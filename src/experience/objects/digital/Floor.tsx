"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, type Mesh, PlaneGeometry, ShaderMaterial } from "three";
import { frame } from "../../frame";
import { noiseGLSL } from "../../shaders/common";
import { DIGITAL_ORIGIN } from "../../worlds";

const vertexShader = /* glsl */ `
varying vec3 vWorld;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

// Contour lines of a slow noise field — the "site plan" of the deep.
const fragmentShader = /* glsl */ `
uniform vec3 uBase;
uniform vec3 uLine;
uniform vec3 uAccent;
uniform vec3 uFog;
uniform float uFogDensity;
uniform float uTime;
uniform vec3 uCentre;
varying vec3 vWorld;
${noiseGLSL}

// 1 on integer values of h, anti-aliased to about px pixels wide
float contour(float h, float px) {
  float d = abs(fract(h + 0.5) - 0.5);
  float w = fwidth(h) * px;
  return 1.0 - smoothstep(0.0, w, d);
}

void main() {
  vec2 p = vWorld.xz - uCentre.xz;
  float h = fbm(p * 0.035 + 3.0) * 7.0 + length(p) * 0.06;
  float fine = contour(h * 2.0, 1.3);
  float major = contour(h * 0.4, 1.6);
  float r = length(p);
  vec3 col = uBase;
  col += uLine * (fine * 0.22 + major * 0.5);
  // a small warm pool of light where the product will be built
  col += uAccent * exp(-r * r * 0.09) * 0.1;
  float dist = length(vWorld - cameraPosition);
  col = mix(uFog, col, exp(-dist * uFogDensity * 0.9));
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const floorUniforms = {
  uBase: { value: new Color("#040a0f") },
  uLine: { value: new Color("#5d7e8c") },
  uAccent: { value: new Color("#ff8a2a") },
  uFog: { value: new Color("#07141c") },
  uFogDensity: { value: 0.03 },
  uTime: { value: 0 },
  uCentre: { value: DIGITAL_ORIGIN.clone() },
};

/** The floor of the deep, following the camera so it never ends. */
export function Floor({ y = -6 }: { y?: number }) {
  const ref = useRef<Mesh>(null);
  const geometry = useMemo(() => {
    const g = new PlaneGeometry(420, 420, 1, 1);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const material = useMemo(
    () => new ShaderMaterial({ uniforms: floorUniforms, vertexShader, fragmentShader, fog: false }),
    [],
  );
  useFrame(({ camera }) => {
    if (!ref.current) return;
    ref.current.position.set(camera.position.x, DIGITAL_ORIGIN.y + y, camera.position.z);
    floorUniforms.uTime.value = frame.elapsed;
  });
  return <mesh ref={ref} geometry={geometry} material={material} frustumCulled={false} />;
}
