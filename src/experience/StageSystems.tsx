"use client";

import { PerformanceMonitor } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Color } from "three";
import { moments } from "@/story/moments";
import { frame } from "./frame";
import { fx } from "./fx/fxState";
import { smoothstep } from "./math";
import { setStageStatus } from "./status";

const PORTAL = new Color("#0d2530");
const LIGHT_WATER = new Color("#79b4bf");

/**
 * World swaps are hidden inside a full-frame moment:
 *   into the laptop  - the screen already fills the frame; the veil matches it for a beat
 *   up to the sea    - rising through bright water, the frame washes to light for a beat
 */
export function WorldTransitions() {
  useFrame(() => {
    const t = frame.t;
    const e = moments.enterScreen;
    const s = moments.surfaceSwap;
    const intoScreen = smoothstep(e - 0.012, e, t) * (1 - smoothstep(e, e + 0.035, t));
    const toSurface = smoothstep(s - 0.03, s, t) * (1 - smoothstep(s, s + 0.04, t));
    fx.veil = Math.max(intoScreen, toSurface);
    fx.veilColor.copy(intoScreen >= toSurface ? PORTAL : LIGHT_WATER);
  }, -1);
  return null;
}

/** Lowers the pixel ratio when frames drop, raises it back when there's headroom. */
export function AdaptiveResolution({ range }: { range: readonly [number, number] }) {
  const setDpr = useThree((s) => s.setDpr);
  const current = useRef(Math.min(range[1], typeof window !== "undefined" ? window.devicePixelRatio : 1));
  return (
    <PerformanceMonitor
      bounds={() => [48, 58]}
      flipflops={4}
      onDecline={() => {
        current.current = Math.max(range[0], current.current - 0.2);
        setDpr(current.current);
      }}
      onIncline={() => {
        current.current = Math.min(range[1], current.current + 0.15);
        setDpr(current.current);
      }}
      onFallback={() => setDpr(range[0])}
    />
  );
}

/**
 * After the first frame: mark the stage ready (the CSS backdrop steps aside) and pre-compile
 * every material, including those of worlds not yet visible, so later chapters don't hitch.
 */
export function WarmUp() {
  const { gl, scene, camera } = useThree();
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    frames.current += 1;
    if (frames.current === 2 && !done.current) {
      done.current = true;
      setStageStatus("ready");
      const compile = (gl as unknown as { compileAsync?: typeof gl.compile }).compileAsync;
      if (compile) void Promise.resolve(compile.call(gl, scene, camera)).catch(() => undefined);
    }
  });
  useEffect(() => () => void (done.current = false), []);
  return null;
}
