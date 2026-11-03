"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Matrix4, Points, Vector3 } from "three";
import { frame } from "./state";
import { HologramTube, cloudGeometry, createPointsMaterial, emptyCloud, useHologram, type Cloud } from "./hologram";

/*
 * The Cloudflare landmark, as a hologram: the logo's cloud as a puffy 3D shape with a flat base, made of ~12k
 * points in a containment tube (see hologram.tsx): squashed spheres cut flat at the floor, in the logo's
 * proportions. As in the logo, a curved cut separates the small cloud on the right (lighter, bobbing on its own),
 * a thin dash cuts through both clouds from a third of the way in, and where the two cuts meet they make a small
 * four-point star. The cuts carry a line of light, so they read like the logo's white from every side.
 */

const TUBE_R = 1.72;
const TUBE_BOTTOM = 0.35;
const TUBE_TOP = 6.55;
const SPARK = new Vector3(0, TUBE_BOTTOM + 0.5, 0);

const S = 1.05;
const CY = 3.2; // the cloud's base line sits a little below this, metres above the gateway floor
const MAIN = 0;
const SMALL = 1;

// Logo-space: x from -1.5 to 1.58, the flat bottom at -0.5, the big cloud's peak near 0.98.
const FLOOR = -0.5;
const SQUASH = 0.6; // lobes are flattened front to back
const LOBES: { c: [number, number]; r: number }[] = [
  { c: [0.12, 0.24], r: 0.74 }, // the big dome
  { c: [-0.75, 0.05], r: 0.47 },
  { c: [-1.2, -0.25], r: 0.3 },
  // fillers along the bottom, cut flat by the floor
  { c: [-0.3, -0.3], r: 0.5 },
  { c: [0.45, -0.3], r: 0.45 },
  { c: [1.12, -0.12], r: 0.46 }, // the small cloud
];

// The separation: a curve leaning right as it rises, between the big cloud and the small one.
const sepX = (y: number) => 0.61 + 0.258 * (y + 0.485);
const SEP_TOP = 0.34; // above the small cloud there is nothing left to separate
const SEP_GAP = 0.034;
const onSmallSide = (x: number, y: number) => x > sepX(y);
const inSeparation = (x: number, y: number) => y < SEP_TOP && Math.abs(x - sepX(y)) < SEP_GAP;

// The dash: from a third of the way in, through the big cloud to the star, then on into the small cloud.
const DASH_A: [number, number] = [-0.66, -0.13];
const STAR: [number, number] = [sepX(-0.16), -0.16];
const DASH_C: [number, number] = [1.2, -0.12];
const DASH_W = 0.032;

function segDist(x: number, y: number, [ax, ay]: [number, number], [bx, by]: [number, number]) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - (ax + dx * t), y - (ay + dy * t));
}
const inDash = (x: number, y: number) => segDist(x, y, DASH_A, STAR) < DASH_W || segDist(x, y, STAR, DASH_C) < DASH_W * 0.85;

const inLobe = (x: number, y: number, z: number, l: (typeof LOBES)[number]) =>
  ((x - l.c[0]) / l.r) ** 2 + ((y - l.c[1]) / l.r) ** 2 + (z / (l.r * SQUASH)) ** 2 < 1;
const inCloud = (x: number, y: number, z: number) => y >= FLOOR && LOBES.some((l) => inLobe(x, y, z, l));

/** Inside the cloud, ignoring one lobe (so a surface point of that lobe is tested against the others). */
function inside(x: number, y: number, z: number, skip: number) {
  if (y < FLOOR) return true; // below the floor counts as solid: nothing shows under the flat bottom
  return LOBES.some((l, i) => i !== skip && inLobe(x, y, z, l));
}

/** How far the cloud's surface stands out in front at (x, y). */
function frontZ(x: number, y: number) {
  let z = 0;
  for (const l of LOBES) {
    const q = 1 - ((x - l.c[0]) / l.r) ** 2 - ((y - l.c[1]) / l.r) ** 2;
    if (q > 0) z = Math.max(z, Math.sqrt(q) * l.r * SQUASH);
  }
  return z;
}

function push(c: Cloud, x: number, y: number, z: number, n: Vector3, tone: number, grain = true) {
  const g = grain ? (Math.random() - 0.35) * 0.03 : 0;
  const small = onSmallSide(x, y);
  c.pos.push((x + n.x * g) * S, (y + n.y * g) * S + CY, (z + n.z * g) * S);
  c.nrm.push(n.x, n.y, n.z);
  c.part.push(small ? SMALL : MAIN);
  // the small cloud is the lighter one; light keeps its own tone
  c.tone.push(tone >= 1.5 ? tone : small ? tone * 1.19 : tone);
}

function makeCloud() {
  const c = emptyCloud();
  const D = 1000;
  // the surface: points on each squashed sphere that no other lobe covers, minus the two cuts
  LOBES.forEach((l, i) => {
    const target = Math.round(4 * Math.PI * l.r * l.r * 0.75 * D);
    for (let k = 0; k < target * 3 && c.part.length < 40000; k++) {
      const d = new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
      if (d.lengthSq() > 0.25 || d.lengthSq() < 1e-4) continue;
      d.normalize();
      const x = l.c[0] + d.x * l.r;
      const y = l.c[1] + d.y * l.r;
      const z = d.z * l.r * SQUASH;
      if (inside(x, y, z, i) || inSeparation(x, y) || inDash(x, y)) continue;
      push(c, x, y, z, new Vector3(d.x, d.y, d.z / SQUASH).normalize(), 0.84);
    }
  });
  // the flat bottom: anywhere under the cloud's footprint, except across the separation
  for (let k = 0; k < 3.1 * 0.95 * D; k++) {
    const x = rand([-1.55, 1.6]);
    const z = rand([-0.47, 0.47]);
    if (!inCloud(x, FLOOR + 0.001, z) || inSeparation(x, FLOOR)) continue;
    push(c, x, FLOOR, z, new Vector3(0, -1, 0), 0.6);
  }
  // the cuts' light: a thin sheet inside each cut, through the cloud's depth
  const sheet = (count: number, at: () => [number, number]) => {
    for (let k = 0; k < count; k++) {
      const [x, y] = at();
      const z = rand([-0.5, 0.5]);
      if (!inCloud(x, y, z)) continue;
      push(c, x, y, z, new Vector3(0, 0, Math.sign(z) || 1), 2.3, false);
    }
  };
  sheet(1500, () => {
    const t = Math.random();
    const [a, b] = t < 0.74 ? [DASH_A, STAR] : [STAR, DASH_C];
    const u = t < 0.74 ? t / 0.74 : (t - 0.74) / 0.26;
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u + (Math.random() - 0.5) * 0.012];
  });
  sheet(700, () => {
    const y = rand([FLOOR, SEP_TOP]);
    return [sepX(y) + (Math.random() - 0.5) * 0.012, y];
  });
  // the star where the cuts meet: a four-point sparkle on the front and the back
  for (const side of [1, -1]) {
    for (let k = 0; k < 900; k++) {
      const dx = rand([-0.17, 0.17]);
      const dy = rand([-0.2, 0.2]);
      if (Math.sqrt(Math.abs(dx) / 0.17) + Math.sqrt(Math.abs(dy) / 0.2) > 1) continue;
      const x = STAR[0] + dx;
      const y = STAR[1] + dy;
      push(c, x, y, side * (frontZ(x, y) + 0.015), new Vector3(0, 0, side), 2.6, false);
    }
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
