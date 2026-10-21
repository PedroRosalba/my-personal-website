// The guided path: every HTML section maps to a position on the causeway.
// World units are metres; the causeway runs along -z.

import { projects } from "./projects";

export const GATE_X = 9; // project gateways stand to the right of the causeway
// wider than the camera's trailing distance, so an earlier gateway never blocks the next one
export const GATE_SPACING = 70;
export const FIRST_GATE_Z = -215;

export const gateZ = (index: number) => FIRST_GATE_Z - GATE_SPACING * index;

export type Stop = { id: string; z: number; focusX: number };

const lastGateZ = gateZ(projects.length - 1);

export const TRANSIT_Z = -45; // colossal first gateway the causeway passes through
export const FINAL_GATE_Z = lastGateZ - 150;
export const CAUSEWAY_END_Z = FINAL_GATE_Z - 2;

// Page order: hero, experience (featured role, then "also"), projects and their gateways,
// writing, community, education (hackathon awards are dropdowns there), contact. z only ever decreases, so scrolling always walks forward.
export const stops: Stop[] = [
  { id: "top", z: 0, focusX: 0 },
  { id: "experience-herodotus", z: -84, focusX: 0 },
  { id: "experience-earlier", z: -128, focusX: 3 }, // past the stele
  { id: "projects", z: -186, focusX: 2 },
  ...projects.map((p, i) => ({ id: `project-${p.slug}`, z: gateZ(i) + 13, focusX: GATE_X })),
  { id: "writing", z: lastGateZ - 26, focusX: 0 },
  { id: "community", z: lastGateZ - 52, focusX: 0 },
  { id: "education", z: lastGateZ - 80, focusX: 0 },
  { id: "contact", z: FINAL_GATE_Z + 44, focusX: 0 },
];

export const stopById = Object.fromEntries(stops.map((s) => [s.id, s]));
