"use client";

import { RoundedBox, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AdditiveBlending,
  Color,
  type Group,
  type Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  ShaderMaterial,
  SRGBColorSpace,
  type Texture,
  VideoTexture,
} from "three";
import { featuredProjects } from "@/data/projects";
import { GALLERY, galleryPosition, galleryRotation, WALL, wallPosition } from "../../choreo/digitalLayout";
import { clamp, damp, easeInOutCubic, lerp } from "../../math";

/** Written by the digital world controller. */
export const galleryState = {
  presence: 0,
  activity: featuredProjects.map(() => 0),
  /** 0 = screens on the arc, 1 = gathered into the archive wall. */
  gather: 0,
  /** Allow scroll-through videos (off on low tier / reduced motion). */
  video: true,
};

const glowVertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const glowFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
varying vec2 vUv;
void main() {
  vec2 p = (vUv - 0.5) * vec2(1.0, 1.6);
  float g = exp(-dot(p, p) * 5.0);
  gl_FragColor = vec4(uColor * g * uIntensity, 1.0);
}
`;

/** One project's screen: frame, picture (poster → live video when active), and its own light. */
function ProjectScreen({ index, poster }: { index: number; poster: Texture }) {
  const project = featuredProjects[index];
  const screenRef = useRef<Mesh>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const videoTex = useRef<VideoTexture | null>(null);
  const assets = useMemo(() => {
    poster.colorSpace = SRGBColorSpace;
    poster.anisotropy = 8;
    return {
      screen: new MeshBasicMaterial({ map: poster, toneMapped: false, transparent: true }),
      frame: new MeshStandardMaterial({ color: "#11181e", metalness: 0.7, roughness: 0.3 }),
      glow: new ShaderMaterial({
        uniforms: { uColor: { value: new Color(project.accent) }, uIntensity: { value: 0 } },
        vertexShader: glowVertex,
        fragmentShader: glowFragment,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
      }),
      plane: new PlaneGeometry(GALLERY.width, GALLERY.height),
      glowPlane: new PlaneGeometry(GALLERY.width * 2.2, GALLERY.height * 2.2),
    };
  }, [poster, project.accent]);

  useEffect(
    () => () => {
      video.current?.pause();
      video.current?.removeAttribute("src");
      video.current?.load();
      videoTex.current?.dispose();
    },
    [],
  );

  useFrame((_, dt) => {
    const a = galleryState.activity[index];
    const presence = galleryState.presence;
    assets.screen.opacity = presence;
    assets.screen.color.setScalar(0.38 + 0.62 * a);
    assets.glow.uniforms.uIntensity.value = damp(assets.glow.uniforms.uIntensity.value, a * 0.55 * presence, 4, dt);

    // Live scroll-through on the active screen only.
    const wantVideo = galleryState.video && a > 0.6 && !!project.media.video;
    if (wantVideo && !video.current) {
      const v = document.createElement("video");
      v.src = project.media.video!.src;
      v.muted = true;
      v.loop = true;
      v.playsInline = true;
      v.preload = "auto";
      v.crossOrigin = "anonymous";
      video.current = v;
      const tex = new VideoTexture(v);
      tex.colorSpace = SRGBColorSpace;
      videoTex.current = tex;
    }
    const v = video.current;
    if (v) {
      if (wantVideo && v.paused) void v.play().catch(() => undefined);
      if (!wantVideo && !v.paused) v.pause();
      const ready = v.readyState >= 2 && wantVideo;
      const map = ready && videoTex.current ? videoTex.current : poster;
      if (assets.screen.map !== map) {
        assets.screen.map = map;
        assets.screen.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      <mesh geometry={assets.glowPlane} material={assets.glow} position={[0, 0, -0.35]} />
      <RoundedBox args={[GALLERY.width + 0.16, GALLERY.height + 0.16, 0.08]} radius={0.05} smoothness={3} material={assets.frame} position={[0, 0, -0.05]} />
      <mesh ref={screenRef} geometry={assets.plane} material={assets.screen} />
    </group>
  );
}

/** Shortest signed angle from a to b. */
const angleDelta = (a: number, b: number) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

/**
 * The featured projects, each on a screen in the deep, arranged on an arc above the ring.
 * At the end of the chapter they gather into one wall — the way into the full archive.
 */
export function WorkGallery() {
  const group = useRef<Group>(null);
  const holders = useRef<(Group | null)[]>([]);
  const lastGather = useRef(-1);
  const posters = useTexture(featuredProjects.map((p) => p.media.poster.src));
  const placements = useMemo(() => {
    const n = featuredProjects.length;
    return featuredProjects.map((_, i) => ({
      arc: galleryPosition(i, n),
      arcRot: galleryRotation(i, n),
      wall: wallPosition(i, n),
    }));
  }, []);

  useFrame(() => {
    if (group.current) group.current.visible = galleryState.presence > 0.002;
    const g = galleryState.gather;
    if (g === lastGather.current) return;
    lastGather.current = g;
    const n = placements.length;
    placements.forEach((pl, i) => {
      const holder = holders.current[i];
      if (!holder) return;
      // staggered: the first screens leave slightly earlier
      const lag = n > 1 ? (i / (n - 1)) * 0.3 : 0;
      const e = easeInOutCubic(clamp(g * 1.3 - lag));
      holder.position.lerpVectors(pl.arc, pl.wall, e);
      holder.position.y += Math.sin(Math.PI * e) * 0.9;
      holder.rotation.y = pl.arcRot + angleDelta(pl.arcRot, WALL.rotation) * e;
      holder.scale.setScalar(lerp(1, WALL.scale, e));
    });
  });

  return (
    <group ref={group}>
      {placements.map((pl, i) => (
        <group
          key={featuredProjects[i].slug}
          ref={(el) => {
            holders.current[i] = el;
          }}
          position={pl.arc}
          rotation={[0, pl.arcRot, 0]}
        >
          <ProjectScreen index={i} poster={posters[i]} />
        </group>
      ))}
    </group>
  );
}
