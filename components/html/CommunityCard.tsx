"use client";

import { useEffect, useRef, useState } from "react";
import type { CommunityItem, TalkVideo } from "@/content/media";
import { DomusArt, TalkDialog, type TalkControl } from "@/components/html/TalkPlayer";
import { EventEmblem } from "@/components/html/EventEmblem";
import { YouTubeClip } from "@/components/html/YouTubeClip";

/** Where an external link goes, in one word: "Luma", "Linktree", else the bare host. */
function linkLabel(href: string) {
  try {
    const host = new URL(href).hostname.replace(/^www\./, "");
    if (host.endsWith("luma.com") || host.endsWith("lu.ma")) return "Luma";
    if (host.endsWith("linktr.ee")) return "Linktree";
    if (host.endsWith("youtube.com") || host === "youtu.be") return "YouTube";
    return host;
  } catch {
    return "Link";
  }
}

/**
 * One Community row. The visual (a living emblem, the Domus, or an image) and the title lead to the row's primary
 * destination; a quiet action line underneath names every destination. When there are two (the talk is on the site
 * and the event has its own page), clicking the visual opens a tiny chooser on top of it instead of guessing.
 */
export function CommunityCard({ item }: { item: CommunityItem }) {
  const player = useRef<TalkControl | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [choosing, setChoosing] = useState(false);
  const video = item.video;
  const href = item.href;
  const label = href ? linkLabel(href) : null;
  const both = Boolean(video && href);
  const watch = () => {
    setChoosing(false);
    player.current?.open();
  };

  useEffect(() => {
    if (!choosing) return;
    const away = (e: PointerEvent) => { if (!rowRef.current?.contains(e.target as Node)) setChoosing(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setChoosing(false); };
    document.addEventListener("pointerdown", away);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away);
      document.removeEventListener("keydown", esc);
    };
  }, [choosing]);

  // An event emblem says nothing about a recording, so when the row also has a video it wears a small play badge.
  const art = item.emblem ? (
    <span className="cc-art">
      <EventEmblem kind={item.emblem} />
      {video ? <span className="cc-badge" aria-hidden="true" /> : null}
    </span>
  ) : video ? (
    <DomusArt />
  ) : item.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img className="card-thumb" src={item.image} alt="" loading="lazy" />
  ) : null;

  const minutes = video ? Math.round(((video.clip?.end ?? video.duration) - (video.clip?.start ?? 0)) / 60) : 0;

  let visual: React.ReactNode = null;
  if (item.youtube) {
    visual = <YouTubeClip clip={item.youtube} title={item.title} language={item.language} />;
  } else if (art && both) {
    visual = (
      <div className={`cc-visual-wrap${choosing ? " choosing" : ""}`}>
        <button type="button" className="cc-visual" onClick={() => setChoosing((c) => !c)} aria-expanded={choosing} aria-label={`Open ${item.title}: watch here or on ${label}`}>
          {art}
        </button>
        {choosing ? (
          <div className="cc-choose" role="menu" aria-label="Open with">
            <button type="button" role="menuitem" className="cc-choice cc-choice-watch" onClick={watch} autoFocus>
              <span aria-hidden="true">▶</span> Watch here
            </button>
            <a role="menuitem" className="cc-choice" href={href} target="_blank" rel="noreferrer" onClick={() => setChoosing(false)}>
              {label} <span aria-hidden="true">↗</span>
            </a>
          </div>
        ) : null}
      </div>
    );
  } else if (art && video) {
    visual = (
      <button type="button" className="cc-visual" onClick={watch} aria-label={`Play: ${item.title} (${minutes} min)`}>
        {art}
      </button>
    );
  } else if (art && href) {
    visual = (
      <a className="cc-visual" href={href} target="_blank" rel="noreferrer" tabIndex={-1} aria-hidden="true">
        {art}
      </a>
    );
  } else visual = art;

  return (
    <div className="cc" ref={rowRef}>
      {visual}
      <div>
        <p className="timeline-period">{item.period}</p>
        <h3 className="card-row-title">
          {video ? (
            <button type="button" className="talk-title" onClick={watch}>
              {item.title}
            </button>
          ) : href ? (
            <a href={href} target="_blank" rel="noreferrer">
              {item.title}
            </a>
          ) : (
            item.title
          )}
        </h3>
        <p className="card-row-text">{item.where}</p>
        {video || href ? (
          <p className="cc-actions">
            {video ? (
              <span className="cc-action">
                <button type="button" className="cc-link cc-link-watch" onClick={watch}>
                  <span aria-hidden="true">▶</span> Watch
                </button>
                <span className="cc-detail">
                  {" "}· {minutes}&nbsp;min{item.language ? ` · ${item.language}` : ""}
                  {video.chapters && video.chapters.length > 1 ? ` · ${video.chapters.length} chapters` : ""}
                </span>
              </span>
            ) : null}
            {href ? (
              <a className="cc-link" href={href} target="_blank" rel="noreferrer" aria-label={`${item.title} on ${label}`}>
                {label} <span aria-hidden="true">↗</span>
              </a>
            ) : null}
          </p>
        ) : null}
      </div>
      {video ? <TalkDialog item={{ ...item, video: video as TalkVideo }} controlRef={player} /> : null}
    </div>
  );
}
