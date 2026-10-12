"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, ShaderMaterial } from "three";
import { ACCENT_RAW, HORIZON_GLSL, frame } from "./state";
import { LIGHT_WAVE } from "./lightWave";

const vertex = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragment = /* glsl */ `
  varying vec3 vWorld;
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uAccent;
  uniform vec3 uCamera;
  uniform vec3 uSwell; // crest spacing, speed toward the Eclipse, intensity

  ${HORIZON_GLSL}
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.0; a *= 0.5; }
    return v;
  }

  float haze_(float dist) { return smoothstep(300.0, 2400.0, dist); }

  void main() {
    vec2 p = vWorld.xz;
    float dist = length(p - uCamera.xz);
    // two slow layers drifting across each other
    float n = fbm(p * 0.012 + vec2(uTime * 0.012, uTime * 0.004));
    n = mix(n, fbm(p * 0.004 - vec2(uTime * 0.006, 0.0)), 0.5);
    float billow = smoothstep(0.34, 0.7, n);

    vec3 deep = vec3(0.026, 0.026, 0.038);
    vec3 crest = vec3(0.15, 0.146, 0.2);
    vec3 color = mix(deep, crest, billow);

    // light of the Eclipse lying on the fog, toward the horizon
    float toward = smoothstep(0.0, 1.0, clamp((uCamera.z - vWorld.z) / 1500.0, 0.0, 1.0));
    float path = exp(-abs(p.x) / (120.0 + 500.0 * toward)) * toward;
    color += mix(vec3(0.5, 0.48, 0.62), uAccent, 0.55) * path * (0.2 + 0.5 * billow) * uIntensity;

    // a slow swell of the accent rolling across the fog toward the Eclipse; its front bows with the billows
    float front = vWorld.z + uTime * uSwell.y + abs(p.x) * 0.25 + (n - 0.5) * 90.0;
    float swell = 0.5 + 0.5 * cos(front * 6.2831853 / uSwell.x);
    swell = swell * swell * swell;
    color += uAccent * swell * uSwell.z * (0.35 + 0.65 * billow) * (1.0 - haze_(dist));

    // dissolve into the horizon haze
    float haze = haze_(dist);
    color = mix(color, horizonColor(uIntensity, uAccent), haze);
    gl_FragColor = vec4(color, 1.0);
  }
`;

/** The causeway hangs above a slowly drifting sea of fog; structures rise out of it. */
export function FogSea() {
  const mesh = useRef<Mesh>(null!);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: 0.4 },
          uAccent: { value: ACCENT_RAW },
          uCamera: { value: [0, 0, 0] },
          uSwell: { value: [LIGHT_WAVE.sea.length, LIGHT_WAVE.sea.speed, LIGHT_WAVE.sea.intensity] },
        },
        fog: false,
      }),
    [],
  );

  useFrame(({ camera }) => {
    mesh.current.position.set(camera.position.x, -22, camera.position.z);
    material.uniforms.uTime.value = frame.time;
    material.uniforms.uIntensity.value = 0.42 + 0.58 * frame.progress;
    material.uniforms.uCamera.value = [camera.position.x, camera.position.y, camera.position.z];
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} material={material} renderOrder={-10}>
      <planeGeometry args={[7000, 7000]} />
    </mesh>
  );
}
