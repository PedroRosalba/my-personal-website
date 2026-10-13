"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { CatmullRomCurve3, Color, MeshStandardMaterial, Vector3, type Group } from "three";
import { FINAL_GATE_Z, GATE_X, gateZ } from "@/content/journey";
import { ACCENT, clamp01, damp, frame, smooth } from "./state";

/**
 * The traveller: a scale and atmosphere device, not a game character.
 * Position comes from scroll; the walk cycle is driven by distance travelled.
 * When a project opens he leaves the causeway, crosses the forecourt and steps into the gateway.
 */
const PALE = new Color("#d6d3cb");
const SHADE = new Color("#2a2a31");

const point = new Vector3();
const tangent = new Vector3();

/** The way in: off the causeway, across the forecourt, through the arch and past the portal plane. */
function wayIn(index: number, fromZ: number) {
  const gz = gateZ(index);
  // if he is far from the gateway (opened from the HTML list), he starts at its stop instead
  const startZ = Math.abs(fromZ - (gz + 13)) > 16 ? gz + 13 : fromZ;
  return new CatmullRomCurve3(
    [
      new Vector3(0, 0, startZ),
      new Vector3(2.8, 0, Math.min(startZ - 3, gz + 8.5)),
      new Vector3(GATE_X - 0.6, 0, gz + 4.8),
      new Vector3(GATE_X, 0, gz + 2.4),
      new Vector3(GATE_X, 0, gz + 0.2),
    ],
    false,
    "centripetal",
  );
}

