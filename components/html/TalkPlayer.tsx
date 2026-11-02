"use client";

import { useCallback, useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { CommunityItem, TalkVideo, VideoChapter } from "@/content/media";

// The talk player. Motion follows .claude/skills/immersive-portfolio/MOTION_LIBRARY.md:
// opening "C · Light Seam", timeline "1 · Aurora Ridge", extra "Corona Breath".

const RATES = [1, 1.25, 1.5, 2];
const ACC = "123,97,255";

function fmt(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, "0");
  return h ? `${h}:${String(m).padStart(2, "0")}:${sec}` : `${m}:${sec}`;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function store(key: string, value?: number) {
  try {
    if (value === undefined) return Number(localStorage.getItem(key)) || 0;
    localStorage.setItem(key, String(Math.floor(value)));
  } catch {
    /* private mode, blocked storage: resume is a convenience only */
  }
  return 0;
}

/**
 * The Domus: the Eclipse over a colonnade, with voice ripples. The living object that stands in for a video still
 * (same 112×63 slot as the other rows' thumbnails). Purely visual: the row decides what clicking it does.
 */
export function DomusArt() {
  const gid = useId();
  return (
    <span className="talk-object" aria-hidden="true">
      <span className="to-ripple" style={{ animationDelay: "0s" }} />
      <span className="to-ripple" style={{ animationDelay: "-1.2s" }} />
      <span className="to-ripple" style={{ animationDelay: "-2.4s" }} />
      <span className="to-eclipse">
        <span className="to-play" />
      </span>
      <svg className="to-domus" viewBox="0 0 60 22">
        <defs>
          <linearGradient id={`${gid}-lit`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgb(196,184,255)" stopOpacity="0.75" />
            <stop offset="1" stopColor="rgb(237,235,230)" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        <g fill={`url(#${gid}-lit)`}>
          <path d="M5 7.4 30 1.2 55 7.4Z" />
          <rect x="5" y="7.9" width="50" height="1.3" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={8.6 + i * 8.2} y="9.9" width="2.2" height="9.6" />
          ))}
          <rect x="3" y="20" width="54" height="1.4" />
        </g>
      </svg>
    </span>
  );
}

export type TalkControl = { open: () => void };

/**
 * The player dialog for one talk. A row opens it through `controlRef.current.open()`; it also opens itself from a
 * deep link (/#talk=<id>&t=<seconds>). Nothing from the video loads before it opens.
 */
export function TalkDialog({ item, controlRef }: { item: CommunityItem & { video: TalkVideo }; controlRef: React.RefObject<TalkControl | null> }) {
  const { video, title, where, summary } = item;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const exitRef = useRef<(() => void) | null>(null);
  const [open, setOpen] = useState(false);

  const show = useCallback(() => {
    if (dialogRef.current?.open) return;
    dialogRef.current?.showModal();
    setOpen(true);
  }, []);

  useEffect(() => {
    controlRef.current = { open: show };
    return () => { controlRef.current = null; };
  }, [controlRef, show]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    if (params.get("talk") === video.id) show();
  }, [video.id, show]);

  const requestClose = () => (exitRef.current ? exitRef.current() : dialogRef.current?.close());

  return (
    <dialog
      ref={dialogRef}
      className="talk-dialog"
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault(); // Esc: play the exit first
        requestClose();
      }}
      onClose={() => {
        setOpen(false);
        if (window.location.hash.includes("talk=")) history.replaceState(null, "", window.location.pathname + window.location.search);
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose(); // click on the backdrop
      }}
    >
      {open ? (
        <Theater video={video} title={title} where={where} summary={summary} exitRef={exitRef} onClosed={() => dialogRef.current?.close()} />
      ) : null}
    </dialog>
  );
}

type TheaterProps = {
  video: TalkVideo;
  title: string;
  where: string;
  summary?: string;
  exitRef: React.RefObject<(() => void) | null>;
  onClosed: () => void;
};

