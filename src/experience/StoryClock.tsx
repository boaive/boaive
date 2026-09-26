"use client";

import { useFrame } from "@react-three/fiber";
import { moments } from "@/story/moments";
import { story } from "@/story/store";
import { frame } from "./frame";
import { damp } from "./math";

/**
 * First thing every frame: smooth story time (snapping on big jumps, e.g. nav),
 * advance ambient time, and decide which world is on screen.
 */
export function StoryClock() {
  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 20);
    frame.dt = dt;
    frame.motion = story.reducedMotion ? 0 : 1;
    frame.elapsed += dt * (story.reducedMotion ? 0.2 : 1);

    const target = story.time;
    if (story.reducedMotion || Math.abs(target - frame.t) > 0.5) frame.t = target;
    else frame.t = damp(frame.t, target, 9, dt);

    frame.world = frame.t >= moments.enterScreen && frame.t < moments.surfaceSwap ? "digital" : "ocean";
    frame.timeOfDay = frame.t >= moments.surfaceSwap ? 1 : 0;
  }, -3);
  return null;
}
