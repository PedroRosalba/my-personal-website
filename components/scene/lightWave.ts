import { useFrame } from "@react-three/fiber";
import { MeshStandardMaterial, Vector3 } from "three";
import { ACCENT_RAW, frame } from "./state";

/**
 * Slow swells of the accent colour moving through the background: up through the colonnade
 * monoliths, as if they were dark tanks holding a violet liquid, and across the fog sea toward
 * the Eclipse. Driven by the shared clock, so everything freezes under reduced motion.
 */
export const LIGHT_WAVE = {
  pillars: {
    /** swells per second: one bottom → top pass takes 1 / speed seconds */
    speed: 0.06,
    /** peak added brightness in display space; the stone stays mostly dark */
    intensity: 0.4,
    /** half-width of the band as a fraction of the monolith height (soft gaussian, no hard line) */
    width: 0.12,
    /** how far neighbouring monoliths run out of phase: 0 = all in sync, 1 = fully spread */
    stagger: 0.6,
    /** fraction of each face, from its edge, over which the glow fades out (the tank's dark rim) */
    inset: 0.45,
    /** the glow is seen through haze: 1 = the scene fog, lower = it carries further */
    fog: 0.3,
  },
  sea: {
    /** distance between two crests, in world units */
    length: 320,
    /** crest travel toward the Eclipse, in world units per second */
    speed: 16,
    /** peak added brightness on the fog crests */
    intensity: 0.11,
  },
};

const P = LIGHT_WAVE.pillars;

// Shared by every monolith material: one clock, one set of controls.
const uniforms = {
  uLwTime: { value: 0 },
  uLwSpeed: { value: P.speed },
  uLwIntensity: { value: P.intensity },
  uLwWidth: { value: P.width },
  uLwStagger: { value: P.stagger },
  uLwInset: { value: P.inset },
  uLwFog: { value: P.fog },
  uLwColor: { value: ACCENT_RAW.clone().lerp(new Vector3(1, 1, 1), 0.1) },
};

const vertexHead = /* glsl */ `
  varying float vLwH;
  varying float vLwU;
  varying float vLwPhase;
`;

// Unit boxes scaled per instance: height 0 → 1 from foot to cap, the face's own u, and a phase that
// belongs to the monolith, not the vertex. Only linear terms here: anything else would be evaluated at
// the corners (where u is 0 or 1) and interpolated flat across the face.
const vertexBody = /* glsl */ `
  #include <project_vertex>
  vLwH = position.y + 0.5;
  vLwU = uv.x;
  #ifdef USE_INSTANCING
    vec3 lwOrigin = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  #else
    vec3 lwOrigin = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  #endif
  vLwPhase = fract(sin(dot(lwOrigin.xz, vec2(12.9898, 78.233))) * 43758.5453);
`;

const fragmentHead = /* glsl */ `
  uniform float uLwTime;
  uniform float uLwSpeed;
  uniform float uLwIntensity;
  uniform float uLwWidth;
  uniform float uLwStagger;
  uniform float uLwInset;
  uniform float uLwFog;
  uniform vec3 uLwColor;
  varying float vLwH;
  varying float vLwU;
  varying float vLwPhase;
  float lwGlow = 0.0;

  float lwBump(float d) {
    return exp(-d * d / (2.0 * uLwWidth * uLwWidth));
  }
`;

// The crest travels 0 → 1 and wraps, so the next swell enters at the foot while this one leaves the cap.
const fragmentShape = /* glsl */ `
  #include <emissivemap_fragment>
  {
    float crest = fract(uLwTime * uLwSpeed + vLwPhase * uLwStagger);
    float lateral = 1.0 - abs(vLwU * 2.0 - 1.0); // 0 at the face edges, 1 down the middle
    // the band curves: it lags a little toward the edges, like a meniscus
    float h = vLwH - 0.05 * (1.0 - lateral) * (1.0 - lateral);
    float d = h - crest;
    float band = lwBump(d) + lwBump(d + 1.0) + lwBump(d - 1.0);
    // the tank: dark at the foot and the cap, dark along the rim
    float envelope = smoothstep(0.0, 0.22, vLwH) * smoothstep(1.0, 0.72, vLwH);
    float rim = smoothstep(0.0, uLwInset, lateral);
    float facing = 0.6 + 0.4 * abs(dot(normal, normalize(vViewPosition)));
    lwGlow = band * envelope * rim * facing;
  }
`;

// Added after the scene fog, through a thinner haze of its own: the monoliths stand deep in the fog
// and would otherwise lose the glow entirely.
const fragmentLight = /* glsl */ `
  #include <fog_fragment>
  #ifdef USE_FOG
  {
    float haze = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth * uLwFog);
    gl_FragColor.rgb += uLwColor * lwGlow * uLwIntensity * (1.0 - haze);
  }
  #endif
`;

/** Teaches an instanced unit-box standard material the light wave. */
export function applyLightWave(material: MeshStandardMaterial) {
  const previous = material.onBeforeCompile;
  const previousKey = previous.toString();
  material.onBeforeCompile = (shader, renderer) => {
    previous.call(material, shader, renderer);
    Object.assign(shader.uniforms, uniforms);
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
    uniforms.uLwTime.value = frame.time;
  });
  return null;
}
