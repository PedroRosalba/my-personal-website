"use client";

import { useEffect, useMemo, useRef, type MutableRefObject, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Matrix4,
  Mesh,
  Plane,
  PointLight,
  Points,
  Raycaster,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";
import { gateZ } from "@/content/journey";
import { clamp01, damp, frame } from "./state";

/*
 * Shared pieces of the hologram landmarks: a figure made of points standing in a containment tube between
 * glowing rings. The points stream up out of a spark when the traveller comes near, fray and snap back every
 * few seconds. Everything is in the site's violet.
 */

// Violet palette: shadow → lit → rim, the glow of points in flight and the emissive bits.
const SHADOW = new Vector3(0.15, 0.12, 0.27);
const LIT = new Vector3(0.74, 0.68, 0.98);
const RIM = new Vector3(0.78, 0.72, 1.0);
export const GLOW = new Vector3(0.48, 0.38, 1.0);
const EMISSIVE = new Vector3(0.86, 0.8, 1.0);

/* ---------- the points ---------- */

/** A figure as raw point data: position, outward normal, moving-part index and tone (1 lit, <1 shaded, >1.5 emissive). */
export type Cloud = { pos: number[]; nrm: number[]; part: number[]; tone: number[] };

export const emptyCloud = (): Cloud => ({ pos: [], nrm: [], part: [], tone: [] });

/** Packs a cloud into a geometry, with per-point seeds; the build order runs bottom to top with a ragged front. */
export function cloudGeometry(c: Cloud) {
  const count = c.part.length;
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < count; i++) {
    minY = Math.min(minY, c.pos[i * 3 + 1]);
    maxY = Math.max(maxY, c.pos[i * 3 + 1]);
  }
  const seed: number[] = [];
  for (let i = 0; i < count; i++) {
    const h = (c.pos[i * 3 + 1] - minY) / (maxY - minY);
    seed.push(Math.random(), h * 0.75 + Math.random() * 0.25, Math.random(), Math.random());
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(c.pos, 3));
  geometry.setAttribute("normal", new Float32BufferAttribute(c.nrm, 3));
  geometry.setAttribute("aPart", new Float32BufferAttribute(c.part, 1));
  geometry.setAttribute("aTone", new Float32BufferAttribute(c.tone, 1));
  geometry.setAttribute("aSeed", new Float32BufferAttribute(seed, 4));
  // the points move in the shader, so the CPU-side bounds are only a rough guess
  geometry.computeBoundingSphere();
  geometry.boundingSphere!.radius += 1.5;
  return geometry;
}

const pointsVertex = /* glsl */ `
  attribute float aPart;
  attribute float aTone;
  attribute vec4 aSeed;
  uniform mat4 uParts[6];
  uniform float uTime;
  uniform float uBuild;
  uniform float uScatter;
  uniform float uSize;
  uniform float uViewH;
  uniform vec3 uSpark;
  varying vec3 vN;
  varying float vTone;
  varying float vAlpha;
  varying float vGlow;

  vec3 drift(vec3 p, float s, float t) {
    return vec3(
      sin(p.y * 3.1 + t * 1.7 + s * 6.0) + sin(p.z * 5.3 - t * 2.3),
      sin(p.z * 2.7 + t * 1.3 + s * 4.0) + 0.6,
      sin(p.x * 3.3 + t * 1.9 + s * 5.0) + sin(p.y * 4.7 + t * 1.1)
    ) * 0.5;
  }

  void main() {
    mat4 M = uParts[int(aPart + 0.5)];
    vec3 p = (M * vec4(position, 1.0)).xyz;
    vec3 n = normalize(mat3(M) * normal);

    // fray: a share of the points lift off the surface and drift, more of them at the extremities
    float reach = uScatter * (0.06 + aSeed.z * aSeed.z * aSeed.z * 0.75);
    p += (n * 0.12 + drift(p, aSeed.w, uTime) * 0.16) * reach;

    // build: each point streams up from the spark along a short spiral, bottom of the figure first
    float k = clamp((uBuild * 1.3 - aSeed.y) / 0.3, 0.0, 1.0);
    k = k * k * (3.0 - 2.0 * k);
    vec3 from = uSpark + (aSeed.zwx - 0.5) * 0.22;
    vec3 q = mix(from, p, k);
    float a = (1.0 - k) * (2.5 + aSeed.w * 3.0);
    q.xz = mat2(cos(a), -sin(a), sin(a), cos(a)) * q.xz;

    // before launch, only a few points show, gathered as a spark on the ring
    float launched = step(0.0001, k);
    float spark = step(aSeed.x, 0.07) * step(0.002, uBuild) * (1.0 - smoothstep(0.6, 1.0, uBuild));
    vAlpha = max(launched, spark);

    vec4 mv = modelViewMatrix * vec4(q, 1.0);
    gl_Position = projectionMatrix * mv;
    float size = uSize * mix(0.7, 1.0, k) * (1.0 + reach * 0.3);
    gl_PointSize = vAlpha * size * projectionMatrix[1][1] * uViewH * 0.5 / -mv.z;

    vN = normalize(normalMatrix * n);
    vTone = aTone;
    vGlow = (1.0 - k) * 0.9 + reach * 0.5;
  }
`;

