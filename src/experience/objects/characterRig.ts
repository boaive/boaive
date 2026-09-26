import { Vector3 } from "three";

/**
 * Pose description for the doodle engineer. All positions are in boat space
 * (x forward, y up, z starboard). Hands and feet are IK targets.
 */
export type Pose = {
  pelvis: Vector3;
  /** Lean forward (+) */
  pitch: number;
  /** Lean to starboard (+) */
  roll: number;
  /** Turn toward starboard (+) */
  yaw: number;
  headPitch: number;
  headYaw: number;
  handL: Vector3;
  handR: Vector3;
  footL: Vector3;
  footR: Vector3;
};

export const BODY = {
  torso: 0.46,
  neck: 0.06,
  headRadius: 0.125,
  shoulderHalf: 0.18,
  hipHalf: 0.095,
  upperArm: 0.27,
  foreArm: 0.26,
  thigh: 0.42,
  shin: 0.42,
};

export function makePose(): Pose {
  return {
    pelvis: new Vector3(),
    pitch: 0,
    roll: 0,
    yaw: 0,
    headPitch: 0,
    headYaw: 0,
    handL: new Vector3(),
    handR: new Vector3(),
    footL: new Vector3(),
    footR: new Vector3(),
  };
}

export function copyPose(out: Pose, p: Pose): Pose {
  out.pelvis.copy(p.pelvis);
  out.pitch = p.pitch;
  out.roll = p.roll;
  out.yaw = p.yaw;
  out.headPitch = p.headPitch;
  out.headYaw = p.headYaw;
  out.handL.copy(p.handL);
  out.handR.copy(p.handR);
  out.footL.copy(p.footL);
  out.footR.copy(p.footR);
  return out;
}

/** out = lerp(a, b, t) */
export function blendPose(out: Pose, a: Pose, b: Pose, t: number): Pose {
  out.pelvis.lerpVectors(a.pelvis, b.pelvis, t);
  out.pitch = a.pitch + (b.pitch - a.pitch) * t;
  out.roll = a.roll + (b.roll - a.roll) * t;
  out.yaw = a.yaw + (b.yaw - a.yaw) * t;
  out.headPitch = a.headPitch + (b.headPitch - a.headPitch) * t;
  out.headYaw = a.headYaw + (b.headYaw - a.headYaw) * t;
  out.handL.lerpVectors(a.handL, b.handL, t);
  out.handR.lerpVectors(a.handR, b.handR, t);
  out.footL.lerpVectors(a.footL, b.footL, t);
  out.footR.lerpVectors(a.footR, b.footR, t);
  return out;
}

const tmpD = new Vector3();
const tmpP = new Vector3();

/**
 * Two-bone IK: from root `a` toward `target`, bending toward `pole`.
 * Writes the joint (elbow/knee) into `mid` and the reachable end into `end`.
 */
export function solveTwoBone(a: Vector3, target: Vector3, l1: number, l2: number, pole: Vector3, mid: Vector3, end: Vector3) {
  tmpD.subVectors(target, a);
  const reach = l1 + l2 - 1e-4;
  const dist = Math.min(Math.max(tmpD.length(), Math.abs(l1 - l2) + 1e-3), reach);
  tmpD.normalize();
  end.copy(a).addScaledVector(tmpD, dist);
  const cosA = (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist);
  const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
  tmpP.subVectors(pole, a);
  tmpP.addScaledVector(tmpD, -tmpP.dot(tmpD));
  if (tmpP.lengthSq() < 1e-8) tmpP.set(0, -1, 0);
  tmpP.normalize();
  mid.copy(a).addScaledVector(tmpD, cosA * l1).addScaledVector(tmpP, sinA * l1);
}
