"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  type BufferGeometry,
  CapsuleGeometry,
  CylinderGeometry,
  DataTexture,
  DoubleSide,
  Euler,
  type Group,
  type Mesh,
  MeshToonMaterial,
  NearestFilter,
  Quaternion,
  RedFormat,
  SphereGeometry,
  Vector2,
  Vector3,
} from "three";
import { BODY, type Pose, solveTwoBone } from "./characterRig";
import { inkOutlineMaterial, setOutlineResolution } from "./inkOutline";

/**
 * The doodle engineer: a few simple shapes, toon shading and an ink outline.
 * Driven entirely by a Pose (hands/feet are IK targets), so the scene can make them
 * type, reach, look over the side, stand at the mast and wave.
 */

function toonGradient() {
  const data = new Uint8Array([52, 120, 200, 255]);
  const tex = new DataTexture(data, 4, 1, RedFormat);
  tex.minFilter = NearestFilter;
  tex.magFilter = NearestFilter;
  tex.needsUpdate = true;
  return tex;
}

const UP = new Vector3(0, 1, 0);
const LIMBS = ["upperArmL", "foreArmL", "upperArmR", "foreArmR", "thighL", "shinL", "thighR", "shinR"] as const;
const LIMB_MATERIAL: Record<(typeof LIMBS)[number], "hoodie" | "pants"> = {
  upperArmL: "hoodie",
  foreArmL: "hoodie",
  upperArmR: "hoodie",
  foreArmR: "hoodie",
  thighL: "pants",
  shinL: "pants",
  thighR: "pants",
  shinR: "pants",
};

/** Ink line for a part (shares the part's geometry and transform). */
function Ink({ geometry, on }: { geometry: BufferGeometry; on: boolean }) {
  return on ? <mesh geometry={geometry} material={inkOutlineMaterial} /> : null;
}

