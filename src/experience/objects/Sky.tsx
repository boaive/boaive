"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BackSide, type Mesh, ShaderMaterial } from "three";
import { atmosphere, skyUniforms } from "../atmosphere";
import { frame } from "../frame";
import { noiseGLSL, skyGLSL, skyUniformsGLSL } from "../shaders/common";

const vertexShader = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_Position.z = gl_Position.w; // always at the far plane
}
`;

const fragmentShader = /* glsl */ `
${skyUniformsGLSL}
uniform float uStars;
uniform float uTime;
varying vec3 vDir;
${noiseGLSL}
${skyGLSL}

void main() {
  vec3 dir = normalize(vDir);
  vec3 col = skyColor(dir);

  // Blue-hour stars: sparse, faint, slightly twinkling. Gone by sunrise.
  if (uStars > 0.01 && dir.y > 0.02) {
    vec2 sph = vec2(atan(dir.z, dir.x + 1e-6), asin(clamp(dir.y, -1.0, 1.0))) * 140.0;
    vec2 cell = floor(sph);
    float h = hash12(cell);
    vec2 offs = vec2(hash12(cell + 3.1), hash12(cell + 7.7)) - 0.5;
    float d = length(fract(sph) - 0.5 - offs * 0.6);
    float star = step(0.985, h) * (1.0 - smoothstep(0.0, 0.12, d));
    star *= smoothstep(0.03, 0.35, dir.y) * (0.55 + 0.45 * sin(uTime * (0.8 + h * 2.0) + h * 50.0));
    col += vec3(0.85, 0.9, 1.0) * star * 0.75 * uStars;
  }

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/** Infinite sky dome that follows the camera. */
export function Sky() {
  const ref = useRef<Mesh>(null);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { ...skyUniforms, uStars: { value: 1 }, uTime: { value: 0 } },
        vertexShader,
        fragmentShader,
        side: BackSide,
        depthWrite: false,
        fog: false,
      }),
    [],
  );

  useFrame(({ camera }) => {
    if (!ref.current) return;
    // Below the surface the sky is only visible through the water (the ocean's underside draws that).
    ref.current.visible = camera.position.y > -0.02;
    ref.current.position.copy(camera.position);
    material.uniforms.uStars.value = atmosphere.stars;
    material.uniforms.uTime.value = frame.elapsed;
  });

  return (
    <mesh ref={ref} material={material} frustumCulled={false} renderOrder={-10}>
      <sphereGeometry args={[400, 48, 24]} />
    </mesh>
  );
}
