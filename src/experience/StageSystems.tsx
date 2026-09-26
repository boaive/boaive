"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Color } from "three";
import { moments } from "@/story/moments";
import { bench } from "./debug";
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

/**
 * Phones can drop the WebGL context (memory pressure, switching apps). three.js asks the browser
 * to restore it; meanwhile the CSS story shows instead of a frozen or black canvas.
 */
export function ContextWatch() {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = () => setStageStatus("lost");
    const restored = () => setStageStatus("ready");
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    return () => {
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
    };
  }, [gl]);
  return null;
}

/** `?dpr=1.25` pins the pixel ratio (for testing on a device); otherwise null. */
export function forcedDpr(): number | null {
  const value = Number(new URLSearchParams(window.location.search).get("dpr"));
  return value > 0 ? Math.min(value, 3) : null;
}

/** The pixel ratio a tier starts at: its preferred value, never above the screen's own. */
export function initialDpr(range: readonly [number, number], start: number): number {
  return forcedDpr() ?? Math.max(range[0], Math.min(start, range[1], window.devicePixelRatio));
}

/**
 * Trades pixels for frame rate. Every ~1.5 s: slow frames step the pixel ratio down, clear headroom
 * steps it back up (never above the screen's own ratio). Once it has gone back and forth it stays on
 * the lower value, so it never oscillates. (drei's PerformanceMonitor counted every step as a flip-flop
 * and dropped even smooth devices to the minimum after ~12 s.)
 */
export function AdaptiveResolution({ range, start }: { range: readonly [number, number]; start: number }) {
  const setDpr = useThree((s) => s.setDpr);
  const state = useRef({ dpr: start, grace: 2, frames: 0, time: 0, dir: 0, flips: 0, settled: forcedDpr() !== null });

  useFrame((_, delta) => {
    const s = state.current;
    if (s.settled || bench.active) return;
    // first frames compile shaders and upload textures: not representative
    if (s.grace > 0) {
      s.grace -= delta;
      return;
    }
    // a long gap (tab in the background, a one-off hitch) says nothing about the steady frame rate
    if (delta > 0.25) {
      s.frames = 0;
      s.time = 0;
      return;
    }
    s.frames += 1;
    s.time += delta;
    if (s.time < 1.5) return;
    const fps = s.frames / s.time;
    s.frames = 0;
    s.time = 0;

    const max = Math.min(range[1], window.devicePixelRatio);
    let next = s.dpr;
    if (fps < 45 && s.dpr > range[0]) next = Math.max(range[0], s.dpr * 0.85);
    else if (fps > 57 && s.dpr < max) next = Math.min(max, s.dpr * 1.12);
    if (next === s.dpr) return;

    const dir = next < s.dpr ? -1 : 1;
    if (s.dir !== 0 && dir !== s.dir) s.flips += 1;
    s.dir = dir;
    s.dpr = next;
    setDpr(next);
    if (s.flips >= 2 && dir === -1) s.settled = true;
  });
  return null;
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
