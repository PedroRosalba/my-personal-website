"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Matrix4, Points, Vector3 } from "three";
import { frame } from "./state";
import { HologramTube, cloudGeometry, createPointsMaterial, emptyCloud, useHologram, type Cloud } from "./hologram";

/*
 * The Cloudflare landmark, as a hologram: the logo's cloud as a puffy 3D shape with a flat base, made of ~12k
 * points in a containment tube (see hologram.tsx): squashed spheres cut flat at the floor. The small lobe on
 * the right is lighter, as in the logo, and bobs a little on its own; the logo's horizontal dash is a glowing
 * groove around the lower body.
 */

const TUBE_R = 1.72;
const TUBE_BOTTOM = 0.35;
const TUBE_TOP = 6.55;
const SPARK = new Vector3(0, TUBE_BOTTOM + 0.5, 0);

const S = 1.05;
const CY = 3.2; // the cloud's base line sits a little below this, metres above the gateway floor
const MAIN = 0;
const SMALL = 1;

const FLOOR = -0.5; // the logo's flat bottom
const SQUASH = 0.6; // lobes are flattened front to back
const LOBES: { c: [number, number]; r: number; part: number }[] = [
  { c: [0.35, 0.2], r: 0.78, part: MAIN },
  { c: [-0.75, -0.08], r: 0.5, part: MAIN },
  { c: [-1.22, -0.3], r: 0.28, part: MAIN },
  // fillers along the bottom, cut flat by the floor
  { c: [-0.3, -0.32], r: 0.5, part: MAIN },
  { c: [0.7, -0.3], r: 0.5, part: MAIN },
  { c: [1.18, -0.24], r: 0.34, part: SMALL },
];

// the logo's horizontal dash: a groove around the lower body with a line of light in it
const DASH = { y: -0.31, x: [-1.05, 1.0], gap: 0.05 };
const inDashGap = (x: number, y: number) => x > DASH.x[0] && x < DASH.x[1] && Math.abs(y - DASH.y) < DASH.gap;

const inLobe = (x: number, y: number, z: number, l: (typeof LOBES)[number]) =>
  ((x - l.c[0]) / l.r) ** 2 + ((y - l.c[1]) / l.r) ** 2 + (z / (l.r * SQUASH)) ** 2 < 1;

/** Inside the cloud, ignoring one lobe (so a surface point of that lobe is tested against the others). */
function inside(x: number, y: number, z: number, skip: number) {
  if (y < FLOOR) return true; // below the floor counts as solid: nothing shows under the flat bottom
  return LOBES.some((l, i) => i !== skip && inLobe(x, y, z, l));
}

function push(c: Cloud, x: number, y: number, z: number, n: Vector3, part: number, tone: number) {
  const g = (Math.random() - 0.35) * 0.03;
  c.pos.push((x + n.x * g) * S, (y + n.y * g) * S + CY, (z + n.z * g) * S);
  c.nrm.push(n.x, n.y, n.z);
  c.part.push(part);
  c.tone.push(tone);
}

function makeCloud() {
  const c = emptyCloud();
  const D = 1000;
  // the lobes: points on each squashed sphere that no other piece covers
  LOBES.forEach((l, i) => {
    const tone = l.part === SMALL ? 1 : 0.84;
    const target = Math.round(4 * Math.PI * l.r * l.r * 0.75 * D);
    for (let k = 0; k < target * 3 && c.part.length < 40000; k++) {
      const d = new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
      if (d.lengthSq() > 0.25 || d.lengthSq() < 1e-4) continue;
      d.normalize();
      const x = l.c[0] + d.x * l.r;
      const y = l.c[1] + d.y * l.r;
      const z = d.z * l.r * SQUASH;
      if (inside(x, y, z, i) || inDashGap(x, y)) continue;
      push(c, x, y, z, new Vector3(d.x, d.y, d.z / SQUASH).normalize(), l.part, tone);
    }
  });
  // the dash's line of light: where the groove's plane cuts each lobe, pulled a little into the groove
  LOBES.forEach((l, i) => {
    const dy = (DASH.y - l.c[1]) / l.r;
    if (Math.abs(dy) >= 1) return;
    const rx = l.r * Math.sqrt(1 - dy * dy);
    for (let k = 0; k < rx * 900; k++) {
      const a = Math.random() * Math.PI * 2;
      const x = l.c[0] + Math.cos(a) * rx;
      const z = Math.sin(a) * rx * SQUASH;
      if (x < DASH.x[0] || x > DASH.x[1] || inside(x, DASH.y, z, i)) continue;
      const n = new Vector3(Math.cos(a), 0, Math.sin(a) / SQUASH).normalize();
      push(c, x - n.x * 0.03, DASH.y + (Math.random() - 0.5) * 0.02, z - n.z * 0.03, n, l.part, 2.3);
    }
  });
  // the flat bottom: anywhere under the cloud's footprint
  for (let k = 0; k < 3.1 * 0.95 * D; k++) {
    const x = rand([-1.55, 1.5]);
    const z = rand([-0.47, 0.47]);
    const y = FLOOR + 0.001;
    if (!LOBES.some((l) => inLobe(x, y, z, l))) continue;
    push(c, x, FLOOR, z, new Vector3(0, -1, 0), MAIN, 0.6);
  }
  return cloudGeometry(c);
}

const rand = ([a, b]: number[]) => a + Math.random() * (b - a);

export function CloudMark({ position, index }: { position: [number, number, number]; index: number }) {
  const spin = useRef<Group>(null!);
  const points = useRef<Points>(null!);
  const geometry = useMemo(makeCloud, []);
  const parts = useMemo(() => Array.from({ length: 6 }, () => new Matrix4()), []);
  const material = useMemo(() => createPointsMaterial(parts, SPARK, 0.04), [parts]);
  const drive = useHologram({ index, material, points, spin, spinSpeed: 0.3, centerY: CY + 0.2 });

  useFrame(() => {
    const t = frame.time;
    parts[MAIN].makeTranslation(0, Math.sin(t * 0.7) * 0.03, 0);
    parts[SMALL].makeTranslation(0, Math.sin(t * 1.3 + 1) * 0.06, Math.sin(t * 0.8) * 0.04);
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
