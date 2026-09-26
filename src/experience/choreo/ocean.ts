import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import { moments, pinnedAt } from "@/story/moments";
import { clamp, easeInCubic, easeInOutSine, easeOutCubic, invLerp, lerp, smoothstep } from "../math";
import { FLOOR_Y } from "../objects/boatGeometry";
import { type Pose, blendPose, copyPose, makePose } from "../objects/characterRig";
import { LAPTOP, screenFrameLocal } from "../objects/Laptop";
import { RIG } from "../objects/Sail";

/**
 * The ocean chapters as pure functions of story time t, so scrolling back rewinds exactly.
 * Boat space: x = bow, y = up, z = starboard. The boat sits at the world origin (yaw 0).
 */

// ── Where things are ──────────────────────────────────────────────────────────
/** Laptop resting on the engineer's thighs (laptop origin = underside of the base). */
export const LAP = new Vector3(-0.37, 0.4, 0);
const PELVIS_SEATED = new Vector3(-0.66, 0.29, 0);

// ── The boat ──────────────────────────────────────────────────────────────────
/** Extra roll (radians, + = starboard down) from the wave that tips the laptop over. */
export function scriptedRoll(t: number): number {
  const s = invLerp(moments.slip - 0.04, moments.leaveBoat + 0.08, t);
  if (s <= 0 || s >= 1) return 0;
  return Math.sin(Math.PI * Math.pow(s, 0.8)) * 0.15;
}

// ── The laptop ────────────────────────────────────────────────────────────────
export type LaptopPose = {
  position: Vector3;
  quaternion: Quaternion;
  /** true while it's still resting in the boat (then position/quaternion are in boat space). */
  inBoat: boolean;
  visible: boolean;
};

const e = new Euler();
const qA = new Quaternion();
const qB = new Quaternion();
const m4 = new Matrix4();
const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();

/** Final underwater orientation: screen turned toward the camera arriving from +z, slightly above. */
const FINAL_Q = (() => {
  const centre = new Vector3();
  const normal = new Vector3();
  const up = new Vector3();
  screenFrameLocal(centre, normal, up);
  const want = new Vector3(0.18, 0.32, 1).normalize();
  const wantUp = new Vector3(0, 1, 0);
  wantUp.addScaledVector(want, -wantUp.dot(want)).normalize();
  const wantSide = new Vector3().crossVectors(wantUp, want);
  const localSide = new Vector3().crossVectors(up, normal);
  const local = new Matrix4().makeBasis(localSide, up, normal);
  const world = new Matrix4().makeBasis(wantSide, wantUp, want);
  return new Quaternion().setFromRotationMatrix(world.multiply(local.transpose()));
})();

/** Boat-space pose while sliding off the lap (s: 0 → 1). */
function slidePose(s: number, out: LaptopPose) {
  const a = easeInCubic(clamp(s / 0.62));
  const b = easeInOutSine(clamp((s - 0.62) / 0.38));
  out.position.set(LAP.x + 0.02 * a, LAP.y - 0.035 * a - 0.07 * b, 0.34 * a + 0.36 * b);
  e.set(0.28 * a + 0.9 * b, 0.05 * a, -0.04 * a);
  out.quaternion.setFromEuler(e);
}

/**
 * Where the laptop is at story time t.
 * `boatMatrix` is the boat's current world matrix (used for the hand-off from boat to water).
 */
export function laptopPose(t: number, boatMatrix: Matrix4 | null, out: LaptopPose): LaptopPose {
  out.visible = t < moments.enterScreen + 0.02;
  if (t < moments.slip) {
    out.inBoat = true;
    out.position.copy(LAP);
    out.quaternion.identity();
    return out;
  }
  if (t < moments.leaveBoat) {
    out.inBoat = true;
    slidePose(invLerp(moments.slip, moments.leaveBoat, t), out);
    return out;
  }

  // The moment it leaves the boat, in world space.
  slidePose(1, out);
  v1.copy(out.position);
  qA.copy(out.quaternion);
  if (boatMatrix) {
    v1.applyMatrix4(boatMatrix);
    qB.setFromRotationMatrix(m4.extractRotation(boatMatrix));
    qA.premultiply(qB);
  }
  out.inBoat = false;

  if (t < moments.splash) {
    // Falling: a short arc outward, tumbling over its long edge.
    const f = invLerp(moments.leaveBoat, moments.splash, t);
    out.position.set(v1.x + 0.04 * f, v1.y - (v1.y + 0.02) * f * f, v1.z + 0.34 * f);
    e.set(1.25 * f, 0.18 * f, 0.1 * f);
    out.quaternion.copy(qA).multiply(qB.setFromEuler(e));
    return out;
  }

  // Underwater: momentum from the splash, then a slow steady sink; tumbling settles and the
  // screen turns toward the camera for the approach.
  const s = invLerp(moments.splash, moments.enterScreen, t);
  const start = v2.set(v1.x + 0.04, -0.02, v1.z + 0.34);
  const depth = 1.3 * (1 - Math.exp(-s * 6)) + 6.2 * s;
  out.position.set(start.x + 0.55 * s, start.y - depth, start.z + 0.95 * s + 0.22 * Math.sin(s * 3.2));
  e.set(1.25 + 1.4 * (1 - Math.exp(-s * 4.5)), 0.18 + 0.7 * s, 0.1 + 0.35 * Math.sin(s * 5));
  const tumbling = qB.setFromEuler(e).premultiply(qA);
  const settle = smoothstep(0.42, 0.8, s);
  out.quaternion.copy(tumbling).slerp(FINAL_Q, settle);
  return out;
}

