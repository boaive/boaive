"use client";

import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { CircleGeometry, Color, DoubleSide, Mesh, MeshBasicMaterial, PlaneGeometry, PMREMGenerator, Scene } from "three";

type Panel = { w: number; h: number; color: string; intensity: number; pos: [number, number, number]; rot: [number, number, number]; round?: boolean };

/** Soft studio light panels — gives metal and glass something to reflect. */
const PANELS: Panel[] = [
  { w: 12, h: 3, color: "#e4ecf2", intensity: 2.2, pos: [0, 7, -3], rot: [Math.PI / 2, 0, 0] },
  { w: 9, h: 0.7, color: "#ff9a52", intensity: 1.4, pos: [-7, 1.2, -2], rot: [0, Math.PI / 2, 0] },
  { w: 6, h: 4, color: "#8fb7c8", intensity: 0.7, pos: [7, 2, 3], rot: [0, -Math.PI / 2, 0] },
  { w: 3, h: 3, color: "#cfe3ea", intensity: 0.5, pos: [0, 2, 8], rot: [0, Math.PI, 0], round: true },
];

/**
 * A tiny reflection environment baked once with PMREM from a few emissive panels
 * (what a "lightformer" setup does), without shipping any HDR/EXR loaders.
 */
export function StudioEnvironment() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const env = new Scene();
    env.background = new Color("#0b1217");
    const disposables: { dispose(): void }[] = [];
    for (const p of PANELS) {
      const geometry = p.round ? new CircleGeometry(p.w / 2, 32) : new PlaneGeometry(p.w, p.h);
      const material = new MeshBasicMaterial({ color: new Color(p.color).multiplyScalar(p.intensity), side: DoubleSide });
      const mesh = new Mesh(geometry, material);
      mesh.position.set(...p.pos);
      mesh.rotation.set(...p.rot);
      env.add(mesh);
      disposables.push(geometry, material);
    }
    const pmrem = new PMREMGenerator(gl);
    const target = pmrem.fromScene(env, 0.04);
    scene.environment = target.texture;
    pmrem.dispose();
    disposables.forEach((d) => d.dispose());
    return () => {
      if (scene.environment === target.texture) scene.environment = null;
      target.dispose();
    };
  }, [gl, scene]);

  return null;
}
