"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Matrix4,
  Mesh,
  PointLight,
  ShaderMaterial,
  Vector3,
} from "three";
import { gateZ } from "@/content/journey";
import { clamp01, damp, frame } from "./state";

/*
 * The Ravi landmark, as a hologram: a small walker robot made of ~14k points, standing in a containment
 * tube with two glowing rings. When the traveller comes near, the robot streams up out of a spark on the
 * bottom ring; then it turns slowly, walks in place, and every few seconds its points fray apart and
 * snap back. Everything is in the site's single violet.
 */

// Layout, in metres from the gateway floor (the tube stands inside the 4.8 m arch).
const TUBE_R = 1.72;
const TUBE_BOTTOM = 0.35;
const TUBE_TOP = 6.55;
const SPARK = new Vector3(0, TUBE_BOTTOM + 0.5, 0);

// Violet palette: shadow → lit → ink, plus the glow and the emissive bits (eyes, antenna tips, chest).
const SHADOW = new Vector3(0.15, 0.12, 0.27);
const LIT = new Vector3(0.74, 0.68, 0.98);
const RIM = new Vector3(0.78, 0.72, 1.0);
const GLOW = new Vector3(0.48, 0.38, 1.0);
const EMISSIVE = new Vector3(0.86, 0.8, 1.0);

// Parts that move independently. Each point carries the index of the part it belongs to.
const BODY = 0;
const HEAD = 1;
const THIGH_L = 2;
const SHIN_L = 3;
const THIGH_R = 4;
const SHIN_R = 5;

const HIP_Y = 3.02;
const KNEE_Y = 2.2;
const HIP_X = 0.3;
const NECK_Y = 4.05;

type Cloud = {
  pos: number[];
  nrm: number[];
  part: number[];
  tone: number[];
};

/** Points on the surface of a box, spread by face area, pushed slightly along the normal for a grainy, voxel feel. */
function box(
  c: Cloud,
  part: number,
  [cx, cy, cz]: [number, number, number],
  [w, h, d]: [number, number, number],
  density: number,
  shade?: (x: number, y: number, z: number, n: [number, number, number]) => { tone: number; inset?: number },
) {
  const faces: { n: [number, number, number]; a: number }[] = [
    { n: [1, 0, 0], a: h * d },
    { n: [-1, 0, 0], a: h * d },
    { n: [0, 1, 0], a: w * d },
    { n: [0, -1, 0], a: w * d },
    { n: [0, 0, 1], a: w * h },
    { n: [0, 0, -1], a: w * h },
  ];
  for (const { n, a } of faces) {
    const count = Math.max(8, Math.round(a * density));
    for (let i = 0; i < count; i++) {
      const u = Math.random() - 0.5;
      const v = Math.random() - 0.5;
      let x = n[0] !== 0 ? (n[0] * w) / 2 : n[1] !== 0 ? u * w : u * w;
      let y = n[1] !== 0 ? (n[1] * h) / 2 : n[0] !== 0 ? u * h : v * h;
      let z = n[2] !== 0 ? (n[2] * d) / 2 : n[0] !== 0 ? v * d : v * d;
      const s = shade?.(x, y, z, n) ?? { tone: 1 };
      // grain: most points sit on the surface, some a little proud of it or just under it
      const g = (Math.random() - 0.35) * 0.035 - (s.inset ?? 0);
      x += n[0] * g;
      y += n[1] * g;
      z += n[2] * g;
      c.pos.push(cx + x, cy + y, cz + z);
      c.nrm.push(...n);
      c.part.push(part);
      c.tone.push(s.tone);
    }
  }
}

