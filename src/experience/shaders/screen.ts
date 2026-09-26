import { noiseGLSL } from "./common";

/**
 * The laptop screen, procedurally:
 *   mode 0   code editor (the engineer is working)
 *   mode 1   water glitch
 *   mode 2   boot: the Boaive mark
 *   mode 3   portal: a first look at the digital deep (matches the next scene's first frame)
 */
export const screenVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const screenFragment = /* glsl */ `
uniform float uTime;
uniform float uMode;
uniform float uGlitch;
uniform float uPower;
uniform sampler2D uMark;
uniform float uMarkAspect;
varying vec2 vUv;
${noiseGLSL}

float h11(float n) { return fract(sin(n * 127.1 + 1.7) * 43758.5453); }

vec3 codeView(vec2 uv) {
  vec3 col = vec3(0.03, 0.036, 0.047);
  float bar = step(0.93, uv.y);
  col = mix(col, vec3(0.062, 0.07, 0.086), bar);
  for (int i = 0; i < 3; i++) {
    vec2 c = vec2(0.035 + float(i) * 0.03, 0.965);
    float d = length((uv - c) * vec2(1.6, 1.0));
    col = mix(col, vec3(0.32, 0.35, 0.4), bar * smoothstep(0.011, 0.007, d));
  }
  // file tree
  float side = step(uv.x, 0.19) * (1.0 - bar);
  col = mix(col, vec3(0.04, 0.047, 0.06), side);
  float trow = floor((0.9 - uv.y) * 22.0);
  float tline = smoothstep(0.3, 0.36, fract((0.9 - uv.y) * 22.0)) * smoothstep(0.7, 0.64, fract((0.9 - uv.y) * 22.0));
  float tw = 0.05 + h11(trow * 3.1) * 0.08;
  float tx = 0.025 + floor(h11(trow) * 2.0) * 0.02;
  float entry = step(tx, uv.x) * step(uv.x, tx + tw) * tline * side * step(trow, 17.0);
  col = mix(col, trow == 5.0 ? vec3(1.0, 0.6, 0.25) : vec3(0.36, 0.4, 0.46), entry);

  // code
  float rows = 19.0;
  float y = (0.915 - uv.y) * rows + uTime * 0.35;
  float row = floor(y);
  float fy = fract(y);
  float line = smoothstep(0.3, 0.37, fy) * smoothstep(0.7, 0.63, fy);
  float empty = step(h11(row + 9.0), 0.16);
  float comment = step(0.84, h11(row + 5.0));
  float indent = floor(h11(row + 3.0) * 4.0) * 0.032;
  float cursor = 0.265 + indent;
  vec3 tok = vec3(0.0);
  float mask = 0.0;
  for (int t = 0; t < 6; t++) {
    float w = 0.025 + h11(row * 7.0 + float(t)) * 0.11;
    float kind = h11(row * 11.0 + float(t) * 3.0);
    vec3 c = kind < 0.24 ? vec3(1.0, 0.55, 0.17) : kind < 0.44 ? vec3(0.52, 0.8, 0.72) : kind < 0.58 ? vec3(0.6, 0.7, 0.96) : vec3(0.84, 0.82, 0.78);
    float inside = step(cursor, uv.x) * step(uv.x, cursor + w);
    tok += c * inside;
    mask += inside;
    cursor += w + 0.016;
    if (cursor > 0.93) break;
  }
  tok = mix(tok, vec3(0.34, 0.37, 0.42) * mask, comment);
  float codeArea = (1.0 - bar) * step(0.245, uv.x);
  col = mix(col, tok, line * mask * (1.0 - empty) * codeArea);
  // gutter numbers
  float gutter = step(0.205, uv.x) * step(uv.x, 0.232) * (1.0 - bar);
  col = mix(col, vec3(0.2, 0.23, 0.28), line * gutter);
  // active line + blinking cursor
  float activeRow = floor(0.915 * rows * 0.62 + uTime * 0.35);
  float onActiveRow = step(abs(row - activeRow), 0.0) * codeArea;
  col += vec3(0.03, 0.035, 0.045) * onActiveRow;
  float caret = onActiveRow * step(abs(uv.x - (0.3 + fract(uTime * 0.21) * 0.4)), 0.0035) * line * step(0.5, fract(uTime * 1.6));
  col = mix(col, vec3(1.0, 0.64, 0.28), caret);
  return col;
}

vec3 markView(vec2 uv, float t) {
  vec3 col = vec3(0.012, 0.016, 0.022);
  vec2 p = (uv - 0.5) * vec2(1.6, 1.0);
  float h = 0.36;
  vec2 muv = vec2(p.x / (h * uMarkAspect) + 0.5, p.y / h + 0.5);
  vec4 mark = texture2D(uMark, clamp(muv, 0.0, 1.0));
  float inside = step(0.0, muv.x) * step(muv.x, 1.0) * step(0.0, muv.y) * step(muv.y, 1.0);
  float glow = exp(-dot(p, p) * 9.0) * 0.18;
  col += vec3(1.0, 0.55, 0.2) * glow * t;
  col = mix(col, mark.rgb * 1.15, mark.a * inside * t);
  // progress hairline
  float bar = step(abs(uv.y - 0.2), 0.0035) * step(abs(uv.x - 0.5), 0.12);
  float fill = step(uv.x, 0.38 + 0.24 * fract(uTime * 0.25));
  col += vec3(0.95, 0.55, 0.2) * bar * fill * t * 0.8;
  return col;
}

vec3 portalView(vec2 uv) {
  // The digital deep, seen through the screen: ink below, light from far above.
  vec3 top = vec3(0.07, 0.19, 0.24);
  vec3 bottom = vec3(0.012, 0.03, 0.045);
  vec3 col = mix(bottom, top, pow(uv.y, 1.6));
  float rays = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float x = 0.18 + fi * 0.17 + sin(uTime * 0.2 + fi) * 0.02;
    rays += exp(-pow((uv.x - x - (1.0 - uv.y) * 0.12) * 18.0, 2.0)) * (0.4 + 0.6 * h11(fi));
  }
  col += vec3(0.25, 0.45, 0.5) * rays * pow(uv.y, 2.0) * 0.35;
  float horizon = exp(-pow((uv.y - 0.34) * 40.0, 2.0)) * (1.0 - abs(uv.x - 0.5) * 1.4);
  col += vec3(1.0, 0.55, 0.2) * max(horizon, 0.0) * 0.35;
  float motes = step(0.995, hash12(floor(uv * vec2(160.0, 100.0) + vec2(0.0, -uTime * 3.0))));
  col += vec3(0.8, 0.9, 1.0) * motes * 0.4;
  return col;
}

void main() {
  vec2 uv = vUv;
  float g = uGlitch;
  // water glitch: tearing bands + chromatic split
  float band = step(0.7, vnoise(vec2(uv.y * 30.0, uTime * 12.0))) * g;
  uv.x += (vnoise(vec2(uv.y * 80.0, uTime * 20.0)) - 0.5) * 0.08 * band;

  vec3 code = codeView(uv);
  if (g > 0.001) {
    code.r = codeView(uv + vec2(0.006 * g, 0.0)).r;
    code.b = codeView(uv - vec2(0.006 * g, 0.0)).b;
  }
  vec3 boot = markView(uv, smoothstep(1.2, 1.9, uMode));
  vec3 portal = portalView(uv);

  vec3 col = code;
  col = mix(col, boot, smoothstep(1.05, 1.5, uMode));
  col = mix(col, portal, smoothstep(2.2, 3.0, uMode));
  col *= 1.0 - band * 0.5;
  col *= uPower * (1.0 - 0.35 * g * step(0.5, fract(uTime * 17.0)));

  // screen edge falloff + faint pixel grid up close
  vec2 e = min(vUv, 1.0 - vUv);
  col *= smoothstep(0.0, 0.012, min(e.x, e.y));
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;
