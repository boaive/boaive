import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // The WebGL stage owns Three.js objects (materials, uniforms, cameras) that are mutated
    // every frame inside useFrame — the intended React Three Fiber pattern, not React state.
    files: ["src/experience/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/immutability": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Local, git-ignored QA scratch (screenshots and one-off scripts).
    ".qa/**",
  ]),
]);

export default eslintConfig;
