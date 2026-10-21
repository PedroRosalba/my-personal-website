"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, Group, Points, PointsMaterial } from "three";
import { gateZ } from "@/content/journey";
import { clamp01, damp, frame } from "./state";

const COUNT = 1800;

/** Inside a Cloudflare-style cloud: a big lobe, a small one to its left, a flat base (unit ≈ 1 m). */
function inCloud(x: number, y: number) {
  if (y < -0.5) return false;
  const lobe = (cx: number, cy: number, r: number) => (x - cx) ** 2 + (y - cy) ** 2 < r * r;
  const base = y < -0.05 && x > -1.45 && x < 1.5;
  return base || lobe(0.35, 0.2, 0.78) || lobe(-0.75, -0.08, 0.5) || lobe(1.18, -0.2, 0.32) || lobe(-1.3, -0.3, 0.2);
}

/** On the silhouette: inside, but a small step away is outside. */
function onEdge(x: number, y: number) {
  const d = 0.06;
  return !inCloud(x + d, y) || !inCloud(x - d, y) || !inCloud(x, y + d) || !inCloud(x, y - d);
}

function makeCloud() {
  const home: number[] = [];
  const seed: number[] = [];
  while (home.length < COUNT * 3) {
    const x = (Math.random() * 2 - 1) * 1.6;
    const y = Math.random() * 1.6 - 0.55;
    if (!inCloud(x, y)) continue;
    // half the sparks trace the outline so the silhouette reads from the causeway
    const edge = onEdge(x, y);
    if (!edge && home.length / 3 > COUNT * 0.5) continue;
    home.push(x, y, (Math.random() * 2 - 1) * (edge ? 0.06 : 0.22));
    seed.push(Math.random() * Math.PI * 2, 0.6 + Math.random() * 1.4, Math.random());
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(home.slice(), 3));
  return { geometry, home, seed };
}

/** The Cloudflare landmark: a cloud of orange sparks that drifts apart when idle and assembles near its gateway. */
export function CloudMark({ position, index }: { position: [number, number, number]; index: number }) {
  const bob = useRef<Group>(null!);
  const points = useRef<Points>(null!);
  const spread = useRef(1);
  const { geometry, home, seed } = useMemo(makeCloud, []);
  const material = useMemo(
    () =>
      new PointsMaterial({
        color: "#f38020",
        size: 0.06,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.95,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const near = 1 - clamp01(Math.abs(frame.z - (gateZ(index) + 13)) / 45);
    const open = frame.revealIndex === index ? frame.reveal : 0;
    // far: a loose drift of sparks; near: the cloud assembles; open: it swirls
    spread.current = damp(spread.current, 1 - near * 0.97 + open * 0.3, 2, dt);
    const t = frame.time;
    const pos = geometry.getAttribute("position");
    for (let i = 0; i < COUNT; i++) {
      const [phase, speed, r] = [seed[i * 3], seed[i * 3 + 1], seed[i * 3 + 2]];
      const a = phase + t * speed * (0.35 + open * 1.5);
      const amp = spread.current * (0.25 + r * 0.9);
      pos.setXYZ(
        i,
        home[i * 3] + Math.cos(a) * amp,
        home[i * 3 + 1] + Math.sin(a * 1.3) * amp * 0.6,
        home[i * 3 + 2] + Math.sin(a) * amp,
      );
    }
    pos.needsUpdate = true;
    material.opacity = 0.55 + near * 0.4;
    bob.current.rotation.y = Math.sin(t * 0.25) * 0.4;
    bob.current.position.y = Math.sin(t * 0.6) * 0.14;
  });

  return (
    <group position={position}>
      <group ref={bob} scale={1.4}>
        <points ref={points} geometry={geometry} material={material} />
      </group>
      <pointLight position={[0, 0.3, 1.8]} color="#f38020" intensity={16} distance={9} decay={2} />
    </group>
  );
}
