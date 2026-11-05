"use client";

import { useEffect, useState } from "react";
import type { TerminalWindow as Terminal } from "@/content/projects";

/** How long each kind of line holds before the next one, and the rest before the run starts again. */
const COMMAND_MS = 900;
const OUTPUT_MS = 170;
const REST_MS = 5200;

/** The work as it runs: the same window as the live products, tinted violet until hover. The script loops. */
export function TerminalWindow({ terminal }: { terminal: Terminal }) {
  const { lines } = terminal;
  const [shown, setShown] = useState(lines.length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout>;
    const step = (n: number) => {
      setShown(n);
      const last = n >= lines.length;
      const line = lines[n - 1];
      timer = setTimeout(() => step(last ? 0 : n + 1), last ? REST_MS : line?.tone === "command" ? COMMAND_MS : OUTPUT_MS);
    };
    step(0);
    return () => clearTimeout(timer);
  }, [lines]);

  return (
    <a className="product-window" href={terminal.href} target="_blank" rel="noreferrer" aria-label={terminal.alt}>
      <span className="pw-bar">
        <span className="pw-seam" aria-hidden="true" />
        <span>{terminal.label}</span>
        <span aria-hidden="true">↗</span>
      </span>
      <span className="pw-terminal" aria-hidden="true">
        {lines.map((line, i) => (
          <span key={i} className={`t-line t-${line.tone ?? "plain"}`} data-on={i < shown}>
            {line.tone === "command" ? <span className="t-prompt">$ </span> : null}
            {line.task ? <span className="t-task">{line.task} </span> : null}
            {line.text}
            {line.badge ? <span className="t-badge"> {line.badge}</span> : null}
          </span>
        ))}
      </span>
    </a>
  );
}
