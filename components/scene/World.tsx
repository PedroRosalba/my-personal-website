"use client";

import { projects } from "@/content/projects";
import { FINAL_GATE_Z, GATE_X, TRANSIT_Z, gateZ } from "@/content/journey";
import { FOG_COLOR, FOG_DENSITY } from "./state";
import { Rig } from "./Rig";
import { Figure } from "./Figure";
import { Sky } from "./Sky";
import { FogSea } from "./FogSea";
import { Causeway, Colonnade, Stele } from "./Structures";
import { Gateway } from "./Gateway";
import { EthDiamond } from "./EthDiamond";

export function World({ onOpen }: { onOpen: (slug: string) => void }) {
  return (
    <>
      <color attach="background" args={["#050507"]} />
      <fogExp2 attach="fog" args={[FOG_COLOR, FOG_DENSITY]} />

      {/* The Eclipse is the only "sun": a cold backlight from the end of the causeway. */}
      <ambientLight intensity={0.75} color="#9a9aa8" />
      <directionalLight position={[40, 90, -300]} intensity={1.0} color="#e2def2" />
      <directionalLight position={[-40, 50, 120]} intensity={0.5} color="#8c8c98" />

      <Rig />
      <Sky />
      <FogSea />
      <Colonnade />
      <Causeway />
      <Figure />

      {/* 00 → 01: the first threshold. The causeway passes through it. */}
      <Gateway
        kind="transit"
        position={[0, 0, TRANSIT_Z]}
        width={16}
        height={130}
        depth={30}
        openWidth={5.4}
        openHeight={11}
      />

      <Stele position={[7.5, 0, -114]} />

      {/* 03: one gateway per project, in content order. */}
      {projects.map((project, i) => (
        <Gateway
          key={project.slug}
          kind="project"
          index={i}
          slug={project.slug}
          onOpen={onOpen}
          position={[GATE_X, 0, gateZ(i)]}
          width={14}
          height={36}
          depth={5}
          openWidth={4.8}
          openHeight={9.6}
        >
          {project.landmark === "eth" ? <EthDiamond position={[0, 4.6, 1.2]} /> : null}
        </Gateway>
      ))}

      {/* 05: the last gateway, open and lit, at the edge of the void. */}
      <Gateway
        kind="final"
        position={[0, 0, FINAL_GATE_Z]}
        width={12.5}
        height={100}
        depth={6}
        openWidth={7}
        openHeight={15}
      />
    </>
  );
}
