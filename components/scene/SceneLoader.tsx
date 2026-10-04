"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Experience = dynamic(() => import("./Experience"), { ssr: false });

function canRunWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    return !saveData;
  } catch {
    return false;
  }
}

/** Progressive enhancement: the 3D world mounts only after the HTML is interactive. */
export function SceneLoader() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has("nowebgl")) return;
    if (canRunWebGL()) setEnabled(true);
  }, []);
  return enabled ? <Experience /> : null;
}
