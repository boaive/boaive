"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  type Group,
  type InstancedMesh,
  LineBasicMaterial,
  Matrix4,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Quaternion,
  RingGeometry,
  Euler,
  Vector3,
} from "three";
import { frame } from "../../frame";
import { clamp, easeInOutCubic, easeOutCubic, hash, smoothstep } from "../../math";
import { uiTexture } from "./uiTextures";

/**
 * "How we build": one product, assembled in front of you.
 *   stage 0→1  Understand  scattered pieces (the messy problem) settle into an ordered lattice
 *   stage 1→2  Design      the lattice becomes a blueprint: dashed outlines, dimension lines
 *   stage 2→3  Build       pieces fly into place, layer by layer from the bottom
 *   stage 3→4  Refine      the pieces melt into polished panels, a highlight sweeps across
 *   stage 4→5  Launch      the screens light up and a pulse goes out
 */
export const buildState = {
  /** 0..5 continuous stage. */
  stage: 0,
  /** 0..1 visibility of the whole object. */
  presence: 0,
};

type PanelDef = { size: [number, number, number]; pos: [number, number, number]; rotY: number; tex: "website" | "app" | "dashboard"; share: number };

const PANELS: PanelDef[] = [
  { size: [3.2, 2.0, 0.12], pos: [0, 0.45, 0], rotY: 0, tex: "website", share: 0.6 },
  { size: [0.86, 1.72, 0.1], pos: [2.05, -0.05, 0.55], rotY: -0.32, tex: "app", share: 0.2 },
  { size: [1.35, 0.86, 0.08], pos: [-2.1, -0.3, 0.5], rotY: 0.32, tex: "dashboard", share: 0.2 },
];

type Voxel = {
  chaos: Vector3;
  chaosRot: Quaternion;
  lattice: Vector3;
  edge: Vector3;
  edgeRot: Quaternion;
  edgeScale: Vector3;
  tile: Vector3;
  tileRot: Quaternion;
  tileScale: Vector3;
  delay: number;
  layer: number;
  sweep: number;
  accent: boolean;
};

function panelMatrix(p: PanelDef) {
  return new Matrix4().compose(new Vector3(...p.pos), new Quaternion().setFromEuler(new Euler(0, p.rotY, 0)), new Vector3(1, 1, 1));
}

/** Outline + interface lines of a panel, in panel space (pairs of points). */
function blueprintSegments(p: PanelDef): [Vector3, Vector3][] {
  const [w, h, d] = p.size;
  const z = d / 2 + 0.01;
  const x0 = -w / 2;
  const x1 = w / 2;
  const y0 = -h / 2;
  const y1 = h / 2;
  const segs: [Vector3, Vector3][] = [
    [new Vector3(x0, y0, z), new Vector3(x1, y0, z)],
    [new Vector3(x1, y0, z), new Vector3(x1, y1, z)],
    [new Vector3(x1, y1, z), new Vector3(x0, y1, z)],
    [new Vector3(x0, y1, z), new Vector3(x0, y0, z)],
  ];
  if (p.tex === "website") {
    segs.push([new Vector3(x0, y1 - 0.22, z), new Vector3(x1, y1 - 0.22, z)]);
    segs.push([new Vector3(0.12, y1 - 0.22, z), new Vector3(0.12, y0 + 0.62, z)]);
    segs.push([new Vector3(x0, y0 + 0.62, z), new Vector3(x1, y0 + 0.62, z)]);
  } else if (p.tex === "app") {
    segs.push([new Vector3(x0, y1 - 0.5, z), new Vector3(x1, y1 - 0.5, z)]);
    segs.push([new Vector3(x0, y0 + 0.2, z), new Vector3(x1, y0 + 0.2, z)]);
  } else {
    segs.push([new Vector3(x0 + 0.3, y0, z), new Vector3(x0 + 0.3, y1, z)]);
  }
  return segs;
}

