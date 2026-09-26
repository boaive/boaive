import { gerstnerGLSL } from "../waves";
import { noiseGLSL, skyGLSL, skyUniformsGLSL } from "./common";

export const oceanVertex = /* glsl */ `
uniform float uTime;
uniform float uAmp;
uniform vec2 uFlow;
uniform vec4 uRipple; // xz = centre, z = age (s), w = strength
varying vec3 vWorld;
varying vec3 vNormal;
varying float vCrest;
varying float vFoam;
${gerstnerGLSL}

void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  float camDist = length(wp.xz - cameraPosition.xz);
  // Fade displacement with distance: the grid gets sparse and the eye can't resolve it anyway.
  float amp = uAmp * (0.15 + 0.85 * exp(-camDist * 0.018));
  vec2 xz = wp.xz + uFlow;
  vec3 n;
  vec3 g = gerstner(xz, uTime, amp, n);
  vec3 p = vec3(wp.x + (g.x - xz.x), g.y, wp.z + (g.z - xz.y));

  // Splash ripple: rings travelling out from where the laptop hit the water.
  float r = distance(wp.xz, uRipple.xy);
  float age = uRipple.z;
  float front = age * 1.6;
  float envelope = uRipple.w * exp(-age * 0.45) * smoothstep(0.0, 0.25, age);
  float rr = (r - front) * 2.6;
  float ring = exp(-rr * rr);
  float wavelet = sin((r - front) * 11.0) * exp(-max(front - r, 0.0) * 1.4) * step(r, front + 0.6);
  p.y += (ring * 0.05 + wavelet * 0.018) * envelope;
  vFoam = ring * envelope;

  vWorld = p;
  vNormal = n;
  vCrest = g.y / max(amp, 0.0001);
  gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
}
`;