/** Points along a thin rod from a to b, ending in a small bright bead. */
function antenna(c: Cloud, part: number, a: Vector3, b: Vector3) {
  const dir = b.clone().sub(a);
  for (let i = 0; i < 90; i++) {
    const t = Math.random();
    const p = a.clone().addScaledVector(dir, t);
    const j = 0.025;
    c.pos.push(p.x + (Math.random() - 0.5) * j, p.y + (Math.random() - 0.5) * j, p.z + (Math.random() - 0.5) * j);
    c.nrm.push(0, 1, 0);
    c.part.push(part);
    c.tone.push(1);
  }
  for (let i = 0; i < 60; i++) {
    const n = new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    const p = b.clone().addScaledVector(n, 0.07);
    c.pos.push(p.x, p.y, p.z);
    c.nrm.push(n.x, n.y, n.z);
    c.part.push(part);
    c.tone.push(2.4);
  }
}

/** A Ravi-ish walker: wide boxy head with a visor and two round eyes, two antennas, a torso, two jointed legs. */
function makeRobot() {
  const c: Cloud = { pos: [], nrm: [], part: [], tone: [] };
  const D = 640; // points per m² of surface

  // head, with a recessed dark visor and two bright round eyes on the front face
  const HEAD_C: [number, number, number] = [0, 4.56, 0];
  const HEAD_S: [number, number, number] = [1.56, 0.96, 1.1];
  box(c, HEAD, HEAD_C, HEAD_S, D, (x, y, _z, n) => {
    if (n[2] !== 1) return { tone: 1 };
    const inVisor = Math.abs(x) < 0.62 && Math.abs(y + 0.02) < 0.3;
    if (!inVisor) return { tone: 1 };
    const eye = Math.min(Math.hypot(x - 0.3, y), Math.hypot(x + 0.3, y));
    return eye < 0.13 ? { tone: 2.6, inset: 0.02 } : { tone: 0.32, inset: 0.05 };
  });
  // extra points in the eyes so they read from the causeway
  for (const ex of [-0.3, 0.3]) {
    for (let i = 0; i < 70; i++) {
      const r = Math.sqrt(Math.random()) * 0.12;
      const a = Math.random() * Math.PI * 2;
      c.pos.push(ex + Math.cos(a) * r, 4.56 + Math.sin(a) * r, 0.53);
      c.nrm.push(0, 0, 1);
      c.part.push(HEAD);
      c.tone.push(2.8);
    }
  }
  // ear pods
  for (const s of [-1, 1]) box(c, HEAD, [s * 0.84, 4.56, 0], [0.12, 0.36, 0.36], D);
  antenna(c, HEAD, new Vector3(-0.42, 5.04, -0.15), new Vector3(-0.6, 5.62, -0.3));
  antenna(c, HEAD, new Vector3(0.42, 5.04, -0.15), new Vector3(0.52, 5.5, -0.22));

  // neck
  box(c, BODY, [0, NECK_Y - 0.05, 0], [0.24, 0.22, 0.24], D);
  // torso, with a small light strip on the chest
  box(c, BODY, [0, 3.5, 0], [1.1, 0.78, 0.8], D, (x, y, _z, n) =>
    n[2] === 1 && Math.abs(x) < 0.22 && Math.abs(y - 0.12) < 0.035 ? { tone: 2.2 } : { tone: 1 },
  );
  // pelvis
  box(c, BODY, [0, HIP_Y, 0], [0.86, 0.22, 0.52], D);

  // legs: thigh, shin, chunky foot
  for (const [s, thigh, shin] of [
    [-1, THIGH_L, SHIN_L],
    [1, THIGH_R, SHIN_R],
  ] as const) {
    const x = s * HIP_X;
    box(c, thigh, [x, (HIP_Y + KNEE_Y) / 2, 0], [0.32, HIP_Y - KNEE_Y + 0.08, 0.38], D);
    box(c, shin, [x, KNEE_Y, 0.02], [0.36, 0.2, 0.42], D); // knee cap
    box(c, shin, [x, 1.78, 0], [0.28, 0.82, 0.3], D);
    box(c, shin, [x * 1.06, 1.27, 0.1], [0.52, 0.2, 0.78], D);
  }

  const count = c.part.length;
  const seed: number[] = [];
  let minY = Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < count; i++) {
    const y = c.pos[i * 3 + 1];
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  for (let i = 0; i < count; i++) {
    // build order: bottom first, with some randomness so the front is ragged
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

const robotVertex = /* glsl */ `
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

    // build: each point streams up from the spark along a short spiral, bottom of the robot first
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

const robotFragment = /* glsl */ `
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

/** The tube: a faint lit wall with a triangle-lattice texture, brighter at the silhouette and near the floor. */
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
    vec2 a = vec2(p.x, p.y);
    vec2 b = vec2(p.x * 0.5 + p.y * 0.866, 0.0);
    vec2 c = vec2(p.x * 0.5 - p.y * 0.866, 0.0);
    float da = abs(fract(a.y) - 0.5);
    float db = abs(fract(b.x) - 0.5);
    float dc = abs(fract(c.x) - 0.5);
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
    transparent: true,
    blending: AdditiveBlending,
    depthWrite: false,
    side: DoubleSide,
    toneMapped: false,
  });
}

