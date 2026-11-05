"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Matrix4, Points, Vector3 } from "three";
import { damp, frame } from "./state";
import { HologramTube, cloudGeometry, createPointsMaterial, emptyCloud, useHologram, type Cloud } from "./hologram";

/*
 * The di.studio landmark, as a hologram: the logo's D made of ~14k points in a containment tube (see hologram.tsx).
 * Its two halves are blades: they part as the traveller arrives and open wide once the project opens. A thin orbit
 * with two moons turns around it, as the D sits among planets on di.studio's own landing page.
 */

const TUBE_R = 1.72;
const TUBE_BOTTOM = 0.35;
const TUBE_TOP = 6.55;
const SPARK = new Vector3(0, TUBE_BOTTOM + 0.5, 0);

const K = 0.08; // metres per unit of the logo outline below
const CY = 3.45; // the mark's centre, metres above the gateway floor
const DEPTH = 0.2; // half the extrusion, front to back
const ORBIT_R = 1.56;
const STEM = 0;
const BOWL = 1;
const ORBIT = 2;

type Point2 = [number, number];
// The same outline as the emblem (EventEmblem's DiStudio), centred and turned y-up.
const fromLogo = (points: Point2[]): Point2[] => points.map(([x, y]) => [(x - 55.5) * K, (31 - y) * K]);
const STEM_OUTLINE = fromLogo([[38.4, 19.7], [44.2, 25.5], [44.2, 44.9], [58.2, 44.9], [69.9, 35.4], [72.6, 37.7], [60, 50.3], [38.4, 50.3]]);
const BOWL_OUTLINE = fromLogo([[46, 11.6], [61.4, 11.6], [73.3, 23.1], [73.3, 34.6], [67.2, 29.2], [67.2, 25.1], [58.6, 17.4], [51.9, 17.4]]);

function inside([x, y]: Point2, outline: Point2[]) {
  let hit = false;
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const [ax, ay] = outline[i];
    const [bx, by] = outline[j];
    if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) hit = !hit;
  }
  return hit;
}

function push(c: Cloud, part: number, x: number, y: number, z: number, n: Vector3, tone: number) {
  c.pos.push(x, y + CY, z);
  c.nrm.push(n.x, n.y, n.z);
  c.part.push(part);
  c.tone.push(tone);
}

/** One blade: its two faces, and its rim with the outline's edges burning a little brighter. */
function blade(c: Cloud, part: number, outline: Point2[]) {
  const xs = outline.map((p) => p[0]);
  const ys = outline.map((p) => p[1]);
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
  const [y0, y1] = [Math.min(...ys), Math.max(...ys)];
  for (let placed = 0, tries = 0; placed < 4200 && tries < 60000; tries++) {
    const p: Point2 = [x0 + Math.random() * (x1 - x0), y0 + Math.random() * (y1 - y0)];
    if (!inside(p, outline)) continue;
    const side = Math.random() < 0.5 ? 1 : -1;
    push(c, part, p[0], p[1], side * DEPTH, new Vector3(0, 0, side), 0.8);
    placed++;
  }
  outline.forEach((a, i) => {
    const b = outline[(i + 1) % outline.length];
    const [dx, dy] = [b[0] - a[0], b[1] - a[1]];
    const length = Math.hypot(dx, dy);
    const normal = new Vector3(dy / length, -dx / length, 0);
    for (let k = 0; k < length * 380; k++) {
      const u = Math.random();
      const z = (Math.random() * 2 - 1) * DEPTH;
      push(c, part, a[0] + dx * u, a[1] + dy * u, z, normal, Math.abs(z) > DEPTH * 0.9 ? 1.25 : 0.95);
    }
  });
}

function moon(c: Cloud, angle: number, radius: number) {
  const center = new Vector3(Math.cos(angle) * ORBIT_R, 0, Math.sin(angle) * ORBIT_R);
  for (let k = 0; k < 170; k++) {
    const n = new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    push(c, ORBIT, center.x + n.x * radius, n.y * radius, center.z + n.z * radius, n, 1.7);
  }
}

function makeMark() {
  const c = emptyCloud();
  blade(c, STEM, STEM_OUTLINE);
  blade(c, BOWL, BOWL_OUTLINE);
  for (let k = 0; k < 900; k++) {
    const a = Math.random() * Math.PI * 2;
    push(c, ORBIT, Math.cos(a) * ORBIT_R, 0, Math.sin(a) * ORBIT_R, new Vector3(Math.cos(a), 0, Math.sin(a)), 0.7);
  }
  moon(c, 0.7, 0.1);
  moon(c, 3.6, 0.07);
  return cloudGeometry(c);
}

export function DiMark({ position, index }: { position: [number, number, number]; index: number }) {
  const spin = useRef<Group>(null!);
  const points = useRef<Points>(null!);
  const geometry = useMemo(makeMark, []);
  const parts = useMemo(() => Array.from({ length: 6 }, () => new Matrix4()), []);
  const material = useMemo(() => createPointsMaterial(parts, SPARK, 0.038), [parts]);
  const drive = useHologram({ index, material, points, spin, spinSpeed: 0.22, centerY: CY });
  const motion = useRef({ gap: 0, angle: 0 });
  const tilt = useMemo(() => new Matrix4().makeRotationZ(-0.34).multiply(new Matrix4().makeRotationX(0.16)), []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const { awake, open } = drive.current;
    const m = motion.current;
    m.gap = damp(m.gap, awake * 0.1 + open * 0.2, 2.5, dt);
    if (!frame.reduced) m.angle += (0.45 + open * 1.4) * dt;
    parts[BOWL].makeTranslation(m.gap, m.gap, 0);
    parts[ORBIT]
      .makeTranslation(0, CY, 0)
      .multiply(tilt)
      .multiply(new Matrix4().makeRotationY(m.angle))
      .multiply(new Matrix4().makeTranslation(0, -CY, 0));
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
