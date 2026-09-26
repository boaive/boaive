"use client";

import type { DirectionalLight, HemisphereLight, PointLight } from "three";
import { StudioEnvironment } from "./StudioEnvironment";

/**
 * One fixed set of lights shared by both worlds (constant light count = no shader
 * recompiles on world swaps). The active world's controller sets their values each frame.
 */
export const lightRig = {
  hemi: null as HemisphereLight | null,
  key: null as DirectionalLight | null,
  glow: null as PointLight | null,
  accent: null as PointLight | null,
};

export function Lighting() {
  return (
    <>
      <hemisphereLight ref={(l) => void (lightRig.hemi = l)} args={["#33475e", "#0a1016", 0.5]} />
      <directionalLight ref={(l) => void (lightRig.key = l)} position={[-6, 4, -8]} intensity={0.4} color="#9fb4d0" />
      <pointLight ref={(l) => void (lightRig.glow = l)} intensity={0} distance={4} decay={2} color="#ffe2bf" />
      <pointLight ref={(l) => void (lightRig.accent = l)} intensity={0} distance={12} decay={2} color="#ff8a2a" />
      <StudioEnvironment />
    </>
  );
}
