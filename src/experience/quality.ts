import type { Quality } from "@/story/store";

/** Can this browser run the WebGL stage at all? (three.js needs WebGL 2.) */
export function probeWebGL(): { ok: boolean; software: boolean } {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return { ok: false, software: false };
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    const software = /swiftshader|llvmpipe|software|basic render/i.test(renderer);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return { ok: true, software };
  } catch {
    return { ok: false, software: false };
  }
}

/**
 * Coarse device tiering. Phones get a deliberately lighter stage (not a shrunken desktop one);
 * the adaptive-resolution monitor in the stage can still step down further at runtime.
 */
export function detectQuality(software: boolean): Quality {
  const params = new URLSearchParams(window.location.search);
  const forced = params.get("quality");
  if (forced === "high" || forced === "medium" || forced === "low") return forced;
  if (software) return "low";

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const shortSide = Math.min(window.screen.width, window.screen.height);
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;

  if (coarse && shortSide < 700) return "low";
  if (coarse || cores <= 4 || memory <= 4) return "medium";
  return "high";
}

/** Per-tier budgets used by the scenes. */
export const budgets = {
  high: {
    dpr: [1, 1.75] as [number, number],
    antialias: true,
    oceanRings: 110,
    oceanSegments: 160,
    particles: 1600,
    bubbles: 80,
    drops: 50,
    shafts: 10,
    voxels: 720,
    grain: true,
    outlines: true,
  },
  medium: {
    dpr: [1, 1.4] as [number, number],
    antialias: true,
    oceanRings: 84,
    oceanSegments: 128,
    particles: 900,
    bubbles: 60,
    drops: 36,
    shafts: 8,
    voxels: 480,
    grain: true,
    outlines: true,
  },
  // Phones: fewer things drawn, but a sharp picture. Their 2–3× screens made 1.2× look jagged next to
  // the ink outlines, and MSAA is cheap on mobile (tile-based) GPUs. AdaptiveResolution steps down if needed.
  low: {
    dpr: [1, 1.75] as [number, number],
    antialias: true,
    oceanRings: 64,
    oceanSegments: 96,
    particles: 420,
    bubbles: 40,
    drops: 24,
    shafts: 6,
    voxels: 300,
    grain: false,
    outlines: true,
  },
} as const satisfies Record<Quality, unknown>;

export type Budget = (typeof budgets)[Quality];
