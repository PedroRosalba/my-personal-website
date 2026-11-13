"use client";

import { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, Vector3 } from "three";
import { useJourney } from "@/lib/store";
import { projects } from "@/content/projects";
import { FINAL_GATE_Z, GATE_X, MOBILE_ROAD_SHIFT } from "@/content/journey";
import { CAM, clamp01, damp, frame } from "./state";

const pos = new Vector3();
const look = new Vector3();

/**
 * Floating road: the camera is the traveller. It stands at eye level on the causeway, always looking straight
 * down the road — it never leans toward a landmark and never swings round when a project opens. The projects
 * come to it instead, floating beside the road (see FloatingMark).
 */
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

    // position: eased toward the scroll target (a nav jump becomes a ~1s dash)
    const prevZ = frame.z;
    frame.z = frame.reduced ? s.targetZ : damp(frame.z, s.targetZ, 3.4, dt);
    frame.speed = (frame.z - prevZ) / dt;
    frame.focusX = frame.reduced ? s.focusX : damp(frame.focusX, s.focusX, 2.6, dt);
    frame.progress = clamp01(-frame.z / -(FINAL_GATE_Z + 44));

    // project reveal: no camera move any more, but the marks and the guide still answer to it
    const activeIndex = s.activeProject ? projects.findIndex((p) => p.slug === s.activeProject) : -1;
    if (activeIndex >= 0) frame.revealIndex = activeIndex;
    const revealTarget = activeIndex >= 0 ? 1 : 0;
    frame.reveal = frame.reduced ? revealTarget : damp(frame.reveal, revealTarget, 3.2, dt);
    if (frame.reveal < 0.002 && revealTarget === 0) frame.revealIndex = -1;

    // a faint step in the eye line while moving; still when standing
    const speed = Math.abs(frame.speed);
    const bob = frame.reduced || speed > 45 ? 0 : clamp01(speed / 1.2);
    frame.walk += Math.min(speed, 2.4) * dt * 4.4;
    // level: no pitch, no roll; the step bob moves the eye and its target together so the horizon never tips
    const y = CAM.y + Math.abs(Math.cos(frame.walk)) * 0.05 * bob;
    pos.set(0, y, frame.z + CAM.back);
    look.set(0, y, frame.z - 30);
    camera.position.copy(pos);
    camera.lookAt(look);

    // desktop: the lens widens a little with speed. Phones: never. A finger flick spikes the speed, and the
    // picture pumped out and back in, stretching the marks at its edge as if they tilted.
    const kick = frame.reduced || mobile ? 0 : Math.min(16, speed * 0.07);
    camera.fov = damp(camera.fov, (mobile ? CAM.fovMobile : CAM.fov) + kick, 6, dt);

    // centred: the road runs down the middle of the screen; phones lift the world above the copy, and at a
    // project stop slide the road to the left third so the mark has the right of the picture to itself.
    // focusX is GATE_X at a project stop and ~0 elsewhere, so the slide follows the scroll.
    const shift = mobile ? MOBILE_ROAD_SHIFT * clamp01(frame.focusX / GATE_X) * size.width : 0;
    camera.setViewOffset(size.width, size.height, shift, mobile ? 0.21 * size.height : 0, size.width, size.height);
  });

  return null;
}
