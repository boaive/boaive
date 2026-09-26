"use client";

import { forwardRef, type ReactNode, useMemo } from "react";
import { BoxGeometry, Color, DoubleSide, type Group, MeshStandardMaterial } from "three";
import { createGunwaleGeometry, createHullGeometry, createTransomRailGeometry, thwartAt } from "./boatGeometry";

export const THWARTS = { aft: -0.66, fore: 0.46 } as const;

function createHullMaterial() {
  const material = new MeshStandardMaterial({ color: "#ffffff", roughness: 0.55, metalness: 0, side: DoubleSide });
  const uniforms = {
    uTopside: { value: new Color("#e6dfd2") },
    uStripe: { value: new Color("#f2700e") },
    uBottom: { value: new Color("#16202b") },
    uInterior: { value: new Color("#7a5236") },
  };
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vHullY;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvHullY = position.y;");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying float vHullY;\nuniform vec3 uTopside;\nuniform vec3 uStripe;\nuniform vec3 uBottom;\nuniform vec3 uInterior;",
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        vec3 hullCol = uTopside;
        hullCol = mix(hullCol, uStripe, step(0.052, vHullY) * step(vHullY, 0.098));
        hullCol = mix(hullCol, uBottom, step(vHullY, 0.052));
        diffuseColor.rgb = gl_FrontFacing ? hullCol : uInterior;`,
      );
  };
  material.customProgramCacheKey = () => "boaive-hull";
  return material;
}

/** The Boaive dinghy. Children (the engineer, the sail) ride along in boat space. */
export const Boat = forwardRef<Group, { children?: ReactNode }>(function Boat({ children }, ref) {
  const assets = useMemo(() => {
    const wood = new MeshStandardMaterial({ color: "#6e4a31", roughness: 0.78 });
    const rail = new MeshStandardMaterial({ color: "#3a291d", roughness: 0.6 });
    const aft = thwartAt(THWARTS.aft);
    const fore = thwartAt(THWARTS.fore);
    return {
      hull: createHullGeometry(),
      hullMaterial: createHullMaterial(),
      gunwaleL: createGunwaleGeometry(-1),
      gunwaleR: createGunwaleGeometry(1),
      transom: createTransomRailGeometry(),
      wood,
      rail,
      thwartAft: { geo: new BoxGeometry(0.22, 0.034, aft.width), y: aft.y },
      thwartFore: { geo: new BoxGeometry(0.2, 0.034, fore.width), y: fore.y },
    };
  }, []);

  return (
    <group ref={ref}>
      <mesh geometry={assets.hull} material={assets.hullMaterial} />
      <mesh geometry={assets.gunwaleL} material={assets.rail} />
      <mesh geometry={assets.gunwaleR} material={assets.rail} />
      <mesh geometry={assets.transom} material={assets.rail} />
      <mesh geometry={assets.thwartAft.geo} material={assets.wood} position={[THWARTS.aft, assets.thwartAft.y, 0]} />
      <mesh geometry={assets.thwartFore.geo} material={assets.wood} position={[THWARTS.fore, assets.thwartFore.y, 0]} />
      {children}
    </group>
  );
});
