"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { InstancedMesh, MeshStandardMaterial, Object3D } from "three";
import { CAUSEWAY_END_Z, FINAL_GATE_Z } from "@/content/journey";
import { STONE } from "./state";

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function useInstances(build: () => { p: [number, number, number]; s: [number, number, number] }[]) {
  const ref = useRef<InstancedMesh>(null!);
  const items = useMemo(build, [build]);
  useLayoutEffect(() => {
    const o = new Object3D();
    items.forEach((it, i) => {
      o.position.set(...it.p);
      o.scale.set(...it.s);
      o.updateMatrix();
      ref.current.setMatrixAt(i, o.matrix);
    });
    ref.current.instanceMatrix.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [items]);
  return { ref, count: items.length };
}

const SEGMENT = 6;

const buildCauseway = () => {
  const items: { p: [number, number, number]; s: [number, number, number] }[] = [];
  for (let z = 42; z > CAUSEWAY_END_Z; z -= SEGMENT) {
    items.push({ p: [0, -0.3, z - SEGMENT / 2], s: [3.4, 0.6, SEGMENT - 0.12] });
  }
  return items;
};

const buildPiers = () => {
  const items: { p: [number, number, number]; s: [number, number, number] }[] = [];
  for (let z = 30; z > CAUSEWAY_END_Z; z -= SEGMENT * 5) {
    items.push({ p: [0, -35.6, z], s: [0.7, 70, 0.7] });
  }
  return items;
};

/** One narrow path, one direction. Slabs with seams, thin piers vanishing into the fog. */
export function Causeway() {
  const slabs = useInstances(buildCauseway);
  const piers = useInstances(buildPiers);
  return (
    <>
      <instancedMesh ref={slabs.ref} args={[undefined, undefined, slabs.count]}>
        <boxGeometry />
        <meshStandardMaterial color="#34343c" roughness={0.92} />
      </instancedMesh>
      <instancedMesh ref={piers.ref} args={[undefined, undefined, piers.count]}>
        <boxGeometry />
        <meshStandardMaterial color={STONE} roughness={1} />
      </instancedMesh>
    </>
  );
}

const buildColonnade = () => {
  const items: { p: [number, number, number]; s: [number, number, number] }[] = [];
  const base = -60;
  let n = 0;
  // inner avenue: ordered pairs flanking the causeway
  for (let z = 70; z > FINAL_GATE_Z - 20; z -= 46) {
    for (const side of [-1, 1]) {
      n++;
      const height = 90 + hash(n) * 80;
      const x = side * (54 + hash(n + 50) * 8);
      const w = 7 + hash(n + 90) * 4;
      if (n % 3 === 0) {
        // broken monolith: an aligned floating segment above a gap
        const cut = height * 0.6;
        items.push({ p: [x, base + cut / 2, z], s: [w, cut, w] });
        items.push({ p: [x, base + cut + 5 + (height - cut) / 2, z], s: [w, height - cut, w] });
      } else {
        items.push({ p: [x, base + height / 2, z], s: [w, height, w] });
      }
    }
  }
  // outer rows: taller, wider, mostly lost in fog
  for (let z = 120; z > FINAL_GATE_Z - 260; z -= 78) {
    for (const side of [-1, 1]) {
      n++;
      const height = 210 + hash(n) * 160;
      items.push({ p: [side * (135 + hash(n + 20) * 40), base + height / 2, z - 20], s: [20, height, 20] });
    }
  }
  return items;
};

/** Monoliths in ordered rows, receding into the fog: architecture at an inhuman scale. */
export function Colonnade() {
  const { ref, count } = useInstances(buildColonnade);
  const material = useMemo(() => {
    const m = new MeshStandardMaterial({ color: "#3d3d47", roughness: 1 });
    // Far monoliths dissolve into the haze instead of walling off the Eclipse.
    m.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
        float fadeNoise = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
        if (smoothstep(380.0, 240.0, vFogDepth) < fadeNoise) discard;`,
      );
    };
    return m;
  }, []);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} material={material}>
      <boxGeometry />
    </instancedMesh>
  );
}

/** About landmark: a nearby stele with one detached block held above it. */
export function Stele({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, -14, 0]}>
        <boxGeometry args={[3.4, 48, 3.4]} />
        <meshStandardMaterial color="#4a4a55" roughness={0.95} />
      </mesh>
      <mesh position={[0, 12.6, 0]}>
        <boxGeometry args={[3.4, 3.4, 3.4]} />
        <meshStandardMaterial color="#4a4a55" roughness={0.95} />
      </mesh>
      <pointLight position={[0, 10.45, 0]} color="#8f66ff" intensity={5} distance={8} decay={2} />
    </group>
  );
}
