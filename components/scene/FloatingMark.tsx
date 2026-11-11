"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { Vector3, type Group } from "three";
import { FLOAT_BACK, FLOAT_X, FLOAT_X_MOBILE, gateZ } from "@/content/journey";
import { projects } from "@/content/projects";
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
/** How far from the stop, in metres, the cue has fully faded. */
const REACH = 12;

/**
 * Floating road: a project's hologram hangs in the air beside the causeway instead of standing in a gateway.
 * It is the thing you click. Its panel opens on the left, where the card was, so the mark stays in view and the
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

/**
 * Keeps the "open" cue under the mark of the project the visitor is standing at. The cue is HTML so it stays sharp
 * and uses the site's type; this writes straight to the element every frame.
 */
export function FloatCueTracker({ cue }: { cue: RefObject<HTMLButtonElement | null> }) {
  const p = useRef(new Vector3());

  useFrame(({ camera, size }) => {
    const el = cue.current;
    if (!el) return;
    const index = projects.reduce(
      (best, _, i) => (Math.abs(frame.z - (gateZ(i) + STOP_OFFSET)) < Math.abs(frame.z - (gateZ(best) + STOP_OFFSET)) ? i : best),
      0,
    );
    const mark = markPositions[index];
    if (!mark) return;
    const { activeProject, hoverProject } = useJourney.getState();
    const near = 1 - clamp01(Math.abs(frame.z - (gateZ(index) + STOP_OFFSET)) / REACH);
    const opacity = activeProject || frame.reveal > 0.02 ? 0 : clamp01(near * 2.5 - 0.4);

    // just under the emitter's dais, on its front edge
    const a = p.current.set(mark.x, mark.y - 0.35, mark.z + 1.5).project(camera);
    const x = ((a.x + 1) / 2) * size.width;
    const y = ((1 - a.y) / 2) * size.height;

    const project = projects[index];
    if (el.dataset.slug !== project.slug) {
      el.dataset.slug = project.slug;
      el.querySelector(".float-cue-index")!.textContent = String(index + 1).padStart(2, "0");
      el.querySelector(".float-cue-title")!.textContent = project.title;
    }
    el.dataset.hover = String(hoverProject === project.slug);
    el.style.opacity = opacity.toFixed(3);
    el.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, 10px)`;
  });

  return null;
}

/** The clickable sign under a floating mark. A mouse twin of the card's link, so it stays out of the tab order. */
export function FloatCue({ cue, onOpen }: { cue: RefObject<HTMLButtonElement | null>; onOpen: (slug: string) => void }) {
  const set = useJourney((s) => s.set);
  return (
    <button
      ref={cue}
      type="button"
      className="float-cue"
      tabIndex={-1}
      onClick={(e) => {
        const slug = e.currentTarget.dataset.slug;
        if (slug) onOpen(slug);
      }}
      onMouseEnter={(e) => set({ hoverProject: e.currentTarget.dataset.slug ?? null })}
      onMouseLeave={() => set({ hoverProject: null })}
    >
      <span className="float-cue-index" />
      <span className="float-cue-title" />
      <span className="float-cue-open">
        Open <span aria-hidden="true">→</span>
      </span>
    </button>
  );
}
