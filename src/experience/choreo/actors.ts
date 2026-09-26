import { Vector3 } from "three";

/** Live world positions the effects need (written by the ocean controller each frame). */
export const actors = {
  laptop: new Vector3(),
  laptopUnderwater: false,
  /** Emit a stream of bubbles from the laptop. */
  bubbling: 0,
  /** One-shot requests, consumed by the effect components. */
  splashAt: null as Vector3 | null,
};
