"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useJourney } from "@/lib/store";

/** Project overlay on top of the 3D scene. Close / Esc / Back return to the causeway. */
export function ProjectPanel({
  slug,
  title,
  children,
}: {
  slug: string;
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    useJourney.getState().set({ activeProject: slug });
    return () => useJourney.getState().set({ activeProject: null });
  }, [slug]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [router]);

  return (
    <div className="panel-layer">
      <button className="panel-dismiss" aria-label="Close project" tabIndex={-1} onClick={() => router.back()} />
      <aside className="panel" role="dialog" aria-modal="true" aria-label={title}>
        <div className="panel-bar">
          <span className="panel-path">/projects/{slug}</span>
          <button ref={closeRef} className="panel-close" onClick={() => router.back()}>
            Close <kbd>Esc</kbd>
          </button>
        </div>
        {children}
      </aside>
    </div>
  );
}
