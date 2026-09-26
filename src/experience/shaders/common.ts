/** GLSL chunks shared by several materials. */

export const noiseGLSL = /* glsl */ `
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * vnoise(p);
    p = p * 2.03 + vec2(17.1, 9.2);
    a *= 0.5;
  }
  return v;
}
`;

/**
 * Analytic sky: zenith→horizon gradient, a warm glow band around the sun's azimuth, sun disc + halo.
 * Used by the sky dome and by the ocean's reflections so they always agree.
 */
export const skyUniformsGLSL = /* glsl */ `
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform vec3 uGlow;
uniform float uGlowPower;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunSize;
`;

export const skyGLSL = /* glsl */ `
vec3 skyColor(vec3 dir) {
  float h = dir.y;
  vec3 col = mix(uHorizon, uZenith, pow(smoothstep(-0.04, 0.7, h), 0.5));
  vec2 dxz = normalize(dir.xz + 1e-5);
  vec2 sxz = normalize(uSunDir.xz + 1e-5);
  float az = max(dot(dxz, sxz), 0.0);
  // warm band hugging the horizon, concentrated toward the sun's azimuth
  float toward = pow(az, uGlowPower);
  float band = exp(-max(h, 0.0) * 24.0) * (0.08 + 0.92 * toward);
  float veil = exp(-max(h, 0.0) * 7.0) * toward * 0.22; // faint afterglow higher up
  col += uGlow * (band + veil);
  float sd = max(dot(dir, uSunDir), 0.0);
  col += uSunColor * uSunSize * (smoothstep(0.99955, 0.99975, sd) * 14.0 + pow(sd, 90.0) * 1.1 + pow(sd, 12.0) * 0.12);
  col = mix(col, uHorizon * 0.55, 1.0 - smoothstep(-0.1, 0.0, h));
  return col;
}
`;

/** Film grain helper for overlays. */
export const grainGLSL = /* glsl */ `
// sine-free: sin() of large arguments is imprecise on mobile GPUs and shows up as stripes
float grain(vec2 uv, float t) {
  vec3 p3 = fract(vec3(uv.xyx + t) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
`;
