"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { FINAL_GATE_Z } from "@/content/journey";
import { clamp01, damp, frame } from "./state";

/**
 * The traveller: a scale and atmosphere device, not a game character.
 * Position comes from scroll; the walk cycle is driven by distance travelled.
 */
export function Figure() {
  const root = useRef<Group>(null!);
  const body = useRef<Group>(null!);
  const legL = useRef<Group>(null!);
  const legR = useRef<Group>(null!);
  const armL = useRef<Group>(null!);
  const armR = useRef<Group>(null!);
  const state = useRef({ phase: 0, moving: 0, yaw: 0 });

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = state.current;
    const speed = Math.abs(frame.speed);
    const moving = clamp01(speed / 1.2);
    s.moving = damp(s.moving, moving, 8, dt);
    s.phase += Math.min(speed, 2.4) * dt * 4.4;

    const swing = Math.sin(s.phase) * 0.6 * s.moving;
    legL.current.rotation.x = swing;
    legR.current.rotation.x = -swing;
    armL.current.rotation.x = -swing * 0.7;
    armR.current.rotation.x = swing * 0.7;
    body.current.position.y = Math.abs(Math.cos(s.phase)) * 0.035 * s.moving;
    body.current.rotation.x = -0.06 * s.moving;

    // idle: turn slightly toward the nearest landmark; at Contact: turn to face the camera
    const atContact = clamp01((FINAL_GATE_Z + 30 - frame.z) / 12);
    const towardLandmark = -Math.atan2(frame.focusX, 14) * (1 - s.moving);
    const backward = frame.speed > 0.4 && atContact < 0.5 ? Math.PI : 0;
    const targetYaw = atContact > 0 ? Math.PI * atContact : backward + towardLandmark;
    s.yaw = frame.reduced ? targetYaw : damp(s.yaw, targetYaw, 3, dt);

    root.current.position.set(0, 0, frame.z);
    root.current.rotation.y = s.yaw;
    root.current.visible = frame.reveal < 0.98;
  });

  const material = <meshStandardMaterial color="#d6d3cb" roughness={1} emissive="#d6d3cb" emissiveIntensity={0.22} />;

  return (
    <group ref={root}>
      <group ref={body}>
        {/* torso + head */}
        <mesh position={[0, 1.2, 0]}>
          <capsuleGeometry args={[0.15, 0.42, 4, 10]} />
          {material}
        </mesh>
        <mesh position={[0, 1.68, 0]}>
          <sphereGeometry args={[0.115, 14, 12]} />
          {material}
        </mesh>
        {/* arms, pivoting at the shoulders */}
        <group ref={armL} position={[-0.215, 1.44, 0]}>
          <mesh position={[0, -0.31, 0]}>
            <capsuleGeometry args={[0.048, 0.52, 4, 8]} />
            {material}
          </mesh>
        </group>
        <group ref={armR} position={[0.215, 1.44, 0]}>
          <mesh position={[0, -0.31, 0]}>
            <capsuleGeometry args={[0.048, 0.52, 4, 8]} />
            {material}
          </mesh>
        </group>
        {/* legs, pivoting at the hips; feet point forward (-z) */}
        <group ref={legL} position={[-0.085, 0.9, 0]}>
          <mesh position={[0, -0.43, 0]}>
            <capsuleGeometry args={[0.066, 0.72, 4, 8]} />
            {material}
          </mesh>
          <mesh position={[0, -0.86, -0.06]}>
            <boxGeometry args={[0.11, 0.07, 0.26]} />
            {material}
          </mesh>
        </group>
        <group ref={legR} position={[0.085, 0.9, 0]}>
          <mesh position={[0, -0.43, 0]}>
            <capsuleGeometry args={[0.066, 0.72, 4, 8]} />
            {material}
          </mesh>
          <mesh position={[0, -0.86, -0.06]}>
            <boxGeometry args={[0.11, 0.07, 0.26]} />
            {material}
          </mesh>
        </group>
      </group>
    </group>
  );
}
