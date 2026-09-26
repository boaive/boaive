import { Vector3 } from "three";
import { featuredProjects } from "@/data/projects";
import { handoffTimeAt, moments, timeAt } from "@/story/moments";
import { timing } from "@/story/timing";
import { formAngle, GALLERY, galleryPosition, PRODUCT_POSITION, RING_CENTRE, WALL } from "../choreo/digitalLayout";
import { dw } from "../worlds";
import type { KeySpec } from "./track";

/**
 * Inside the digital deep. Positions are local to the digital world (dw() converts).
 * Text sits left on desktop, so subjects are framed right of centre with the lens shift.
 */

const ORBIT = 16.4;

/** Camera for capability i: outside the ring, slightly to the side, form right of centre. */
function formShot(i: number): Pick<KeySpec, "pos" | "look"> {
  const a = formAngle(i) + 0.14;
  const target = new Vector3(Math.cos(formAngle(i)) * 9.5, RING_CENTRE.y + 0.3, Math.sin(formAngle(i)) * 9.5);
  return {
    pos: () => dw(Math.cos(a) * ORBIT, 4.5, Math.sin(a) * ORBIT),
    look: () => dw(target.x, target.y, target.z),
  };
}

/** Camera for project i: from near the centre, facing its screen. */
function projectShot(i: number, pull = 0): Pick<KeySpec, "pos" | "look"> {
  const n = featuredProjects.length;
  const a = GALLERY.angle(i, n);
  const screen = galleryPosition(i, n);
  const d = 4.3 - pull;
  return {
    pos: () => dw(Math.cos(a) * d, GALLERY.y - 0.35, Math.sin(a) * d),
    look: () => dw(screen.x, screen.y, screen.z),
  };
}

/** A point on the process orbit around the product (angle in degrees). */
function processShot(deg: number, r: number, y: number): Pick<KeySpec, "pos" | "look"> {
  const a = (deg * Math.PI) / 180;
  return {
    pos: () => dw(PRODUCT_POSITION.x + Math.cos(a) * r, y, PRODUCT_POSITION.z + Math.sin(a) * r),
    look: () => dw(PRODUCT_POSITION.x, PRODUCT_POSITION.y + 0.35, PRODUCT_POSITION.z),
  };
}

const capabilityKeys: KeySpec[] = timing.capabilities.items.flatMap(([a, b], i) => [
  { at: () => timeAt("capabilities", a + 0.02), ...formShot(i), fov: 38, shift: [0.3, 0.02], shiftPortrait: [0, 0.2], backPortrait: 1.25, ease: "inOut" as const },
  { at: () => timeAt("capabilities", b - 0.025), ...formShot(i), fov: 37, shift: [0.3, 0.02], shiftPortrait: [0, 0.2], backPortrait: 1.25 },
]);

const workKeys: KeySpec[] = timing.work.projects.flatMap(([a, b], i) => [
  { at: () => timeAt("work", a + 0.025), ...projectShot(i), fov: 40, shift: [0.27, 0], shiftPortrait: [0, 0.22], backPortrait: 1.1, ease: "inOut" as const },
  { at: () => timeAt("work", Math.min(b, 0.999) - 0.03), ...projectShot(i, 0.3), fov: 40, shift: [0.27, 0], shiftPortrait: [0, 0.22], backPortrait: 1.1 },
]);

/** Closing beat: back off to take in the gathered wall of screens — the archive. */
const wallLook = () => dw(WALL.centre.x, WALL.centre.y, WALL.centre.z);
const moreKeys: KeySpec[] = [
  { at: () => timeAt("work", timing.work.more[0] + 0.06), pos: () => dw(0, 13.2, -3.4), look: wallLook, fov: 40, shift: [0.32, 0], shiftPortrait: [0, 0.2], backPortrait: 1.3, ease: "inOut" },
  { at: () => timeAt("work", 1), pos: () => dw(0, 13.4, -4.6), look: wallLook, fov: 40, shift: [0.32, 0], shiftPortrait: [0, 0.2], backPortrait: 1.3 },
];

