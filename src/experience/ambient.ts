import { Color, Vector3 } from "three";

/** Ambient water state shared across worlds, set by the active world's controller. */
export const ambient = {
  /** Marine-snow opacity (0 above water). */
  snow: 0,
  snowTint: new Color("#dfe9ee"),
  /** Light shafts from the surface. */
  shafts: 0,
  shaftsColor: new Color("#9fd3de"),
  /** Where the shafts hang from (the surface plane, or the digital world's "sky"). */
  shaftsAnchor: new Vector3(0, 0, 0),
  shaftsLength: 16,
};
