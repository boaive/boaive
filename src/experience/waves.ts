/**
 * Gerstner waves shared by the ocean shader (GLSL) and the CPU (boat buoyancy),
 * so the boat rides exactly the surface you see. Calm sea: long, low swells.
 */

type Wave = { dir: [number, number]; length: number; amplitude: number; steepness: number };

const normalise = (x: number, y: number): [number, number] => {
  const l = Math.hypot(x, y);
  return [x / l, y / l];
};

export const WAVES: Wave[] = [
  { dir: normalise(1, 0.35), length: 15, amplitude: 0.1, steepness: 0.32 },
  { dir: normalise(0.7, -0.62), length: 8.8, amplitude: 0.055, steepness: 0.3 },
  { dir: normalise(-0.28, 1), length: 5.4, amplitude: 0.032, steepness: 0.26 },
  { dir: normalise(0.25, 0.92), length: 2.9, amplitude: 0.016, steepness: 0.22 },
];

/** Global time scale — lower = lazier sea. */
export const WAVE_TIME_SCALE = 0.55;
const G = 9.81;

/** GLSL: `vec3 gerstner(vec2 xz, float time, out vec3 normal)` using the same constants. */
export const gerstnerGLSL = /* glsl */ `
vec3 gerstner(vec2 xz, float time, float amp, out vec3 nrm) {
  vec3 p = vec3(xz.x, 0.0, xz.y);
  vec3 n = vec3(0.0, 1.0, 0.0);
  ${WAVES.map((w, i) => {
    const k = (2 * Math.PI) / w.length;
    const c = Math.sqrt(G / k);
    return `
  {
    vec2 d = vec2(${w.dir[0].toFixed(5)}, ${w.dir[1].toFixed(5)});
    float k = ${k.toFixed(5)};
    float a = ${w.amplitude.toFixed(5)} * amp;
    float q = ${w.steepness.toFixed(5)};
    float f = k * (dot(d, xz) - ${c.toFixed(5)} * time * ${WAVE_TIME_SCALE.toFixed(3)}) + ${(i * 1.7).toFixed(2)};
    float cf = cos(f);
    float sf = sin(f);
    p.x += q * a * d.x * cf;
    p.z += q * a * d.y * cf;
    p.y += a * sf;
    n.x -= d.x * k * a * cf;
    n.z -= d.y * k * a * cf;
    n.y -= q * k * a * sf;
  }`;
  }).join("")}
  nrm = normalize(n);
  return p;
}
`;

/** CPU height of the sea surface at (x, z). Horizontal displacement is ignored (small steepness). */
export function waveHeight(x: number, z: number, time: number, amp = 1): number {
  let y = 0;
  WAVES.forEach((w, i) => {
    const k = (2 * Math.PI) / w.length;
    const c = Math.sqrt(G / k);
    const f = k * (w.dir[0] * x + w.dir[1] * z - c * time * WAVE_TIME_SCALE) + i * 1.7;
    y += w.amplitude * amp * Math.sin(f);
  });
  return y;
}
