"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Matrix4, Points, Vector3 } from "three";
import { frame } from "./state";
import { HologramTube, cloudGeometry, createPointsMaterial, emptyCloud, useHologram, type Cloud } from "./hologram";

/*
 * The Ravi landmark, as a hologram: a small walker robot made of ~14k points in a containment tube (see
 * hologram.tsx). It streams up out of a spark when the traveller comes near, turns slowly, walks in place,
 * frays and snaps back every few seconds, and lights up where the cursor passes.
 */

// Layout, in metres from the gateway floor (the tube stands inside the 4.8 m arch).
const TUBE_R = 1.72;
const TUBE_BOTTOM = 0.35;
const TUBE_TOP = 6.55;
const SPARK = new Vector3(0, TUBE_BOTTOM + 0.5, 0);

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
  const c = emptyCloud();
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

  return cloudGeometry(c);
}

const pivot = (m: Matrix4, x: number, y: number, z: number, rx: number, ry = 0) =>
  m
    .makeTranslation(x, y, z)
    .multiply(new Matrix4().makeRotationY(ry))
    .multiply(new Matrix4().makeRotationX(rx))
    .multiply(new Matrix4().makeTranslation(-x, -y, -z));

export function RobotMark({ position, index }: { position: [number, number, number]; index: number }) {
  const spin = useRef<Group>(null!);
  const points = useRef<Points>(null!);
  const geometry = useMemo(makeRobot, []);
  const parts = useMemo(() => Array.from({ length: 6 }, () => new Matrix4()), []);
  const material = useMemo(() => createPointsMaterial(parts, SPARK), [parts]);
  const drive = useHologram({ index, material, points, spin });
  const gait = useRef(0);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = frame.time;
    const { awake, open } = drive.current;

    // walk in place. The robot faces +z; a negative x rotation swings a leg forward. Each knee folds back
    // in early swing, as its thigh starts forward, and is straight by the time the foot reaches out.
    if (!frame.reduced) gait.current += dt * (1.6 + awake * 1.2);
    const g = gait.current;
    const swing = 0.42;
    pivot(parts[THIGH_L], -HIP_X, HIP_Y, 0, -Math.sin(g) * swing);
    pivot(parts[THIGH_R], HIP_X, HIP_Y, 0, Math.sin(g) * swing);
    const kneeL = Math.max(0, Math.cos(g + 0.6)) * 0.85;
    const kneeR = Math.max(0, Math.cos(g + Math.PI + 0.6)) * 0.85;
    parts[SHIN_L].copy(parts[THIGH_L]).multiply(pivot(new Matrix4(), -HIP_X, KNEE_Y, 0, kneeL));
    parts[SHIN_R].copy(parts[THIGH_R]).multiply(pivot(new Matrix4(), HIP_X, KNEE_Y, 0, kneeR));
    const bob = Math.abs(Math.cos(g)) * 0.05;
    parts[BODY].makeTranslation(0, bob, 0);
    parts[HEAD]
      .makeTranslation(0, bob, 0)
      .multiply(pivot(new Matrix4(), 0, NECK_Y, 0, Math.sin(t * 3) * 0.06 * open, Math.sin(t * 0.5) * 0.35 * (1 - open)));
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
