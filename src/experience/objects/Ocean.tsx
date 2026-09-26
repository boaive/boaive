"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BufferAttribute, BufferGeometry, Color, DoubleSide, type Mesh, ShaderMaterial, Vector2, Vector3, Vector4 } from "three";
import { skyUniforms, waterUniforms } from "../atmosphere";
import { frame } from "../frame";
import { oceanFragment, oceanVertex } from "../shaders/ocean";

/**
 * Camera-centred polar grid: rings get exponentially wider with distance, so resolution
 * sits where the eye is (close-ups of the splash) and the horizon costs almost nothing.
 */
function createPolarGrid(rings: number, segments: number, radius: number): BufferGeometry {
  const r0 = 0.06;
  const k = Math.log(radius / r0 + 1) / rings;
  const positions = new Float32Array((1 + rings * segments) * 3);
  let o = 3; // centre vertex at 0,0,0
  for (let i = 1; i <= rings; i++) {
    const r = r0 * (Math.exp(k * i) - 1);
    for (let j = 0; j < segments; j++) {
      const a = (j / segments) * Math.PI * 2;
      positions[o++] = Math.cos(a) * r;
      positions[o++] = 0;
      positions[o++] = Math.sin(a) * r;
    }
  }
  const indices: number[] = [];
  for (let j = 0; j < segments; j++) {
    indices.push(0, 1 + ((j + 1) % segments), 1 + j);
  }
  for (let i = 1; i < rings; i++) {
    const a0 = 1 + (i - 1) * segments;
    const b0 = 1 + i * segments;
    for (let j = 0; j < segments; j++) {
      const j1 = (j + 1) % segments;
      indices.push(a0 + j, a0 + j1, b0 + j);
      indices.push(a0 + j1, b0 + j1, b0 + j);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeBoundingSphere();
  return g;
}

export type OceanState = {
  ripple: Vector4;
  glowPos: Vector3;
  glowStrength: number;
  wake: number;
  boat: Vector4;
  flow: Vector2;
  amp: number;
};

/** Mutable state other components write into (splash ripple, laptop glow, wake…). */
export const oceanState: OceanState = {
  ripple: new Vector4(0, 0, 99, 0),
  glowPos: new Vector3(),
  glowStrength: 0,
  wake: 0,
  boat: new Vector4(0, 0, 1, 0),
  flow: new Vector2(),
  amp: 1,
};

export function Ocean({ rings, segments }: { rings: number; segments: number }) {
  const ref = useRef<Mesh>(null);
  const geometry = useMemo(() => createPolarGrid(rings, segments, 460), [rings, segments]);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          ...skyUniforms,
          ...waterUniforms,
          uTime: { value: 0 },
          uAmp: { value: 1 },
          uFlow: { value: oceanState.flow },
          uRipple: { value: oceanState.ripple },
          uGlowPos: { value: oceanState.glowPos },
          uGlowColor: { value: new Color("#ffc587") },
          uGlowStrength: { value: 0 },
          uHorizonFade: { value: 0.0065 },
          uUnderShallow: { value: new Color("#2f7f8e") },
          uUnderFog: { value: new Color("#0b2f3b") },
          uUnderDensity: { value: 0.07 },
          uBoat: { value: oceanState.boat },
          uWake: { value: 0 },
        },
        vertexShader: oceanVertex,
        fragmentShader: oceanFragment,
        side: DoubleSide,
        fog: false,
      }),
    [],
  );

  useFrame(({ camera }) => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.position.set(camera.position.x, 0, camera.position.z);
    const u = material.uniforms;
    u.uTime.value = frame.elapsed * frame.motion + 12;
    u.uAmp.value = oceanState.amp;
    u.uGlowStrength.value = oceanState.glowStrength;
    u.uWake.value = oceanState.wake;
  });

  return <mesh ref={ref} geometry={geometry} material={material} frustumCulled={false} renderOrder={-5} />;
}

export { createPolarGrid };