export function Figure() {
  const root = useRef<Group>(null!);
  const body = useRef<Group>(null!);
  const legL = useRef<Group>(null!);
  const legR = useRef<Group>(null!);
  const armL = useRef<Group>(null!);
  const armR = useRef<Group>(null!);
  const state = useRef({
    phase: 0,
    moving: 0,
    yaw: 0,
    heading: 0,
    way: null as CatmullRomCurve3 | null,
    wayIndex: -1,
    t: 0,
  });

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = state.current;
    // in while a project is open; back out, along the same way, after it closes
    const walking = frame.walk > 0 && (frame.revealIndex >= 0 || s.way !== null);

    let moving: number;
    let targetYaw: number;
    let glow = 0;
    let fade = 0;
    const atContact = clamp01((FINAL_GATE_Z + 64 - frame.z) / 12);

    if (walking) {
      if (!s.way || (frame.revealIndex >= 0 && s.wayIndex !== frame.revealIndex)) {
        s.way = wayIn(frame.revealIndex, frame.z);
        s.wayIndex = frame.revealIndex;
        s.t = 0;
      }
      // a short lean-in, then a steady stride to the arch
      const t = frame.walk;
      const eased = t < 0.2 ? smooth(t / 0.2) * 0.2 : t;
      const prevT = s.t;
      s.t = eased;
      s.way.getPointAt(eased, point);
      s.way.getTangentAt(Math.min(Math.max(eased, 0.005), 0.995), tangent);
      const delta = eased - prevT;
      const travelled = Math.abs(delta) * s.way.getLength();
      moving = 1;
      s.phase += travelled * 2.9; // long, purposeful strides
      if (delta < 0) tangent.negate(); // walking back out
      if (delta !== 0) s.heading = Math.atan2(-tangent.x, -tangent.z);
      targetYaw = s.heading;
      // he glows as he steps into the light, and dissolves into it
      glow = smooth(clamp01((eased - 0.66) / 0.22));
      fade = smooth(clamp01((eased - 0.84) / 0.14));
      root.current.position.copy(point);
    } else {
      s.way = null;
      s.wayIndex = -1;
      const speed = Math.abs(frame.speed);
      // a nav jump is a cut, not a sprint: no walk cycle while dashing
      moving = speed > 45 ? 0 : clamp01(speed / 1.2);
      s.phase += Math.min(speed, 2.4) * dt * 4.4;

      // idle: turn slightly toward the nearest landmark; at Contact: turn to face the camera
      const towardLandmark = -Math.atan2(frame.focusX, 14) * (1 - s.moving);
      const backward = frame.speed > 0.4 && atContact < 0.5 ? Math.PI : 0;
      targetYaw = atContact > 0 ? Math.PI * atContact : backward + towardLandmark;
      root.current.position.set(0, 0, frame.z);
    }

    s.moving = damp(s.moving, moving, 8, dt);
    const swing = Math.sin(s.phase) * (0.6 + 0.15 * (walking ? 1 : 0)) * s.moving;
    legL.current.rotation.x = swing;
    legR.current.rotation.x = -swing;
    armL.current.rotation.x = -swing * 0.7;
    armR.current.rotation.x = swing * 0.7;
    body.current.position.y = Math.abs(Math.cos(s.phase)) * 0.035 * s.moving;
    body.current.rotation.x = -(walking ? 0.1 : 0.06) * s.moving;

    // turning: snap when the way bends sharply, otherwise ease
    s.yaw = frame.reduced ? targetYaw : damp(s.yaw, targetYaw, walking ? 7 : 3, dt);
    root.current.rotation.y = s.yaw;
    // gone once he has dissolved into the portal
    root.current.visible = frame.walk < 1 && fade < 0.999;

    // pale anchor along the journey; a dark silhouette against the final door of light;
    // violet as he walks into a gateway
    material.emissiveIntensity = 0.22 * (1 - 0.9 * atContact) + glow * 1.6;
    material.color.copy(PALE).lerp(SHADE, atContact).lerp(ACCENT, glow * 0.8);
    material.emissive.copy(PALE).lerp(ACCENT, glow);
    material.opacity = 1 - fade;
  });

  const material = useMemo(
    () =>
      new MeshStandardMaterial({
        color: PALE,
        roughness: 1,
        emissive: PALE,
        emissiveIntensity: 0.22,
        transparent: true,
        opacity: 1,
      }),
    [],
  );

  return (
    <group ref={root}>
      <group ref={body}>
        {/* torso + head */}
        <mesh position={[0, 1.2, 0]}>
          <capsuleGeometry args={[0.15, 0.42, 4, 10]} />
          <primitive object={material} attach="material" />
        </mesh>
        <mesh position={[0, 1.68, 0]}>
          <sphereGeometry args={[0.115, 14, 12]} />
          <primitive object={material} attach="material" />
        </mesh>
        {/* arms, pivoting at the shoulders */}
        <group ref={armL} position={[-0.215, 1.44, 0]}>
          <mesh position={[0, -0.31, 0]}>
            <capsuleGeometry args={[0.048, 0.52, 4, 8]} />
            <primitive object={material} attach="material" />
          </mesh>
        </group>
        <group ref={armR} position={[0.215, 1.44, 0]}>
          <mesh position={[0, -0.31, 0]}>
            <capsuleGeometry args={[0.048, 0.52, 4, 8]} />
            <primitive object={material} attach="material" />
          </mesh>
        </group>
        {/* legs, pivoting at the hips; feet point forward (-z) */}
        <group ref={legL} position={[-0.085, 0.9, 0]}>
          <mesh position={[0, -0.43, 0]}>
            <capsuleGeometry args={[0.066, 0.72, 4, 8]} />
            <primitive object={material} attach="material" />
          </mesh>
          <mesh position={[0, -0.86, -0.06]}>
            <boxGeometry args={[0.11, 0.07, 0.26]} />
            <primitive object={material} attach="material" />
          </mesh>
        </group>
        <group ref={legR} position={[0.085, 0.9, 0]}>
          <mesh position={[0, -0.43, 0]}>
            <capsuleGeometry args={[0.066, 0.72, 4, 8]} />
            <primitive object={material} attach="material" />
          </mesh>
          <mesh position={[0, -0.86, -0.06]}>
            <boxGeometry args={[0.11, 0.07, 0.26]} />
            <primitive object={material} attach="material" />
          </mesh>
        </group>
      </group>
    </group>
  );
}
