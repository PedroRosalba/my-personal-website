"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  SRGBColorSpace,
  Sprite,
  SpriteMaterial,
  Vector3,
  type Group,
  type PointLight,
} from "three";
import { GATE_X } from "@/content/journey";
import { useJourney } from "@/lib/store";
import { ACCENT, clamp01, damp, frame, markPositions, smooth } from "./state";

const TRAIL = 22;
/** Height of the light over the stones, and how far ahead of the visitor it waits. */
const HOVER_Y = 1.35;
const AHEAD = 6;

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.16, "rgba(255,255,255,0.9)");
  g.addColorStop(0.42, "rgba(255,255,255,0.22)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

const target = new Vector3();
const orbit = new Vector3();

/**
 * The guide (`?guide`): a small violet light that leads the way down the road, lights the stones under it,
 * drifts toward each project as you reach it, and circles the mark while its panel is open.
 * No limbs, so no walk to get wrong. Without it the camera alone is the traveller.
 */
export function Guide() {
  const group = useRef<Group>(null!);
  const light = useRef<PointLight>(null!);
  const state = useRef({ pos: new Vector3(0, HOVER_Y, -AHEAD), fade: 0, init: false });

  const { core, halo, trail, history } = useMemo(() => {
    const map = glowTexture();
    const mat = (color: Color, opacity: number) =>
      new SpriteMaterial({ map, color, transparent: true, opacity, blending: AdditiveBlending, depthWrite: false, toneMapped: false, fog: false });
    return {
      core: new Sprite(mat(new Color("#f1ebff"), 1)),
      halo: new Sprite(mat(ACCENT.clone(), 0.55)),
      trail: Array.from({ length: TRAIL }, () => new Sprite(mat(ACCENT.clone(), 0.4))),
      history: Array.from({ length: TRAIL * 2 + 2 }, () => new Vector3()),
    };
  }, []);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = state.current;
    const on = useJourney.getState().guide;
    s.fade = frame.reduced ? (on ? 1 : 0) : damp(s.fade, on ? 1 : 0, 4, dt);
    // the light stays in the scene at zero (adding or removing a light recompiles every material)
    const visible = s.fade > 0.01;
    core.visible = halo.visible = visible;
    trail.forEach((p) => (p.visible = visible));
    if (!visible) {
      light.current.intensity = 0;
      s.init = false;
      return;
    }

    const t = frame.time;
    // leading: a little ahead and to the side the next project floats on
    const lean = clamp01(frame.focusX / GATE_X);
    const ahead = AHEAD + Math.min(5, Math.abs(frame.speed) * 0.35) + lean * 3;
    target.set(
      Math.sin(t * 0.6) * 0.35 + lean * (frame.mobile ? 1 : 2.4),
      HOVER_Y + Math.sin(t * 1.4) * 0.12 + lean * 0.5,
      frame.z - ahead,
    );

    // a project is open: fly out to its mark and circle it
    const open = frame.revealIndex >= 0 ? smooth(clamp01(frame.reveal)) : 0;
    const mark = frame.revealIndex >= 0 ? markPositions[frame.revealIndex] : undefined;
    if (mark && open > 0) {
      orbit.set(Math.cos(t * 1.1) * 2.3, 3.6 + Math.sin(t * 1.7) * 0.35, Math.sin(t * 1.1) * 2.3).add(mark);
      target.lerp(orbit, open);
    }

    // a nav jump: arrive with the visitor instead of streaking across the whole causeway
    if (!s.init || Math.abs(s.pos.z - target.z) > 30) {
      s.pos.copy(target);
      history.forEach((v) => v.copy(target));
      s.init = true;
    }
    s.pos.lerp(target, 1 - Math.exp(-(frame.reduced ? 60 : open > 0 ? 3.5 : 5) * dt));
    group.current.position.copy(s.pos);

    const breathe = 1 + Math.sin(t * 1.7) * 0.06;
    core.scale.setScalar(0.3 * breathe * (1 + open * 0.4));
    halo.scale.setScalar(1.5 * breathe * (1 + open * 0.6));
    core.material.opacity = s.fade;
    halo.material.opacity = (0.5 + open * 0.25) * s.fade;
    light.current.intensity = (10 + open * 14) * s.fade;

    const v = history.pop()!;
    v.copy(s.pos);
    history.unshift(v);
    trail.forEach((p, i) => {
      const k = 1 - i / TRAIL;
      p.position.copy(history[(i + 1) * 2]);
      p.scale.setScalar(0.24 * k + 0.03);
      p.material.opacity = 0.42 * k * k * s.fade;
    });
  });

  return (
    <>
      <group ref={group}>
        <primitive object={core} />
        <primitive object={halo} />
        <pointLight ref={light} color="#a58cff" intensity={10} distance={14} decay={2} />
      </group>
      {trail.map((p, i) => (
        <primitive key={i} object={p} />
      ))}
    </>
  );
}
