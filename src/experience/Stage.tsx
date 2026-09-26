"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { Color, FogExp2, NeutralToneMapping } from "three";
import { useStory } from "@/story/store";
import { CameraRig } from "./camera/CameraRig";
import { ScreenFX } from "./fx/ScreenFX";
import { Lighting } from "./Lighting";
import { LightShafts } from "./objects/LightShafts";
import { MarineSnow } from "./objects/MarineSnow";
import { budgets } from "./quality";
import { DigitalWorld } from "./scenes/DigitalWorld";
import { OceanWorld } from "./scenes/OceanWorld";
import { AdaptiveResolution, WarmUp, WorldTransitions } from "./StageSystems";
import { StoryClock } from "./StoryClock";
import styles from "./Stage.module.css";

function SceneSetup() {
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    scene.fog = new FogExp2("#1a2634", 0.003);
    scene.background = new Color("#1a2634");
    if (process.env.NODE_ENV !== "production") (window as unknown as { __scene: unknown }).__scene = scene;
  }, [scene]);
  return null;
}

/** The single WebGL canvas behind the whole story. */
export default function Stage() {
  const quality = useStory("quality");
  const budget = budgets[quality];

  return (
    <div className={styles.stage} aria-hidden="true">
      <Canvas
        dpr={budget.dpr}
        gl={{
          antialias: budget.antialias,
          powerPreference: "high-performance",
          stencil: false,
          // Neutral keeps hues honest (ACES pushes the dusk orange toward magenta)
          toneMapping: NeutralToneMapping,
        }}
        camera={{ fov: 34, near: 0.02, far: 900, position: [13, 1.5, 17.6] }}
        frameloop="always"
      >
        <SceneSetup />
        <StoryClock />
        <CameraRig />
        <WorldTransitions />
        <Lighting />
        <Suspense fallback={null}>
          <OceanWorld budget={budget} />
          <DigitalWorld budget={budget} />
          <WarmUp />
        </Suspense>
        <MarineSnow count={budget.particles} />
        <LightShafts count={budget.shafts} />
        <ScreenFX grain={budget.grain} />
        <AdaptiveResolution range={budget.dpr} />
      </Canvas>
    </div>
  );
}
