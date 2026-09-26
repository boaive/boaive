"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, Color, type Group, QuadraticBezierCurve3, ShaderMaterial, TubeGeometry, Vector3 } from "three";
import { orderedProjects } from "@/data/projects";
import { FORM_COUNT, formPosition, galleryPosition, PRODUCT_POSITION } from "../../choreo/digitalLayout";
import { frame } from "../../frame";

/** Written by the digital world controller. */
export const networkState = {
  presence: 0,
  /** 0..1 how much of the network has been drawn. */
  reveal: 0,
};

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

// Draws itself along the tube (uv.x), with data pulses travelling toward the far end.
const fragmentShader = /* glsl */ `
uniform float uReveal;
uniform float uTime;
uniform float uOffset;
uniform vec3 uColor;
uniform vec3 uPulse;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  float drawn = step(vUv.x, uReveal);
  if (drawn < 0.5) discard;
  float head = exp(-pow((uReveal - vUv.x) * 18.0, 2.0)) * step(uReveal, 0.999);
  float pulse = pow(max(0.0, sin((vUv.x - uTime * 0.35 - uOffset) * 18.0)), 24.0);
  vec3 col = uColor * 0.9 + uPulse * (pulse * 1.8 + head * 2.2);
  gl_FragColor = vec4(col * uOpacity, 1.0);
}
`;

type Link = { from: Vector3; to: Vector3; lift: number; delay: number; weight: number };

/**
 * "Not just a screen. A working system." Everything built so far gets connected:
 * the product to every capability, the capabilities to each other, the work to the product.
 */
export function Network() {
  const group = useRef<Group>(null);
  const links = useMemo(() => {
    const out: Link[] = [];
    const centre = PRODUCT_POSITION.clone().add(new Vector3(0, -0.4, 0));
    for (let i = 0; i < FORM_COUNT; i++) {
      out.push({ from: centre, to: formPosition(i).add(new Vector3(0, -0.6, 0)), lift: 1.6, delay: i * 0.05, weight: 1 });
      out.push({ from: formPosition(i).add(new Vector3(0, -0.9, 0)), to: formPosition((i + 1) % FORM_COUNT).add(new Vector3(0, -0.9, 0)), lift: -0.6, delay: 0.3 + i * 0.04, weight: 0.7 });
    }
    orderedProjects.forEach((_, i) => {
      const g = galleryPosition(i, orderedProjects.length);
      out.push({ from: PRODUCT_POSITION.clone().add(new Vector3(0, 1.6, 0)), to: g.clone().add(new Vector3(0, -1.7, 0)), lift: 2.5, delay: 0.5 + i * 0.05, weight: 0.8 });
    });
    return out;
  }, []);

  const tubes = useMemo(
    () =>
      links.map((l, i) => {
        const mid = l.from.clone().lerp(l.to, 0.5).add(new Vector3(0, l.lift, 0));
        const curve = new QuadraticBezierCurve3(l.from, mid, l.to);
        const material = new ShaderMaterial({
          uniforms: {
            uReveal: { value: 0 },
            uTime: { value: 0 },
            uOffset: { value: i * 0.37 },
            uColor: { value: new Color("#8fb3c0") },
            uPulse: { value: new Color("#ff8a2a") },
            uOpacity: { value: 0 },
          },
          vertexShader,
          fragmentShader,
          transparent: true,
          blending: AdditiveBlending,
          depthWrite: false,
        });
        return { geometry: new TubeGeometry(curve, 64, 0.045 * l.weight + 0.015, 6, false), material, link: l };
      }),
    [links],
  );

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.visible = networkState.presence > 0.002 && networkState.reveal > 0.001;
    if (!g.visible) return;
    const r = networkState.reveal;
    tubes.forEach(({ material, link }) => {
      const local = Math.min(1, Math.max(0, (r - link.delay) / 0.45));
      material.uniforms.uReveal.value = local;
      material.uniforms.uTime.value = frame.elapsed;
      material.uniforms.uOpacity.value = networkState.presence * (0.6 + 0.4 * link.weight);
    });
  });

  return (
    <group ref={group}>
      {tubes.map((t, i) => (
        <mesh key={i} geometry={t.geometry} material={t.material} />
      ))}
    </group>
  );
}