function buildVoxels(count: number): Voxel[] {
  const voxels: Voxel[] = [];
  const e = new Euler();
  PANELS.forEach((panel, pi) => {
    const n = pi === PANELS.length - 1 ? count - voxels.length : Math.round(count * panel.share);
    const [w, h, d] = panel.size;
    const nx = Math.max(1, Math.round(Math.sqrt((n * w) / h)));
    const ny = Math.ceil(n / nx);
    const tw = w / nx;
    const th = h / ny;
    const m = panelMatrix(panel);
    const q = new Quaternion().setFromEuler(new Euler(0, panel.rotY, 0));
    const segs = blueprintSegments(panel);
    const total = segs.reduce((acc, [a, b]) => acc + a.distanceTo(b), 0);
    for (let k = 0; k < n; k++) {
      const i = voxels.length;
      const gx = k % nx;
      const gy = Math.floor(k / nx);
      // tile on the panel face
      const tile = new Vector3(-w / 2 + (gx + 0.5) * tw, -h / 2 + (gy + 0.5) * th, 0).applyMatrix4(m);
      // a dash along the blueprint outline
      let along = (k / n) * total;
      let seg = segs[0];
      for (const s of segs) {
        const len = s[0].distanceTo(s[1]);
        if (along <= len) {
          seg = s;
          break;
        }
        along -= len;
      }
      const dir = new Vector3().subVectors(seg[1], seg[0]);
      const segLen = dir.length();
      dir.normalize();
      const edge = seg[0].clone().addScaledVector(dir, Math.min(along, segLen)).applyMatrix4(m);
      const edgeRot = new Quaternion().setFromUnitVectors(new Vector3(1, 0, 0), dir.clone().applyQuaternion(q));
      // chaos: a loose cloud; lattice: an ordered block
      const r = 2.2 + hash(i * 1.7) * 2.6;
      const th2 = hash(i * 2.3) * Math.PI * 2;
      const ph = Math.acos(2 * hash(i * 3.1) - 1);
      const chaos = new Vector3(Math.sin(ph) * Math.cos(th2) * r, Math.cos(ph) * r * 0.6 + 0.3, Math.sin(ph) * Math.sin(th2) * r);
      e.set(hash(i * 4.1) * 6.28, hash(i * 5.2) * 6.28, hash(i * 6.3) * 6.28);
      const L = 9;
      const lattice = new Vector3(((i % L) - (L - 1) / 2) * 0.42, (Math.floor(i / (L * L)) % 8) * 0.42 - 1.2, ((Math.floor(i / L) % L) - (L - 1) / 2) * 0.42);
      voxels.push({
        chaos,
        chaosRot: new Quaternion().setFromEuler(e),
        lattice,
        edge,
        edgeRot,
        edgeScale: new Vector3(Math.max(0.05, total / n) * 0.62, 0.03, 0.03),
        tile,
        tileRot: q.clone(),
        tileScale: new Vector3(tw * 0.92, th * 0.92, d),
        delay: hash(i * 7.7),
        layer: (tile.y + 1.5) / 3.2,
        sweep: (tile.x + 3) / 6,
        accent: hash(i * 8.9) > 0.94,
      });
    }
  });
  return voxels;
}

/** Staggered 0..1 progress for one voxel inside a transition. */
const stagger = (f: number, delay: number, spread = 0.45) => easeInOutCubic(clamp((f - delay * spread) / (1 - spread)));

