"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo } from "react";
import {
  AdditiveBlending,
  BackSide,
  BoxGeometry,
  type BufferGeometry,
  CircleGeometry,
  Color,
  CylinderGeometry,
  EdgesGeometry,
  LineBasicMaterial,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { frame } from "../../frame";
import { hash } from "../../math";

/**
 * The architecture of the deep: monoliths and floating slabs at the edge of visibility,
 * a thin ember horizon (the same line the laptop screen showed) and a far light above.
 * Merged into a handful of draw calls.
 */
function buildMonoliths(count: number) {
  const solids: BufferGeometry[] = [];
  const edges: BufferGeometry[] = [];
  const m = new Matrix4();
  const q = new Quaternion();
  const up = new Vector3(0, 1, 0);
  for (let i = 0; i < count; i++) {
    const slab = hash(i * 13.1) > 0.72;
    const a = hash(i * 3.7) * Math.PI * 2;
    const r = 26 + hash(i * 5.3) * 46;
    const w = slab ? 5 + hash(i * 2.9) * 8 : 0.5 + hash(i * 2.9) * 0.9;
    const h = slab ? 0.35 : 7 + hash(i * 7.1) * 16;
    const d = slab ? 3 + hash(i * 4.4) * 5 : 2 + hash(i * 4.4) * 4;
    const y = slab ? -2 + hash(i * 8.8) * 14 : -6 + h / 2;
    const box = new BoxGeometry(w, h, d);
    q.setFromAxisAngle(up, a + hash(i * 6.6) * 0.8);
    m.compose(new Vector3(Math.cos(a) * r, y, Math.sin(a) * r), q, new Vector3(1, 1, 1));
    const e = new EdgesGeometry(box);
    box.applyMatrix4(m);
    e.applyMatrix4(m);
    solids.push(box);
    edges.push(e);
  }
  return { solid: mergeGeometries(solids), edges: mergeGeometries(edges) };
}

const horizonVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const horizonFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
varying vec2 vUv;
void main() {
  float by = (vUv.y - 0.5) * 7.0;
  float band = exp(-by * by);
  gl_FragColor = vec4(uColor * band * uIntensity, 1.0);
}
`;
const lightVertex = horizonVertex;
const lightFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float g = pow(max(1.0 - d, 0.0), 2.2);
  gl_FragColor = vec4(uColor * g * uIntensity, 1.0);
}
`;

export const architecture = {
  horizon: 0.55,
  overhead: 0.6,
};

export function Architecture({ count = 26 }: { count?: number }) {
  const assets = useMemo(() => {
    const { solid, edges } = buildMonoliths(count);
    return {
      solid,
      edges,
      glass: new MeshStandardMaterial({ color: "#0a141b", metalness: 0.55, roughness: 0.32, envMapIntensity: 0.6 }),
      line: new LineBasicMaterial({ color: "#7fa2b0", transparent: true, opacity: 0.4 }),
      horizonGeo: new CylinderGeometry(120, 120, 5, 96, 1, true),
      horizon: new ShaderMaterial({
        uniforms: { uColor: { value: new Color("#ff8a2a") }, uIntensity: { value: 0.5 } },
        vertexShader: horizonVertex,
        fragmentShader: horizonFragment,
        side: BackSide,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        fog: false,
      }),
      overheadGeo: new CircleGeometry(60, 48),
      overhead: new ShaderMaterial({
        uniforms: { uColor: { value: new Color("#9fd6e0") }, uIntensity: { value: 0.6 } },
        vertexShader: lightVertex,
        fragmentShader: lightFragment,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        fog: false,
      }),
    };
  }, [count]);

  useFrame(() => {
    assets.horizon.uniforms.uIntensity.value = architecture.horizon * (0.9 + 0.1 * Math.sin(frame.elapsed * 0.5));
    assets.overhead.uniforms.uIntensity.value = architecture.overhead;
  });

  return (
    <group>
      <mesh geometry={assets.solid} material={assets.glass} />
      <lineSegments geometry={assets.edges} material={assets.line} />
      <mesh geometry={assets.horizonGeo} material={assets.horizon} position={[0, -3.6, 0]} renderOrder={-2} />
      <mesh geometry={assets.overheadGeo} material={assets.overhead} position={[0, 46, 0]} rotation={[Math.PI / 2, 0, 0]} renderOrder={-2} />
    </group>
  );
}
