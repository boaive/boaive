"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, type Points, ShaderMaterial } from "three";
import { ambient } from "../ambient";
import { frame } from "../frame";
import { hash } from "../math";

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uPixelScale;
uniform float uOpacity;
attribute float aSize;
attribute float aPhase;
varying float vAlpha;
void main() {
  vec3 box = vec3(22.0, 14.0, 22.0);
  vec3 p = position * box;
  p.y -= uTime * (0.05 + aPhase * 0.08);
  p.x += sin(uTime * 0.21 + aPhase * 6.283) * 0.35;
  p.z += cos(uTime * 0.17 + aPhase * 4.0) * 0.35;
  vec3 rel = mod(p - cameraPosition + box * 0.5, box) - box * 0.5;
  vec3 world = cameraPosition + rel;
  vec4 mv = viewMatrix * vec4(world, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uPixelScale / max(-mv.z, 0.1);
  float d = length(rel);
  vAlpha = uOpacity * (1.0 - smoothstep(5.0, 10.5, d)) * smoothstep(0.25, 1.2, -mv.z);
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uTint;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = (1.0 - smoothstep(0.0, 0.5, d)) * vAlpha;
  if (a < 0.003) discard;
  gl_FragColor = vec4(uTint * a, a);
}
`;

/** Slow drifting motes that always surround the camera (no matter which world). */
export function MarineSnow({ count }: { count: number }) {
  const ref = useRef<Points>(null);
  const { size, viewport } = useThree();
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phase = new Float32Array(count);
    // deterministic scatter (stable between renders and sessions)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = hash(i * 1.31 + 0.1);
      pos[i * 3 + 1] = hash(i * 2.17 + 0.3);
      pos[i * 3 + 2] = hash(i * 3.03 + 0.7);
      sizes[i] = 0.012 + Math.pow(hash(i * 4.41 + 0.9), 3) * 0.05;
      phase[i] = hash(i * 5.77 + 0.2);
    }
    g.setAttribute("position", new BufferAttribute(pos, 3));
    g.setAttribute("aSize", new BufferAttribute(sizes, 1));
    g.setAttribute("aPhase", new BufferAttribute(phase, 1));
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uPixelScale: { value: 400 },
          uOpacity: { value: 0 },
          uTint: { value: new Color() },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
      }),
    [],
  );

  useFrame(({ camera }) => {
    const u = material.uniforms;
    u.uTime.value = frame.elapsed;
    u.uOpacity.value = ambient.snow;
    (u.uTint.value as Color).copy(ambient.snowTint);
    const fov = ("fov" in camera ? (camera.fov as number) : 40) * (Math.PI / 180);
    u.uPixelScale.value = (size.height * viewport.dpr) / (2 * Math.tan(fov / 2));
    if (ref.current) ref.current.visible = ambient.snow > 0.002;
  });

  return <points ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}
