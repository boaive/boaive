import { Color } from "three";

/** Screen-space overlay state, written by scenes and the camera rig, read by <ScreenFX/>. */
export const fx = {
  /** Full-frame veil used to hide world swaps (0..1). */
  veil: 0,
  veilColor: new Color("#0b1e2a"),
  /** Cross-fade between still frames under reduced motion. */
  stillVeil: 0,
  vignette: 0.55,
  grain: 0.05,
  /** 0..1 while the lens is crossing the water surface. */
  waterline: 0,
};
