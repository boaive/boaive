"use client";

import { RoundedBox, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { forwardRef, useMemo } from "react";
import {
  type Group,
  Matrix4,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  ShaderMaterial,
  SRGBColorSpace,
  Vector3,
} from "three";
import { frame } from "../frame";
import { screenFragment, screenVertex } from "../shaders/screen";

/**
 * Laptop, in its own space: origin at the centre of the base's underside,
 * x toward the hinge (away from the user), y up, z to the user's right.
 */
export const LAPTOP = {
  width: 0.3, // along z
  depth: 0.21, // along x
  base: 0.016,
  lid: 0.01,
  openAngle: (105 * Math.PI) / 180,
  screen: { w: 0.272, h: 0.17 },
};

/** Screen centre + normal in laptop space (lid open at LAPTOP.openAngle). */
export function screenFrameLocal(outCentre: Vector3, outNormal: Vector3, outUp: Vector3) {
  const a = -LAPTOP.openAngle;
  const hinge = new Vector3(LAPTOP.depth / 2, LAPTOP.base, 0);
  // lid-local: centre at (-depth/2, -lid/2 - 0.001, 0), normal -y, up (toward far edge) -x
  const rot = (x: number, y: number) => new Vector3(x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), 0);
  outCentre.copy(hinge).add(rot(-LAPTOP.depth / 2 + 0.004, -0.0012));
  outNormal.copy(rot(0, -1)).normalize();
  outUp.copy(rot(-1, 0)).normalize();
}

export type LaptopScreenControls = { mode: number; glitch: number; power: number };

/** Mutable screen state written by the choreography. */
export const laptopScreen: LaptopScreenControls = { mode: 0, glitch: 0, power: 1 };

export const Laptop = forwardRef<Group, { visible?: boolean }>(function Laptop({ visible = true }, ref) {
  const mark = useTexture("/brand/mark-512.png");
  const assets = useMemo(() => {
    mark.colorSpace = SRGBColorSpace;
    mark.anisotropy = 4;
    const aluminium = new MeshStandardMaterial({ color: "#b8bcc2", metalness: 0.82, roughness: 0.3, envMapIntensity: 1.1 });
    const deck = new MeshStandardMaterial({ color: "#16191e", metalness: 0.2, roughness: 0.75 });
    const screen = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMode: { value: 0 },
        uGlitch: { value: 0 },
        uPower: { value: 1 },
        uMark: { value: mark },
        uMarkAspect: { value: 512 / 681 },
      },
      vertexShader: screenVertex,
      fragmentShader: screenFragment,
      toneMapped: false,
    });
    // Plane basis: u → +z (user's right), v → -x (toward the lid's far edge), normal → -y
    const screenGeo = new PlaneGeometry(LAPTOP.screen.w, LAPTOP.screen.h);
    screenGeo.applyMatrix4(new Matrix4().makeBasis(new Vector3(0, 0, 1), new Vector3(-1, 0, 0), new Vector3(0, -1, 0)));
    // Logo on the lid's back: u → -z, v → -x, normal → +y
    const logoGeo = new PlaneGeometry(0.052, 0.052 / (512 / 681));
    logoGeo.applyMatrix4(new Matrix4().makeBasis(new Vector3(0, 0, -1), new Vector3(-1, 0, 0), new Vector3(0, 1, 0)));
    const logo = new MeshBasicMaterial({ map: mark, transparent: true, toneMapped: false, opacity: 0.95 });
    return { aluminium, deck, screen, screenGeo, logoGeo, logo };
  }, [mark]);

  useFrame(() => {
    const u = assets.screen.uniforms;
    u.uTime.value = frame.elapsed;
    u.uMode.value = laptopScreen.mode;
    u.uGlitch.value = laptopScreen.glitch;
    u.uPower.value = laptopScreen.power;
  });

  const { width, depth, base, lid } = LAPTOP;
  return (
    <group ref={ref} visible={visible}>
      {/* base */}
      <RoundedBox args={[depth, base, width]} radius={0.006} smoothness={3} position={[0, base / 2, 0]} material={assets.aluminium} />
      {/* keyboard deck */}
      <mesh position={[-0.012, base + 0.0006, 0]} rotation={[-Math.PI / 2, 0, 0]} material={assets.deck}>
        <planeGeometry args={[depth * 0.52, width * 0.86]} />
      </mesh>
      {/* lid, hinged at the back edge */}
      <group position={[depth / 2, base, 0]} rotation={[0, 0, -LAPTOP.openAngle]}>
        <RoundedBox
          args={[depth, lid, width]}
          radius={0.005}
          smoothness={3}
          position={[-depth / 2, lid / 2, 0]}
          material={assets.aluminium}
        />
        <mesh geometry={assets.screenGeo} material={assets.screen} position={[-depth / 2 + 0.004, -0.0012, 0]} />
        <mesh geometry={assets.logoGeo} material={assets.logo} position={[-depth / 2, lid + 0.0008, 0]} />
      </group>
    </group>
  );
});