export const digitalKeys: KeySpec[] = [
  // Problem — arriving from the screen: the deep opens up, ideas rise past
  { at: () => moments.enterScreen, pos: () => dw(0, 9.5, 33), look: () => dw(0, 7.5, 0), fov: 40, shift: [0, 0.05], shiftPortrait: [0, 0.05] },
  { at: () => timeAt("problem", 0.35), pos: () => dw(-1.5, 8, 28), look: () => dw(0, 6, 0), fov: 40, shift: [0.12, 0.04], shiftPortrait: [0, 0.1] },
  { at: () => timeAt("problem", 0.8), pos: () => dw(2.5, 6.8, 24.5), look: () => dw(0, 4, 2), fov: 40, shift: [0.18, 0.02], shiftPortrait: [0, 0.12] },

  // What we build — the ring comes into view, then the camera orbits to each form
  { at: () => handoffTimeAt("capabilities", 0.6), pos: () => dw(0, 8.5, 25), look: () => dw(0, 3, 0), fov: 40, shift: [0.2, 0.05], shiftPortrait: [0, 0.15] },
  { at: () => timeAt("capabilities", 0.05), pos: () => dw(-2, 9.5, 24), look: () => dw(0, 3, 0), fov: 40, shift: [0.25, 0.05], shiftPortrait: [0, 0.15], ease: "inOut" },
  ...capabilityKeys,
  { at: () => timeAt("capabilities", 0.97), pos: () => dw(-6, 12, 23), look: () => dw(0, 3, 0), fov: 42, shift: [0.2, 0.05], shiftPortrait: [0, 0.15], ease: "inOut" },

  // How we build — in over the ring to the centre; a slow orbit while the product takes shape
  { at: () => timeAt("process", 0), ...processShot(118, 8.6, 4.3), fov: 38, shift: [0.28, 0.02], shiftPortrait: [0, 0.22], backPortrait: 1.35, ease: "inOut" },
  { at: () => timeAt("process", 0.3), ...processShot(104, 7.6, 4.4), fov: 38, shift: [0.28, 0.02], shiftPortrait: [0, 0.22], backPortrait: 1.35 },
  { at: () => timeAt("process", 0.6), ...processShot(88, 7.2, 4.5), fov: 38, shift: [0.28, 0.02], shiftPortrait: [0, 0.22], backPortrait: 1.35 },
  { at: () => timeAt("process", 0.86), ...processShot(74, 7.8, 4.9), fov: 38, shift: [0.28, 0.02], shiftPortrait: [0, 0.22], backPortrait: 1.35 },
  { at: () => timeAt("process", 1), ...processShot(66, 9, 6.2), fov: 39, shift: [0.25, 0.02], shiftPortrait: [0, 0.2], backPortrait: 1.35 },

  // Work — rise to the gallery; face each project in turn
  { at: () => handoffTimeAt("work", 0.6), pos: () => dw(0, 10.5, 1), look: () => dw(0, 12.5, 12), fov: 42, shift: [0.1, 0], shiftPortrait: [0, 0.1] },
  { at: () => timeAt("work", 0.06), pos: () => dw(0, 12.2, -1.5), look: () => dw(0, 12.8, 12), fov: 44, shift: [0.2, 0], shiftPortrait: [0, 0.18], ease: "inOut" },
  ...workKeys,
  ...moreKeys,

  // Outcome — pull back and up: everything connected
  { at: () => timeAt("outcome", 0), pos: () => dw(4, 20, 30), look: () => dw(0, 6, 0), fov: 42, shift: [0, -0.04], shiftPortrait: [0, 0], backPortrait: 1.3, ease: "inOut" },
  { at: () => timeAt("outcome", 0.6), pos: () => dw(-8, 25, 27), look: () => dw(0, 6.5, 0), fov: 42, shift: [0, -0.06], shiftPortrait: [0, 0], backPortrait: 1.3 },
  { at: () => timeAt("outcome", 1), pos: () => dw(-13, 29, 21), look: () => dw(0, 8, 0), fov: 42, shift: [0, -0.06], shiftPortrait: [0, 0], backPortrait: 1.3 },

  // Studio — rising toward the light
  { at: () => timeAt("studio", 0.45), pos: () => dw(-9, 36, 13), look: () => dw(-2, 52, 2), fov: 46, shift: [0, 0], shiftPortrait: [0, 0] },
  { at: () => moments.surfaceSwap, pos: () => dw(-4, 50, 5), look: () => dw(0, 80, 0), fov: 50, shift: [0, 0], shiftPortrait: [0, 0], ease: "in" },
];
