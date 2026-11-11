"use client";

import { useEffect } from "react";
import { useJourney } from "@/lib/store";

/**
 * Exploration control: compare the road with no guide (the camera is the traveller) and with a guiding light.
 * The choice lives in the URL (`?guide`), so either version can be linked.
 */
export function GuideToggle() {
  const guide = useJourney((s) => s.guide);
  const set = useJourney((s) => s.set);

  useEffect(() => {
    set({ guide: new URLSearchParams(window.location.search).has("guide") });
  }, [set]);

  const toggle = () => {
    const next = !guide;
    set({ guide: next });
    const url = new URL(window.location.href);
    if (next) url.searchParams.set("guide", "");
    else url.searchParams.delete("guide");
    // keep the router's own history state, only the query changes
    window.history.replaceState(window.history.state, "", url.toString().replace("guide=", "guide"));
  };

  return (
    <button type="button" className="guide-toggle" aria-pressed={guide} onClick={toggle}>
      <span className="guide-toggle-dot" aria-hidden="true" />
      {guide ? "Guide on" : "No guide"}
    </button>
  );
}