/** Screen centre, normal and up in world space for a laptop pose. */
export function screenWorld(pose: LaptopPose, centre: Vector3, normal: Vector3, up: Vector3) {
  screenFrameLocal(centre, normal, up);
  centre.applyQuaternion(pose.quaternion).add(pose.position);
  normal.applyQuaternion(pose.quaternion);
  up.applyQuaternion(pose.quaternion);
}

/** What the screen shows. */
export function screenState(t: number) {
  const afterSplash = t - moments.splash;
  const glitch = afterSplash > 0 ? Math.max(0, 1 - afterSplash / 0.09) * 0.9 + (afterSplash < 0.2 ? 0.15 : 0) : 0;
  const boot = smoothstep(moments.boot - 0.08, moments.boot + 0.06, t);
  const portal = smoothstep(moments.enterScreen - 0.22, moments.enterScreen - 0.06, t);
  const mode = afterSplash < 0 ? 0 : 1 + boot + portal;
  const power = afterSplash > 0 && afterSplash < 0.12 ? 0.55 + 0.45 * Math.abs(Math.sin(afterSplash * 140)) : 1;
  return { mode, glitch: clamp(glitch), power };
}

// ── The engineer ──────────────────────────────────────────────────────────────
const typing = makePose();
const reaching = makePose();
const watching = makePose();
const standing = makePose();
const tmpPose = makePose();

function typingPose(time: number, out: Pose) {
  out.pelvis.copy(PELVIS_SEATED);
  out.pitch = 0.2 + Math.sin(time * 0.35) * 0.02;
  out.roll = 0;
  out.yaw = 0;
  // mostly on the screen, now and then a glance at the horizon
  const glance = smoothstep(0.82, 0.95, Math.sin(time * 0.21) * 0.5 + 0.5);
  out.headPitch = lerp(0.42, 0.05, glance);
  out.headYaw = lerp(0, -0.35, glance);
  const tap = (phase: number) => Math.max(0, Math.sin(time * 15 + phase)) * 0.012;
  out.handL.set(-0.43, LAP.y + LAPTOP.base + 0.028 + tap(0), -0.075);
  out.handR.set(-0.425, LAP.y + LAPTOP.base + 0.028 + tap(2.1), 0.08);
  out.footL.set(-0.17, FLOOR_Y + 0.03, -0.12);
  out.footR.set(-0.19, FLOOR_Y + 0.03, 0.12);
  return out;
}

function reachingPose(laptop: Vector3, out: Pose) {
  out.pelvis.copy(PELVIS_SEATED).add(v3.set(0.02, 0.01, 0.06));
  out.pitch = 0.32;
  out.roll = 0.36;
  out.yaw = 0.4;
  out.headPitch = 0.34;
  out.headYaw = 0.8;
  out.handR.copy(laptop).add(v3.set(-0.02, 0.05, -0.05));
  out.handL.set(-0.7, 0.33, -0.52); // steadying on the port gunwale
  out.footL.set(-0.16, FLOOR_Y + 0.03, -0.14);
  out.footR.set(-0.22, FLOOR_Y + 0.03, 0.18);
  return out;
}

function watchingPose(time: number, out: Pose) {
  out.pelvis.copy(PELVIS_SEATED).add(v3.set(0.02, 0, 0.1));
  out.pitch = 0.3;
  out.roll = 0.55;
  out.yaw = 0.55;
  out.headPitch = 0.6 + Math.sin(time * 0.7) * 0.03;
  out.headYaw = 0.75;
  out.handR.set(-0.42, 0.36, 0.6); // on the starboard gunwale, looking down into the water
  out.handL.set(-0.62, 0.3, 0.18);
  out.footL.set(-0.16, FLOOR_Y + 0.03, -0.1);
  out.footR.set(-0.2, FLOOR_Y + 0.03, 0.2);
  return out;
}

/** Standing on the starboard side of the mast (the viewer's side), one hand on it, waving. */
function standingPose(time: number, wave: number, out: Pose) {
  out.pelvis.set(0.14, 0.72, 0.2);
  out.pitch = -0.03;
  out.roll = -0.03;
  out.yaw = 0.78; // turned toward the viewer
  out.headPitch = -0.1;
  out.headYaw = 0.3;
  out.handL.set(RIG.mastX - 0.03, 1.25, 0.05); // on the mast
  const w = Math.sin(time * 5.5) * 0.09 * wave;
  out.handR.set(0.12 + w * 0.3, lerp(0.62, 1.55, wave), 0.6 + w);
  out.footL.set(0.06, FLOOR_Y + 0.03, 0.06);
  out.footR.set(0.24, FLOOR_Y + 0.03, 0.3);
  return out;
}

/** The engineer's pose at story time t. `laptopInBoat` is the laptop position in boat space. */
export function characterPose(t: number, time: number, laptopInBoat: Vector3, out: Pose): Pose {
  if (t >= moments.surfaceSwap) {
    // Final chapter: standing at the mast; waves once the call to action is up.
    const wave = smoothstep(0.62, 0.78, pinnedAt("contact", t));
    return copyPose(out, standingPose(time, wave, standing));
  }
  typingPose(time, typing);
  if (t < moments.slip) return copyPose(out, typing);
  reachingPose(laptopInBoat, reaching);
  const reach = smoothstep(moments.slip + 0.03, moments.slip + (moments.leaveBoat - moments.slip) * 0.55, t);
  blendPose(tmpPose, typing, reaching, easeOutCubic(reach));
  if (t < moments.leaveBoat) return copyPose(out, tmpPose);
  watchingPose(time, watching);
  const settle = smoothstep(moments.leaveBoat, moments.splash + 0.05, t);
  return blendPose(out, tmpPose, watching, settle);
}
