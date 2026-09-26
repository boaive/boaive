"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, Color, DoubleSide, type Group, PlaneGeometry, ShaderMaterial } from "three";
import { ambient } from "../ambient";
import { frame } from "../frame";
import { hash } from "../math";
import { noiseGLSL } from "../shaders/common";

const vertexShader = /* glsl */ `
varying vec2 vUv;
varying float vFade;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vFade = smoothstep(0.5, 3.0, length(wp.xyz - cameraPosition));
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform float uIntensity;
uniform float uSeed;
uniform vec3 uColor;
varying vec2 vUv;
varying float vFade;
${noiseGLSL}
void main() {
  float edge = smoothstep(0.0, 0.4, vUv.x) * (1.0 - smoothstep(0.6, 1.0, vUv.x));
  float n = fbm(vec2(vUv.x * 2.5 + uSeed + uTime * 0.03, vUv.y * 0.8 - uTime * 0.015));
  float fall = pow(max(vUv.y, 0.0), 1.8);
  float a = edge * fall * (0.35 + 0.65 * n) * uIntensity * vFade;
  gl_FragColor = vec4(uColor * a, a);
}
`;

/** God rays hanging from the surface; they turn to face the camera around their long axis. */
export function LightShafts({ count = 9 }: { count?: number }) {
  const group = useRef<Group>(null);
  const shafts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const material = new ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uIntensity: { value: 0 },
            uSeed: { value: hash(i + 1) * 20 },
            uColor: { value: new Color() },
          },
          vertexShader,
          fragmentShader,
          transparent: true,
          depthWrite: false,
          blending: AdditiveBlending,
          side: DoubleSide,
          fog: false,
        });
        return {
          material,
          x: (hash(i * 3.3) - 0.5) * 16,
          z: (hash(i * 5.1) - 0.5) * 16,
          width: 1.2 + hash(i * 7.7) * 2.2,
          strength: 0.45 + hash(i * 9.9) * 0.55,
          tilt: (hash(i * 2.2) - 0.5) * 0.25,
        };
      }),
    [count],
  );
  const geometry = useMemo(() => {
    const g = new PlaneGeometry(1, 1);
    g.translate(0, -0.5, 0); // hang from the top edge
    return g;
  }, []);

  useFrame(({ camera }) => {
    const g = group.current;
    if (!g) return;
    g.visible = ambient.shafts > 0.002;
    if (!g.visible) return;
    const anchor = ambient.shaftsAnchor;
    g.children.forEach((child, i) => {
      const s = shafts[i];
      // keep the shafts around the camera so they're always in the water we see
      const cx = anchor.x + s.x + Math.round((camera.position.x - anchor.x) / 16) * 16;
      const cz = anchor.z + s.z + Math.round((camera.position.z - anchor.z) / 16) * 16;
      child.position.set(cx, anchor.y, cz);
      child.rotation.set(0, Math.atan2(camera.position.x - cx, camera.position.z - cz), s.tilt);
      child.scale.set(s.width, ambient.shaftsLength, 1);
      const u = s.material.uniforms;
      u.uTime.value = frame.elapsed;
      u.uIntensity.value = ambient.shafts * s.strength;
      (u.uColor.value as Color).copy(ambient.shaftsColor);
    });
  });

  return (
    <group ref={group}>
      {shafts.map((s, i) => (
        <mesh key={i} geometry={geometry} material={s.material} frustumCulled={false} />
      ))}
    </group>
  );
}
