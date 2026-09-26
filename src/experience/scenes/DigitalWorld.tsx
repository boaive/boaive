"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Suspense, useMemo, useRef, useState } from "react";
import { Color, type FogExp2, type Group, Vector3 } from "three";
import { featuredProjects } from "@/data/projects";
import { handoffTimeAt, moments, timeAt } from "@/story/moments";
import { timing } from "@/story/timing";
import { story } from "@/story/store";
import { ambient } from "../ambient";
import { cameraRig } from "../camera/CameraRig";
import { buildStage, capabilityActivity, presence, projectActivity } from "../choreo/digital";
import { formPosition, GALLERY, galleryPosition, PRODUCT_POSITION } from "../choreo/digitalLayout";
import { frame } from "../frame";
import { lightRig } from "../Lighting";
import { damp, lerp, smoothstep } from "../math";
import { Architecture, architecture } from "../objects/digital/Architecture";
import { CapabilityForms, formsState } from "../objects/digital/CapabilityForms";
import { Floor, floorUniforms } from "../objects/digital/Floor";
import { bubblesState, IdeaBubbles } from "../objects/digital/IdeaBubbles";
import { Network, networkState } from "../objects/digital/Network";
import { buildState, ProductBuild } from "../objects/digital/ProductBuild";
import { galleryState, WorkGallery } from "../objects/digital/WorkGallery";
import type { Budget } from "../quality";
import { DIGITAL_ORIGIN } from "../worlds";

const C = {
  fog: new Color("#06131b"),
  fogLight: new Color("#3f7f8c"),
  hemiSky: new Color("#2c5565"),
  hemiGround: new Color("#03070a"),
  key: new Color("#d4ecf2"),
  ember: new Color("#ff8a2a"),
};

