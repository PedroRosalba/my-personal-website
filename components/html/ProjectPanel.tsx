"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);
  // The slot can outlive its URL (e.g. Back onto a native #hash entry): the URL is the truth.
  const open = pathname === `/projects/${slug}`;

  useEffect(() => {
    if (!open) return;
    // Scroll and panel must agree: a gateway click or "Next" can open a project far from where the page is,
    // so the page moves (hidden under the panel) to that project's station; closing then lands on its card.
    document
      .querySelector<HTMLElement>(`[data-stop="project-${slug}"]`)
      ?.scrollIntoView({ block: "start", behavior: "instant" });
    useJourney.getState().set({ activeProject: slug });
    return () => {
      useJourney.getState().set({ activeProject: null });
      // Back restores the scroll from before the panel opened; land on this project's card instead,
      // unless another project has opened meanwhile ("Next").
      const land = () => {
        if (useJourney.getState().activeProject) return;
        document
          .querySelector<HTMLElement>(`[data-stop="project-${slug}"]`)
          ?.scrollIntoView({ block: "start", behavior: "instant" });
      };
      requestAnimationFrame(() => requestAnimationFrame(land));
      setTimeout(land, 120);
    };
  }, [slug, open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.back();
    };
    // Back onto a history entry the router doesn't own (a native #hash jump) changes the URL
    // without clearing this slot — resync the router to the real URL.
    const onPop = () => {
      if (window.location.pathname !== `/projects/${slug}`) {
        router.replace(window.location.pathname + window.location.search + window.location.hash, { scroll: false });
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("popstate", onPop);
      previous?.focus?.();
    };
  }, [router, open, slug]);

  if (!open) return null;

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
