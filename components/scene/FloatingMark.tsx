"use client";

import { useEffect, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Vector3, type Group } from "three";
import { FLOAT_BACK, FLOAT_X, FLOAT_X_MOBILE, gateZ } from "@/content/journey";
import { useJourney } from "@/lib/store";
import { CAM, clamp01, damp, frame, markPositions, smooth } from "./state";

/** Middle of the whole floating object above its origin: from the figure's top (~5.5 m) down to the tip of the
 * emitter's shard (~-2.7 m). This is what lines up with the card, so the object and the card share one band. */
const OBJECT_MID = 1.4;
/** An element's layout offset from the top of one of its positioned ancestors. */
function offsetWithin(el: HTMLElement, ancestor: HTMLElement) {
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return y;
}

/** The visitor's stop for a project stands this far in front of its mark (see `stops`). */
const STOP_OFFSET = 13;

/**
 * Floating road: a project's hologram hangs in the air beside the causeway instead of standing in a gateway.
 * The object itself is clickable (the card's button on the left is the labelled way in). Its panel opens on the left, where the card was, so the mark stays in view and the
 * camera never has to move.
 */
export function FloatingMark({
  index,
  slug,
  onOpen,
  children,
}: {
  index: number;
  slug: string;
  onOpen: (slug: string) => void;
  children: React.ReactNode;
}) {
  const group = useRef<Group>(null!);
  if (!markPositions[index]) markPositions[index] = new Vector3(FLOAT_X, CAM.y - OBJECT_MID, gateZ(index) - FLOAT_BACK);
  const set = useJourney((s) => s.set);
  /** Where the middle of this project's card sits on screen, as a fraction of its height, at the project's stop. */
  const align = useRef(0.5);
  const hover = useRef(0);

  useEffect(() => {
    const measure = () => {
      const station = document.querySelector<HTMLElement>(`[data-stop="project-${slug}"]`);
      if (!station) return;
      const copy = station.querySelector<HTMLElement>(".copy");
      if (!copy) return;
      // a stop is reached with its station's top at the top of the viewport (ScrollDriver), so an offset inside
      // the station is an offset on screen (layout offsets ignore the copy's float-in transform)
      const top = offsetWithin(copy, station);
      const bottom = top + copy.offsetHeight;
      align.current = (top + bottom) / 2 / window.innerHeight;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, [slug]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const g = group.current;
    const t = frame.time;
    const hovered = useJourney.getState().hoverProject === slug ? 1 : 0;
    hover.current = frame.reduced ? hovered : damp(hover.current, hovered, 8, dt);
    const scale = (frame.mobile ? 0.72 : 1.15) * (1 + hover.current * 0.04);
    // it rises out of the fog as you come up the road, and sinks back once you are well past
    const open = frame.revealIndex === index ? smooth(clamp01(frame.reveal)) : 0;
    const distanceAway = Math.abs(frame.z - (gateZ(index) + STOP_OFFSET));
    const rise = Math.max(open, smooth(clamp01((58 - distanceAway) / 26)));
    g.visible = rise > 0.001;

    // Level with the card: the camera looks dead level, so a screen row maps straight to a height at the
    // distance the mark is seen from at its stop. Phones keep the figure on the horizon above the copy.
    const distance = STOP_OFFSET + CAM.back + FLOAT_BACK;
    const ndc = frame.mobile ? 0 : 1 - 2 * align.current;
    const mid = CAM.y + ndc * Math.tan(((CAM.fov / 2) * Math.PI) / 180) * distance;

    // it stays where it is when its panel opens (the panel takes the card's side); it only lifts a touch
    g.position.set(
      frame.mobile ? FLOAT_X_MOBILE : FLOAT_X,
      mid - OBJECT_MID * scale + Math.sin(t * 0.7 + index * 1.3) * 0.15 + Math.max(open * 0.3, hover.current * 0.35) - (1 - rise) * 9,
      gateZ(index) - FLOAT_BACK,
    );
    g.scale.setScalar(scale);
    markPositions[index].copy(g.position);
  });

  const handlers = {
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onOpen(slug);
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      set({ hoverProject: slug });
      document.body.style.cursor = "pointer";
    },
    onPointerOut: () => {
      set({ hoverProject: null });
      document.body.style.cursor = "";
    },
  };

  return (
    <group ref={group}>
      {/* the hologram is points and glow; this invisible column is what the pointer hits */}
      <mesh position={[0, 3.45, 0]} {...handlers}>
        <cylinderGeometry args={[2, 2, 6.8, 16]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </mesh>
      {children}
    </group>
  );
}
