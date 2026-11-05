"use client";

import { useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { GATE_X, gateZ } from "@/content/journey";
import { projects } from "@/content/projects";
import { useJourney } from "@/lib/store";
import { clamp01, frame } from "./state";

// The landmark stands in the arch: these bound it, in metres from the gateway floor and from the gateway's centre.
const TOP = 8.7;
const BOTTOM = 0.4;
const FRONT = 1.2;
/** The traveller's stop stands this far in front of its gateway (see `stops`). */
const STOP_OFFSET = 13;
/** How far from the stop, in metres, the cue has fully faded. */
const REACH = 12;

/**
 * Keeps the cue on the landmark of the gateway the traveller is standing at. It lives in the canvas for the camera;
 * the cue itself is HTML, so it stays sharp and uses the site's type. It writes straight to the element every frame.
 */
export function GatewayCueTracker({ cue }: { cue: RefObject<HTMLDivElement | null> }) {
  const top = useRef(new Vector3());
  const bottom = useRef(new Vector3());

  useFrame(({ camera, size }) => {
    const el = cue.current;
    if (!el) return;
    const index = projects.reduce(
      (best, _, i) => (Math.abs(frame.z - (gateZ(i) + STOP_OFFSET)) < Math.abs(frame.z - (gateZ(best) + STOP_OFFSET)) ? i : best),
      0,
    );
    const { activeProject } = useJourney.getState();
    const near = 1 - clamp01(Math.abs(frame.z - (gateZ(index) + STOP_OFFSET)) / REACH);
    const opacity = activeProject || frame.reveal > 0.02 ? 0 : clamp01(near * 2.5);

    const a = top.current.set(GATE_X, TOP, gateZ(index) + FRONT).project(camera);
    const b = bottom.current.set(GATE_X, BOTTOM, gateZ(index) + FRONT).project(camera);
    const x = ((a.x + 1) / 2) * size.width;
    const y = ((1 - a.y) / 2) * size.height;
    const height = ((1 - b.y) / 2) * size.height - y;

    el.style.opacity = String(opacity);
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    el.style.setProperty("--cue-h", `${height.toFixed(1)}px`);
  });

  return null;
}

/** The sign that a landmark opens: one faint ripple across the floor from its base. Clicks pass through to the gateway. */
export function GatewayCue({ cue }: { cue: RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={cue} className="gateway-cue">
      <b className="cue-ripple" />
    </div>
  );
}
