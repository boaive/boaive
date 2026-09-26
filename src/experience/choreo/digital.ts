import { pinnedAt, timeAt } from "@/story/moments";
import { timing } from "@/story/timing";
import { clamp, invLerp, smoothstep, window01 } from "../math";

/**
 * The digital chapters as functions of story time. Ranges come from story/timing.ts —
 * the same numbers the DOM beats use — so the active form/step/project always matches the text.
 */

/** How "on" capability i is (0..1) at story time t. */
export function capabilityActivity(i: number, t: number): number {
  const p = pinnedAt("capabilities", t);
  const [a, b] = timing.capabilities.items[i];
  return window01(a, b, p, 0.035);
}

/** Continuous build stage 0..5 through the process chapter. */
export function buildStage(t: number): number {
  const p = pinnedAt("process", t);
  const steps = timing.process.steps;
  if (p <= steps[0][0]) return clamp(invLerp(-0.15, steps[0][0], p)) * 0.15;
  for (let i = 0; i < steps.length; i++) {
    const [a, b] = steps[i];
    // most of the transformation happens early in each step, then it holds for reading
    if (p < b || i === steps.length - 1) return i + clamp(invLerp(a, a + (b - a) * 0.7, p));
  }
  return steps.length;
}

/** How "on" project i is in the work chapter. */
export function projectActivity(i: number, t: number): number {
  const p = pinnedAt("work", t);
  const [a, b] = timing.work.projects[i];
  return window01(a, b, p, 0.03);
}

/** Presence of a layer that appears around `inAt` and leaves around `outAt` (story times). */
export function presence(t: number, inAt: number, outAt: number, fade = 0.12): number {
  return smoothstep(inAt - fade, inAt, t) * (1 - smoothstep(outAt, outAt + fade, t));
}

export const digitalTimes = {
  capabilities: () => timeAt("capabilities", 0),
  process: () => timeAt("process", 0),
  work: () => timeAt("work", 0),
  outcome: () => timeAt("outcome", 0),
};
