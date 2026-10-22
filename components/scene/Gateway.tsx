"use client";

import { useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { ExtrudeGeometry, MeshBasicMaterial, PointLight, ShaderMaterial, Shape, ShapeGeometry } from "three";
import { useJourney } from "@/lib/store";
import { ACCENT, ACCENT_RAW, FOG_DENSITY, STONE, clamp01, damp, frame } from "./state";

type Props = {
  kind: "transit" | "project" | "final";
  position: [number, number, number];
  width: number;
  height: number;
  depth: number;
  openWidth: number;
  openHeight: number;
  index?: number;
  slug?: string;
  /** Project gateways only: false keeps the opening dark, so the landmark is all you see. */
  portal?: boolean;
  onOpen?: (slug: string) => void;
  children?: React.ReactNode;
};

/** Arch outline, feet at y = 0, traced left → over the top → right. */
function traceArch(shape: Shape, w: number, h: number, start: "move" | "line") {
  const r = w / 2;
  if (start === "move") shape.moveTo(-r, 0);
  else shape.lineTo(-r, 0);
  shape.lineTo(-r, h - r);
  shape.absarc(0, h - r, r, Math.PI, 0, true);
  shape.lineTo(r, 0);
}

function monolithGeometry(width: number, height: number, depth: number, ow: number, oh: number) {
  const shape = new Shape();
  shape.moveTo(-width / 2, 0);
  traceArch(shape, ow, oh, "line");
  shape.lineTo(width / 2, 0);
  shape.lineTo(width / 2, height);
  shape.lineTo(-width / 2, height);
  shape.closePath();
  const geometry = new ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 28 });
  geometry.translate(0, 0, -depth / 2);
  return geometry;
}

function archGeometry(ow: number, oh: number) {
  const shape = new Shape();
  traceArch(shape, ow, oh, "move");
  shape.closePath();
  return new ShapeGeometry(shape, 28);
}

/** A thin band following the arch: the seam. */
function seamGeometry(ow: number, oh: number, thickness: number, inset = false) {
  const outer = inset ? ow / 2 : ow / 2 + thickness;
  const inner = inset ? ow / 2 - thickness : ow / 2;
  const cy = oh - ow / 2;
  const shape = new Shape();
  shape.moveTo(-outer, 0);
  shape.lineTo(-outer, cy);
  shape.absarc(0, cy, outer, Math.PI, 0, true);
  shape.lineTo(outer, 0);
  shape.lineTo(inner, 0);
  shape.lineTo(inner, cy);
  shape.absarc(0, cy, inner, 0, Math.PI, false);
  shape.lineTo(-inner, 0);
  shape.closePath();
  return new ShapeGeometry(shape, 28);
}

