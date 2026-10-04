"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, DoubleSide, Float32BufferAttribute, Group } from "three";
import { frame } from "./state";

/** The Ethereum diamond: an upper bipyramid and a detached lower chevron. */
function makeDiamond() {
  const w = 0.92;
  const corners: [number, number, number][] = [
    [w, 0, 0],
    [0, 0, w],
    [-w, 0, 0],
    [0, 0, -w],
  ];
  const tris: number[] = [];
  const tri = (a: number[], b: number[], c: number[]) => tris.push(...a, ...b, ...c);
  const top = [0, 1.5, 0];
  const mid = [0, -0.55, 0];
  const lowTop = [0, -0.8, 0];
  const bottom = [0, -1.66, 0];
  for (let i = 0; i < 4; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % 4];
    tri(top, a, b);
    tri(mid, b, a);
    // lower piece: corners sit one gap below the equator
    const la = [a[0], -0.25, a[2]];
    const lb = [b[0], -0.25, b[2]];
    tri(lowTop, la, lb);
    tri(bottom, lb, la);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(tris, 3));
  geometry.computeVertexNormals();
  return geometry;
}

/** Appears exactly once: the landmark of the Web3 project gateway. */
export function EthDiamond({ position }: { position: [number, number, number] }) {
  const group = useRef<Group>(null!);
  const geometry = useMemo(makeDiamond, []);

  useFrame(() => {
    group.current.rotation.y = frame.time * 0.28;
    group.current.position.y = Math.sin(frame.time * 0.6) * 0.14;
  });

  return (
    <group position={position}>
      <group ref={group} scale={1.55}>
        <mesh geometry={geometry}>
          <meshStandardMaterial color="#3c3c48" metalness={0.5} roughness={0.34} flatShading side={DoubleSide} />
        </mesh>
      </group>
      {/* a cool key from the front and a faint violet rim from behind */}
      <pointLight position={[2.5, 1.5, 4]} color="#dcd8ee" intensity={30} distance={14} decay={2} />
      <pointLight position={[-1.5, 0.4, -2.2]} color="#8f66ff" intensity={26} distance={10} decay={2} />
    </group>
  );
}
