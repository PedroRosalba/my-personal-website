"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Matrix4, Points, Vector3 } from "three";
import { frame } from "./state";
import { HologramTube, cloudGeometry, createPointsMaterial, emptyCloud, useHologram, type Cloud } from "./hologram";

/*
 * The Web3 landmark, as a hologram: the Ethereum diamond made of ~11k points in a containment tube (see
 * hologram.tsx). It streams up out of a spark when the traveller comes near, spins slowly, breathes (the
 * lower chevron drifts away from the upper body and back), frays every few seconds, and lights up where
 * the cursor passes.
 */

const TUBE_R = 1.72;
const TUBE_BOTTOM = 0.35;
const TUBE_TOP = 6.55;
const SPARK = new Vector3(0, TUBE_BOTTOM + 0.5, 0);

const SCALE = 1.4;
const ORIGIN_Y = 3.45; // the diamond's equator, metres above the gateway floor
const UPPER = 0;
const CHEVRON = 1;

type V = [number, number, number];

const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a: V) => Math.hypot(a[0], a[1], a[2]);

/** Points over a triangle (area-weighted), a little grain along its normal, and a denser line along each edge. */
function facet(c: Cloud, part: number, a: V, b: V, cc: V, tone: number, outward: V) {
  let n = cross(sub(b, a), sub(cc, a));
  const area = len(n) / 2;
  n = n.map((x) => x / (2 * area)) as V;
  // keep normals pointing away from the piece's centre
  if (n[0] * outward[0] + n[1] * outward[1] + n[2] * outward[2] < 0) n = n.map((x) => -x) as V;
  const put = (p: V, t: number, g: number) => {
    c.pos.push((p[0] + n[0] * g) * SCALE, (p[1] + n[1] * g) * SCALE + ORIGIN_Y, (p[2] + n[2] * g) * SCALE);
    c.nrm.push(...n);
    c.part.push(part);
    c.tone.push(t);
  };
  const count = Math.round(area * 1150);
  for (let i = 0; i < count; i++) {
    let u = Math.random();
    let v = Math.random();
    if (u + v > 1) [u, v] = [1 - u, 1 - v];
    const p: V = [0, 1, 2].map((k) => a[k] + (b[k] - a[k]) * u + (cc[k] - a[k]) * v) as V;
    put(p, tone, (Math.random() - 0.35) * 0.025);
  }
  // crisp ridges: extra points along the edges
  for (const [p, q] of [
    [a, b],
    [b, cc],
    [cc, a],
  ] as [V, V][]) {
    const m = Math.round(len(sub(q, p)) * 70);
    for (let i = 0; i < m; i++) {
      const t = Math.random();
      put([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t], tone * 1.08, 0.01);
    }
  }
}

/** The Ethereum diamond: an upper bipyramid and a detached lower chevron, two-tone facets like the logo. */
function makeDiamond() {
  const c = emptyCloud();
  const w = 0.92;
  const corners: V[] = [
    [w, 0, 0],
    [0, 0, w],
    [-w, 0, 0],
    [0, 0, -w],
  ];
  const top: V = [0, 1.5, 0];
  const mid: V = [0, -0.55, 0];
  const lowTop: V = [0, -0.8, 0];
  const bottom: V = [0, -1.66, 0];
  for (let i = 0; i < 4; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % 4];
    // alternate light and shaded facets, as in the logo
    const tone = i % 2 === 0 ? 1 : 0.72;
    const out: V = [(a[0] + b[0]) / 2, 0, (a[2] + b[2]) / 2];
    facet(c, UPPER, top, a, b, tone, [out[0], 0.5, out[2]]);
    facet(c, UPPER, mid, b, a, tone * 0.85, [out[0], -0.5, out[2]]);
    const la: V = [a[0], -0.25, a[2]];
    const lb: V = [b[0], -0.25, b[2]];
    facet(c, CHEVRON, lowTop, la, lb, tone * 0.8, [out[0], 0.6, out[2]]);
    facet(c, CHEVRON, bottom, lb, la, tone, [out[0], -0.5, out[2]]);
  }
  // a thin bright seam on the upper body's equator
  for (let i = 0; i < 4; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % 4];
    for (let k = 0; k < 70; k++) {
      const t = Math.random();
      c.pos.push((a[0] + (b[0] - a[0]) * t) * SCALE, ORIGIN_Y, (a[2] + (b[2] - a[2]) * t) * SCALE);
      c.nrm.push(0, 1, 0);
      c.part.push(UPPER);
      c.tone.push(2.2);
    }
  }

  return cloudGeometry(c);
}

/** Appears exactly once: the landmark of the Web3 project gateway. */
export function EthDiamond({ position, index }: { position: [number, number, number]; index: number }) {
  const spin = useRef<Group>(null!);
  const points = useRef<Points>(null!);
  const geometry = useMemo(makeDiamond, []);
  const parts = useMemo(() => Array.from({ length: 6 }, () => new Matrix4()), []);
  const material = useMemo(() => createPointsMaterial(parts, SPARK, 0.04), [parts]);
  const drive = useHologram({ index, material, points, spin, spinSpeed: 0.3 });

  useFrame(() => {
    // breathe: the chevron drifts away from the upper body and back; opening the project closes the gap
    const t = frame.time;
    const gap = (Math.sin(t * 0.9) * 0.5 + 0.5) * 0.22 * (1 - drive.current.open);
    parts[UPPER].makeTranslation(0, gap * 0.4, 0);
    parts[CHEVRON].makeTranslation(0, -gap * 0.6, 0);
  });

  return (
    <group position={position}>
      <HologramTube drive={drive} radius={TUBE_R} bottom={TUBE_BOTTOM} top={TUBE_TOP} />
      <group ref={spin}>
        <points ref={points} geometry={geometry} material={material} renderOrder={4} />
      </group>
    </group>
  );
}