export const oceanFragment = /* glsl */ `
${skyUniformsGLSL}
uniform vec3 uDeep;
uniform vec3 uScatter;
uniform float uTime;
uniform vec3 uGlowPos;
uniform vec3 uGlowColor;
uniform float uGlowStrength;
uniform float uHorizonFade;
uniform vec3 uUnderShallow;
uniform vec3 uUnderFog;
uniform float uUnderDensity;
uniform vec4 uBoat;   // xz = boat position, zw = forward direction
uniform float uWake;
varying vec3 vWorld;
varying vec3 vNormal;
varying float vCrest;
varying float vFoam;
${noiseGLSL}
${skyGLSL}

// Gradient of vnoise (same lattice and hash), analytically.
vec2 vnoiseGrad(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  vec2 du = 6.0 * f * (1.0 - f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  float k = a - b - c + d;
  return du * (vec2(b - a, c - a) + k * u.yx);
}

// Slope of fbm(): 4 noise lookups instead of the 12 that three finite-difference taps cost —
// the water's most expensive line on phones. Weights = octave amplitude × frequency, eased to
// match the old taps (0.06 apart), which averaged away part of the finest octave's slope.
vec2 fbmSlope(vec2 p) {
  const vec2 shift = vec2(17.1, 9.2);
  vec2 d = 0.499 * vnoiseGrad(p);
  p = p * 2.03 + shift;
  d += 0.504 * vnoiseGrad(p);
  p = p * 2.03 + shift;
  d += 0.503 * vnoiseGrad(p);
  p = p * 2.03 + shift;
  d += 0.476 * vnoiseGrad(p);
  return d;
}

vec3 detailNormal(vec2 p, float fade) {
  vec2 q = p * 0.75 + uTime * vec2(0.035, 0.022);
  vec2 slope = fbmSlope(q);
  return vec3(-slope.x, 0.0, -slope.y) * 0.22 * fade;
}

float wakeFoam(vec2 p) {
  if (uWake <= 0.001) return 0.0;
  vec2 rel = p - uBoat.xy;
  vec2 fwd = uBoat.zw;
  vec2 side = vec2(-fwd.y, fwd.x);
  float along = -dot(rel, fwd);      // distance behind the stern
  float across = dot(rel, side);
  if (along < -1.6) return 0.0;
  float spread = max(along, 0.0) * 0.36 + 0.55;
  float ax = (abs(across) - spread) * 3.2;
  float arms = exp(-ax * ax);
  float centre = exp(-across * across * 5.0) * exp(-max(along, 0.0) * 0.12);
  float fade = exp(-max(along, 0.0) * 0.045) * smoothstep(-1.6, 0.0, along);
  float breakup = smoothstep(0.35, 0.75, fbm(p * 2.6 + vec2(uTime * 0.4, 0.0)));
  return (arms * 0.65 + centre * 0.45) * fade * breakup * uWake;
}

void main() {
  vec3 toCam = cameraPosition - vWorld;
  float dist = length(toCam);
  vec3 V = toCam / dist;
  vec3 N = normalize(vNormal + detailNormal(vWorld.xz, exp(-dist * 0.035)));

  vec3 col;
  // Decide by where the camera is, not by face orientation: from below, the backs of
  // distant wave crests can face the camera and would otherwise pick up sky shading.
  bool fromAbove = cameraPosition.y > vWorld.y;
  if (fromAbove) {
    // ── Seen from above ────────────────────────────────────
    float ndv = max(dot(N, V), 0.0);
    float fres = 0.02 + 0.98 * pow(max(1.0 - ndv, 0.0), 5.0);
    vec3 R = reflect(-V, N);
    R.y = abs(R.y);
    vec3 refl = skyColor(normalize(R));
    vec3 body = mix(uDeep, uScatter, clamp(vCrest * 0.5 + 0.35, 0.0, 1.0) * 0.55);
    col = mix(body, refl, fres);

    // Sun path: tight highlight + glitter that breaks up with the detail noise.
    float sd = max(dot(normalize(R), uSunDir), 0.0);
    float glitter = smoothstep(0.55, 0.9, fbm(vWorld.xz * 3.0 + uTime * 0.3));
    col += uSunColor * uSunSize * (pow(sd, 420.0) * 6.0 + pow(sd, 40.0) * 0.35 * glitter);
    // Warm band of the sky glow on the water toward the horizon.
    col += uGlow * pow(max(dot(normalize(vec2(-V.x, -V.z) + 1e-5), normalize(uSunDir.xz + 1e-5)), 0.0), 18.0) * fres * 0.3;

    // Light from the laptop screen, reflected on the water around the boat.
    float gd = distance(vWorld.xz, uGlowPos.xz);
    col += uGlowColor * uGlowStrength * exp(-gd * gd * 1.1) * (0.25 + 0.75 * fres);

    // Foam: splash rings and the wake.
    float foam = clamp(vFoam * 1.4 + wakeFoam(vWorld.xz), 0.0, 1.0);
    col = mix(col, vec3(0.86, 0.9, 0.92) * (0.35 + 0.65 * uSunSize) + 0.08, foam * 0.75);

    // Melt into the sky at the horizon.
    float haze = 1.0 - exp(-dist * uHorizonFade);
    col = mix(col, skyColor(normalize(vec3(-V.x, 0.0015, -V.z))), clamp(haze, 0.0, 1.0));
  } else {
    // ── Seen from below: Snell's window, total internal reflection outside it ──
    vec3 I = normalize(vWorld - cameraPosition);          // camera → surface (pointing up)
    vec3 Nw = normalize(mix(vNormal, N, 0.3));             // mostly the swell; a little detail
    float cosUp = dot(I, Nw);
    // critical angle 48.6° → cos 0.661; soften the rim so ripples shimmer instead of flicker
    float window = smoothstep(0.6, 0.72, cosUp);
    vec3 T = refract(I, -Nw, 1.333);
    vec3 through = skyColor(normalize(dot(T, T) > 0.0 ? T : vec3(I.x, 0.05, I.z)));
    vec3 lit = through * 0.8 + uUnderShallow * 0.35;
    float cu = (cosUp - 0.665) * 28.0;
    float rim = exp(-cu * cu) * 0.25;
    vec3 tir = uUnderFog * 1.1 + uUnderShallow * 0.12;
    col = mix(tir, lit, window) + uUnderShallow * rim;
    col += vec3(0.8, 0.95, 1.0) * vFoam * 0.3;
    // The water column between the camera and the surface.
    col = mix(uUnderFog, col, exp(-dist * uUnderDensity));
  }

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