const pointsFragment = /* glsl */ `
  uniform vec3 uShadow;
  uniform vec3 uLit;
  uniform vec3 uRim;
  uniform vec3 uGlow;
  uniform vec3 uEmissive;
  uniform float uOpacity;
  varying vec3 vN;
  varying float vTone;
  varying float vAlpha;
  varying float vGlow;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    if (d > 0.5 || vAlpha < 0.01) discard;
    // light from up-front-left in view space, a cool rim from behind
    float lam = max(dot(vN, normalize(vec3(-0.35, 0.8, 0.5))), 0.0);
    float rim = pow(1.0 - abs(vN.z), 2.0);
    vec3 col = mix(uShadow, uLit, 0.18 + lam * 0.82) + uRim * rim * 0.25;
    col *= min(vTone, 1.0);
    col = mix(col, uEmissive * 1.5, step(1.5, vTone));
    col += uGlow * vGlow;
    // a tiny highlight in each point gives the cloud its beaded look
    col += uRim * 0.18 * (1.0 - smoothstep(0.0, 0.32, length(c + vec2(0.12, -0.12))));
    float alpha = smoothstep(0.5, 0.36, d) * uOpacity;
    gl_FragColor = vec4(col, alpha);
  }
`;

/** The point material. `parts` are per-part transforms (up to 6) for figures with moving limbs; pass identities otherwise. */
export function createPointsMaterial(parts: Matrix4[], spark: Vector3, size = 0.042) {
  return new ShaderMaterial({
    vertexShader: pointsVertex,
    fragmentShader: pointsFragment,
    uniforms: {
      uParts: { value: parts },
      uTime: { value: 0 },
      uBuild: { value: 0 },
      uScatter: { value: 0 },
      uSize: { value: size },
      uViewH: { value: 900 },
      uSpark: { value: spark },
      uShadow: { value: SHADOW },
      uLit: { value: LIT },
      uRim: { value: RIM },
      uGlow: { value: GLOW },
      uEmissive: { value: EMISSIVE },
      uOpacity: { value: 1 },
    },
    transparent: true,
    depthWrite: true,
    toneMapped: false,
  });
}

/* ---------- the drive: proximity, build, fray, turntable ---------- */

export type Drive = { awake: number; build: number; open: number; yaw: number };

/**
 * Runs a hologram figure: assembles it near its gateway, frays it every `period` seconds, spins `spin` slowly
 * (turning it to face the visitor when the project opens), and keeps `material` in step.
 */
