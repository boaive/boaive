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

/** Rotation that turns screen i on the arc to face the centre. */
export const galleryRotation = (i: number, count: number) => {
  const a = GALLERY.angle(i, count);
  return Math.atan2(-Math.cos(a), -Math.sin(a));
};

/**
 * End of the work chapter: the screens gather into one wall — the archive — facing the centre.
 * Filled row by row (2 columns up to 4 screens, then 3); a short last row is centred.
 */
export const WALL = {
  centre: new Vector3(0, 13.1, 8.6),
  scale: 0.6,
  gap: 0.3,
  /** Facing −z, toward the centre. */
  rotation: Math.PI,
};

export function wallPosition(i: number, count: number, out = new Vector3()) {
  const cols = count <= 2 ? Math.max(1, count) : count <= 4 ? 2 : 3;
  const rows = Math.ceil(count / cols);
  const row = Math.floor(i / cols);
  const col = i % cols;
  const inRow = row === rows - 1 ? count - row * cols : cols;
  const w = GALLERY.width * WALL.scale + WALL.gap;
  const h = GALLERY.height * WALL.scale + WALL.gap;
  // Seen from the centre, +x is on the viewer's left — so the first project reads top-left.
  return out.set(
    WALL.centre.x - (col - (inRow - 1) / 2) * w,
    WALL.centre.y + ((rows - 1) / 2 - row) * h,
    WALL.centre.z,
  );
}

/** Local → world. */
export const toWorld = (v: Vector3) => v.clone().add(DIGITAL_ORIGIN);
