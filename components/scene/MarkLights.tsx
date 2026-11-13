"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { PointLight } from "three";
import { gateZ } from "@/content/journey";
import { frame, markLights, markPositions } from "./state";

/** At most two marks are ever up at once (they sit GATE_SPACING apart and rise within ~58 m of their stop). */
const POOL = 2;

/**
 * The project marks' violet lights, pooled. The lights are always in the scene, at zero when nobody needs them,
 * so the light count never changes while you scroll (a change recompiles every material). Each frame they go to
 * the nearest marks that are showing, at the spot and brightness the mark's tube or emitter asked for.
 */
export function MarkLights() {
  const lights = useRef<(PointLight | null)[]>([]);
  const order = useRef<number[]>([]);

  useFrame(() => {
    const shown = order.current;
    shown.length = 0;
    markLights.forEach((l, i) => l?.shown && markPositions[i] && shown.push(i));
    shown.sort((a, b) => Math.abs(gateZ(a) - frame.z) - Math.abs(gateZ(b) - frame.z));
    for (let k = 0; k < POOL; k++) {
      const light = lights.current[k];
      if (!light) continue;
      const i = shown[k];
      if (i === undefined) {
        light.intensity = 0;
        continue;
      }
      const l = markLights[i];
      light.position.copy(l.offset).multiplyScalar(l.scale).add(markPositions[i]);
      light.intensity = l.intensity;
      light.distance = l.distance;
    }
  });

  return (
    <>
      {Array.from({ length: POOL }, (_, k) => (
        <pointLight
          key={k}
          ref={(el) => {
            lights.current[k] = el;
          }}
          color="#8f66ff"
          intensity={0}
          distance={12}
          decay={2}
        />
      ))}
    </>
  );
}
