"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import { bench, stageStats } from "./debug";

/**
 * `?debug` only, inside the canvas: publishes live numbers for DebugPanel and applies its test
 * switches. It takes over drawing (a positive useFrame priority) so a test can skip the draw call
 * while every scene update still runs.
 */
export function DebugProbe() {
  const setDpr = useThree((s) => s.setDpr);
  const probe = useRef({ start: 0, restore: 0 });

  useFrame(() => {
    probe.current.start = performance.now();
  }, -100);

  useFrame(({ gl, scene, camera }) => {
    const p = probe.current;
    if (bench.active && bench.dpr > 0) {
      if (!p.restore) p.restore = gl.getPixelRatio();
      if (gl.getPixelRatio() !== bench.dpr) setDpr(bench.dpr);
    } else if (p.restore) {
      setDpr(p.restore);
      p.restore = 0;
    }

    if (!(bench.active && bench.skipRender)) gl.render(scene, camera);

    const ms = performance.now() - p.start;
    stageStats.frameMs = stageStats.frameMs ? stageStats.frameMs * 0.9 + ms * 0.1 : ms;
    stageStats.dpr = gl.getPixelRatio();
    stageStats.width = gl.domElement.width;
    stageStats.height = gl.domElement.height;
    stageStats.calls = gl.info.render.calls;
    stageStats.triangles = gl.info.render.triangles;
  }, 1);

  return null;
}
