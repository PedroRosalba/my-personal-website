// The guided path: every HTML section maps to a position on the causeway.
// World units are metres; the causeway runs along -z.

import { projects } from "./projects";

export const GATE_X = 9; // project gateways stand to the right of the causeway
export const GATE_SPACING = 40;
export const FIRST_GATE_Z = -215;

export const gateZ = (index: number) => FIRST_GATE_Z - GATE_SPACING * index;

export type Stop = { id: string; z: number; focusX: number };

const lastGateZ = gateZ(projects.length - 1);

export const TRANSIT_Z = -45; // colossal first gateway the causeway passes through
export const FINAL_GATE_Z = lastGateZ - 105;
export const CAUSEWAY_END_Z = FINAL_GATE_Z - 2;

export const stops: Stop[] = [
  { id: "top", z: 0, focusX: 0 },
  { id: "about", z: -98, focusX: 3 },
  { id: "education", z: -150, focusX: 0 },
  { id: "projects", z: -186, focusX: 2 },
  ...projects.map((p, i) => ({ id: `project-${p.slug}`, z: gateZ(i) + 13, focusX: GATE_X })),
  { id: "experience", z: lastGateZ - 45, focusX: 0 },
  { id: "contact", z: FINAL_GATE_Z + 16, focusX: 0 },
];

export const stopById = Object.fromEntries(stops.map((s) => [s.id, s]));
