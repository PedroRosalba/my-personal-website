"use client";

import { useState } from "react";
import type { YouTubeClip as Clip } from "@/content/media";

/** A still until clicked: no YouTube request, cookie or autoplay before the visitor asks for it. */
export function YouTubeClip({ clip, title, language }: { clip: Clip; title: string; language?: string }) {
  const [playing, setPlaying] = useState(false);
  const params = new URLSearchParams({ autoplay: "1", rel: "0" });
  if (clip.start) params.set("start", String(clip.start));
  if (clip.end) params.set("end", String(clip.end));

  if (playing) {
    return (
      <iframe
        className="clip-frame"
        src={`https://www.youtube-nocookie.com/embed/${clip.id}?${params}`}
        title={title}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    );
  }
  return (
    <button type="button" className="clip-still" onClick={() => setPlaying(true)} aria-label={`Play: ${title}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`https://i.ytimg.com/vi/${clip.id}/hqdefault.jpg`} alt="" loading="lazy" />
      <span className="clip-play" aria-hidden="true">▶</span>
      {language ? <span className="clip-lang">{language}</span> : null}
    </button>
  );
}
