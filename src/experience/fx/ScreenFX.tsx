"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { Color, CustomBlending, OneFactor, OneMinusSrcAlphaFactor, PlaneGeometry, ShaderMaterial, Vector2 } from "three";
import { frame } from "../frame";
import { grainGLSL } from "../shaders/common";
import { fx } from "./fxState";

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Premultiplied output: vignette (black) + grain, then the veil over everything.
const fragmentShader = /* glsl */ `
uniform float uVignette;
uniform float uGrain;
uniform float uTime;
uniform float uVeil;
uniform vec3 uVeilColor;
uniform float uWaterline;
uniform vec2 uRes;
varying vec2 vUv;
${grainGLSL}

void main() {
  vec2 c = vUv - 0.5;
  c.x *= uRes.x / uRes.y;
  float vig = smoothstep(0.45, 1.05, length(c) * 1.15) * uVignette;
  float n = grain(floor(vUv * uRes), fract(uTime * 7.0) * 100.0);
  float gA = uGrain;

  // premultiplied: grain under vignette
  vec3 col = vec3(n) * gA * (1.0 - vig);
  float a = vig + gA * (1.0 - vig);

  // waterline: a wobbling meniscus sweeping through the frame as the lens goes under
  if (uWaterline > 0.001) {
    float y = mix(1.15, -0.15, uWaterline) + sin(vUv.x * 11.0 + uTime * 3.0) * 0.025 + sin(vUv.x * 27.0 - uTime * 5.0) * 0.01;
    float below = smoothstep(y + 0.01, y - 0.01, vUv.y);
    float line = exp(-pow((vUv.y - y) * 90.0, 2.0));
    vec3 tint = vec3(0.04, 0.2, 0.24);
    col = col * (1.0 - below * 0.45) + tint * below * 0.45 + vec3(0.7, 0.85, 0.9) * line * 0.4;
    a = a + below * 0.45 * (1.0 - a) + line * 0.4 * (1.0 - a);
  }

  col = col * (1.0 - uVeil) + uVeilColor * uVeil;
  a = a * (1.0 - uVeil) + uVeil;
  gl_FragColor = vec4(col, a);
}
`;

/** One full-screen quad drawn last: cheaper than a post-processing pass. */
export function ScreenFX({ grain = true }: { grain?: boolean }) {
  const size = useThree((s) => s.size);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uVignette: { value: fx.vignette },
          uGrain: { value: fx.grain },
          uTime: { value: 0 },
          uVeil: { value: 0 },
          uVeilColor: { value: new Color() },
          uWaterline: { value: 0 },
          uRes: { value: new Vector2(1, 1) },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        toneMapped: false,
        blending: CustomBlending,
        blendSrc: OneFactor,
        blendDst: OneMinusSrcAlphaFactor,
      }),
    [],
  );
  const geometry = useMemo(() => new PlaneGeometry(2, 2), []);

  useFrame(() => {
    const u = material.uniforms;
    u.uVignette.value = fx.vignette;
    u.uGrain.value = grain ? fx.grain : 0;
    u.uTime.value = frame.elapsed;
    u.uVeil.value = Math.max(fx.veil, fx.stillVeil);
    (u.uVeilColor.value as Color).copy(fx.veilColor);
    u.uWaterline.value = fx.waterline;
    (u.uRes.value as Vector2).set(size.width, size.height);
  });

  return <mesh geometry={geometry} material={material} frustumCulled={false} renderOrder={1000} />;
}
