import { BackSide, Color, ShaderMaterial, Vector2 } from "three";

/**
 * Doodle ink outline: an inverted hull pushed out along the normal in clip space, so the line
 * stays a constant number of pixels wide at any distance (and under non-uniform scale).
 * Share one material; call `setOutlineResolution` when the drawing buffer changes.
 */
export const inkOutlineMaterial = new ShaderMaterial({
  uniforms: {
    uThickness: { value: 1.6 },
    uResolution: { value: new Vector2(1920, 1080) },
    uColor: { value: new Color("#07090c") },
  },
  vertexShader: /* glsl */ `
    uniform float uThickness;
    uniform vec2 uResolution;
    void main() {
      vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vec3 n = normalize(normalMatrix * normal);
      vec2 dir = (projectionMatrix * vec4(n, 0.0)).xy;
      float len = length(dir);
      dir = len > 1e-5 ? dir / len : vec2(0.0);
      clip.xy += dir * uThickness / uResolution * clip.w * 2.0;
      gl_Position = clip;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    void main() {
      gl_FragColor = vec4(uColor, 1.0);
      #include <colorspace_fragment>
    }
  `,
  side: BackSide,
});

export function setOutlineResolution(width: number, height: number, thickness: number) {
  (inkOutlineMaterial.uniforms.uResolution.value as Vector2).set(width, height);
  inkOutlineMaterial.uniforms.uThickness.value = thickness;
}
