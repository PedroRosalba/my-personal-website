"use client";

import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";
import { useJourney } from "@/lib/store";
import { projects } from "@/content/projects";
import { FINAL_GATE_Z, GATE_X, gateZ } from "@/content/journey";
import { clamp01, damp, frame, smooth } from "./state";

const pos = new Vector3();
const look = new Vector3();
const revealPos = new Vector3();
const revealLook = new Vector3();

/** Camera choreography. Everything is derived from scroll progress — nothing is steered directly. */
export function Rig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => (frame.reduced = mq.matches);
    apply();
    mq.addEventListener("change", apply);
    // start where the page already is (deep links, reloads)
    const s = useJourney.getState();
    frame.z = s.targetZ;
    frame.focusX = s.focusX;
    return () => mq.removeEventListener("change", apply);
  }, []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = useJourney.getState();
    const mobile = size.width / size.height < 0.8;
    frame.mobile = mobile;
    if (!frame.reduced) frame.time += dt;

    // figure position: eased toward the scroll target (a nav jump becomes a ~1s dash)
    const prevZ = frame.z;
    frame.z = frame.reduced ? s.targetZ : damp(frame.z, s.targetZ, 3.4, dt);
    frame.speed = (frame.z - prevZ) / dt;
    frame.focusX = frame.reduced ? s.focusX : damp(frame.focusX, s.focusX, 2.6, dt);
    frame.progress = clamp01(-frame.z / -(FINAL_GATE_Z + 44));

    // project reveal
    const activeIndex = s.activeProject ? projects.findIndex((p) => p.slug === s.activeProject) : -1;
    if (activeIndex >= 0) frame.revealIndex = activeIndex;
    const revealTarget = activeIndex >= 0 ? 1 : 0;
    frame.reveal = frame.reduced ? revealTarget : damp(frame.reveal, revealTarget, 4.2, dt);
    if (frame.reveal < 0.002 && revealTarget === 0) frame.revealIndex = -1;
    const r = smooth(clamp01(frame.reveal));

    // journey camera: low, behind the figure, long lens
    const back = mobile ? 31 : 26;
    // The camera never leaves the causeway (it would pass through earlier gateways);
    // it only turns toward the landmark.
    pos.set(frame.focusX * 0.12, 3, frame.z + back);
    look.set(frame.focusX * (mobile ? 1.25 : 0.62), 4.4, frame.z - 40);

    if (frame.revealIndex >= 0) {
      const gz = gateZ(frame.revealIndex);
      revealPos.set(GATE_X, 3.6, gz + (mobile ? 30 : 19));
      revealLook.set(GATE_X, 4.9, gz);
      pos.lerp(revealPos, r);
      look.lerp(revealLook, r);
    }

    camera.position.copy(pos);
    camera.lookAt(look);

    const kick = frame.reduced ? 0 : Math.min(16, Math.abs(frame.speed) * 0.07);
    camera.fov = damp(camera.fov, (mobile ? 46 : 32) + kick, 6, dt);

    // Keep the world clear of the HTML: shift the picture, not the camera.
    const journeyX = mobile ? 0 : -0.12 * size.width;
    const journeyY = mobile ? 0.14 * size.height : 0;
    const revealX = mobile ? 0 : Math.min(280, size.width * 0.2);
    const revealY = mobile ? 0.27 * size.height : 0;
    camera.setViewOffset(
      size.width,
      size.height,
      journeyX + (revealX - journeyX) * r,
      journeyY + (revealY - journeyY) * r,
      size.width,
      size.height,
    );
  });

  return null;
}