export function Character({ pose, outline = true, lineWidth = 1.5 }: { pose: Pose; outline?: boolean; lineWidth?: number }) {
  const gl = useThree((s) => s.gl);
  const refs = useRef<Record<string, Mesh | null>>({});
  const torsoRef = useRef<Mesh>(null);
  const headRef = useRef<Group>(null);

  const assets = useMemo(() => {
    const gradientMap = toonGradient();
    const toon = (color: string, emissive = "#000000") => new MeshToonMaterial({ color, gradientMap, emissive });
    const beanie = toon("#f2700e", "#2a0e00");
    beanie.side = DoubleSide;
    return {
      materials: {
        skin: toon("#ede3d4"),
        hoodie: toon("#1c2c3b"),
        pants: toon("#262a31"),
        shoe: toon("#121519"),
        beanie,
        eye: new MeshToonMaterial({ color: "#07090c", gradientMap }),
      },
      limb: new CylinderGeometry(1, 1, 1, 12, 1, true),
      joint: new SphereGeometry(1, 16, 12),
      torso: new CapsuleGeometry(0.15, 0.24, 6, 16),
      head: new SphereGeometry(BODY.headRadius, 32, 22),
      // a snug cap on the crown, so the face stays readable even when looking down
      beanie: new SphereGeometry(BODY.headRadius * 1.06, 32, 10, 0, Math.PI * 2, 0, Math.PI * 0.34),
      cuff: new CylinderGeometry(BODY.headRadius * 0.93, BODY.headRadius * 0.99, 0.034, 32, 1, true),
      eye: new SphereGeometry(0.0135, 10, 8),
      buffer: new Vector2(),
    };
  }, []);

  // scratch objects (allocation-free frame loop)
  const s = useMemo(
    () => ({
      q: new Quaternion(),
      qHead: new Quaternion(),
      e: new Euler(0, 0, 0, "YZX"),
      up: new Vector3(),
      fwd: new Vector3(),
      right: new Vector3(),
      chest: new Vector3(),
      neck: new Vector3(),
      head: new Vector3(),
      sL: new Vector3(),
      sR: new Vector3(),
      hL: new Vector3(),
      hR: new Vector3(),
      mid: new Vector3(),
      end: new Vector3(),
      pole: new Vector3(),
      tmp: new Vector3(),
    }),
    [],
  );

  const placeBone = (mesh: Mesh | null | undefined, a: Vector3, b: Vector3, radius: number) => {
    if (!mesh) return;
    s.tmp.subVectors(b, a);
    const len = s.tmp.length();
    mesh.position.addVectors(a, b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(UP, s.tmp.divideScalar(Math.max(len, 1e-5)));
    mesh.scale.set(radius, len, radius);
  };
  const placeJoint = (mesh: Mesh | null | undefined, p: Vector3, r: number) => {
    if (!mesh) return;
    mesh.position.copy(p);
    mesh.scale.setScalar(r);
  };

  useFrame(() => {
    gl.getDrawingBufferSize(assets.buffer);
    setOutlineResolution(assets.buffer.x, assets.buffer.y, lineWidth * gl.getPixelRatio());

    const p = pose;
    s.e.set(p.roll, -p.yaw, -p.pitch, "YZX");
    s.q.setFromEuler(s.e);
    s.up.set(0, 1, 0).applyQuaternion(s.q);
    s.fwd.set(1, 0, 0).applyQuaternion(s.q);
    s.right.set(0, 0, 1).applyQuaternion(s.q);

    // Torso
    s.chest.copy(p.pelvis).addScaledVector(s.up, BODY.torso);
    if (torsoRef.current) {
      torsoRef.current.position.copy(p.pelvis).addScaledVector(s.up, BODY.torso * 0.5);
      torsoRef.current.quaternion.copy(s.q);
    }

    // Head
    s.neck.copy(s.chest).addScaledVector(s.up, BODY.neck);
    s.e.set(0, -p.headYaw, -p.headPitch, "YZX");
    s.qHead.setFromEuler(s.e).premultiply(s.q);
    s.tmp.set(0, BODY.headRadius * 0.95, 0).applyQuaternion(s.qHead);
    s.head.copy(s.neck).add(s.tmp);
    if (headRef.current) {
      headRef.current.position.copy(s.head);
      headRef.current.quaternion.copy(s.qHead);
    }

    // Shoulders & hips
    s.sL.copy(s.chest).addScaledVector(s.up, -0.06).addScaledVector(s.right, -BODY.shoulderHalf);
    s.sR.copy(s.chest).addScaledVector(s.up, -0.06).addScaledVector(s.right, BODY.shoulderHalf);
    s.hL.copy(p.pelvis).addScaledVector(s.right, -BODY.hipHalf);
    s.hR.copy(p.pelvis).addScaledVector(s.right, BODY.hipHalf);

    const r = refs.current;
    // Arms — elbows out, down and slightly back
    for (const side of ["L", "R"] as const) {
      const shoulder = side === "L" ? s.sL : s.sR;
      const target = side === "L" ? p.handL : p.handR;
      const out = side === "L" ? -1 : 1;
      s.pole.copy(shoulder).addScaledVector(s.right, out * 0.55).addScaledVector(s.up, -0.7).addScaledVector(s.fwd, -0.3);
      solveTwoBone(shoulder, target, BODY.upperArm, BODY.foreArm, s.pole, s.mid, s.end);
      placeBone(r[`upperArm${side}`], shoulder, s.mid, 0.052);
      placeBone(r[`foreArm${side}`], s.mid, s.end, 0.046);
      placeJoint(r[`shoulder${side}`], shoulder, 0.058);
      placeJoint(r[`elbow${side}`], s.mid, 0.05);
      placeJoint(r[`hand${side}`], s.end, 0.042);
    }
    // Legs — knees forward
    for (const side of ["L", "R"] as const) {
      const hip = side === "L" ? s.hL : s.hR;
      const target = side === "L" ? p.footL : p.footR;
      s.pole.copy(hip).addScaledVector(s.fwd, 1).addScaledVector(s.up, 0.15);
      solveTwoBone(hip, target, BODY.thigh, BODY.shin, s.pole, s.mid, s.end);
      placeBone(r[`thigh${side}`], hip, s.mid, 0.068);
      placeBone(r[`shin${side}`], s.mid, s.end, 0.058);
      placeJoint(r[`knee${side}`], s.mid, 0.066);
      const foot = r[`foot${side}`];
      if (foot) {
        foot.position.copy(s.end).addScaledVector(s.fwd, 0.04);
        foot.position.y += 0.02;
        foot.quaternion.copy(s.q);
        foot.scale.set(0.085, 0.045, 0.055);
      }
    }
  });

  const m = assets.materials;
  const setRef = (key: string) => (el: Mesh | null) => {
    refs.current[key] = el;
  };

  return (
    <group>
      <mesh ref={torsoRef} geometry={assets.torso} material={m.hoodie} scale={[0.82, 1, 1.12]}>
        <Ink geometry={assets.torso} on={outline} />
      </mesh>

      <group ref={headRef}>
        <mesh geometry={assets.head} material={m.skin} scale={[1, 1.04, 1]}>
          <Ink geometry={assets.head} on={outline} />
        </mesh>
        <mesh geometry={assets.beanie} material={m.beanie} position={[0, 0.01, 0]} rotation={[0, 0, 0.18]}>
          <Ink geometry={assets.beanie} on={outline} />
        </mesh>
        <mesh geometry={assets.cuff} material={m.beanie} position={[-0.012, 0.072, 0]} rotation={[0, 0, 0.18]} />
        <mesh geometry={assets.eye} material={m.eye} position={[0.112, -0.004, -0.045]} />
        <mesh geometry={assets.eye} material={m.eye} position={[0.112, -0.004, 0.045]} />
      </group>

      {LIMBS.map((key) => (
        <mesh key={key} ref={setRef(key)} geometry={assets.limb} material={m[LIMB_MATERIAL[key]]}>
          <Ink geometry={assets.limb} on={outline} />
        </mesh>
      ))}
      {(["shoulderL", "shoulderR", "elbowL", "elbowR"] as const).map((k) => (
        <mesh key={k} ref={setRef(k)} geometry={assets.joint} material={m.hoodie} />
      ))}
      {(["kneeL", "kneeR"] as const).map((k) => (
        <mesh key={k} ref={setRef(k)} geometry={assets.joint} material={m.pants} />
      ))}
      {(["handL", "handR"] as const).map((k) => (
        <mesh key={k} ref={setRef(k)} geometry={assets.joint} material={m.skin}>
          <Ink geometry={assets.joint} on={outline} />
        </mesh>
      ))}
      {(["footL", "footR"] as const).map((k) => (
        <mesh key={k} ref={setRef(k)} geometry={assets.joint} material={m.shoe}>
          <Ink geometry={assets.joint} on={outline} />
        </mesh>
      ))}
    </group>
  );
}
