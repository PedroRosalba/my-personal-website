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
