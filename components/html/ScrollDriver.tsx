"use client";

import { useEffect } from "react";
import { stopById } from "@/content/journey";
import { useJourney } from "@/lib/store";

/**
 * Maps native page scroll to a position on the causeway.
 * The page scrolls normally; the 3D scene only reads the result.
 */
export function ScrollDriver() {
  useEffect(() => {
    let points: { y: number; z: number; focusX: number; id: string }[] = [];

    const measure = () => {
      points = Array.from(document.querySelectorAll<HTMLElement>("[data-stop]"))
        .map((el) => {
          const stop = stopById[el.dataset.stop!];
          const rect = el.getBoundingClientRect();
          return { y: rect.top + window.scrollY + rect.height / 2, z: stop.z, focusX: stop.focusX, id: stop.id };
        })
        .sort((a, b) => a.y - b.y);
      update();
    };

    const update = () => {
      if (!points.length) return;
      const probe = window.scrollY + window.innerHeight / 2;
      let i = 0;
      while (i < points.length - 2 && probe > points[i + 1].y) i++;
      const a = points[i];
      const b = points[Math.min(i + 1, points.length - 1)];
      const t = b.y === a.y ? 0 : Math.min(1, Math.max(0, (probe - a.y) / (b.y - a.y)));
      const nearest = t < 0.5 ? a : b;
      const state = useJourney.getState();
      state.set({
        targetZ: a.z + (b.z - a.z) * t,
        focusX: a.focusX + (b.focusX - a.focusX) * t,
        ...(state.section !== nearest.id ? { section: nearest.id } : {}),
      });
    };

    measure();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
      observer.disconnect();
    };
  }, []);

  return null;
}
