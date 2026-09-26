import { BufferAttribute, BufferGeometry, CatmullRomCurve3, TubeGeometry, Vector3 } from "three";

/**
 * A small stylised dinghy, lofted from a few functions.
 * Boat space: x = forward (bow +), y = up (0 = waterline), z = starboard (+).
 * Swap for a Blender GLB later by replacing <Boat/>'s meshes; keep these dimensions.
 */
export const HULL = {
  length: 3.3,
  beam: 1.28,
  stern: -1.65,
  bow: 1.65,
} as const;

const toU = (x: number) => (x - HULL.stern) / HULL.length;

/** Half-beam at u (0 = stern transom, 1 = bow stem). */
export const halfBeam = (u: number) => (HULL.beam / 2) * Math.pow(Math.sin(Math.PI * (0.16 + 0.84 * u)), 0.62);
/** Gunwale height above the waterline — the sheer rises toward the bow. */
export const sheer = (u: number) => 0.27 + 0.2 * Math.pow(u, 2.6) + 0.04 * Math.pow(1 - u, 2);
/** Depth of the keel below the waterline — the forefoot sweeps up at the bow. */
export const draft = (u: number) => 0.2 * (1 - 0.88 * Math.pow(u, 3.2));

export const sheerAtX = (x: number) => sheer(toU(x));
export const halfBeamAtX = (x: number) => halfBeam(toU(x));

function hullPoint(u: number, v: number, inset: number, out: Vector3) {
  const theta = (v - 0.5) * Math.PI;
  const s = Math.sin(theta);
  const c = Math.cos(theta);
  const hb = Math.max(0, halfBeam(u) - inset);
  const top = sheer(u);
  const bottom = -draft(u) + inset;
  const z = hb * Math.sign(s) * Math.pow(Math.abs(s), 0.82);
  const y = bottom + (top - bottom) * (1 - Math.pow(Math.max(c, 0), 0.5));
  out.set(HULL.stern + u * HULL.length, y, z);
  return out;
}

/** Hull shell (double-sided in the material: paint outside, wood inside). */
export function createHullGeometry(segU = 48, segV = 28): BufferGeometry {
  const positions: number[] = [];
  const indices: number[] = [];
  const p = new Vector3();
  for (let i = 0; i <= segU; i++) {
    // cluster rows toward the bow where the shape changes fastest
    const u = Math.pow(i / segU, 0.9);
    for (let j = 0; j <= segV; j++) {
      hullPoint(u, j / segV, 0, p);
      positions.push(p.x, p.y, p.z);
    }
  }
  const row = segV + 1;
  for (let i = 0; i < segU; i++) {
    for (let j = 0; j < segV; j++) {
      const a = i * row + j;
      const b = (i + 1) * row + j;
      // front faces point outward (paint); back faces are the wooden interior
      indices.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }

  // Transom: close the stern with a flat panel (fan from the top centre).
  const base = positions.length / 3;
  const topCentre = new Vector3(HULL.stern, sheer(0), 0);
  positions.push(topCentre.x, topCentre.y, topCentre.z);
  for (let j = 0; j <= segV; j++) {
    hullPoint(0, j / segV, 0, p);
    positions.push(p.x, p.y, p.z);
  }
  for (let j = 0; j < segV; j++) indices.push(base, base + 1 + j, base + 2 + j);

  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

/** Rounded gunwale rail along one side (sign = +1 starboard, -1 port) plus the transom top. */
export function createGunwaleGeometry(sign: 1 | -1): TubeGeometry {
  const pts: Vector3[] = [];
  const n = 24;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    pts.push(new Vector3(HULL.stern + u * HULL.length, sheer(u) + 0.005, sign * Math.max(halfBeam(u) - 0.004, 0.002)));
  }
  return new TubeGeometry(new CatmullRomCurve3(pts), 48, 0.028, 6, false);
}

export function createTransomRailGeometry(): TubeGeometry {
  const hb = halfBeam(0);
  const y = sheer(0) + 0.005;
  const curve = new CatmullRomCurve3([new Vector3(HULL.stern, y, -hb), new Vector3(HULL.stern - 0.004, y + 0.01, 0), new Vector3(HULL.stern, y, hb)]);
  return new TubeGeometry(curve, 12, 0.028, 6, false);
}

/** Thwart (seat) spanning the hull at x. Returns [width, y]. */
export function thwartAt(x: number): { width: number; y: number } {
  const u = toU(x);
  return { width: halfBeam(u) * 2 * 0.92, y: sheer(u) - 0.11 };
}

/** Interior floor height (for feet), slightly above the keel. */
export const FLOOR_Y = -0.12;
