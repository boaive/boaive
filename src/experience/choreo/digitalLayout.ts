import { Vector3 } from "three";
import { DIGITAL_ORIGIN } from "../worlds";

/**
 * Where everything sits inside the digital deep (local coordinates; add DIGITAL_ORIGIN for world).
 *
 *   the ring        six capability forms around a centre — "what we build"
 *   the centre      where the product is built, step by step — "how we build"
 *   the gallery     an arc of project screens above the ring — "work"
 * Seen together from above, connected by light — "outcome".
 */
export const RING_CENTRE = new Vector3(0, 3, 0);
export const RING_RADIUS = 9.5;
export const FORM_COUNT = 6;

/** Angle of capability i on the ring (the first faces the entry, then clockwise). */
export const formAngle = (i: number) => Math.PI / 2 - i * ((Math.PI * 2) / FORM_COUNT);

export function formPosition(i: number, out = new Vector3()) {
  const a = formAngle(i);
  return out.set(RING_CENTRE.x + Math.cos(a) * RING_RADIUS, RING_CENTRE.y, RING_CENTRE.z + Math.sin(a) * RING_RADIUS);
}

export const PRODUCT_POSITION = new Vector3(0, 3.1, 0);

export const GALLERY = {
  y: 13,
  radius: 12.5,
  /** Screen i sits at this angle around the centre (facing inward). */
  angle: (i: number, count: number) => Math.PI / 2 + ((i - (count - 1) / 2) * Math.PI) / 5.2,
  width: 5.2,
  height: 3.25,
};

export function galleryPosition(i: number, count: number, out = new Vector3()) {
  const a = GALLERY.angle(i, count);
  return out.set(Math.cos(a) * GALLERY.radius, GALLERY.y, Math.sin(a) * GALLERY.radius);
}

/** Local → world. */
export const toWorld = (v: Vector3) => v.clone().add(DIGITAL_ORIGIN);
