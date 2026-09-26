"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, DynamicDrawUsage, type InstancedMesh, Matrix4, ShaderMaterial, SphereGeometry, Vector3 } from "three";
import { frame } from "../../frame";
import { hash } from "../../math";

const vertexShader = /* glsl */ `
attribute float aSpark;
varying vec3 vN;
varying vec3 vV;
varying float vSpark;
void main() {
  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  vSpark = aSpark;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
const fragmentShader = /* glsl */ `
uniform vec3 uRim;
uniform vec3 uSpark;
uniform float uOpacity;
varying vec3 vN;
varying vec3 vV;
varying float vSpark;
void main() {
  float ndv = abs(dot(vN, vV));
  float rim = pow(max(1.0 - ndv, 0.0), 2.4);
  // a small, sharp ember point at the centre of a few bubbles: the idea inside the problem
  float core = pow(ndv, 60.0) * vSpark;
  vec3 col = uRim * rim * 0.9 + uSpark * core * 1.2;
  float a = (rim * 0.7 + core * 0.9 + 0.015) * uOpacity;
  gl_FragColor = vec4(col, a);
}
`;

export const bubblesState = { opacity: 0 };

/**
 * Problems and ideas rising through the deep, like the needs floating in the text.
 * A few carry a small ember core — the idea inside the problem.
 */
export function IdeaBubbles({ count = 26 }: { count?: number }) {
  const ref = useRef<InstancedMesh>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        base: new Vector3((hash(i * 1.3) - 0.5) * 26, hash(i * 2.1) * 24 - 6, 2 + hash(i * 3.7) * 26),
        size: 0.18 + Math.pow(hash(i * 4.9), 2) * 0.75,
        speed: 0.25 + hash(i * 6.1) * 0.35,
        wobble: hash(i * 7.3) * 6.28,
      })),
    [count],
  );
  const assets = useMemo(() => {
    const geometry = new SphereGeometry(1, 24, 16);
    const material = new ShaderMaterial({
      uniforms: { uRim: { value: new Color("#bfe3ea") }, uSpark: { value: new Color("#ff9a45") }, uOpacity: { value: 0 } },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
    });
    return { geometry, material, m: new Matrix4(), p: new Vector3() };
  }, []);

  useFrame(() => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.visible = bubblesState.opacity > 0.002;
    if (!mesh.visible) return;
    assets.material.uniforms.uOpacity.value = bubblesState.opacity;
    const t = frame.elapsed;
    seeds.forEach((s, i) => {
      const rise = ((s.base.y + 6 + t * s.speed) % 24) - 6;
      assets.p.set(s.base.x + Math.sin(t * 0.4 + s.wobble) * 0.4, rise, s.base.z + Math.cos(t * 0.3 + s.wobble) * 0.3);
      assets.m.makeScale(s.size, s.size * 0.96, s.size).setPosition(assets.p);
      mesh.setMatrixAt(i, assets.m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  });

  const spark = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) arr[i] = hash(i * 9.1) > 0.7 ? 1 : 0;
    return arr;
  }, [count]);

  return (
    <instancedMesh ref={ref} args={[assets.geometry, assets.material, count]} frustumCulled={false} instanceMatrix-usage={DynamicDrawUsage}>
      <instancedBufferAttribute attach="geometry-attributes-aSpark" args={[spark, 1]} />
    </instancedMesh>
  );
}