const pivot = (m: Matrix4, x: number, y: number, z: number, rx: number, ry = 0) =>
  m
    .makeTranslation(x, y, z)
    .multiply(new Matrix4().makeRotationY(ry))
    .multiply(new Matrix4().makeRotationX(rx))
    .multiply(new Matrix4().makeTranslation(-x, -y, -z));

export function RobotMark({ position, index }: { position: [number, number, number]; index: number }) {
  const robot = useRef<Group>(null!);
  const haze = useRef<Mesh>(null!);
  const light = useRef<PointLight>(null!);
  const geometry = useMemo(makeRobot, []);
  const parts = useMemo(() => Array.from({ length: 6 }, () => new Matrix4()), []);
  const state = useRef({ awake: 0, build: 0, yaw: 0, gait: 0 });

  const robotMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: robotVertex,
        fragmentShader: robotFragment,
        uniforms: {
          uParts: { value: parts },
          uTime: { value: 0 },
          uBuild: { value: 0 },
          uScatter: { value: 0 },
          uSize: { value: 0.042 },
          uViewH: { value: 900 },
          uSpark: { value: SPARK },
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
      }),
    [parts],
  );

  const tubeMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: tubeVertex,
        fragmentShader: tubeFragment,
        uniforms: { uColor: { value: GLOW.clone() }, uIntensity: { value: 1 }, uTime: { value: 0 } },
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        side: DoubleSide,
        toneMapped: false,
      }),
    [],
  );

  const hazeMaterial = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: hazeVertex,
        fragmentShader: hazeFragment,
        uniforms: { uColor: { value: GLOW.clone() }, uIntensity: { value: 1 } },
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );

  const rings = useMemo(
    () => ({
      top: ringMaterial(TUBE_R, 2, 0.06),
      bottom: ringMaterial(TUBE_R, 2, 0.03),
      outer: ringMaterial(TUBE_R + 0.35, 3, 0.22),
    }),
    [],
  );

  useFrame(({ camera, gl }, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = frame.time;
    const s = state.current;

    const near = 1 - clamp01(Math.abs(frame.z - (gateZ(index) + 13)) / 45);
    const open = frame.revealIndex === index ? frame.reveal : 0;
    s.awake = damp(s.awake, Math.max(near, open), 3, dt);

    // assemble when the traveller gets close, fall back into the spark when they leave
    const target = s.awake > 0.2 ? 1 : 0;
    s.build = frame.reduced ? target : s.build + Math.sign(target - s.build) * Math.min(Math.abs(target - s.build), dt / 2.6);

    // fray and reassemble every 7 s; stronger while idle, nearly still once the project is open
    const cyc = (t % 7) / 7;
    const pulse = cyc > 0.6 ? Math.sin(((cyc - 0.6) / 0.4) * Math.PI) ** 2 : 0;
    const scatter = frame.reduced ? 0 : pulse * (1 - open * 0.8) + (1 - s.build) * 0.4;

    // a slow turntable; when the project opens it turns to face the visitor
    if (open > 0.05) s.yaw = damp(s.yaw, Math.round(s.yaw / (Math.PI * 2)) * Math.PI * 2, 2.5, dt);
    else if (!frame.reduced) s.yaw += dt * 0.35;
    robot.current.rotation.y = s.yaw;
    robot.current.position.y = Math.sin(t * 1.1) * 0.08;

    // walk in place
    if (!frame.reduced) s.gait += dt * (1.6 + s.awake * 1.2);
    const g = s.gait;
    const swing = 0.42;
    pivot(parts[THIGH_L], -HIP_X, HIP_Y, 0, -Math.sin(g) * swing);
    pivot(parts[THIGH_R], HIP_X, HIP_Y, 0, Math.sin(g) * swing);
    const kneeL = Math.max(0, Math.sin(g - 0.9)) * 0.75;
    const kneeR = Math.max(0, Math.sin(g + Math.PI - 0.9)) * 0.75;
    parts[SHIN_L].copy(parts[THIGH_L]).multiply(pivot(new Matrix4(), -HIP_X, KNEE_Y, 0, kneeL));
    parts[SHIN_R].copy(parts[THIGH_R]).multiply(pivot(new Matrix4(), HIP_X, KNEE_Y, 0, kneeR));
    const bob = Math.abs(Math.cos(g)) * 0.05;
    parts[BODY].makeTranslation(0, bob, 0);
    parts[HEAD]
      .makeTranslation(0, bob, 0)
      .multiply(pivot(new Matrix4(), 0, NECK_Y, 0, Math.sin(t * 3) * 0.06 * open, Math.sin(t * 0.5) * 0.35 * (1 - open)));

    const u = robotMaterial.uniforms;
    u.uTime.value = t;
    u.uBuild.value = s.build;
    u.uScatter.value = scatter;
    u.uViewH.value = gl.domElement.height;
    u.uOpacity.value = 0.55 + s.awake * 0.45;

    const glow = 0.35 + s.awake * 0.65;
    tubeMaterial.uniforms.uTime.value = t;
    tubeMaterial.uniforms.uIntensity.value = glow;
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
  const height = TUBE_TOP - TUBE_BOTTOM;

  return (
    <group position={position}>
      <mesh ref={haze} position={[0, TUBE_BOTTOM + height / 2, 0]} material={hazeMaterial} renderOrder={1}>
        <planeGeometry args={[TUBE_R * 4.2, height * 1.25]} />
      </mesh>
      <mesh position={[0, TUBE_BOTTOM + height / 2, 0]} material={tubeMaterial} renderOrder={2}>
        <cylinderGeometry args={[TUBE_R, TUBE_R, height, 96, 1, true]} />
      </mesh>
      <mesh position={[0, TUBE_TOP, 0]} rotation={[-Math.PI / 2, 0, 0]} material={rings.top} renderOrder={3}>
        {ringGeo(TUBE_R)}
      </mesh>
      <mesh position={[0, TUBE_BOTTOM, 0]} rotation={[-Math.PI / 2, 0, 0]} material={rings.bottom} renderOrder={3}>
        {ringGeo(TUBE_R)}
      </mesh>
      <mesh position={[0, TUBE_BOTTOM - 0.25, 0]} rotation={[-Math.PI / 2, 0, 0]} material={rings.outer} renderOrder={3}>
        {ringGeo(TUBE_R + 0.35)}
      </mesh>
      <group ref={robot}>
        <points geometry={geometry} material={robotMaterial} renderOrder={4} />
      </group>
      <pointLight ref={light} position={[0, 2.5, 2.2]} color="#8f66ff" intensity={10} distance={12} decay={2} />
    </group>
  );
}
