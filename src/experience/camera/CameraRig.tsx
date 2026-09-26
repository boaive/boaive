"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { type PerspectiveCamera, Vector3 } from "three";
import { moments } from "@/story/moments";
import { story } from "@/story/store";
import { frame } from "../frame";
import { fx } from "../fx/fxState";
import { clamp, damp } from "../math";
import { digitalKeys } from "./digitalTracks";
import { floatDiveKeys } from "./oceanTracks";
import { surfaceKeys } from "./surfaceTracks";
import { CameraTrack, makeSample } from "./track";

/** Landscape layouts are designed around this aspect; narrower screens widen the lens. */
const DESIGN_ASPECT = 1.3;

export const cameraRig = {
  tracks: {
    ocean: new CameraTrack(floatDiveKeys),
    digital: new CameraTrack(digitalKeys),
    surface: new CameraTrack(surfaceKeys),
  },
  /** A shot scenes can blend toward (e.g. pushing in on a project's screen). */
  push: { pos: new Vector3(), look: new Vector3(), shift: [0, 0] as [number, number], weight: 0 },
};

function trackFor(t: number) {
  const { tracks } = cameraRig;
  if (t < moments.enterScreen) return tracks.ocean;
  if (t < moments.surfaceSwap) return tracks.digital;
  return tracks.surface;
}

export function CameraRig() {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const layout = useRef(-1);
  const still = useRef({ t: -1, fade: 0 });
  const s = useMemo(
    () => ({
      sample: makeSample(),
      pos: new Vector3(),
      look: new Vector3(),
      dir: new Vector3(),
      right: new Vector3(),
      up: new Vector3(),
      times: [] as number[],
    }),
    [],
  );

  useFrame((state, delta) => {
    const { tracks } = cameraRig;
    if (layout.current !== story.layoutVersion) {
      layout.current = story.layoutVersion;
      moments.refresh();
      tracks.ocean.build();
      tracks.digital.build();
      tracks.surface.build();
      s.times = [...tracks.ocean.times, ...tracks.digital.times, ...tracks.surface.times].sort((a, b) => a - b);
    }

    // Reduced motion: hold still frames (the last key reached) and cross-fade between them.
    if (story.reducedMotion) {
      let held = s.times[0] ?? 0;
      for (const kt of s.times) if (kt <= frame.t + 1e-4) held = kt;
      if (held !== still.current.t) {
        if (still.current.t >= 0) still.current.fade = 1;
        still.current.t = held;
      }
      frame.t = held;
      still.current.fade = Math.max(0, still.current.fade - delta * 2.4);
      fx.stillVeil = still.current.fade;
    } else {
      fx.stillVeil = 0;
    }

    const track = trackFor(frame.t);
    track.sample(frame.t, s.sample);
    s.pos.copy(s.sample.pos);
    s.look.copy(s.sample.look);

    // Scene-requested push (project close-ups)
    const push = cameraRig.push;
    if (push.weight > 0.0001) {
      s.pos.lerp(push.pos, push.weight);
      s.look.lerp(push.look, push.weight);
    }

    const aspect = state.size.width / state.size.height;
    const portrait = aspect < 0.9;
    frame.portrait = portrait;

    // Portrait: step back a little along the view line.
    if (portrait && s.sample.backPortrait !== 1) {
      s.dir.subVectors(s.pos, s.look);
      s.pos.copy(s.look).addScaledVector(s.dir, s.sample.backPortrait);
    }

    // Subtle pointer parallax, proportional to the shot's distance.
    s.dir.subVectors(s.look, s.pos);
    const dist = s.dir.length();
    s.dir.divideScalar(dist || 1);
    s.right.crossVectors(s.dir, camera.up).normalize();
    s.up.crossVectors(s.right, s.dir).normalize();
    frame.pointer.x = damp(frame.pointer.x, story.pointer.x, 2.5, delta);
    frame.pointer.y = damp(frame.pointer.y, story.pointer.y, 2.5, delta);
    const amp = story.reducedMotion ? 0 : Math.min(dist, 12) * 0.018;
    s.pos.addScaledVector(s.right, frame.pointer.x * amp).addScaledVector(s.up, frame.pointer.y * amp * 0.6);

    camera.position.copy(s.pos);
    camera.lookAt(s.look);

    // Lens: widen for narrow screens so the composition keeps its width.
    const widen = clamp(DESIGN_ASPECT / aspect, 1, 2.1);
    const fovRad = (s.sample.fov * Math.PI) / 180;
    const fov = (2 * Math.atan(Math.tan(fovRad / 2) * widen) * 180) / Math.PI;
    if (Math.abs(camera.fov - fov) > 1e-3 || camera.aspect !== aspect) {
      camera.fov = fov;
      camera.aspect = aspect;
    }
    camera.updateProjectionMatrix();
    // Off-axis lens shift: a negative offset term moves the image toward +x / +y.
    const shift = portrait ? s.sample.shiftPortrait : s.sample.shift;
    const w = push.weight;
    const sx = shift[0] + (push.shift[0] - shift[0]) * w;
    const sy = shift[1] + (push.shift[1] - shift[1]) * w;
    camera.projectionMatrix.elements[8] = -sx;
    camera.projectionMatrix.elements[9] = -sy;
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  }, -2);

  return null;
}
