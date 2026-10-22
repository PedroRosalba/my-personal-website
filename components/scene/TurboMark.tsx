"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, DoubleSide, Float32BufferAttribute, Group, TorusGeometry } from "three";
import { gateZ } from "@/content/journey";
import { clamp01, damp, frame } from "./state";

const BLUE = new Color("#0096ff");
const PINK = new Color("#ff1e56");

/** One arc of the outer ring, coloured blue → pink along the circle like the Turborepo mark. */
function arcGeometry(start: number, length: number) {
  const g = new TorusGeometry(1.25, 0.13, 12, 48, length);
  g.rotateZ(start);
  const pos = g.getAttribute("position");
  const colors: number[] = [];
  const c = new Color();
  for (let i = 0; i < pos.count; i++) {
    const a = (Math.atan2(pos.getY(i), pos.getX(i)) + Math.PI) / (Math.PI * 2);
    c.copy(BLUE).lerp(PINK, a);
    colors.push(c.r, c.g, c.b);
  }
  g.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return g;
}

/** The Turborepo landmark: an inner ring and an outer ring of glowing arcs that spins up near its gateway. */
export function TurboMark({ position, index }: { position: [number, number, number]; index: number }) {
  const bob = useRef<Group>(null!);
  const outer = useRef<Group>(null!);
  const inner = useRef<Group>(null!);
  const spin = useRef(0.4);
  const arcs = useMemo(() => [0, 1, 2, 3].map((i) => arcGeometry((i * Math.PI) / 2 + 0.12, Math.PI / 2 - 0.24)), []);
  const ring = useMemo(() => new TorusGeometry(0.62, 0.15, 14, 64), []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const near = 1 - clamp01(Math.abs(frame.z - (gateZ(index) + 13)) / 40);
    const open = frame.revealIndex === index ? frame.reveal : 0;
    // idle drift → faster as the traveller arrives → full "turbo" when the project opens
    spin.current = damp(spin.current, 0.35 + near * 1.6 + open * 5, 2.5, dt);
    outer.current.rotation.z -= spin.current * dt;
    inner.current.rotation.y = frame.time * 0.4;
    bob.current.rotation.y = Math.sin(frame.time * 0.3) * 0.35;
    bob.current.position.y = Math.sin(frame.time * 0.6) * 0.14;
  });

  return (
    <group position={position}>
      <group ref={bob} scale={1.15}>
        <group ref={outer}>
          {arcs.map((g, i) => (
            <mesh key={i} geometry={g}>
              <meshBasicMaterial vertexColors toneMapped={false} />
            </mesh>
          ))}
        </group>
        <group ref={inner}>
          <mesh geometry={ring}>
            <meshStandardMaterial color="#3c3c48" metalness={0.6} roughness={0.3} side={DoubleSide} />
          </mesh>
        </group>
      </group>
      <pointLight position={[2.5, 1.5, 4]} color="#dcd8ee" intensity={26} distance={14} decay={2} />
      <pointLight position={[-1.2, 0.2, 1.6]} color="#ff1e56" intensity={10} distance={8} decay={2} />
      <pointLight position={[1.2, -0.2, 1.6]} color="#0096ff" intensity={10} distance={8} decay={2} />
    </group>
  );
}
