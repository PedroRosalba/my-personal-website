"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Matrix4, Points, Vector3 } from "three";
import { frame, damp } from "./state";
import { HologramTube, cloudGeometry, createPointsMaterial, emptyCloud, useHologram, type Cloud } from "./hologram";

/*
 * The Turborepo landmark, as a hologram: the mark's inner ring and four outer arcs made of ~12k points in a
 * containment tube (see hologram.tsx). The arcs spin in their own plane, faster as the traveller arrives and at
 * full "turbo" once the project opens; their leading tips burn bright.
 */

const TUBE_R = 1.72;
const TUBE_BOTTOM = 0.35;
const TUBE_TOP = 6.55;
const SPARK = new Vector3(0, TUBE_BOTTOM + 0.5, 0);

const S = 1.15;
const CY = 3.45; // the mark's centre, metres above the gateway floor
const INNER = 0;
const OUTER = 1;

/** Points on a torus section in the XY plane (axis z), area-weighted, from angle `start` over `length`. */
function torus(c: Cloud, part: number, R: number, r: number, start: number, length: number, density: number, tone: (u01: number) => number) {
  const count = Math.round(length * R * Math.PI * 2 * r * density);
  for (let i = 0; i < count; ) {
    const u01 = Math.random();
    const u = start + u01 * length;
    const v = Math.random() * Math.PI * 2;
    // the outside of a torus has more surface than the inside
    if (Math.random() > (R + r * Math.cos(v)) / (R + r)) continue;
    i++;
    const g = 1 + (Math.random() - 0.35) * 0.06;
    const n = new Vector3(Math.cos(v) * Math.cos(u), Math.cos(v) * Math.sin(u), Math.sin(v));
    const rr = R + r * g * Math.cos(v);
    c.pos.push(rr * Math.cos(u), rr * Math.sin(u) + CY, r * g * Math.sin(v));
    c.nrm.push(n.x, n.y, n.z);
    c.part.push(part);
    c.tone.push(tone(u01));
  }
}

/** Closes an arc's end with a small disc of points. */
function cap(c: Cloud, part: number, R: number, r: number, u: number, sign: number, tone: number) {
  const t = new Vector3(-Math.sin(u), Math.cos(u), 0).multiplyScalar(sign);
  for (let i = 0; i < 60; i++) {
    const rad = Math.sqrt(Math.random()) * r;
    const v = Math.random() * Math.PI * 2;
    const rr = R + rad * Math.cos(v);
    c.pos.push(rr * Math.cos(u), rr * Math.sin(u) + CY, rad * Math.sin(v));
    c.nrm.push(t.x, t.y, t.z);
    c.part.push(part);
    c.tone.push(tone);
  }
}

function makeTurbo() {
  const c = emptyCloud();
  const D = 1100;
  // the inner ring
  torus(c, INNER, 0.62 * S, 0.15 * S, 0, Math.PI * 2, D, () => 0.9);
  // four outer arcs; tone rises along each like the mark's blue → pink sweep, and the leading tip glows
  const R = 1.25 * S;
  const r = 0.13 * S;
  const length = Math.PI / 2 - 0.24;
  for (let i = 0; i < 4; i++) {
    const start = (i * Math.PI) / 2 + 0.12;
    torus(c, OUTER, R, r, start, length, D, (u01) => (u01 < 0.07 ? 2.2 : 0.62 + 0.38 * (1 - u01)));
    cap(c, OUTER, R, r, start, -1, 2.2);
    cap(c, OUTER, R, r, start + length, 1, 0.62);
  }
  return cloudGeometry(c);
}

const about = (m: Matrix4, axis: "y" | "z", angle: number) => {
  const rot = axis === "y" ? new Matrix4().makeRotationY(angle) : new Matrix4().makeRotationZ(angle);
  return m.makeTranslation(0, CY, 0).multiply(rot).multiply(new Matrix4().makeTranslation(0, -CY, 0));
};

export function TurboMark({ position, index }: { position: [number, number, number]; index: number }) {
  const spin = useRef<Group>(null!);
  const points = useRef<Points>(null!);
  const geometry = useMemo(makeTurbo, []);
  const parts = useMemo(() => Array.from({ length: 6 }, () => new Matrix4()), []);
  const material = useMemo(() => createPointsMaterial(parts, SPARK, 0.04), [parts]);
  const drive = useHologram({ index, material, points, spin, spinSpeed: 0.22, centerY: CY });
  const arcs = useRef({ angle: 0, speed: 0.35 });

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const { awake, open } = drive.current;
    const a = arcs.current;
    // idle drift → faster as the traveller arrives → full "turbo" when the project opens
    a.speed = damp(a.speed, 0.35 + awake * 1.6 + open * 5, 2.5, dt);
    if (!frame.reduced) a.angle -= a.speed * dt;
    about(parts[OUTER], "z", a.angle);
    about(parts[INNER], "y", frame.time * 0.4);
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
