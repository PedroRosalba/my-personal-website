"use client";

// Small living emblems, in the world's palette instead of a platform's share image or a screenshot of someone
// else's design. Same family as the talk card's Domus object (TalkPlayer): a dark star frame, one landmark from the
// item's own imagery drawn in light, and one quiet motion that means something. Used by Community rows, roles, the
// builds under a role and the project cards. The drawing is pure SVG/CSS; the only script pauses the SVG (SMIL)
// animations for visitors who ask for reduced motion, since CSS cannot stop those.

import { useEffect, useId, useRef, type CSSProperties } from "react";
import type { EmblemKind } from "@/content/media";

const DRAW: Record<EmblemKind, (id: string) => React.ReactNode> = {
  rio: () => <Rio />,
  obelisk: () => <Obelisk />,
};

/** `large` fills its container's width (a project card cover) and scales the glow with it. */
export function EventEmblem({ kind, large = false }: { kind: EmblemKind; large?: boolean }) {
  // Gradient and clip ids must be unique: the same emblem can be on the page twice (home row and project panel).
  const id = `em${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Freeze each SVG on a representative frame instead of its first one (which can be empty).
    ref.current?.querySelectorAll("svg").forEach((svg) => {
      try {
        svg.setCurrentTime(2.2);
        svg.pauseAnimations();
      } catch {
        /* an SVG without animations */
      }
    });
  }, []);

  return (
    <span ref={ref} className={`emblem emblem-${kind}${large ? " emblem-lg" : ""}`} aria-hidden="true">
      {DRAW[kind](id)}
    </span>
  );
}

/** A drop-shadow glow whose radius grows with the emblem (`--k` is 1 in a row, 3 on a card). */
const glow = (px: number, color = "rgb(123,97,255)"): CSSProperties => ({
  filter: `drop-shadow(0 0 calc(${px}px * var(--k)) ${color})`,
});

function Art({ children }: { children: React.ReactNode }) {
  return (
    <svg className="em-art" viewBox="0 0 112 63" focusable="false">
      {children}
    </svg>
  );
}

/** Devin Meetup, Rio: the skyline from the event's own cover, and an Eclipse moon with two orbiting tasks. */
function Rio() {
  return (
    <>
      <span className="em-moon">
        <span className="em-orbit em-orbit-a">
          <i />
        </span>
        <span className="em-orbit em-orbit-b">
          <i />
        </span>
      </span>
      <svg className="em-art" viewBox="0 0 112 63">
        <g className="em-line">
          {/* Corcovado and the Christ */}
          <path d="M8 50 Q15 38 21 33.5 Q24 31.5 27 33.5 Q33 38 40 50" />
          <path d="M24 31.5 V25.5 M21.2 27.4 H26.8" />
          {/* the city */}
          <path d="M41 50 V44 H45 V50 M46 50 V41 H49.5 V50 M50.5 50 V45.5 H54 V50 M55 50 V43 H57.5 V50" />
          {/* a palm */}
          <path d="M61 50 Q61.6 45 61 41 M61 41 Q57.8 40.4 56.6 42.2 M61 41 Q64.2 40.4 65.4 42.2 M61 41 Q59.2 38.6 57.6 38.8 M61 41 Q62.8 38.6 64.4 38.8" />
          {/* Sugarloaf, Urca, and the cable car */}
          <path d="M66 50 Q70 43 74 42.6 Q77 42.4 79 46 Q83 33 89 31.6 Q95 31 98 39 Q101 45 104 50" />
          <path d="M76.6 43 L90 31.8" className="em-cable" />
        </g>
        <path d="M6 50.5 H106" className="em-base" />
      </svg>
      <span className="em-water" />
    </>
  );
}

/** Invisible Garden, Buenos Aires: the Obelisco as a monolith the light wave climbs, and voxel petals rising. */
function Obelisk() {
  return (
    <>
      <svg className="em-art" viewBox="0 0 112 63">
        <defs>
          <clipPath id="em-obelisk-shape">
            <path d="M56 6 L58.6 10.4 L59.6 49 H52.4 L53.4 10.4 Z" />
          </clipPath>
          <linearGradient id="em-obelisk-wave" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgb(123,97,255)" stopOpacity="0" />
            <stop offset="0.5" stopColor="rgb(214,205,255)" stopOpacity="0.95" />
            <stop offset="1" stopColor="rgb(123,97,255)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="em-obelisk-lit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgb(196,184,255)" stopOpacity="0.7" />
            <stop offset="1" stopColor="rgb(237,235,230)" stopOpacity="0.12" />
          </linearGradient>
        </defs>
        <path d="M56 6 L58.6 10.4 L59.6 49 H52.4 L53.4 10.4 Z" fill="url(#em-obelisk-lit)" />
        <g clipPath="url(#em-obelisk-shape)">
          <rect className="em-wave" x="50" y="40" width="12" height="16" fill="url(#em-obelisk-wave)" />
        </g>
        <path d="M47 49 H65 V51.2 H47 Z M41 51.2 H71 V53 H41 Z" fill="url(#em-obelisk-lit)" />
        <path d="M14 53.5 H98" className="em-base" />
      </svg>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <i key={i} className="em-petal" style={{ ["--i" as string]: i }} />
      ))}
    </>
  );
}
