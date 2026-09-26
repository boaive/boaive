import { Color, Vector3 } from "three";

/**
 * Time of day for the ocean world. The story opens at blue hour (an idea, quietly floating)
 * and closes at sunrise (thrive). Sky and ocean share these uniform objects by reference.
 */

type Preset = {
  zenith: string;
  horizon: string;
  glow: string;
  glowPower: number;
  sunDir: [number, number, number];
  sunColor: string;
  sunSize: number;
  deep: string;
  scatter: string;
  haze: string;
  stars: number;
};

/** The opening camera looks toward -x,-z; both light sources sit behind the boat. */
const PRESETS: Record<"night" | "dawn", Preset> = {
  night: {
    zenith: "#06101c",
    horizon: "#2d4660",
    glow: "#a4562a",
    glowPower: 4.5,
    sunDir: [-0.62, -0.075, -0.78],
    sunColor: "#ffb070",
    sunSize: 0,
    deep: "#02080e",
    scatter: "#0b2633",
    haze: "#1a2634",
    stars: 1,
  },
  dawn: {
    zenith: "#1b3150",
    horizon: "#8f7472",
    glow: "#ff8f4a",
    glowPower: 3.6,
    sunDir: [-0.5, 0.055, -0.86],
    sunColor: "#ffd49a",
    sunSize: 1,
    deep: "#06111a",
    scatter: "#274650",
    haze: "#a97f6c",
    stars: 0,
  },
};

const night = toColors(PRESETS.night);
const dawn = toColors(PRESETS.dawn);

function toColors(p: Preset) {
  return {
    ...p,
    zenithC: new Color(p.zenith),
    horizonC: new Color(p.horizon),
    glowC: new Color(p.glow),
    sunColorC: new Color(p.sunColor),
    sunDirV: new Vector3(...p.sunDir).normalize(),
    deepC: new Color(p.deep),
    scatterC: new Color(p.scatter),
    hazeC: new Color(p.haze),
  };
}

/** Shared by the sky dome and the ocean (reflections must match the sky). */
export const skyUniforms = {
  uZenith: { value: new Color() },
  uHorizon: { value: new Color() },
  uGlow: { value: new Color() },
  uGlowPower: { value: 2 },
  uSunDir: { value: new Vector3(0, 0.1, -1) },
  uSunColor: { value: new Color() },
  uSunSize: { value: 0 },
};

export const waterUniforms = {
  uDeep: { value: new Color() },
  uScatter: { value: new Color() },
};

export const atmosphere = {
  haze: new Color(),
  stars: 1,
  /** Apply time of day (0 = blue hour, 1 = sunrise). Cheap; safe to call every frame. */
  apply(timeOfDay: number) {
    const t = timeOfDay;
    const u = skyUniforms;
    u.uZenith.value.lerpColors(night.zenithC, dawn.zenithC, t);
    u.uHorizon.value.lerpColors(night.horizonC, dawn.horizonC, t);
    u.uGlow.value.lerpColors(night.glowC, dawn.glowC, t);
    u.uGlowPower.value = night.glowPower + (dawn.glowPower - night.glowPower) * t;
    u.uSunDir.value.lerpVectors(night.sunDirV, dawn.sunDirV, t).normalize();
    u.uSunColor.value.lerpColors(night.sunColorC, dawn.sunColorC, t);
    u.uSunSize.value = night.sunSize + (dawn.sunSize - night.sunSize) * t;
    waterUniforms.uDeep.value.lerpColors(night.deepC, dawn.deepC, t);
    waterUniforms.uScatter.value.lerpColors(night.scatterC, dawn.scatterC, t);
    this.haze.lerpColors(night.hazeC, dawn.hazeC, t);
    this.stars = night.stars + (dawn.stars - night.stars) * t;
  },
};

atmosphere.apply(0);

/** Underwater colours: light near the surface, ink in the deep. */
export const underwaterColors = {
  shallow: new Color("#0d3a47"),
  deep: new Color("#04121b"),
  dawnShallow: new Color("#2b6470"),
};
