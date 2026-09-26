"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  Color,
  DynamicDrawUsage,
  type InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
} from "three";
import { actors } from "../choreo/actors";
import { frame } from "../frame";
import { oceanState } from "./Ocean";

const bubbleVertex = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
void main() {
  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;
const bubbleFragment = /* glsl */ `
uniform vec3 uColor;
varying vec3 vN;
varying vec3 vV;
void main() {
  float rim = pow(max(1.0 - abs(dot(vN, vV)), 0.0), 2.2);
  float spec = pow(max(dot(reflect(-vV, vN), normalize(vec3(0.2, 1.0, 0.1))), 0.0), 40.0);
  float a = clamp(rim * 0.85 + spec * 0.9 + 0.04, 0.0, 1.0);
  gl_FragColor = vec4(uColor * (rim + spec * 1.5), a);
}
`;

type Particle = { p: Vector3; v: Vector3; age: number; life: number; size: number; on: boolean };

function pool(n: number): Particle[] {
  return Array.from({ length: n }, () => ({ p: new Vector3(), v: new Vector3(), age: 0, life: 1, size: 1, on: false }));
}

/**
 * Splash droplets, the ripple kick, and bubbles streaming from the sinking laptop.
 * Real-time (not scroll-scrubbed): water keeps moving even when the reader stops scrolling.
 */
export function WaterFX({ bubbleCount = 70, dropCount = 46 }: { bubbleCount?: number; dropCount?: number }) {
  const bubblesRef = useRef<InstancedMesh>(null);
  const dropsRef = useRef<InstancedMesh>(null);
  const state = useMemo(() => ({ bubbles: pool(bubbleCount), drops: pool(dropCount), emit: 0, m: new Matrix4(), resting: false }), [bubbleCount, dropCount]);
  const assets = useMemo(
    () => ({
      sphere: new SphereGeometry(1, 12, 10),
      bubble: new ShaderMaterial({
        uniforms: { uColor: { value: new Color("#dff4f7") } },
        vertexShader: bubbleVertex,
        fragmentShader: bubbleFragment,
        transparent: true,
        depthWrite: false,
      }),
      drop: new MeshStandardMaterial({ color: "#d9e6ea", roughness: 0.15, metalness: 0, emissive: "#3a5460", transparent: true, opacity: 0.9 }),
    }),
    [],
  );

  const spawnBubble = (at: Vector3, spread: number, speed: number) => {
    const b = state.bubbles.find((x) => !x.on);
    if (!b) return;
    b.on = true;
    b.age = 0;
    b.life = 2.5 + Math.random() * 2.5;
    b.size = 0.008 + Math.pow(Math.random(), 2) * 0.03;
    b.p.set(at.x + (Math.random() - 0.5) * spread, at.y + (Math.random() - 0.5) * spread * 0.4, at.z + (Math.random() - 0.5) * spread);
    b.v.set((Math.random() - 0.5) * 0.15, speed * (0.6 + Math.random() * 0.6), (Math.random() - 0.5) * 0.15);
  };

  useFrame(() => {
    // Inside the laptop there's no sea to simulate: clear what's in flight once, then rest.
    if (frame.world !== "ocean") {
      oceanState.ripple.z += frame.dt; // the splash keeps fading, so it's gone when the sea comes back
      if (state.resting) return;
      state.resting = true;
      for (const b of state.bubbles) b.on = false;
      for (const d of state.drops) d.on = false;
      for (const mesh of [bubblesRef.current, dropsRef.current]) {
        if (mesh) {
          mesh.count = 0;
          mesh.visible = false;
        }
      }
      return;
    }
    state.resting = false;
    const dt = frame.dt;
    const reduced = frame.motion === 0;

    // One-shot: the laptop hits the water.
    if (actors.splashAt) {
      const at = actors.splashAt;
      actors.splashAt = null;
      oceanState.ripple.set(at.x, at.z, 0, 1);
      if (!reduced) {
        for (const d of state.drops) {
          const ang = Math.random() * Math.PI * 2;
          const out = 0.4 + Math.random() * 1.3;
          d.on = true;
          d.age = 0;
          d.life = 2;
          d.size = 0.008 + Math.random() * 0.022;
          d.p.set(at.x + Math.cos(ang) * 0.12, 0.02, at.z + Math.sin(ang) * 0.12);
          d.v.set(Math.cos(ang) * out, 1.4 + Math.random() * 2.2, Math.sin(ang) * out);
        }
        for (let i = 0; i < 26; i++) spawnBubble(new Vector3(at.x, -0.25, at.z), 0.5, 0.9);
      }
    }
    oceanState.ripple.z += dt;

    // Stream of bubbles from the sinking laptop.
    if (actors.bubbling > 0 && actors.laptopUnderwater && !reduced) {
      state.emit += dt * 14 * actors.bubbling;
      while (state.emit > 1) {
        state.emit -= 1;
        spawnBubble(actors.laptop, 0.22, 0.55);
      }
    }

    const m = state.m;
    const bubbles = bubblesRef.current;
    if (bubbles) {
      let n = 0;
      for (const b of state.bubbles) {
        if (!b.on) continue;
        b.age += dt;
        b.v.y += dt * 0.4;
        b.p.addScaledVector(b.v, dt);
        b.p.x += Math.sin(b.age * 9 + b.size * 400) * 0.004;
        if (b.p.y > -0.03 || b.age > b.life) {
          b.on = false;
          continue;
        }
        const s = b.size * Math.min(1, b.age * 6);
        m.makeScale(s, s * 0.85, s).setPosition(b.p);
        bubbles.setMatrixAt(n++, m);
      }
      // nothing alive: no upload, no draw call
      bubbles.count = n;
      bubbles.visible = n > 0;
      if (n > 0) bubbles.instanceMatrix.needsUpdate = true;
    }

    const drops = dropsRef.current;
    if (drops) {
      let n = 0;
      for (const d of state.drops) {
        if (!d.on) continue;
        d.age += dt;
        d.v.y -= 9.81 * dt;
        d.p.addScaledVector(d.v, dt);
        if (d.p.y < -0.05 && d.v.y < 0) {
          d.on = false;
          continue;
        }
        m.makeScale(d.size, d.size * 1.4, d.size).setPosition(d.p);
        drops.setMatrixAt(n++, m);
      }
      drops.count = n;
      drops.visible = n > 0;
      if (n > 0) drops.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      <instancedMesh
        ref={bubblesRef}
        args={[assets.sphere, assets.bubble, bubbleCount]}
        frustumCulled={false}
        instanceMatrix-usage={DynamicDrawUsage}
      />
      <instancedMesh ref={dropsRef} args={[assets.sphere, assets.drop, dropCount]} frustumCulled={false} instanceMatrix-usage={DynamicDrawUsage} />
    </>
  );
}
