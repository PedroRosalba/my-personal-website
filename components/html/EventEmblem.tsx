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
  herodotus: (id) => <Herodotus id={id} />,
  daloc: (id) => <Daloc id={id} />,
  "daloc-docs": (id) => <DalocDocs id={id} />,
  ravi: (id) => <Ravi id={id} />,
  turborepo: (id) => <Turborepo id={id} />,
  enor: (id) => <Enor id={id} />,
  mediolano: (id) => <Mediolano id={id} />,
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

/** Light falling on a solid: lavender at the top, fading to the floor. */
function Lit({ id }: { id: string }) {
  return (
    <linearGradient id={`${id}-lit`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="rgb(196,184,255)" stopOpacity="0.75" />
      <stop offset="1" stopColor="rgb(237,235,230)" stopOpacity="0.1" />
    </linearGradient>
  );
}

/** The Daloc four-leaf mark, from daloc-logo.svg (15 × 17 units). */
function Clover({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="rgb(196,184,255)">
      <path d="M0 5.5C0 3.29 1.79 1.5 4 1.5C6.21 1.5 8 3.29 8 5.5V9.5H4C1.79 9.5 0 7.71 0 5.5Z" />
      <path d="M9 6.5C9 4.84 10.34 3.5 12 3.5C13.66 3.5 15 4.84 15 6.5C15 8.16 13.66 9.5 12 9.5H9V6.5Z" />
      <path d="M0 14.5C0 12.29 1.79 10.5 4 10.5H8V14.5C8 16.71 6.21 18.5 4 18.5C1.79 18.5 0 16.71 0 14.5Z" />
      <path d="M9 10.5H12C13.66 10.5 15 11.84 15 13.5C15 15.16 13.66 16.5 12 16.5C10.34 16.5 9 15.16 9 13.5V10.5Z" />
    </g>
  );
}

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

/** Herodotus: the outlined H from herodotus.dev with its two ghost blocks. A pulse of light runs the outline and
 * the ghost blocks wake in turn as it passes: state read in one place, proven in another. */
function Herodotus({ id }: { id: string }) {
  const H = "M42.5 8.5 L34 0 V34 H0 V68 L17 85 V51 H51 V17 Z"; // 51 × 85 units
  return (
    <Art>
      <defs>
        <linearGradient id={`${id}-ga`} x1="0" y1="17" x2="0" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="rgb(214,205,255)" />
          <stop offset="1" stopColor="rgb(214,205,255)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${id}-gb`} x1="0" y1="68" x2="0" y2="51" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="rgb(214,205,255)" />
          <stop offset="1" stopColor="rgb(214,205,255)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform="translate(41.7 5) scale(.56)">
        <path d={H} fill="rgba(123,97,255,.1)" />
        <path className="hd-ghost" d="M0 34 V17 H17 V34" fill="none" stroke={`url(#${id}-ga)`} strokeWidth="1.6" style={glow(1.5)} />
        <path className="hd-ghost hd-ghost-b" d="M34 51 V68 H51 V51" fill="none" stroke={`url(#${id}-gb)`} strokeWidth="1.6" style={glow(1.5)} />
        <path className="em-line" style={{ strokeWidth: 1.6 }} d={H} />
        <path className="em-hot hd-run" style={{ strokeWidth: 2.2 }} pathLength={1} d={H} />
      </g>
      <path className="em-base" d="M22 56 H90" />
    </Art>
  );
}

/** Daloc: the arc of collateral over a planet from daloc.xyz's hero, the four-leaf mark on the account, and
 * collateral orbs gliding along the arc: collateral that never sits still. */
function Daloc({ id }: { id: string }) {
  return (
    <Art>
      <defs>
        <radialGradient id={`${id}-dome`} cx="56" cy="64" r="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="rgb(160,144,255)" stopOpacity="0.6" />
          <stop offset="0.55" stopColor="rgb(123,97,255)" stopOpacity="0.18" />
          <stop offset="1" stopColor="rgb(123,97,255)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M24 63 Q56 37 88 63Z" fill={`url(#${id}-dome)`} />
      <path className="em-line" d="M24 63 Q56 37 88 63" />
      <path className="em-dim em-dash" id={`${id}-orbit`} d="M6 55 Q56 11 106 55" />
      <path className="em-line em-thin" d="M56 13.5 V50" />
      <rect x="47" y="5" width="18" height="8.5" rx="4.25" className="em-void" stroke="rgba(214,205,255,.6)" strokeWidth="0.6" />
      <Clover x={49.6} y={5.6} s={0.4} />
      <path className="em-dim" d="M57.6 9.25 H62.4" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <circle r="2" className="em-void" stroke="rgba(214,205,255,.75)" strokeWidth="0.6" />
          <circle r="0.7" fill="rgb(214,205,255)" />
          <animateMotion dur="10s" begin={`${-i * 2}s`} repeatCount="indefinite">
            <mpath href={`#${id}-orbit`} />
          </animateMotion>
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.12;.88;1" dur="10s" begin={`${-i * 2}s`} repeatCount="indefinite" />
        </g>
      ))}
    </Art>
  );
}

