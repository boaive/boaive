"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, type FogExp2, type Group, Matrix4, Quaternion, Vector3 } from "three";
import { moments, pinnedAt } from "@/story/moments";
import { ambient } from "../ambient";
import { atmosphere, underwaterColors } from "../atmosphere";
import { actors } from "../choreo/actors";
import { characterPose, laptopPose, type LaptopPose, scriptedRoll, screenState } from "../choreo/ocean";
import { frame } from "../frame";
import { fx } from "../fx/fxState";
import { lightRig } from "../Lighting";
import { clamp, lerp, smoothstep } from "../math";
import { Boat } from "../objects/Boat";
import { Character } from "../objects/Character";
import { makePose } from "../objects/characterRig";
import { Laptop, laptopScreen, screenFrameLocal } from "../objects/Laptop";
import { Ocean, oceanState } from "../objects/Ocean";
import { Sail } from "../objects/Sail";
import { Sky } from "../objects/Sky";
import { WaterFX } from "../objects/WaterFX";
import type { Budget } from "../quality";
import { waveHeight } from "../waves";

const C = {
  nightHemiSky: new Color("#3a5068"),
  nightHemiGround: new Color("#0a1016"),
  nightKey: new Color("#8fa6c4"),
  dawnHemiSky: new Color("#f0b58c"),
  dawnHemiGround: new Color("#1c2835"),
  dawnKey: new Color("#ffc58e"),
  waterHemiSky: new Color("#4b98a6"),
  waterHemiGround: new Color("#041016"),
  waterKey: new Color("#bfe6ee"),
  screenWarm: new Color("#ffe1bb"),
  screenBoot: new Color("#ffae68"),
  screenPortal: new Color("#8fd1dc"),
};