export function ProductBuild({ count }: { count: number }) {
  const group = useRef<Group>(null);
  const voxelsRef = useRef<InstancedMesh>(null);
  const solids = useRef<Group>(null);
  const pulseRef = useRef<Group>(null);
  const voxels = useMemo(() => buildVoxels(count), [count]);
  const assets = useMemo(() => {
    const blueprint = new BufferGeometry();
    const pts: number[] = [];
    PANELS.forEach((panel) => {
      const m = panelMatrix(panel);
      blueprintSegments(panel).forEach(([a, b]) => {
        const A = a.clone().applyMatrix4(m);
        const B = b.clone().applyMatrix4(m);
        pts.push(A.x, A.y, A.z, B.x, B.y, B.z);
      });
    });
    // dimension line above the main panel, with end ticks — architectural drawing
    const [w, h] = PANELS[0].size;
    const y = PANELS[0].pos[1] + h / 2 + 0.28;
    pts.push(-w / 2, y, 0.08, w / 2, y, 0.08, -w / 2, y - 0.09, 0.08, -w / 2, y + 0.09, 0.08, w / 2, y - 0.09, 0.08, w / 2, y + 0.09, 0.08);
    const x = -w / 2 - 0.28;
    const yb = PANELS[0].pos[1] - h / 2;
    const yt = PANELS[0].pos[1] + h / 2;
    pts.push(x, yb, 0.08, x, yt, 0.08, x - 0.09, yb, 0.08, x + 0.09, yb, 0.08, x - 0.09, yt, 0.08, x + 0.09, yt, 0.08);
    blueprint.setAttribute("position", new BufferAttribute(new Float32Array(pts), 3));

    // silver pieces (a few ember ones via instance colour); a faint cool self-light so they read in the dark
    const voxelMat = new MeshStandardMaterial({ color: "#ffffff", metalness: 0.45, roughness: 0.32, emissive: "#9fc3cf", emissiveIntensity: 0 });
    const colors = new Float32Array(voxels.length * 3);
    const silver = new Color("#d7e0e4");
    const ember = new Color("#ff8a2a");
    voxels.forEach((v, i) => (v.accent ? ember : silver).toArray(colors, i * 3));

    return {
      blueprint,
      blueprintMat: new LineBasicMaterial({ color: "#9fc3cf", transparent: true, opacity: 0 }),
      box: new BoxGeometry(1, 1, 1),
      voxelMat,
      colors,
      body: new MeshStandardMaterial({ color: "#0f1d26", metalness: 0.55, roughness: 0.2, transparent: true, opacity: 0, envMapIntensity: 1.3 }),
      screens: PANELS.map((p) => new MeshBasicMaterial({ map: uiTexture(p.tex), transparent: true, opacity: 0, toneMapped: false })),
      sweepMat: new MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, toneMapped: false }),
      ring: new RingGeometry(0.98, 1, 96),
      ringMats: [0, 1, 2].map(
        () =>
          new MeshBasicMaterial({ color: "#ff9a45", transparent: true, opacity: 0, side: DoubleSide, blending: AdditiveBlending, depthWrite: false, toneMapped: false }),
      ),
      m: new Matrix4(),
      p: new Vector3(),
      q: new Quaternion(),
      s: new Vector3(),
      tmpQ: new Quaternion(),
      tmpV: new Vector3(),
      drift: new Vector3(),
    };
  }, [voxels]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;
    g.visible = buildState.presence > 0.002;
    if (!g.visible) return;
    const S = buildState.stage;
    const t = frame.elapsed;
    const mesh = voxelsRef.current;

    // ── voxels ──
    if (mesh) {
      const { m, p, q, s, tmpQ, tmpV, drift } = assets;
      const fU = clamp(S);
      const fD = clamp(S - 1);
      const fB = clamp(S - 2);
      const fR = clamp(S - 3);
      voxels.forEach((v, i) => {
        // chaos drifts gently while the problem is still being understood
        drift.set(Math.sin(t * 0.5 + i) * 0.12, Math.cos(t * 0.4 + i * 1.3) * 0.12, Math.sin(t * 0.3 + i * 0.7) * 0.12).multiplyScalar(1 - fU);
        const u1 = stagger(fU, v.delay);
        p.lerpVectors(tmpV.copy(v.chaos).add(drift), v.lattice, u1);
        q.slerpQuaternions(v.chaosRot, tmpQ.identity(), u1);
        const sc = 0.065 + 0.075 * u1;
        s.set(sc, sc, sc);
        if (fD > 0) {
          const u2 = stagger(fD, v.delay, 0.5);
          p.lerp(v.edge, u2);
          q.slerp(v.edgeRot, u2);
          s.lerp(v.edgeScale, u2);
        }
        if (fB > 0) {
          const u3 = stagger(fB, v.layer, 0.6);
          p.lerp(v.tile, u3);
          q.slerp(v.tileRot, u3);
          s.lerp(v.tileScale, u3);
        }
        if (fR > 0) {
          const shrink = 1 - stagger(fR, v.sweep, 0.55);
          s.multiplyScalar(Math.max(shrink, 0.0001));
        }
        m.compose(p, q, s);
        mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
      mesh.visible = fR < 0.999;
      assets.voxelMat.emissiveIntensity = 0.06 + 0.1 * (1 - fU);
    }

    // ── blueprint lines: appear in Design, fade as the product is refined ──
    assets.blueprintMat.opacity = smoothstep(1, 1.5, S) * (1 - smoothstep(3.1, 3.7, S) * 0.9) * 0.85 * buildState.presence;

    // ── the finished panels ──
    const refine = smoothstep(3, 3.85, S);
    const launch = smoothstep(4, 4.6, S);
    assets.body.opacity = refine * 0.94 * buildState.presence;
    assets.screens.forEach((mat) => {
      mat.opacity = refine * buildState.presence;
      mat.color.setScalar(0.55 + 0.45 * refine + 0.35 * launch);
    });
    // a highlight sweeping across while the pieces melt into panels
    const sw = clamp((S - 3) / 0.9);
    assets.sweepMat.opacity = Math.sin(Math.PI * sw) * 0.22 * buildState.presence;
    if (solids.current) {
      solids.current.visible = refine > 0.001;
      solids.current.position.y = launch * 0.45;
      solids.current.children.forEach((child) => {
        if (child.userData.sweep) child.position.x = -3.4 + sw * 6.8;
      });
    }
    // ── launch pulses ──
    if (pulseRef.current) {
      pulseRef.current.visible = launch > 0.001;
      pulseRef.current.children.forEach((ring, k) => {
        const f = (t * 0.35 + k / 3) % 1;
        ring.scale.setScalar(1 + easeOutCubic(f) * 11);
        assets.ringMats[k].opacity = (1 - f) * 0.55 * launch * buildState.presence;
      });
    }
  });

  return (
    <group ref={group}>
      <instancedMesh ref={voxelsRef} args={[assets.box, assets.voxelMat, voxels.length]}>
        <instancedBufferAttribute attach="instanceColor" args={[assets.colors, 3]} />
      </instancedMesh>
      <lineSegments geometry={assets.blueprint} material={assets.blueprintMat} />
      <group ref={solids}>
        {PANELS.map((panel, i) => (
          <group key={i} position={panel.pos} rotation={[0, panel.rotY, 0]}>
            <RoundedBox args={panel.size} radius={0.04} smoothness={3} material={assets.body} />
            <mesh material={assets.screens[i]} position={[0, 0, panel.size[2] / 2 + 0.004]}>
              <planeGeometry args={[panel.size[0] * 0.94, panel.size[1] * 0.92]} />
            </mesh>
          </group>
        ))}
        <mesh material={assets.sweepMat} userData={{ sweep: true }} position={[0, 0.2, 0.3]} rotation={[0, 0, 0.35]}>
          <planeGeometry args={[0.25, 4.2]} />
        </mesh>
      </group>
      <group ref={pulseRef} position={[0, -1.3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        {assets.ringMats.map((mat, k) => (
          <mesh key={k} geometry={assets.ring} material={mat} />
        ))}
      </group>
    </group>
  );
}
