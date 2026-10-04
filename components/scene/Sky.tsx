"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, BackSide, BufferAttribute, BufferGeometry, DoubleSide, Group, ShaderMaterial } from "three";
import { ACCENT_RAW, HORIZON_GLSL, frame } from "./state";

const ECLIPSE_DISTANCE = 1700;
const ECLIPSE_HEIGHT = 40;

const eclipseVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// A dark disc with a thin, uneven corona. The corona is the main home of the accent colour.
const eclipseFragment = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uAccent;

  void main() {
    vec2 p = (vUv - 0.5) * 2.0;
    float r = length(p);
    float a = atan(p.y, p.x);
    const float R = 0.3;

    // slow, uneven streamers
    float streak = 0.55
      + 0.25 * sin(a * 3.0 + uTime * 0.05)
      + 0.14 * sin(a * 7.0 - uTime * 0.035 + 1.3)
      + 0.08 * sin(a * 17.0 + uTime * 0.02 + 4.0);
    float beads = 0.72 + 0.28 * sin(a * 5.0 + 2.0) * sin(a * 11.0 - 1.0 + uTime * 0.02);
    float d = max(r - R, 0.0);
    float glow = exp(-d * 80.0) * 0.8 * beads + exp(-d * mix(24.0, 5.0, streak * streak)) * 0.5 * streak;
    float rim = smoothstep(0.0035, 0.0, abs(r - R - 0.001)) * (0.5 + 0.5 * beads);
    float disc = smoothstep(R + 0.002, R - 0.002, r);
    float edge = smoothstep(1.0, 0.75, r);

    vec3 corona = mix(uAccent, vec3(0.86, 0.83, 1.0), clamp(glow * 1.3, 0.0, 1.0));
    vec3 color = corona * glow * uIntensity + vec3(0.95, 0.93, 1.0) * rim * (0.3 + 0.6 * uIntensity);
    color *= (1.0 - disc);
    float alpha = max(disc, clamp(glow * uIntensity + rim, 0.0, 1.0)) * edge;
    gl_FragColor = vec4(color, alpha);
  }
`;

function makeStars(count: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  let seed = 7;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < count; i++) {
    // upper hemisphere, thinning toward the horizon haze
    const u = rand();
    const y = 0.06 + 0.94 * u * u;
    const theta = rand() * Math.PI * 2;
    const rr = Math.sqrt(1 - y * y);
    positions.set([Math.cos(theta) * rr * 5000, y * 5000, Math.sin(theta) * rr * 5000], i * 3);
    const b = 0.25 + 0.75 * Math.pow(rand(), 3);
    colors.set([b * 0.9, b * 0.9, b], i * 3);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("color", new BufferAttribute(colors, 3));
  return geometry;
}

/** Sparse stars, one faint ring arc, and the Eclipse at the end of the causeway. */
export function Sky() {
  const group = useRef<Group>(null!);
  const stars = useRef<Group>(null!);
  const starGeometry = useMemo(() => makeStars(520), []);
  const eclipse = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: eclipseVertex,
        fragmentShader: eclipseFragment,
        uniforms: { uTime: { value: 0 }, uIntensity: { value: 0.4 }, uAccent: { value: ACCENT_RAW } },
        transparent: true,
        depthWrite: false,
        fog: false,
      }),
    [],
  );
  const dome = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          varying vec3 vDir;
          uniform float uIntensity;
          uniform vec3 uAccent;
          ${HORIZON_GLSL}
          void main() {
            float up = clamp(vDir.y, 0.0, 1.0);
            vec3 zenith = vec3(0.012, 0.012, 0.018);
            vec3 color = mix(horizonColor(uIntensity, uAccent), zenith, smoothstep(0.0, 0.32, up));
            gl_FragColor = vec4(color, 1.0);
          }
        `,
        uniforms: { uIntensity: { value: 0.4 }, uAccent: { value: ACCENT_RAW } },
        side: BackSide,
        depthWrite: false,
        fog: false,
      }),
    [],
  );

  useFrame(({ camera }) => {
    // the sky travels with the camera: it is infinitely far away
    group.current.position.set(0, 0, camera.position.z);
    stars.current.position.x = camera.position.x;
    stars.current.rotation.y = frame.time * 0.002;
    eclipse.uniforms.uTime.value = frame.time;
    eclipse.uniforms.uIntensity.value = 0.42 + 0.58 * frame.progress;
    dome.uniforms.uIntensity.value = 0.42 + 0.58 * frame.progress;
    group.current.position.x = 0;
  });

  return (
    <group ref={group}>
      <mesh material={dome} renderOrder={-40} frustumCulled={false}>
        <sphereGeometry args={[6000, 32, 16]} />
      </mesh>
      <group ref={stars}>
        <points geometry={starGeometry} renderOrder={-30}>
          <pointsMaterial
            size={1.7}
            sizeAttenuation={false}
            vertexColors
            transparent
            opacity={0.9}
            depthWrite={false}
            fog={false}
          />
        </points>
      </group>
      <mesh position={[0, ECLIPSE_HEIGHT, -ECLIPSE_DISTANCE]} rotation={[1.26, 0, 0.3]} renderOrder={-25}>
        <ringGeometry args={[1180, 1184, 180]} />
        <meshBasicMaterial
          color="#8d89a8"
          transparent
          opacity={0.22}
          side={DoubleSide}
          blending={AdditiveBlending}
          depthWrite={false}
          fog={false}
        />
      </mesh>
      <mesh position={[0, ECLIPSE_HEIGHT, -ECLIPSE_DISTANCE]} renderOrder={-20} material={eclipse}>
        <planeGeometry args={[2200, 2200]} />
      </mesh>
    </group>
  );
}