/** Float, Dive and Surface: the real sea, the boat, the engineer and the laptop. */
export function OceanWorld({ budget }: { budget: Budget }) {
  const scene = useThree((s) => s.scene);
  const group = useRef<Group>(null);
  const boatRef = useRef<Group>(null);
  const laptopRef = useRef<Group>(null);
  const sailRef = useRef<Group>(null);
  const characterRef = useRef<Group>(null);
  const pose = useMemo(() => makePose(), []);
  const s = useMemo(
    () => ({
      lp: { position: new Vector3(), quaternion: new Quaternion(), inBoat: true, visible: true } as LaptopPose,
      q: new Quaternion(),
      m: new Matrix4(),
      lapInBoat: new Vector3(),
      screenC: new Vector3(),
      screenN: new Vector3(),
      screenU: new Vector3(),
      lastT: 0,
      tmpColor: new Color(),
    }),
    [],
  );

  useFrame(({ camera, gl }) => {
    const active = frame.world === "ocean";
    if (group.current) group.current.visible = active;
    if (!active) return;

    const t = frame.t;
    const time = frame.elapsed * frame.motion + 12;
    const final = t >= moments.surfaceSwap;
    atmosphere.apply(frame.timeOfDay);

    // ── Boat on the swell ─────────────────────────────────────
    const boat = boatRef.current!;
    const amp = oceanState.amp;
    const bow = waveHeight(1.25, 0, time, amp);
    const stern = waveHeight(-1.25, 0, time, amp);
    const port = waveHeight(0, -0.55, time, amp);
    const star = waveHeight(0, 0.55, time, amp);
    const mid = waveHeight(0, 0, time, amp);
    boat.position.y = (bow + stern + port + star + mid * 2) / 6 - 0.012;
    boat.rotation.z = Math.atan2(bow - stern, 2.5) * 0.8;
    boat.rotation.x = -Math.atan2(star - port, 1.1) * 0.8 + scriptedRoll(t);
    boat.updateMatrixWorld(true);

    // ── Laptop ───────────────────────────────────────────────
    const laptop = laptopRef.current!;
    const lp = laptopPose(t, boat.matrixWorld, s.lp);
    if (lp.inBoat) {
      s.lapInBoat.copy(lp.position);
      laptop.position.copy(lp.position).applyMatrix4(boat.matrixWorld);
      s.q.setFromRotationMatrix(s.m.extractRotation(boat.matrixWorld));
      laptop.quaternion.copy(s.q).multiply(lp.quaternion);
    } else {
      laptop.position.copy(lp.position);
      laptop.quaternion.copy(lp.quaternion);
    }
    laptop.visible = lp.visible && !final;
    laptop.updateMatrixWorld(true);
    Object.assign(laptopScreen, screenState(t));

    // ── Engineer ─────────────────────────────────────────────
    characterPose(t, frame.elapsed, s.lapInBoat, pose);

    // ── Sail: only once the story has come full circle ──────
    if (sailRef.current) sailRef.current.visible = final;

    // ── Screen light: on the engineer's face, on the water, then in the deep ──
    screenFrameLocal(s.screenC, s.screenN, s.screenU);
    s.screenC.applyMatrix4(laptop.matrixWorld);
    s.screenN.transformDirection(laptop.matrixWorld);
    const glow = lightRig.glow;
    if (glow) {
      // sit the light between the screen and the engineer's face, not on the screen itself
      glow.position.copy(s.screenC).addScaledVector(s.screenN, 0.34);
      const mode = laptopScreen.mode;
      s.tmpColor.copy(C.screenWarm).lerp(C.screenBoot, smoothstep(1.2, 2, mode)).lerp(C.screenPortal, smoothstep(2.2, 3, mode));
      glow.color.copy(s.tmpColor);
      glow.intensity = laptop.visible ? (lp.inBoat ? 0.55 : 1.4) * laptopScreen.power : 0;
      glow.distance = lp.inBoat ? 2.4 : 4.5;
    }
    oceanState.glowPos.copy(s.screenC);
    oceanState.glowStrength = laptop.visible && s.screenC.y > -0.05 ? 0.3 * laptopScreen.power : 0;

    // ── Splash (one-shot) + bubbles ─────────────────────────
    if (s.lastT < moments.splash && t >= moments.splash) actors.splashAt = laptop.position.clone();
    s.lastT = t;
    actors.laptop.copy(laptop.position);
    actors.laptopUnderwater = laptop.position.y < -0.15;
    actors.bubbling = t > moments.splash && t < moments.enterScreen ? 1 - smoothstep(moments.boot, moments.enterScreen, t) * 0.7 : 0;

    // ── Water, fog and light, from where the camera is ───────
    const camY = camera.position.y;
    const under = smoothstep(0.05, -0.1, camY);
    frame.underwater = under;
    fx.waterline = camY < 0.12 && camY > -0.14 ? clamp(1 - (camY + 0.14) / 0.26) : 0;

    const depth = clamp(-camY / 16);
    const shallow = s.tmpColor.copy(underwaterColors.shallow).lerp(underwaterColors.dawnShallow, frame.timeOfDay);
    const waterColor = shallow.lerp(underwaterColors.deep, depth);
    const fog = scene.fog as FogExp2;
    fog.color.copy(atmosphere.haze).lerp(waterColor, under);
    fog.density = lerp(0.0032, lerp(0.07, 0.1, depth), under);
    (scene.background as Color).copy(fog.color);

    ambient.snow = under * 0.75;
    ambient.snowTint.set(final ? "#ffe9d2" : "#d6e8ee");
    ambient.shafts = under * (1 - depth * 0.6) * (final ? 1.3 : 0.85);
    ambient.shaftsColor.set(final ? "#ffd9a8" : "#9fd3de");
    ambient.shaftsAnchor.set(0, 0, 0);
    ambient.shaftsLength = 18;

    const hemi = lightRig.hemi;
    const key = lightRig.key;
    const accent = lightRig.accent;
    if (hemi && key) {
      hemi.color.copy(C.nightHemiSky).lerp(C.dawnHemiSky, frame.timeOfDay).lerp(C.waterHemiSky, under);
      hemi.groundColor.copy(C.nightHemiGround).lerp(C.dawnHemiGround, frame.timeOfDay).lerp(C.waterHemiGround, under);
      hemi.intensity = lerp(lerp(0.55, 1.0, frame.timeOfDay), 0.9 * (1 - depth * 0.7), under);
      key.color.copy(C.nightKey).lerp(C.dawnKey, frame.timeOfDay).lerp(C.waterKey, under);
      key.intensity = lerp(lerp(0.45, 2.6, frame.timeOfDay), 1.4 * (1 - depth * 0.5), under);
      // above water: from the dusk glow / sun behind the boat (a rim light); below: from the surface
      const above = 1 - under;
      key.position.set(lerp(0.4, -9, above), lerp(14, 4.5, above), lerp(2, -11, above));
    }
    if (accent) accent.intensity = 0;
    scene.environmentIntensity = lerp(lerp(0.35, 0.95, frame.timeOfDay), 0.3, under);
    gl.toneMappingExposure = lerp(lerp(1.05, 1.0, frame.timeOfDay), 1.15, under);

    // ── Finale: sailing into the sunrise ──────────────────────
    const sailing = final ? smoothstep(0.3, 0.8, pinnedAt("contact", t)) : 0;
    oceanState.wake = sailing * 0.85;
    oceanState.flow.x += frame.dt * sailing * 1.15;
    oceanState.boat.set(boat.position.x, boat.position.z, 1, 0);
  }, -1);

  return (
    <group ref={group}>
      <Sky />
      <Ocean rings={budget.oceanRings} segments={budget.oceanSegments} />
      <Boat ref={boatRef}>
        <group ref={characterRef}>
          <Character pose={pose} />
        </group>
        <Sail ref={sailRef} />
      </Boat>
      <Laptop ref={laptopRef} />
      <WaterFX bubbleCount={budget.bubbles} dropCount={budget.drops} />
    </group>
  );
}
