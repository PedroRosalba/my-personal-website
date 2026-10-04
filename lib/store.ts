import { create } from "zustand";

type JourneyState = {
  /** Where scroll says the figure should be (world z) and where the camera should lean. */
  targetZ: number;
  focusX: number;
  /** Nearest stop id, used for nav highlighting. */
  section: string;
  /** Project currently open in the panel (drives the reveal camera). */
  activeProject: string | null;
  /** Project hovered/focused in HTML or 3D (drives the gateway seam). */
  hoverProject: string | null;
  sceneReady: boolean;
  set: (partial: Partial<Omit<JourneyState, "set">>) => void;
};

export const useJourney = create<JourneyState>((set) => ({
  targetZ: 0,
  focusX: 0,
  section: "top",
  activeProject: null,
  hoverProject: null,
  sceneReady: false,
  set: (partial) => set(partial),
}));