export function useHologram({
  index,
  material,
  points,
  spin,
  period = 7,
  spinSpeed = 0.35,
}: {
  index: number;
  material: ShaderMaterial;
  points: RefObject<Points | null>;
  spin: RefObject<Group | null>;
  period?: number;
  spinSpeed?: number;
}): MutableRefObject<Drive> {
  const drive = useRef<Drive>({ awake: 0, build: 0, open: 0, yaw: 0 });
  useFrame(({ gl }, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = frame.time;
    const s = drive.current;

    const near = 1 - clamp01(Math.abs(frame.z - (gateZ(index) + 13)) / 45);
    s.open = frame.revealIndex === index ? frame.reveal : 0;
    s.awake = damp(s.awake, Math.max(near, s.open), 3, dt);

    // assemble when the traveller gets close, fall back into the spark when they leave
    const target = s.awake > 0.2 ? 1 : 0;
    s.build = frame.reduced
      ? target
      : s.build + Math.sign(target - s.build) * Math.min(Math.abs(target - s.build), dt / 2.6);

    // fray and reassemble every `period` s; nearly still once the project is open
    const cyc = (t % period) / period;
    const pulse = cyc > 0.6 ? Math.sin(((cyc - 0.6) / 0.4) * Math.PI) ** 2 : 0;
    const scatter = frame.reduced ? 0 : pulse * (1 - s.open * 0.8) + (1 - s.build) * 0.4;

    // a slow turntable; when the project opens it turns to face the visitor
    if (s.open > 0.05) s.yaw = damp(s.yaw, Math.round(s.yaw / (Math.PI * 2)) * Math.PI * 2, 2.5, dt);
    else if (!frame.reduced) s.yaw += dt * spinSpeed;
    if (spin.current) {
      spin.current.rotation.y = s.yaw;
      spin.current.position.y = Math.sin(t * 1.1) * 0.08;
    }

    const u = material.uniforms;
    u.uTime.value = t;
    u.uBuild.value = s.build;
    u.uScatter.value = scatter;
    u.uViewH.value = gl.domElement.height;
    u.uOpacity.value = 0.55 + s.awake * 0.45;
  });

  return drive;
}

/* ---------- the containment tube ---------- */

/** A faint lit wall with a triangle-lattice texture, brighter at the silhouette and near the floor. */
const tubeVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const tubeFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  // distance to the nearest edge of a triangle lattice
  float lattice(vec2 p) {
    float da = abs(fract(p.y) - 0.5);
    float db = abs(fract(p.x * 0.5 + p.y * 0.866) - 0.5);
    float dc = abs(fract(p.x * 0.5 - p.y * 0.866) - 0.5);
    return 0.5 - max(da, max(db, dc));
  }

  void main() {
    float edge = 1.0 - abs(dot(normalize(vN), normalize(vV)));
    float sil = pow(edge, 2.2);
    vec2 p = vec2(vUv.x * 64.0, vUv.y * 30.0);
    // jitter the lattice per cell so it reads like a fine irregular mesh, not graph paper
    vec2 cell = floor(p);
    p += (vec2(hash(cell), hash(cell + 7.1)) - 0.5) * 0.35;
    float line = 1.0 - smoothstep(0.0, 0.06, lattice(p));
    float sparkle = step(0.82, hash(cell + floor(uTime * 2.0))) * 0.6 + 0.4;
    float floorGlow = exp(-vUv.y * 3.2);
    float fade = smoothstep(1.0, 0.75, vUv.y) * smoothstep(0.0, 0.03, vUv.y);
    float a = (0.035 + sil * 0.55 + floorGlow * 0.3) + line * sparkle * (0.05 + sil * 0.7);
    gl_FragColor = vec4(uColor * a * fade * uIntensity, 1.0);
  }
`;

/** A flat ring in the XZ plane: a hot core line with a soft halo (our stand-in for bloom), cut into rotating arcs. */
const ringVertex = /* glsl */ `
  varying vec2 vP;
  void main() {
    vP = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const ringFragment = /* glsl */ `
  uniform float uRadius;
  uniform float uRot;
  uniform float uSegments;
  uniform float uGap;
  uniform float uIntensity;
  uniform vec3 uCore;
  uniform vec3 uColor;
  varying vec2 vP;
  void main() {
    float r = length(vP);
    float d = abs(r - uRadius);
    float ang = atan(vP.y, vP.x) / 6.28318 + 0.5;
    float seg = fract(ang * uSegments + uRot);
    // soft ends on each arc
    float arc = smoothstep(0.0, 0.02, seg - uGap) * smoothstep(1.0, 0.98, seg);
    float core = exp(-pow(d / 0.045, 2.0));
    float halo = exp(-d / 0.12) * 0.6 + exp(-d / 0.45) * 0.18;
    vec3 col = uCore * core * arc * 1.6 + uColor * (halo * mix(0.35, 1.0, arc));
    gl_FragColor = vec4(col * uIntensity, 1.0);
  }
`;

/** A camera-facing soft column of light behind and around the tube: fakes the volume glow of a bloom pass. */
const hazeVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const hazeFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    vec2 c = vUv - 0.5;
    float x = exp(-pow(abs(c.x) / 0.26, 3.0));
    float y = smoothstep(0.5, 0.25, abs(c.y + 0.03));
    float floorPool = exp(-pow((vUv.y - 0.12) / 0.07, 2.0)) * exp(-pow(c.x / 0.3, 2.0));
    gl_FragColor = vec4(uColor * (x * y * 0.22 + floorPool * 0.35) * uIntensity, 1.0);
  }