const portalVertex = /* glsl */ `
  varying vec2 vP;
  varying float vDepth;
  void main() {
    vP = position.xy;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

// Looking into the portal: a receding tunnel of light. Dormant it is almost black.
const portalFragment = /* glsl */ `
  varying vec2 vP;
  varying float vDepth;
  uniform float uMode;   // 0 = tunnel portal, 1 = door of light
  uniform float uFog;
  uniform float uTime;
  uniform float uOpen;   // 0 dormant → 1 open
  uniform float uGlow;   // idle presence
  uniform vec2 uSize;    // opening width, height
  uniform vec3 uAccent;

  void main() {
    vec2 c = vec2(0.0, uSize.y * 0.46);
    vec2 q = (vP - c) / uSize.x;
    float r = length(q) + 0.02;
    float a = atan(q.y, q.x);

    float depth = 0.32 / r;
    float rings = smoothstep(0.82, 1.0, sin(depth * 5.0 - uTime * 2.4) * 0.5 + 0.5);
    float spokes = smoothstep(0.55, 1.0, sin(a * 12.0 + depth * 0.6) * 0.5 + 0.5);
    float core = exp(-r * 4.2);
    float falloff = smoothstep(1.5, 0.1, r);

    vec3 open = uAccent * (rings * 0.55 + spokes * rings * 0.3) * falloff + mix(uAccent, vec3(1.0), 0.75) * core * 1.5;

    // door of light: a calm gradient, brightest low and centred
    float v = vP.y / uSize.y;
    float heart = exp(-dot(q * vec2(1.5, 0.7), q * vec2(1.5, 0.7)) * 2.6);
    vec3 door = mix(uAccent * 0.85, vec3(1.0, 0.97, 1.0), clamp(heart * 1.15 + (1.0 - v) * 0.2, 0.0, 1.0));
    open = mix(open, door, uMode);
    float floorGlow = smoothstep(uSize.y * 0.7, 0.0, vP.y);
    vec3 idle = uAccent * (0.015 + 0.1 * floorGlow) * uGlow;

    vec3 color = mix(idle, open, uOpen);
    float fog = 1.0 - exp(-uFog * uFog * vDepth * vDepth);
    color = mix(color, vec3(0.067, 0.063, 0.1), fog * (1.0 - 0.5 * uMode));
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function Gateway({
  kind,
  position,
  width,
  height,
  depth,
  openWidth,
  openHeight,
  index = -1,
  slug,
  portal: hasPortal = true,
  onOpen,
  children,
}: Props) {
  const set = useJourney((s) => s.set);
  const light = useRef<PointLight>(null!);
  const level = useRef(kind === "final" ? 1 : 0.15);

  const monolith = useMemo(
    () => monolithGeometry(width, height, depth, openWidth, openHeight),
    [width, height, depth, openWidth, openHeight],
  );
  const arch = useMemo(() => archGeometry(openWidth, openHeight), [openWidth, openHeight]);
  const seam = useMemo(
    () => seamGeometry(openWidth, openHeight, kind === "project" ? 0.11 : 0.16),
    [openWidth, openHeight, kind],
  );
  // ribs sit just inside the passage walls so they read as rings of light receding into depth
  const rib = useMemo(() => seamGeometry(openWidth, openHeight, 0.045, true), [openWidth, openHeight]);
  const seamMaterial = useMemo(() => new MeshBasicMaterial({ color: ACCENT, toneMapped: false }), []);
  const ribMaterial = useMemo(() => new MeshBasicMaterial({ color: ACCENT, toneMapped: false }), []);
  const portal = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: portalVertex,
        fragmentShader: portalFragment,
        uniforms: {
          uTime: { value: 0 },
          uOpen: { value: kind === "final" ? 1 : 0 },
          uGlow: { value: 0.2 },
          uSize: { value: [openWidth, openHeight] },
          uAccent: { value: ACCENT_RAW },
          uMode: { value: kind === "final" ? 1 : 0 },
          uFog: { value: FOG_DENSITY },
        },
        fog: false,
        toneMapped: false,
      }),
    [kind, openWidth, openHeight],
  );
  const ribs = useMemo(() => {
    if (kind !== "transit") return [];
    const count = Math.floor(depth / 5);
    return Array.from({ length: count }, (_, i) => depth / 2 - 3 - i * 5);
  }, [kind, depth]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const s = useJourney.getState();
    let target = 0.15;
    let open = 0;

    if (kind === "project") {
      const near = 1 - clamp01(Math.abs(frame.z - (position[2] + 13)) / 24);
      const hovered = s.hoverProject === slug ? 1 : 0;
      const active = frame.revealIndex === index ? frame.reveal : 0;
      target = Math.max(0.12 + near * 0.75, hovered, active);
      open = hasPortal ? active : 0;
    } else if (kind === "transit") {
      // faint at Arrival; it wakes as the traveller approaches
      const near = 1 - clamp01(Math.abs(frame.z - position[2]) / 70);
      target = 0.3 + near * 0.5;
    } else {
      target = 0.55 + 0.45 * clamp01((position[2] + 110 - frame.z) / 90);
      open = 1;
    }

    level.current = damp(level.current, target, 5, dt);
    const l = level.current;
    seamMaterial.color.copy(ACCENT).multiplyScalar(0.12 + l * 1.5);
    // ribs stay faint from outside and wake only while the traveller is inside the passage
    const inside = 1 - clamp01(Math.abs(frame.z - position[2]) / (depth * 0.9));
    ribMaterial.color.copy(ACCENT).multiplyScalar(0.05 + inside * 0.7);
    portal.uniforms.uTime.value = frame.time;
    portal.uniforms.uOpen.value = kind === "final" ? 0.55 + 0.45 * l : open;
    portal.uniforms.uGlow.value = l;
    if (light.current) light.current.intensity = (kind === "final" ? 220 : kind === "transit" ? 45 : 90) * l * (0.4 + open);
  });

  const interactive = kind === "project" && slug && onOpen;
  const handlers = interactive
    ? {
        onClick: (e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onOpen(slug);
        },
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          set({ hoverProject: slug });
          document.body.style.cursor = "pointer";
        },
        onPointerOut: () => {
          set({ hoverProject: null });
          document.body.style.cursor = "";
        },
      }
    : {};

  return (
    <group position={position}>
      <mesh geometry={monolith} {...handlers}>
        <meshStandardMaterial color={STONE} roughness={0.96} />
      </mesh>

      {/* the monolith rises out of the fog; project gateways get a forecourt off the causeway */}
      <mesh position={[0, -45, 0]}>
        <boxGeometry args={[width, 90, depth]} />
        <meshStandardMaterial color={STONE} roughness={0.96} />
      </mesh>
      {kind === "project" ? (
        <mesh position={[(width / 2 - position[0] + 1.7) / 2, -0.3, depth / 2 + 4]}>
          <boxGeometry args={[width / 2 + position[0] - 1.7, 0.6, 8]} />
          <meshStandardMaterial color="#34343c" roughness={0.92} />
        </mesh>
      ) : null}

      {/* seam on the face toward the traveller */}
      <mesh geometry={seam} material={seamMaterial} position={[0, 0, depth / 2 + 0.03]} />

      {kind !== "project" ? (
        // a single hairline splitting the monolith above the arch, up into the dark
        <mesh material={seamMaterial} position={[0, (openHeight + height) / 2 + 1.5, depth / 2 + 0.03]}>
          <planeGeometry args={[0.1, height - openHeight - 3]} />
        </mesh>
      ) : null}

      {kind === "transit" ? (
        // the passage: ribs of light receding through the monolith
        ribs.map((z) => <mesh key={z} geometry={rib} material={ribMaterial} position={[0, 0, z]} />)
      ) : (
        <mesh geometry={arch} material={portal} position={[0, 0, -depth / 2 + 0.4]} {...handlers} />
      )}

      <pointLight
        ref={light}
        position={[0, openHeight * 0.45, kind === "transit" ? 0 : depth / 2 + 2.5]}
        color="#8f66ff"
        distance={kind === "final" ? 90 : kind === "transit" ? 40 : 26}
        decay={2}
      />
      {children}
    </group>
  );
}