/** Daloc Docs: a docs page (sidebar with the four-leaf mark, heading, prose, a code block) that the light wave
 * reads from top to bottom. */
function DalocDocs({ id }: { id: string }) {
  const text: [number, number][] = [
    [19, 77],
    [23, 73],
    [27, 76],
    [31, 68],
  ];
  return (
    <Art>
      <defs>
        <clipPath id={`${id}-page`}>
          <rect x="30" y="7" width="52" height="44" rx="2" />
        </clipPath>
        <linearGradient id={`${id}-wave`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgb(123,97,255)" stopOpacity="0" />
          <stop offset="0.5" stopColor="rgb(214,205,255)" stopOpacity="0.5" />
          <stop offset="1" stopColor="rgb(123,97,255)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="30" y="7" width="52" height="44" rx="2" fill="rgba(123,97,255,.05)" />
      <g clipPath={`url(#${id}-page)`}>
        <rect className="dc-scan" x="30" y="0" width="52" height="10" fill={`url(#${id}-wave)`} />
      </g>
      <rect className="em-line" x="30" y="7" width="52" height="44" rx="2" />
      <path className="em-dim" d="M44 7 V51" />
      <Clover x={33.2} y={9.4} s={0.3} />
      <path className="em-line em-thin" d="M33.5 19 H40.5" />
      <path className="em-dim" d="M33.5 23 H39.5 M33.5 27 H41 M33.5 31 H38.5 M33.5 35 H40" />
      <path className="em-line" style={{ strokeWidth: 1.5 }} d="M48 13 H66" />
      <path className="em-dim" d={text.map(([y, x2]) => `M48 ${y} H${x2}`).join(" ")} />
      <rect x="48" y="35" width="29" height="11" rx="1" fill="rgba(3,3,4,.7)" stroke="rgba(237,235,230,.22)" strokeWidth="0.5" />
      <path className="em-line em-thin" d="M51 39 H60 M51 42.5 H67" />
      <path className="em-base" d="M18 54 H94" />
    </Art>
  );
}

/** Ravi: the robot that floats beside the Ravi gateway (components/scene/RobotMark), front view. It looks around
 * until a message reaches its antenna, then its eyes light and it faces you: an agent you reach from anywhere. */
function Ravi({ id }: { id: string }) {
  const loop = { dur: "6s", repeatCount: "indefinite" } as const;
  const at = (b: number, t: number) => (t + b / 6).toFixed(3);
  return (
    <Art>
      <defs>
        <Lit id={id} />
      </defs>
      <ellipse cx="56" cy="56.5" rx="11" ry="1.4" fill="rgba(123,97,255,.35)">
        <animate attributeName="rx" values="11;9;11" dur="3s" repeatCount="indefinite" />
      </ellipse>
      <path className="em-base" d="M22 56.5 H90" />
      {/* the message arriving: rings closing in on the antenna */}
      {[0, 0.3, 0.6].map((b) => (
        <circle key={b} cx="56" cy="6.5" r="14" fill="none" stroke="rgb(214,205,255)" strokeWidth="0.6" opacity="0">
          <animate attributeName="r" values="14;14;1.8;1.8" keyTimes={`0;${at(b, 0.02)};${at(b, 0.2)};1`} {...loop} />
          <animate attributeName="opacity" values="0;0;.8;0;0" keyTimes={`0;${at(b, 0.02)};${at(b, 0.08)};${at(b, 0.2)};1`} {...loop} />
        </circle>
      ))}
      <g>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 -1.4;0 0" dur="3s" repeatCount="indefinite" />
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-6 56 15;6 56 15;-6 56 15" dur="1.6s" repeatCount="indefinite" />
          <path className="em-line em-thin" d="M56 15 V8.4" />
          <circle cx="56" cy="6.5" r="1.7" fill="rgb(214,205,255)" style={glow(2)} opacity="0.5">
            <animate attributeName="opacity" values=".5;.5;1;1;.5" keyTimes="0;.3;.34;.75;1" {...loop} />
          </circle>
        </g>
        <rect x="39.2" y="21" width="3" height="7" rx="1.2" fill={`url(#${id}-lit)`} />
        <rect x="69.8" y="21" width="3" height="7" rx="1.2" fill={`url(#${id}-lit)`} />
        <rect className="em-line" x="42.5" y="15" width="27" height="19" rx="3" fill="rgba(123,97,255,.08)" />
        <rect x="45.5" y="19" width="21" height="11" rx="2" className="em-void" stroke="rgba(237,235,230,.22)" strokeWidth="0.5" />
        <g style={glow(2)}>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="-2 0;2 0;-2 0;-2 0;0 0;0 0;-2 0"
            keyTimes="0;.12;.24;.3;.34;.85;1"
            {...loop}
          />
          <g fill="rgb(214,205,255)" opacity="0.45">
            <animate attributeName="opacity" values=".45;.45;1;1;.45" keyTimes="0;.32;.36;.85;1" {...loop} />
            <circle cx="51.5" cy="24.5" r="2" />
            <circle cx="60.5" cy="24.5" r="2" />
          </g>
        </g>
        <rect className="em-line" x="46.5" y="37" width="19" height="13.5" rx="2" fill="rgba(123,97,255,.06)" />
        <rect x="52.3" y="41" width="7.4" height="1.4" rx="0.7" fill="rgb(214,205,255)" style={glow(2)} opacity="0.5">
          <animate attributeName="opacity" values=".5;.5;1;1;.5" keyTimes="0;.36;.4;.85;1" {...loop} />
        </rect>
      </g>
    </Art>
  );
}

/** Turborepo: the speedometer from turborepo.dev. The needle crawls, then snaps to the top with a flash: a cache
 * hit skips the work. */
function Turborepo({ id }: { id: string }) {
  const cx = 56,
    cy = 44,
    r = 25,
    a0 = 160,
    a1 = 380;
  const pt = (a: number, rr: number) =>
    [cx + rr * Math.cos((a * Math.PI) / 180), cy + rr * Math.sin((a * Math.PI) / 180)].map((v) => v.toFixed(2));
  const [sx, sy] = pt(a0, r);
  const [ex, ey] = pt(a1, r);
  const arc = `M${sx} ${sy} A${r} ${r} 0 1 1 ${ex} ${ey}`;
  let ticks = "";
  for (let i = 0; i <= 22; i++) {
    const a = a0 + (i * (a1 - a0)) / 22;
    const [x1, y1] = pt(a, 23);
    const [x2, y2] = pt(a, i % 5 === 0 ? 19.5 : 21.5);
    ticks += `M${x1} ${y1} L${x2} ${y2} `;
  }
  const rot = (deg: number) => `${deg} ${cx} ${cy}`;
  return (
    <Art>
      <defs>
        <linearGradient id={`${id}-band`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="rgb(123,97,255)" stopOpacity="0.35" />
          <stop offset="0.6" stopColor="rgb(160,144,255)" stopOpacity="0.8" />
          <stop offset="1" stopColor="rgb(237,235,255)" />
        </linearGradient>
      </defs>
      <path d={arc} fill="none" stroke={`url(#${id}-band)`} strokeWidth="2.2" strokeLinecap="round" style={glow(2, "rgba(123,97,255,.9)")} />
      <path d={arc} className="em-hot" strokeWidth="2.6" opacity="0">
        <animate attributeName="opacity" values="0;0;1;.3;0" keyTimes="0;.58;.62;.8;1" dur="6s" repeatCount="indefinite" />
      </path>
      <path className="em-dim" d={ticks} />
      <g>
        <path d={`M${cx - 3} ${cy} L${cx + 19} ${cy - 0.5} L${cx + 19} ${cy + 0.5} Z`} fill="rgb(237,235,255)" style={glow(1.5)} />
        <animateTransform
          attributeName="transform"
          type="rotate"
          dur="6s"
          repeatCount="indefinite"
          values={[165, 228, 228, 372, 372, 165].map(rot).join(";")}
          keyTimes="0;.55;.58;.61;.85;1"
        />
      </g>
      <circle cx={cx} cy={cy} r="2.6" className="em-void" stroke="rgba(214,205,255,.8)" strokeWidth="0.7" />
      <path className="em-base" d="M20 56 H92" />
    </Art>
  );
}

/** eNor: the cube, its upper faces in halftone and the bottom face open. Rows of the halftone light from the open
 * face upward: settlement rising into custody. */
function Enor({ id }: { id: string }) {
  const h = 14.72;
  const T = [56, 12],
    UR = [56 + h, 20.5],
    LR = [56 + h, 37.5],
    B = [56, 46],
    LL = [56 - h, 37.5],
    UL = [56 - h, 20.5],
    C = [56, 29];
  const poly = (pts: number[][]) => pts.map((p) => p.join(" ")).join(" L");
  const dots: { x: number; y: number; r: number; d: number }[] = [];
  for (let row = 0, y = 13.4; y < 38; row++, y += 2.25) {
    for (let x = 41.6 + (row % 2) * 1.15; x < 71; x += 2.3) {
      dots.push({
        x,
        y,
        r: 0.32 + 0.62 * Math.max(0, 1 - Math.hypot(x - 56, y - 15) / 22),
        d: -((38 - y) / 26) * 1.7,
      });
    }
  }
  const upper = `M${poly([T, UR, LR, C, LL, UL])} Z`;
  return (
    <Art>
      <defs>
        <clipPath id={`${id}-upper`}>
          <path d={upper} />
        </clipPath>
      </defs>
      <path d={upper} fill="rgba(123,97,255,.12)" />
      <g clipPath={`url(#${id}-upper)`}>
        {dots.map((p) => (
          <circle
            key={`${p.x.toFixed(2)}-${p.y.toFixed(2)}`}
            className="en-dot"
            cx={p.x.toFixed(2)}
            cy={p.y.toFixed(2)}
            r={p.r.toFixed(2)}
            style={{ ["--d" as string]: `${p.d.toFixed(2)}s` }}
          />
        ))}
      </g>
      <path className="em-line" d={`M${poly([T, UR, LR, B, LL, UL])} Z`} />
      <path className="em-line" d={`M${poly([LL, C, LR])}`} />
      <path className="em-base" d="M22 52 H90" />
    </Art>
  );
}

/** Mediolano: Medialane's two lanes, sparkle and dot. A spark leaves the sparkle, runs down the lane and lights the
 * dot: a work, minted, then licensed. */
function Mediolano({ id }: { id: string }) {
  const star = "M0 -4 Q.6 -.6 4 0 Q.6 .6 0 4 Q-.6 .6 -4 0 Q-.6 -.6 0 -4Z";
  const loop = { dur: "6s", repeatCount: "indefinite" } as const;
  return (
    <Art>
      <defs>
        <Lit id={id} />
        <clipPath id={`${id}-sq`}>
          <rect x="37" y="7" width="38" height="38" rx="10" />
        </clipPath>
      </defs>
      <rect x="37" y="7" width="38" height="38" rx="10" fill="rgba(123,97,255,.1)" />
      <g clipPath={`url(#${id}-sq)`} fill={`url(#${id}-lit)`}>
        <rect x="53" y="7" width="2.6" height="38" />
        <rect x="59" y="7" width="2.6" height="38" />
      </g>
      <rect className="em-line" x="37" y="7" width="38" height="38" rx="10" />
      <g transform="translate(44.5 15.5)">
        <path d={star} fill="rgb(214,205,255)" style={glow(2)}>
          <animateTransform attributeName="transform" type="scale" values="1;1.35;.9;1;1" keyTimes="0;.06;.14;.22;1" {...loop} />
        </path>
      </g>
      <circle cx="68.5" cy="38.5" r="2.5" fill="none" stroke="rgba(214,205,255,.7)" strokeWidth="0.7" />
      <circle cx="68.5" cy="38.5" r="2.5" fill="rgb(214,205,255)" opacity="0.15" style={glow(3)}>
        <animate attributeName="opacity" values=".15;.15;1;1;.15" keyTimes="0;.7;.74;.9;1" {...loop} />
      </circle>
      <circle r="1.1" fill="rgb(237,235,255)" opacity="0" style={glow(2)}>
        <animateMotion
          path="M44.5 15.5 Q57.3 9 57.3 18 L57.3 37 Q57.3 40.5 66 38.5"
          keyPoints="0;0;1;1"
          keyTimes="0;.1;.72;1"
          calcMode="linear"
          {...loop}
        />
        <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;.1;.14;.68;.73;1" {...loop} />
      </circle>
      <path className="em-base" d="M22 52 H90" />
    </Art>
  );
}