/** Problem → Studio: the deep inside the laptop, where the product gets built. */
export function DigitalWorld({ budget }: { budget: Budget }) {
  const scene = useThree((s) => s.scene);
  const root = useRef<Group>(null);
  const [galleryReady, setGalleryReady] = useState(false);
  const s = useMemo(() => ({ accent: new Vector3(), v: new Vector3(), push: 0, tmp: new Color() }), []);

  useFrame(({ gl }, delta) => {
    const t = frame.t;
    // Start fetching project posters a chapter ahead of the Work chapter.
    if (!galleryReady && t > timeAt("capabilities", 0.4)) setGalleryReady(true);

    const active = frame.world === "digital";
    if (root.current) root.current.visible = active;
    if (!active) return;

    const studioT = timeAt("studio", 0);
    const endT = moments.surfaceSwap;

    // ── what's on stage ──────────────────────────────────────
    bubblesState.opacity = presence(t, moments.enterScreen + 0.06, timeAt("capabilities", 0.02), 0.12);
    formsState.presence = presence(t, timeAt("capabilities", -0.25), studioT + 0.35, 0.18);
    const inCapabilities = t < timeAt("process", -0.2);
    for (let i = 0; i < formsState.activity.length; i++) {
      const target = inCapabilities
        ? capabilityActivity(i, t)
        : t > timeAt("outcome", 0.1)
          ? 0.55 * smoothstep(timeAt("outcome", 0.1), timeAt("outcome", 0.5), t)
          : 0.08;
      formsState.activity[i] = damp(formsState.activity[i], target, 5, delta);
    }

    buildState.presence = presence(t, timeAt("process", -0.08), studioT + 0.35, 0.12);
    buildState.stage = t < timeAt("process", 1) ? buildStage(t) : 5;

    // screens power on as the first project arrives, after the chapter heading has had the stage
    galleryState.presence = presence(t, timeAt("work", 0.1), studioT + 0.35, 0.1);
    galleryState.video = !story.reducedMotion && story.quality !== "low";
    // closing beat: the screens gather into the archive wall, then return to the arc for the outcome
    const [moreAt] = timing.work.more;
    galleryState.gather =
      smoothstep(timeAt("work", moreAt - 0.03), timeAt("work", moreAt + 0.05), t) *
      (1 - smoothstep(handoffTimeAt("outcome", 0.05), handoffTimeAt("outcome", 0.7), t));
    const open = story.openProject ? featuredProjects.findIndex((p) => p.slug === story.openProject) : -1;
    featuredProjects.forEach((_, i) => {
      const target =
        open >= 0
          ? i === open
            ? 1
            : 0.1
          : t < timeAt("outcome", 0)
            ? Math.max(projectActivity(i, t), galleryState.gather * 0.5)
            : 0.35;
      galleryState.activity[i] = damp(galleryState.activity[i], target, 5, delta);
    });

    networkState.presence = presence(t, timeAt("outcome", 0), studioT + 0.4, 0.2);
    networkState.reveal = smoothstep(timeAt("outcome", 0.02), timeAt("outcome", 0.75), t);

    // ── push the camera in on the open project's screen ──────
    const push = cameraRig.push;
    s.push = damp(s.push, open >= 0 ? 1 : 0, 3.5, delta);
    push.weight = s.push * 0.9;
    if (open >= 0) {
      const a = GALLERY.angle(open, featuredProjects.length);
      galleryPosition(open, featuredProjects.length, s.v);
      push.look.copy(s.v).add(DIGITAL_ORIGIN);
      push.pos.set(s.v.x - Math.cos(a) * 4.6, s.v.y - 0.2, s.v.z - Math.sin(a) * 4.6).add(DIGITAL_ORIGIN);
      push.shift[0] = frame.portrait ? 0 : -0.34;
      push.shift[1] = frame.portrait ? 0.18 : 0;
    }

    // ── light: an ember key light on whatever the story is about ──
    const accent = lightRig.accent;
    if (accent) {
      let best = -1;
      let bestA = 0;
      formsState.activity.forEach((a, i) => {
        if (a > bestA) {
          bestA = a;
          best = i;
        }
      });
      if (inCapabilities && best >= 0) formPosition(best, s.v).add(new Vector3(0, 2.2, 1.5));
      else s.v.copy(PRODUCT_POSITION).add(new Vector3(0, 3, 2.5));
      s.accent.lerp(s.v.add(DIGITAL_ORIGIN), 1 - Math.exp(-4 * delta));
      accent.position.copy(s.accent);
      accent.intensity = inCapabilities ? 14 * bestA : 9 * smoothstep(3, 4.5, buildState.stage) * buildState.presence;
      accent.distance = 14;
      accent.color.copy(C.ember);
    }
    const glow = lightRig.glow;
    if (glow) glow.intensity = 0;
    const hemi = lightRig.hemi;
    const key = lightRig.key;
    // Rising toward the light at the end of the Studio chapter.
    const ascent = smoothstep(studioT + 0.45, endT, t);
    if (hemi && key) {
      hemi.color.copy(C.hemiSky);
      hemi.groundColor.copy(C.hemiGround);
      hemi.intensity = lerp(0.55, 1.1, ascent);
      key.color.copy(C.key);
      key.intensity = lerp(1.3, 2, ascent);
      key.position.set(DIGITAL_ORIGIN.x + 6, DIGITAL_ORIGIN.y + 40, DIGITAL_ORIGIN.z + 10);
    }

    // ── water ────────────────────────────────────────────────
    frame.underwater = 1;
    const fog = scene.fog as FogExp2;
    fog.color.copy(C.fog).lerp(C.fogLight, ascent * 0.9);
    fog.density = lerp(0.028, 0.045, ascent);
    (scene.background as Color).copy(fog.color);
    floorUniforms.uFog.value.copy(fog.color);
    floorUniforms.uFogDensity.value = fog.density;
    // the ember horizon echoes the laptop screen on arrival, then steps back
    architecture.horizon = lerp(0.5, 0.1, smoothstep(moments.enterScreen, timeAt("problem", 0.3), t)) * (1 - ascent);
    architecture.overhead = lerp(0.55, 1.4, ascent);
    ambient.snow = 0.85;
    ambient.snowTint.set("#cfe3ea");
    ambient.shafts = lerp(0.35, 1.1, ascent);
    ambient.shaftsColor.set("#a6dbe4");
    ambient.shaftsAnchor.set(DIGITAL_ORIGIN.x, DIGITAL_ORIGIN.y + 44, DIGITAL_ORIGIN.z);
    ambient.shaftsLength = 56;
    scene.environmentIntensity = 0.9;
    gl.toneMappingExposure = lerp(1.05, 1.2, ascent);
  }, -1);

  return (
    <group>
      <group ref={root}>
        <Floor />
        <group position={DIGITAL_ORIGIN}>
          <Architecture />
          <IdeaBubbles />
          <CapabilityForms />
          <group position={PRODUCT_POSITION}>
            <ProductBuild count={budget.voxels} />
          </group>
          {galleryReady ? (
            <Suspense fallback={null}>
              <WorkGallery />
            </Suspense>
          ) : null}
          <Network />
        </group>
      </group>
    </group>
  );
}