function Theater({ video, title, where, summary, exitRef, onClosed }: TheaterProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const theaterRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  const auroraRef = useRef<HTMLCanvasElement>(null);
  const seamRef = useRef<HTMLSpanElement>(null);
  const seamTopRef = useRef<HTMLSpanElement>(null);
  const seamBotRef = useRef<HTMLSpanElement>(null);
  const idleTimer = useRef<number | undefined>(undefined);
  const energyRef = useRef<number[]>([]);
  const hoverXRef = useRef<number | null>(null);
  const introDone = useRef(false);

  const lo = video.clip?.start ?? 0;
  const hi = video.clip?.end ?? video.duration;
  const resumeKey = `talk:${video.id}`;

  const [t, setT] = useState(lo);
  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [captions, setCaptions] = useState(false);
  const [idle, setIdle] = useState(false);
  const [hover, setHover] = useState<{ x: number; time: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [resumed, setResumed] = useState<number | null>(null);
  const [cue, setCue] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const chapters: VideoChapter[] = (video.chapters ?? [{ start: lo, title }])
    .filter((c) => c.start < hi)
    .map((c) => ({ ...c, start: Math.max(c.start, lo) }));
  const chapterAt = (time: number) => {
    let i = 0;
    chapters.forEach((c, j) => {
      if (time >= c.start) i = j;
    });
    return i;
  };
  const current = chapterAt(t);

  const seek = useCallback(
    (time: number) => {
      const v = ref.current;
      if (!v) return;
      v.currentTime = clamp(time, lo, hi - 0.25);
      setT(v.currentTime);
    },
    [lo, hi],
  );

  const toggle = useCallback(() => {
    const v = ref.current;
    if (!v) return;
    if (v.paused) {
      if (v.currentTime >= hi - 0.5) v.currentTime = lo;
      void v.play();
    } else v.pause();
  }, [lo, hi]);

  const fullscreen = useCallback(() => {
    const stage = stageRef.current;
    const v = ref.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (document.fullscreenElement) void document.exitFullscreen();
    else if (stage?.requestFullscreen) void stage.requestFullscreen();
    else v?.webkitEnterFullscreen?.(); // iOS Safari
  }, []);

  // Lay the three seam lines over the theater: one across its middle, two that will ride its top and bottom edges.
  const placeSeams = () => {
    const th = theaterRef.current!;
    const r = th.getBoundingClientRect();
    const cy = r.top + r.height / 2;
    for (const el of [seamRef.current, seamTopRef.current, seamBotRef.current]) {
      if (el) Object.assign(el.style, { display: "block", left: `${r.left}px`, top: `${cy - 1}px`, width: `${r.width}px`, transform: "", opacity: "1" });
    }
    return r;
  };
  const hideSeams = () => {
    for (const el of [seamRef.current, seamTopRef.current, seamBotRef.current]) {
      if (!el) continue;
      el.getAnimations().forEach((a) => a.cancel());
      el.style.display = "none";
    }
  };

  // ---------- Light Seam: in ----------
  // A hairline of violet light draws across, flashes, then splits top and bottom with the player inside.
  useEffect(() => {
    const th = theaterRef.current;
    const line = seamRef.current;
    const top = seamTopRef.current;
    const bot = seamBotRef.current;
    if (!th || !line || !top || !bot) return;
    let cancelled = false;
    const finish = () => {
      // fill:"forwards" outlives a style reset, so the animations themselves must go, or the clip stays
      th.getAnimations().forEach((a) => a.cancel());
      th.style.clipPath = "";
      hideSeams();
      introDone.current = true;
      setRevealed(true);
    };
    if (reducedMotion()) {
      th.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "ease-out" }).finished.then(() => !cancelled && finish());
      return () => { cancelled = true; };
    }
    th.style.clipPath = "inset(50% 0 50% 0)";
    const r = placeSeams();
    top.style.display = bot.style.display = "none";
    (async () => {
      await line.animate([{ transform: "scaleX(0)", opacity: 0.4 }, { transform: "scaleX(1)", opacity: 1 }], { duration: 650, easing: "cubic-bezier(.7,0,.2,1)", fill: "forwards" }).finished;
      if (cancelled) return;
      await line.animate([{ filter: "brightness(1)" }, { filter: "brightness(2.2)" }, { filter: "brightness(1.4)" }], { duration: 300, fill: "forwards" }).finished;
      if (cancelled) return;
      line.style.display = "none";
      top.style.display = bot.style.display = "block";
      const half = r.height / 2;
      const split = { duration: 900, easing: "cubic-bezier(.65,0,.35,1)", fill: "forwards" as const };
      top.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: `translateY(${-half}px)`, opacity: 0.25 }], split);
      bot.animate([{ transform: "translateY(0)", opacity: 1 }, { transform: `translateY(${half}px)`, opacity: 0.25 }], split);
      await th.animate([{ clipPath: "inset(50% 0 50% 0)" }, { clipPath: "inset(0% 0 0% 0)" }], split).finished;
      if (cancelled) return;
      await Promise.all([top, bot].map((el) => el.animate([{ opacity: 0.25 }, { opacity: 0 }], { duration: 400, fill: "forwards" }).finished));
      if (!cancelled) finish();
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Light Seam: out ----------
  // The reverse: the edges close in on the middle, and the seam that is left collapses to nothing.
  useEffect(() => {
    exitRef.current = () => {
      const th = theaterRef.current;
      const dialog = th?.closest("dialog");
      const line = seamRef.current;
      const top = seamTopRef.current;
      const bot = seamBotRef.current;
      if (!th || !line || !top || !bot || reducedMotion()) return onClosed();
      ref.current?.pause();
      introDone.current = false;
      th.style.boxShadow = "none";
      const r = placeSeams();
      line.style.display = "none";
      const half = r.height / 2;
      try {
        dialog?.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 760, easing: "ease-in", pseudoElement: "::backdrop", fill: "forwards" });
      } catch {
        /* ::backdrop animation unsupported: it simply disappears with the dialog */
      }
      (async () => {
        const close = { duration: 420, easing: "cubic-bezier(.6,0,.4,1)", fill: "forwards" as const };
        top.animate([{ transform: `translateY(${-half}px)`, opacity: 0.3 }, { transform: "translateY(0)", opacity: 1 }], close);
        bot.animate([{ transform: `translateY(${half}px)`, opacity: 0.3 }, { transform: "translateY(0)", opacity: 1 }], close);
        await th.animate([{ clipPath: "inset(0% 0 0% 0)" }, { clipPath: "inset(50% 0 50% 0)" }], close).finished;
        top.style.display = bot.style.display = "none";
        line.style.display = "block";
        await line.animate([{ transform: "scaleX(1)", opacity: 1 }, { transform: "scaleX(0)", opacity: 0.3 }], { duration: 320, easing: "cubic-bezier(.7,0,.9,.4)", fill: "forwards" }).finished;
        hideSeams();
        onClosed();
      })();
    };
    return () => { exitRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exitRef, onClosed]);

  // Start: deep-link time, else the saved position, else the top. Autoplay rides the click that opened us.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const hashT = Number(new URLSearchParams(window.location.hash.slice(1)).get("t"));
    const saved = store(resumeKey);
    const start = hashT ? lo + hashT : saved > lo + 15 && saved < hi - 15 ? saved : lo;
    let started = false;
    const begin = () => {
      started = true;
      v.currentTime = start;
      if (!hashT && start !== lo) setResumed(start);
      void v.play().catch(() => setPlaying(false));
    };
    if (v.readyState >= 1) begin();
    else v.addEventListener("loadedmetadata", begin, { once: true });
    return () => {
      v.removeEventListener("loadedmetadata", begin);
      // Only a session that actually started may overwrite the saved spot.
      if (started) store(resumeKey, v.currentTime >= hi - 15 ? lo : v.currentTime);
    };
  }, [resumeKey, lo, hi]);

  useEffect(() => {
    if (!video.energy) return;
    let alive = true;
    fetch(video.energy)
      .then((r) => r.json())
      .then((d: { perSecond: number[] }) => { if (alive) energyRef.current = d.perSecond; })
      .catch(() => {});
    return () => { alive = false; };
  }, [video.energy]);

  // ---------- per frame: Aurora Ridge + Corona Breath ----------
  useEffect(() => {
    let raf = 0;
    let smooth = 0;
    const still = reducedMotion();
    const E = (s: number) => energyRef.current[clamp(Math.floor(s), 0, energyRef.current.length - 1)] ?? 0;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const v = ref.current;
      const cv = auroraRef.current;
      const th = theaterRef.current;
      if (!v || !cv || !th) return;
      const time = v.currentTime;
      const level = energyRef.current.length ? E(time) : 0.3;

      smooth += ((v.paused ? 0.12 : level) - smooth) * (still ? 1 : 0.12);
      if (introDone.current) {
        th.style.boxShadow = `0 0 0 1px rgba(214,205,255,${0.1 + smooth * 0.28}), 0 0 ${30 + smooth * 70}px ${smooth * 10}px rgba(${ACC},${0.16 + smooth * 0.38}), 0 0 ${140 + smooth * 120}px rgba(${ACC},${0.07 + smooth * 0.12}), 0 30px 120px rgba(0,0,0,.6)`;
      }

      const dpr = window.devicePixelRatio || 1;
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      if (!w) return;
      if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
        cv.width = Math.round(w * dpr);
        cv.height = Math.round(h * dpr);
      }
      const ctx = cv.getContext("2d")!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const span = hi - lo;
      const X = (s: number) => ((s - lo) / span) * w;
      const px = X(time);
      const base = h - 9;
      const amp = h - 14;
      const ridge = () => {
        ctx.beginPath();
        ctx.moveTo(0, base);
        for (let x = 0; x <= w; x += 2) {
          const s0 = lo + (x / w) * span;
          const s1 = lo + ((x + 2) / w) * span;
          let m = 0;
          for (let s = Math.floor(s0); s <= s1; s++) m = Math.max(m, E(s));
          if (!energyRef.current.length) m = 0.35;
          ctx.lineTo(x, base - (0.08 + m * 0.92) * amp);
        }
        ctx.lineTo(w, base);
        ctx.closePath();
        ctx.fill();
      };
      ctx.fillStyle = "rgba(237,235,230,0.14)";
      ridge();
      const hx = hoverXRef.current;
      if (hx !== null) {
        const g = ctx.createRadialGradient(hx, base, 0, hx, base, 64);
        g.addColorStop(0, "rgba(237,235,230,.38)");
        g.addColorStop(1, "rgba(237,235,230,0)");
        ctx.fillStyle = g;
        ridge();
      }
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, px, h);
      ctx.clip();
      const g = ctx.createLinearGradient(0, base - amp, 0, base);
      g.addColorStop(0, "rgba(200,188,255,1)");
      g.addColorStop(0.5, `rgba(${ACC},.95)`);
      g.addColorStop(1, `rgba(${ACC},.25)`);
      ctx.shadowColor = `rgba(${ACC},.9)`;
      ctx.shadowBlur = 8 + smooth * 14;
      ctx.fillStyle = g;
      ridge();
      ctx.restore();
      // chapters are breaks in the ridge
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      chapters.forEach((c) => { if (c.start > lo) ctx.fillRect(X(c.start) - 1, 0, 2, h); });
      ctx.restore();
      ctx.fillStyle = "rgba(237,235,230,.18)";
      ctx.fillRect(0, base, w, 1);
      ctx.fillStyle = `rgba(${ACC},.9)`;
      ctx.fillRect(0, base, px, 1);
      // playhead: a tiny Eclipse that pulses with the voice
      const r = 4.5 + smooth * 2.5;
      ctx.strokeStyle = `rgba(${ACC},.5)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, 2);
      ctx.lineTo(px, base);
      ctx.stroke();
      const halo = ctx.createRadialGradient(px, base, r * 0.8, px, base, r * 3.2 + smooth * 8);
      halo.addColorStop(0, `rgba(${ACC},${0.55 + smooth * 0.4})`);
      halo.addColorStop(1, `rgba(${ACC},0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(px, base, r * 3.2 + smooth * 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#030304";
      ctx.beginPath();
      ctx.arc(px, base, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(237,235,255,.95)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
    // chapters are derived from props; lo/hi cover the clip window
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lo, hi, video.chapters]);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.playbackRate = rate;
  }, [rate]);

  // Captions are drawn by us, not the browser: native cues would sit under the controls overlay.
  // "hidden" still loads the track and fires cuechange.
  useEffect(() => {
    const track = ref.current?.textTracks[0];
    if (!track) return;
    track.mode = "hidden";
    const onCue = () => {
      const active = captions && track.activeCues ? Array.from(track.activeCues) : [];
      setCue(active.length ? active.map((c) => (c as VTTCue).text).join("\n") : null);
    };
    track.addEventListener("cuechange", onCue);
    onCue();
    return () => track.removeEventListener("cuechange", onCue);
  }, [captions]);

  // Keep the current chapter in view in the side list.
  useEffect(() => {
    document.querySelector(".chapters button.on")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [current]);

  useEffect(() => {
    if (resumed === null) return;
    const id = window.setTimeout(() => setResumed(null), 6000);
    return () => window.clearTimeout(id);
  }, [resumed]);

  // Controls fade out while playing and the pointer is still.
  const wake = useCallback(() => {
    setIdle(false);
    window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), 2500);
  }, []);
  useEffect(() => () => window.clearTimeout(idleTimer.current), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const v = ref.current;
      if (!v) return;
      const handled = (() => {
        switch (e.key) {
          case " ":
          case "k": toggle(); return true;
          case "ArrowLeft": seek(v.currentTime - 5); return true;
          case "ArrowRight": seek(v.currentTime + 5); return true;
          case "j": seek(v.currentTime - 10); return true;
          case "l": seek(v.currentTime + 10); return true;
          case "f": fullscreen(); return true;
          case "m": v.muted = !v.muted; return true;
          case "c": if (video.captions?.length) setCaptions((c) => !c); return true;
          case ">": setRate((r) => RATES[Math.min(RATES.indexOf(r) + 1, RATES.length - 1)]); return true;
          case "<": setRate((r) => RATES[Math.max(RATES.indexOf(r) - 1, 0)]); return true;
          default:
            if (/^[0-9]$/.test(e.key)) { seek(lo + ((hi - lo) * Number(e.key)) / 10); return true; }
            return false;
        }
      })();
      if (handled) { e.preventDefault(); wake(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle, seek, fullscreen, wake, lo, hi, video.captions]);

  const timeAtPointer = (clientX: number) => {
    const r = scrubRef.current!.getBoundingClientRect();
    const x = clamp(clientX - r.left, 0, r.width);
    return { x, time: lo + (x / r.width) * (hi - lo) };
  };
  const onScrubDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    seek(timeAtPointer(e.clientX).time);
  };
  const onScrubMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const p = timeAtPointer(e.clientX);
    hoverXRef.current = p.x;
    setHover(p);
    if (dragging) seek(p.time);
  };

  const thumbStyle = (time: number) => {
    const th = video.thumbs;
    if (!th) return undefined;
    const per = th.cols * th.rows;
    const i = Math.floor(time / th.every);
    const sheet = th.sheets[Math.min(Math.floor(i / per), th.sheets.length - 1)];
    const k = i % per;
    return {
      width: th.w,
      height: th.h,
      backgroundImage: `url(${sheet})`,
      backgroundPosition: `-${(k % th.cols) * th.w}px -${Math.floor(k / th.cols) * th.h}px`,
    };
  };

  const shareAt = () => {
    const url = `${window.location.origin}${window.location.pathname}#talk=${video.id}&t=${Math.floor(t - lo)}`;
    void navigator.clipboard?.writeText(url);
  };

  return (
    <>
      <span className="seam" ref={seamRef} aria-hidden="true" />
      <span className="seam" ref={seamTopRef} aria-hidden="true" />
      <span className="seam" ref={seamBotRef} aria-hidden="true" />
      <div className={`theater${revealed ? " revealed" : ""}`} ref={theaterRef}>
        <div
          ref={stageRef}
          className={`stage${idle && playing && !dragging ? " idle" : ""}`}
          onPointerMove={wake}
          onPointerLeave={() => playing && setIdle(true)}
        >
          <video
            ref={ref}
            src={video.src}
            poster={video.poster}
            preload="metadata"
            playsInline
            onClick={toggle}
            onDoubleClick={fullscreen}
            onPlay={() => { setPlaying(true); wake(); }}
            onPause={() => { setPlaying(false); setIdle(false); }}
            onWaiting={() => setWaiting(true)}
            onPlaying={() => setWaiting(false)}
            onCanPlay={() => setWaiting(false)}
            onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.currentTime >= hi) { v.pause(); v.currentTime = hi; }
              setT(v.currentTime);
            }}
          >
            {video.captions?.map((c) => <track key={c.lang} kind="subtitles" src={c.src} srcLang={c.lang} label={c.label} />)}
          </video>

          {cue ? (
            <p className="stage-caption" lang={video.captions?.[0]?.lang}>
              <span>{cue}</span>
            </p>
          ) : null}
          {waiting && playing ? <span className="stage-spinner" aria-hidden="true" /> : null}
          {!playing && !waiting ? (
            <button type="button" className="stage-play clip-play" onClick={toggle} aria-label="Play">
              <Icon name="play" />
            </button>
          ) : null}
          {resumed !== null ? (
            <p className="stage-toast">
              Resumed at {fmt(resumed - lo)}
              <button type="button" onClick={() => { seek(lo); setResumed(null); }}>Start over</button>
            </p>
          ) : null}

          <div className="controls">
            <div
              ref={scrubRef}
              className="scrub scrub-aurora"
              role="slider"
              tabIndex={0}
              aria-label="Seek"
              aria-valuemin={0}
              aria-valuemax={Math.round(hi - lo)}
              aria-valuenow={Math.round(t - lo)}
              aria-valuetext={`${fmt(t - lo)} of ${fmt(hi - lo)}, ${chapters[current]?.title ?? ""}`}
              onKeyDown={(e) => {
                if (e.key === "Home") { e.preventDefault(); seek(lo); }
                if (e.key === "End") { e.preventDefault(); seek(hi - 1); }
              }}
              onPointerDown={onScrubDown}
              onPointerMove={onScrubMove}
              onPointerUp={() => setDragging(false)}
              onPointerLeave={() => { if (!dragging) { hoverXRef.current = null; setHover(null); } }}
            >
              <canvas ref={auroraRef} className="aurora" aria-hidden="true" />
              {hover ? (
                <span className="preview" style={{ left: clamp(hover.x, 84, (scrubRef.current?.clientWidth ?? 0) - 84) }}>
                  {video.thumbs ? <span className="preview-img" style={thumbStyle(hover.time)} /> : null}
                  <span className="preview-chapter">{chapters[chapterAt(hover.time)]?.title}</span>
                  <span className="preview-time">{fmt(hover.time - lo)}</span>
                </span>
              ) : null}
            </div>

            <div className="bar">
              <button type="button" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
                <Icon name={playing ? "pause" : "play"} />
              </button>
              <button type="button" onClick={() => seek(t - 10)} aria-label="Back 10 seconds"><Icon name="back" /></button>
              <button type="button" onClick={() => seek(t + 10)} aria-label="Forward 10 seconds"><Icon name="fwd" /></button>
              <button type="button" onClick={() => { if (ref.current) ref.current.muted = !muted; }} aria-label={muted ? "Unmute" : "Mute"}>
                <Icon name={muted ? "muted" : "sound"} />
              </button>
              <span className="bar-time">
                {fmt(t - lo)} <span>/ {fmt(hi - lo)}</span>
              </span>
              <span className="bar-chapter">
                {chapters.length > 1 ? (
                  <>
                    <i>{String(current + 1).padStart(2, "0")}</i>
                    {chapters[current]?.title}
                  </>
                ) : null}
              </span>
              <button
                type="button"
                className="bar-text"
                onClick={() => setRate(RATES[(RATES.indexOf(rate) + 1) % RATES.length])}
                aria-label={`Playback speed ${rate}x`}
              >
                {rate}×
              </button>
              {video.captions?.length ? (
                <button type="button" className={`bar-text${captions ? " on" : ""}`} onClick={() => setCaptions((c) => !c)} aria-pressed={captions} aria-label="Captions">
                  CC
                </button>
              ) : null}
              <button type="button" onClick={fullscreen} aria-label="Fullscreen"><Icon name="full" /></button>
            </div>
          </div>
        </div>

        <aside className="side">
          <div className="side-inner">
            <div className="side-head">
              <div>
                <h2 className="side-title">{title}</h2>
                <p className="side-where">{where}</p>
              </div>
              <button type="button" className="side-close" onClick={() => exitRef.current?.()} aria-label="Close">
                <Icon name="close" />
              </button>
            </div>
            {summary ? <p className="side-summary">{summary}</p> : null}
            {chapters.length > 1 ? (
              <ol className="chapters">
                {chapters.map((c, i) => (
                  <li key={c.start}>
                    <button
                      type="button"
                      className={i === current ? "on" : undefined}
                      aria-current={i === current ? "true" : undefined}
                      onClick={() => { seek(c.start); void ref.current?.play(); }}
                    >
                      <span className="chapter-time">{fmt(c.start - lo)}</span>
                      <span>{c.title}</span>
                    </button>
                  </li>
                ))}
              </ol>
            ) : null}
            <button type="button" className="side-share" onClick={shareAt}>
              Copy link at {fmt(t - lo)}
            </button>
            <p className="side-keys">
              <kbd>space</kbd> play · <kbd>←</kbd><kbd>→</kbd> 5s · <kbd>j</kbd><kbd>l</kbd> 10s · <kbd>&lt;</kbd><kbd>&gt;</kbd> speed · <kbd>f</kbd> full screen · <kbd>esc</kbd> close
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

const PATHS: Record<string, string> = {
  play: "M8 5.5v13l11-6.5z",
  pause: "M7 5h3.5v14H7zM13.5 5H17v14h-3.5z",
  back: "M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z",
  fwd: "M12 5V2l5 4-5 4V7a6 6 0 1 0 6 6h2a8 8 0 1 1-8-8z",
  sound: "M4 9h4l5-4v14l-5-4H4zM16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12",
  muted: "M4 9h4l5-4v14l-5-4H4zM16.5 9.5l5 5M21.5 9.5l-5 5",
  full: "M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5",
  close: "M6 6l12 12M18 6L6 18",
};

function Icon({ name }: { name: keyof typeof PATHS }) {
  const filled = name === "play" || name === "pause" || name === "back" || name === "fwd";
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill={filled ? "currentColor" : "none"} stroke={filled ? "none" : "currentColor"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={PATHS[name]} />
    </svg>
  );
}