`;

const additive = { transparent: true, blending: AdditiveBlending, depthWrite: false, toneMapped: false } as const;

function ringMaterial(radius: number, segments: number, gap: number) {
  return new ShaderMaterial({
    vertexShader: ringVertex,
    fragmentShader: ringFragment,
    uniforms: {
      uRadius: { value: radius },
      uRot: { value: 0 },
      uSegments: { value: segments },
      uGap: { value: gap },
      uIntensity: { value: 1 },
      uCore: { value: new Vector3(0.93, 0.9, 1.0) },
      uColor: { value: GLOW.clone() },
    },
    side: DoubleSide,
    ...additive,
  });
}

/** The tube, its rings, the haze around it and a violet light on the stone, all driven by a figure's `drive`. */
export function HologramTube({
  drive,
  radius,
  bottom,
  top,
}: {
  drive: MutableRefObject<Drive>;
  radius: number;
  bottom: number;
  top: number;
}) {
  const haze = useRef<Mesh>(null!);
  const light = useRef<PointLight>(null!);
  const tube = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: tubeVertex,
        fragmentShader: tubeFragment,
        uniforms: { uColor: { value: GLOW.clone() }, uIntensity: { value: 1 }, uTime: { value: 0 } },
        side: DoubleSide,
        ...additive,
      }),
    [],
  );
  const hazeMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: hazeVertex,
        fragmentShader: hazeFragment,
        uniforms: { uColor: { value: GLOW.clone() }, uIntensity: { value: 1 } },
        ...additive,
      }),
    [],
  );
  const rings = useMemo(
    () => ({
      top: ringMaterial(radius, 2, 0.06),
      bottom: ringMaterial(radius, 2, 0.03),
      outer: ringMaterial(radius + 0.35, 3, 0.22),
    }),
    [radius],
  );

  useFrame(({ camera }) => {
    const t = frame.time;
    const s = drive.current;
    const glow = 0.35 + s.awake * 0.65;
    tube.uniforms.uTime.value = t;
    tube.uniforms.uIntensity.value = glow;
    hazeMaterial.uniforms.uIntensity.value = glow * (0.6 + s.build * 0.4);
    haze.current.quaternion.copy(camera.quaternion);

    rings.top.uniforms.uRot.value = t * 0.06;
    rings.bottom.uniforms.uRot.value = -t * 0.09;
    rings.outer.uniforms.uRot.value = t * 0.04;
    // the bottom ring flares while it feeds the build
    const feeding = s.build > 0.001 && s.build < 0.999 ? 0.6 : 0;
    rings.top.uniforms.uIntensity.value = glow * 0.8;
    rings.bottom.uniforms.uIntensity.value = glow * (1 + feeding);
    rings.outer.uniforms.uIntensity.value = glow * 0.55;
    light.current.intensity = 6 + s.awake * 16;
  });

  const ringGeo = (r: number) => <ringGeometry args={[Math.max(0.01, r - 0.9), r + 0.9, 128, 1]} />;
  const height = top - bottom;

  return (
    <>
      <mesh ref={haze} position={[0, bottom + height / 2, 0]} material={hazeMaterial} renderOrder={1}>
        <planeGeometry args={[radius * 4.2, height * 1.25]} />
      </mesh>
      <mesh position={[0, bottom + height / 2, 0]} material={tube} renderOrder={2}>
        <cylinderGeometry args={[radius, radius, height, 96, 1, true]} />
      </mesh>
      <mesh position={[0, top, 0]} rotation={[-Math.PI / 2, 0, 0]} material={rings.top} renderOrder={3}>
        {ringGeo(radius)}
      </mesh>
      <mesh position={[0, bottom, 0]} rotation={[-Math.PI / 2, 0, 0]} material={rings.bottom} renderOrder={3}>
        {ringGeo(radius)}
      </mesh>
      <mesh position={[0, bottom - 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]} material={rings.outer} renderOrder={3}>
        {ringGeo(radius + 0.35)}
      </mesh>
      <pointLight ref={light} position={[0, 2.5, 2.2]} color="#8f66ff" intensity={10} distance={12} decay={2} />
    </>
  );
}
