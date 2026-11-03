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
