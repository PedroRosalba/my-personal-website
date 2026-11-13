"use client";

import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import type { Object3D } from "three";

/**
 * Builds every shader program once while the page loads, instead of the first time each thing comes into view
 * mid-scroll (each build stalls a frame; on phones, long enough to feel). The project marks and the desktop/phone
 * variants of their holograms start hidden, so they are shown for the one compile pass and hidden again.
 */
export function Warmup() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  useEffect(() => {
    // after the first frames, once the Rig has placed the camera and the marks have set their own visibility
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => {
        const hidden: Object3D[] = [];
        scene.traverse((o) => {
          if (!o.visible) {
            hidden.push(o);
            o.visible = true;
          }
        });
        gl.compile(scene, camera);
        hidden.forEach((o) => (o.visible = false));
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [gl, scene, camera]);

  return null;
}
