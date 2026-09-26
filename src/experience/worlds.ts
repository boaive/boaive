import { Vector3 } from "three";

/**
 * The two worlds share one canvas but live far apart; only one is visible at a time.
 * World swaps happen while something fills the frame (the laptop screen, the bright water column).
 */
export const DIGITAL_ORIGIN = new Vector3(0, -400, 0);

/** Digital-world local → world position. */
export const dw = (x: number, y: number, z: number) => new Vector3(x, y, z).add(DIGITAL_ORIGIN);
