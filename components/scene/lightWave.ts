import { useFrame } from "@react-three/fiber";
import { MeshStandardMaterial, Vector3 } from "three";
import { ACCENT_RAW, frame } from "./state";

/**
 * One slow swell of the accent colour rolling through the whole background, from the Eclipse toward
 * the traveller: the fog sea brightens as the crest crosses it and the colonnade monoliths wake as it
 * passes them, so the background rises and falls together on a slow beat. Driven by the shared clock,
 * so it freezes under reduced motion.
 */
export const LIGHT_WAVE = {
  /** crest-to-crest distance in world units; long, so roughly one crest is in view at a time */
  length: 720,
  /** crest travel toward the camera, in world units per second (length / speed = seconds per beat) */
  speed: 140,
  /** how sharp the crest is: 1 = gentle sine, higher = a crest with longer dark between beats */
  shape: 2.2,
  /** peak added brightness on the fog sea */
  ground: 0.19,
  /** peak added brightness on the monoliths, in display space */
  pillars: 0.62,
  /** the monolith glow is seen through haze: 1 = the scene fog, lower = it carries further */
  haze: 0.3,
};

/** GLSL: the swell at world z, 0 → 1. Shared by the fog sea and the monoliths so they move as one. */
export const LIGHT_WAVE_GLSL = /* glsl */ `
  uniform vec3 uLightWave; // length, speed, shape
  uniform float uLightWaveTime;
  float lightWave(float z, float bow) {
    float phase = (z + bow - uLightWaveTime * uLightWave.y) / uLightWave.x;
    float w = 0.5 + 0.5 * cos(phase * 6.2831853);
    return pow(w, uLightWave.z);
  }
`;

// One clock and one set of controls, shared by every material that follows the wave.
export const lightWaveUniforms = {
  uLightWaveTime: { value: 0 },
  uLightWave: { value: [LIGHT_WAVE.length, LIGHT_WAVE.speed, LIGHT_WAVE.shape] },
};

const monolithUniforms = {
  uLwIntensity: { value: LIGHT_WAVE.pillars },
  uLwHaze: { value: LIGHT_WAVE.haze },
  uLwColor: { value: ACCENT_RAW.clone().lerp(new Vector3(1, 1, 1), 0.1) },
};

const vertexHead = /* glsl */ `
  varying float vLwH;
  varying float vLwZ;
`;

// Unit boxes scaled per instance: height 0 → 1 from foot to cap, plus the world z of the fragment.
// Linear terms only: anything else would be evaluated at the corners and interpolated flat.
const vertexBody = /* glsl */ `
  #include <project_vertex>
  vLwH = position.y + 0.5;
  {
    vec4 lwLocal = vec4(position, 1.0);
    #ifdef USE_INSTANCING
      lwLocal = instanceMatrix * lwLocal;
    #endif
    vLwZ = (modelMatrix * lwLocal).z;
  }
`;

const fragmentHead = /* glsl */ `
  ${LIGHT_WAVE_GLSL}
  uniform float uLwIntensity;
  uniform float uLwHaze;
  uniform vec3 uLwColor;
  varying float vLwH;
  varying float vLwZ;
  float lwGlow = 0.0;
`;

// The monolith takes the swell as it passes: brightest where it meets the fog, fading toward the cap.
const fragmentShape = /* glsl */ `
  #include <emissivemap_fragment>
  {
    float swell = lightWave(vLwZ, 0.0);
    float low = 1.0 - smoothstep(0.1, 0.9, vLwH);
    float facing = 0.7 + 0.3 * abs(dot(normal, normalize(vViewPosition)));
    lwGlow = swell * (0.25 + 0.75 * low) * facing;
  }
`;

// Added after the scene fog, through a thinner haze: the monoliths stand deep in the fog and would
// otherwise lose the glow entirely.
const fragmentLight = /* glsl */ `
  #include <fog_fragment>
  #ifdef USE_FOG
  {
    float haze = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth * uLwHaze);
    gl_FragColor.rgb += uLwColor * lwGlow * uLwIntensity * (1.0 - haze);
  }
  #endif
`;

/** Teaches an instanced unit-box standard material to follow the light wave. */
export function applyLightWave(material: MeshStandardMaterial) {
  const previous = material.onBeforeCompile;
  const previousKey = previous.toString();
  material.onBeforeCompile = (shader, renderer) => {
    previous.call(material, shader, renderer);
    Object.assign(shader.uniforms, lightWaveUniforms, monolithUniforms);
    shader.vertexShader = vertexHead + shader.vertexShader.replace("#include <project_vertex>", vertexBody);
    shader.fragmentShader =
      fragmentHead +
      shader.fragmentShader
        .replace("#include <emissivemap_fragment>", fragmentShape)
        .replace("#include <fog_fragment>", fragmentLight);
  };
  material.customProgramCacheKey = () => `${previousKey}|lightwave`;
  return material;
}

/** Advances the shared wave clock. Mount once in the world. */
export function LightWaveClock() {
  useFrame(() => {
    lightWaveUniforms.uLightWaveTime.value = frame.time;
  });
  return null;
}
