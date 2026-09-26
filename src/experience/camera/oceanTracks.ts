import { Quaternion, Vector3 } from "three";
import { handoffTimeAt, moments, timeAt } from "@/story/moments";
import { type LaptopPose, laptopPose, screenWorld } from "../choreo/ocean";
import type { KeySpec } from "./track";

/**
 * Float + Dive, in world space (the boat sits at the origin, bow toward +x).
 * The opening looks at the boat's starboard bow quarter so we see the engineer's face,
 * lit by the screen, with the dusk glow behind them.
 */

const pose: LaptopPose = { position: new Vector3(), quaternion: new Quaternion(), inBoat: false, visible: true };
const c = new Vector3();
const n = new Vector3();
const u = new Vector3();

/** Laptop position at story time t (underwater phase — no boat dependency). */
const laptopAt = (t: () => number, offset: [number, number, number] = [0, 0, 0]) => () =>
  laptopPose(t(), null, pose).position.clone().add(new Vector3(...offset));

/** A point in front of the screen at distance d (for the approach into the laptop). */
const screenFront = (t: () => number, d: number, lift = 0) => () => {
  laptopPose(t(), null, pose);
  screenWorld(pose, c, n, u);
  return c.clone().addScaledVector(n, d).addScaledVector(u, lift);
};
const screenCentre = (t: () => number) => () => {
  laptopPose(t(), null, pose);
  screenWorld(pose, c, n, u);
  return c.clone();
};

export const floatDiveKeys: KeySpec[] = [
  // 01 — wide, calm, blue hour. Boat right of centre on the horizon.
  { at: () => 0, pos: [13.2, 1.5, 17.6], look: [0, 0.6, 0], fov: 30, shift: [0.34, 0.2], shiftPortrait: [0, 0.3], backPortrait: 1.25 },
  { at: () => timeAt("float", 0.3), pos: [11.6, 1.42, 15.2], look: [0, 0.6, 0], fov: 30, shift: [0.32, 0.19], shiftPortrait: [0, 0.3], backPortrait: 1.2 },
  // closer: the engineer at work, the floating line sits upper-left
  { at: () => timeAt("float", 0.5), pos: [4.1, 1.28, 4.6], look: [-0.4, 0.72, 0.02], fov: 32, shift: [0.3, 0.02], shiftPortrait: [0, 0.2], backPortrait: 1.3 },
  // over the shoulder: the code on the screen
  { at: () => timeAt("float", 0.63), pos: [-1.95, 1.42, 1.02], look: [-0.26, 0.55, -0.04], fov: 32, shift: [0.16, 0.02], shiftPortrait: [0, 0.1] },
  // the roll: round to the starboard bow quarter, low — the face, and the laptop sliding toward us
  { at: () => moments.slip + 0.02, pos: [1.25, 0.98, 1.9], look: [-0.38, 0.55, 0.12], fov: 36, shift: [0.08, 0], shiftPortrait: [0, 0.08] },
  { at: () => (moments.slip + moments.leaveBoat) / 2, pos: [1.05, 0.9, 2.1], look: [-0.34, 0.44, 0.34], fov: 37, shift: [0.02, 0], shiftPortrait: [0, 0.06] },
  { at: () => moments.leaveBoat, pos: [0.8, 0.84, 2.35], look: [-0.32, 0.3, 0.68], fov: 38, shift: [0, 0], shiftPortrait: [0, 0.04] },
  // falling… the camera tips down with it
  { at: () => moments.splash, pos: [0.3, 0.62, 2.6], look: [-0.25, -0.02, 1.02], fov: 40, shift: [0, 0], shiftPortrait: [0, 0] },
  // through the surface
  { at: () => handoffTimeAt("dive", 0.86), pos: [0.12, 0.14, 2.45], look: laptopAt(() => moments.submerged), fov: 42, shift: [0, 0], shiftPortrait: [0, 0] },
  { at: () => moments.submerged, pos: [0.1, -0.55, 2.4], look: laptopAt(() => moments.submerged), fov: 42, shift: [0, 0], shiftPortrait: [0, 0] },
  // "Good products aren't built on the surface." — look up at the boat against the light
  { at: () => timeAt("dive", 0.3), pos: [1.7, -3.9, 3.7], look: [-0.1, -0.4, 0.9], fov: 44, shift: [0.18, -0.05], shiftPortrait: [0, 0.05] },
  // "We go deep…" — follow it down
  { at: () => timeAt("dive", 0.56), pos: laptopAt(() => timeAt("dive", 0.56), [1.5, 0.9, 2.4]), look: laptopAt(() => timeAt("dive", 0.6)), fov: 40, shift: [-0.22, 0], shiftPortrait: [0, 0.12] },
  { at: () => timeAt("dive", 0.78), pos: screenFront(() => timeAt("dive", 0.78), 1.6, 0.25), look: screenCentre(() => timeAt("dive", 0.8)), fov: 38, shift: [-0.1, 0], shiftPortrait: [0, 0.05], ease: "linear" },
  // into the screen
  { at: () => timeAt("dive", 0.9), pos: screenFront(() => timeAt("dive", 0.9), 0.62), look: screenCentre(() => timeAt("dive", 0.9)), fov: 38, shift: [0, 0], shiftPortrait: [0, 0] },
  { at: () => moments.enterScreen, pos: screenFront(() => moments.enterScreen, 0.13), look: screenCentre(() => moments.enterScreen), fov: 38, shift: [0, 0], shiftPortrait: [0, 0], backPortrait: 1, ease: "in" },
];
