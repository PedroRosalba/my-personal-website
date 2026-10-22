"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MeshBasicMaterial } from "three";
import { gateZ } from "@/content/journey";
import { clamp01, damp, frame } from "./state";

const EYE = "#35d0e6"; // ravi.bot's cyan

/** The Ravi landmark: a small floating robot that wakes, looks around and waves its antenna near its gateway. */
export function RobotMark({ position, index }: { position: [number, number, number]; index: number }) {
  const body = useRef<Group>(null!);
  const head = useRef<Group>(null!);
  const antenna = useRef<Group>(null!);
  const eyes = useMemo(() => new MeshBasicMaterial({ color: EYE, toneMapped: false }), []);
  const awake = useRef(0);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const t = frame.time;
    const near = 1 - clamp01(Math.abs(frame.z - (gateZ(index) + 13)) / 40);
    const open = frame.revealIndex === index ? frame.reveal : 0;
    awake.current = damp(awake.current, Math.max(near, open), 3, dt);
    const a = awake.current;

    body.current.position.y = Math.sin(t * 1.1) * 0.12 * (0.4 + a);
    // looks around while idle, turns toward the traveller when awake, nods when opened
    head.current.rotation.y = Math.sin(t * 0.5) * 0.7 * (1 - a) + 0.35 * a;
    head.current.rotation.x = Math.sin(t * 3) * 0.08 * open;
    antenna.current.rotation.z = Math.sin(t * (2 + a * 4)) * 0.25 * (0.3 + a);
    // blink every ~4 s; brighter when awake
    const blink = Math.sin(t * 1.6) > 0.985 ? 0.1 : 1;
    eyes.color.set(EYE).multiplyScalar((0.35 + a * 1.4) * blink);
  });

  const metal = <meshStandardMaterial color="#3c3c48" metalness={0.55} roughness={0.32} />;
  return (
    <group position={position}>
      <group ref={body} scale={1.1}>
        {/* head */}
        <group ref={head} position={[0, 1.05, 0]}>
          <mesh>
            <boxGeometry args={[1.5, 1.05, 1.1]} />
            {metal}
          </mesh>
          {/* visor */}
          <mesh position={[0, 0, 0.56]}>
            <boxGeometry args={[1.2, 0.62, 0.04]} />
            <meshStandardMaterial color="#0b0b10" metalness={0.2} roughness={0.15} />
          </mesh>
          {[-0.3, 0.3].map((x) => (
            <mesh key={x} position={[x, 0.02, 0.59]} material={eyes}>
              <circleGeometry args={[0.13, 24]} />
            </mesh>
          ))}
          <group ref={antenna} position={[0, 0.52, 0]}>
            <mesh position={[0, 0.25, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 0.5, 8]} />
              {metal}
            </mesh>
            <mesh position={[0, 0.55, 0]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshBasicMaterial color={EYE} toneMapped={false} />
            </mesh>
          </group>
          {[-0.8, 0.8].map((x) => (
            <mesh key={x} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.18, 0.18, 0.12, 20]} />
              {metal}
            </mesh>
          ))}
        </group>
        {/* torso, floating free of the head */}
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[1.05, 0.85, 0.75]} />
          {metal}
        </mesh>
        <mesh position={[0, 0, 0.385]}>
          <boxGeometry args={[0.42, 0.08, 0.02]} />
          <meshBasicMaterial color={EYE} toneMapped={false} />
        </mesh>
      </group>
      <pointLight position={[2.5, 1.5, 4]} color="#dcd8ee" intensity={26} distance={14} decay={2} />
      <pointLight position={[0, 1.1, 1.6]} color={EYE} intensity={8} distance={6} decay={2} />
    </group>
  );
}
