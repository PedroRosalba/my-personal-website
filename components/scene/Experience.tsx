"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping } from "three";
import { useJourney } from "@/lib/store";
import { World } from "./World";

export default function Experience() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  // phones: ~30% fewer pixels per frame than 1.5x; their screens are small enough that it still reads sharp
  // (client-only component, so matchMedia is there on first render)
  const [maxDpr] = useState(() => (window.matchMedia("(pointer: coarse)").matches ? 1.25 : 1.5));
  const open = useCallback((slug: string) => router.push(`/projects/${slug}`, { scroll: false }), [router]);

  useEffect(() => {
    useJourney.getState().set({ sceneReady: ready });
  }, [ready]);

  return (
    <div className="scene" data-ready={ready} aria-hidden="true">
      <Canvas
        dpr={[1, maxDpr]}
        // the canvas is fixed: it never needs re-measuring on scroll, and a burst of resizes settles into one
        resize={{ scroll: false, debounce: { scroll: 0, resize: 150 } }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ fov: 32, near: 0.5, far: 7000, position: [0, 3, 26] }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.05;
          // let the first frames render before fading in
          requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
        }}
      >
        <World onOpen={open} />
      </Canvas>
    </div>
  );
}
