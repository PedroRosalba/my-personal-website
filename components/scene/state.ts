import { Color, Vector3 } from "three";

/** Per-frame journey state, written by the Rig and read by everything else. Not React state. */
export const frame = {
  z: 0, // the visitor's position along the causeway
  speed: 0, // metres per second (signed)
  focusX: 0,
  reveal: 0, // 0..1 project reveal blend
  revealIndex: -1,
  walk: 0, // step phase of the eye-level camera (radians, grows with distance travelled)
  progress: 0, // 0 at Arrival → 1 at Contact
  time: 0, // animation clock (frozen under reduced motion)
  reduced: false,
  mobile: false,
};

/** The eye-level camera (Rig): height, how far behind the visitor's stop it stands, and its lens. It looks
 * dead level, so a point at the camera's height sits on the screen's horizontal centre line at any distance. */
export const CAM = { y: 1.9, back: 5, fov: 48, fovMobile: 60 };

/** Live world position of each project's floating mark (FloatingMark writes, the guide reads). */
export const markPositions: Vector3[] = [];

export const ACCENT = new Color("#8f66ff");
/** The same accent as display-space RGB, for raw shaders that write straight to the screen. */
export const ACCENT_RAW = new Vector3(0.56, 0.4, 1.0);
export const FOG_COLOR = "#11101a";
export const FOG_DENSITY = 0.0072;
export const STONE = "#4a4a55";

/** Shared by the sky dome and the far edge of the fog sea so the horizon has no seam. */
export const HORIZON_GLSL = /* glsl */ `
  vec3 horizonColor(float intensity, vec3 accent) {
    return vec3(0.060, 0.057, 0.086) + accent * 0.05 * intensity;
  }
`;

export const damp = (current: number, target: number, rate: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-rate * dt));

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (t: number) => t * t * (3 - 2 * t);
