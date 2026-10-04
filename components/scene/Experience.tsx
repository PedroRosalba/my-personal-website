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
  const open = useCallback((slug: string) => router.push(`/projects/${slug}`, { scroll: false }), [router]);

  useEffect(() => {
    useJourney.getState().set({ sceneReady: ready });
  }, [ready]);

  return (
    <div className="scene" data-ready={ready} aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
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
