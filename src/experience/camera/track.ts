import { Vector3 } from "three";
import { catmull, clamp, easeInCubic, easeInOutCubic, easeOutCubic } from "../math";

type Vec3Like = [number, number, number] | (() => Vector3);
type Ease = "linear" | "inOut" | "in" | "out";

/**
 * One camera keyframe.
 *   at     story time (resolved when the track is built — it depends on the measured layout)
 *   shift  lens shift in NDC for landscape layouts, e.g. [0.3, 0.1] puts the subject right of and
 *          above centre, leaving room for text (verticals stay vertical, like a tilt-shift lens)
 */
export type KeySpec = {
  at: () => number;
  pos: Vec3Like;
  look: Vec3Like;
  fov?: number;
  shift?: [number, number];
  /** Lens shift on portrait screens (text sits at the bottom there). */
  shiftPortrait?: [number, number];
  /** Pull the camera back on portrait screens (multiplies the distance to the target). */
  backPortrait?: number;
  /** Easing of the segment that arrives at this key. */
  ease?: Ease;
};

type Key = {
  t: number;
  pos: Vector3;
  look: Vector3;
  fov: number;
  shift: [number, number];
  shiftPortrait: [number, number];
  backPortrait: number;
  ease: Ease;
};

export type CameraSample = {
  pos: Vector3;
  look: Vector3;
  fov: number;
  shift: [number, number];
  shiftPortrait: [number, number];
  backPortrait: number;
};

export function makeSample(): CameraSample {
  return { pos: new Vector3(), look: new Vector3(), fov: 38, shift: [0, 0], shiftPortrait: [0, 0], backPortrait: 1 };
}

const resolve = (v: Vec3Like) => (typeof v === "function" ? v().clone() : new Vector3(...v));
const easeFn: Record<Ease, (u: number) => number> = {
  linear: (u) => u,
  inOut: easeInOutCubic,
  in: easeInCubic,
  out: easeOutCubic,
};

export class CameraTrack {
  keys: Key[] = [];

  constructor(private readonly specs: KeySpec[]) {}

  /** Resolve times and dynamic positions. Call whenever the layout changes. */
  build() {
    this.keys = this.specs
      .map((s) => ({
        t: s.at(),
        pos: resolve(s.pos),
        look: resolve(s.look),
        fov: s.fov ?? 38,
        shift: s.shift ?? [0, 0],
        shiftPortrait: s.shiftPortrait ?? [0, 0.08],
        backPortrait: s.backPortrait ?? 1,
        ease: s.ease ?? "linear",
      }))
      .sort((a, b) => a.t - b.t);
    return this;
  }

  get start() {
    return this.keys[0]?.t ?? 0;
  }

  get end() {
    return this.keys[this.keys.length - 1]?.t ?? 0;
  }

  /** Times of every key — reduced motion shows these as still frames. */
  get times() {
    return this.keys.map((k) => k.t);
  }

  sample(t: number, out: CameraSample): CameraSample {
    const k = this.keys;
    const n = k.length;
    if (!n) return out;
    let i = 0;
    while (i < n - 2 && t >= k[i + 1].t) i++;
    const a = k[Math.max(0, i - 1)];
    const b = k[i];
    const c = k[Math.min(n - 1, i + 1)];
    const d = k[Math.min(n - 1, i + 2)];
    const span = c.t - b.t;
    const raw = span > 0 ? clamp((t - b.t) / span) : 1;
    const u = t <= b.t ? 0 : easeFn[c.ease](raw);

    out.pos.set(
      catmull(a.pos.x, b.pos.x, c.pos.x, d.pos.x, u),
      catmull(a.pos.y, b.pos.y, c.pos.y, d.pos.y, u),
      catmull(a.pos.z, b.pos.z, c.pos.z, d.pos.z, u),
    );
    out.look.set(
      catmull(a.look.x, b.look.x, c.look.x, d.look.x, u),
      catmull(a.look.y, b.look.y, c.look.y, d.look.y, u),
      catmull(a.look.z, b.look.z, c.look.z, d.look.z, u),
    );
    out.fov = b.fov + (c.fov - b.fov) * u;
    out.shift[0] = b.shift[0] + (c.shift[0] - b.shift[0]) * u;
    out.shift[1] = b.shift[1] + (c.shift[1] - b.shift[1]) * u;
    out.shiftPortrait[0] = b.shiftPortrait[0] + (c.shiftPortrait[0] - b.shiftPortrait[0]) * u;
    out.shiftPortrait[1] = b.shiftPortrait[1] + (c.shiftPortrait[1] - b.shiftPortrait[1]) * u;
    out.backPortrait = b.backPortrait + (c.backPortrait - b.backPortrait) * u;
    return out;
  }
}
