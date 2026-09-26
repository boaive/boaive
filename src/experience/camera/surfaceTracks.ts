import { moments, timeAt } from "@/story/moments";
import type { KeySpec } from "./track";

/**
 * Surface: rising from the deep under the boat, breaking the surface at sunrise,
 * and settling on the final frame — the boat with its sail, the sun behind it.
 */
export const surfaceKeys: KeySpec[] = [
  { at: () => moments.surfaceSwap, pos: [2.2, -17, 6.5], look: [0, -2, 0.4], fov: 46, shift: [0, 0], shiftPortrait: [0, 0] },
  { at: () => timeAt("contact", 0.2), pos: [1.6, -6.5, 6.2], look: [0, 0.2, 0], fov: 44, shift: [0.1, 0], shiftPortrait: [0, 0] },
  { at: () => moments.surfaceBreak - 0.015, pos: [1.2, -0.35, 7.2], look: [0, 0.9, 0], fov: 40, shift: [0.12, 0.05], shiftPortrait: [0, 0.1] },
  { at: () => moments.surfaceBreak + 0.02, pos: [2.2, 0.55, 8.6], look: [0, 1.2, 0], fov: 38, shift: [0.18, 0.1], shiftPortrait: [0, 0.18] },
  // Final frame: the boat sits high and central, between the brand line and the call to action.
  { at: () => timeAt("contact", 0.62), pos: [6.2, 1.25, 11.2], look: [-0.1, 1.45, 0], fov: 34, shift: [-0.02, 0.3], shiftPortrait: [0, 0.34], backPortrait: 1.35, ease: "out" },
  { at: () => timeAt("contact", 1), pos: [6.8, 1.3, 12.1], look: [-0.1, 1.45, 0], fov: 34, shift: [-0.02, 0.3], shiftPortrait: [0, 0.34], backPortrait: 1.35 },
];
