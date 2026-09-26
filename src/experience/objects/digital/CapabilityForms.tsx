"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { type ReactNode, useMemo, useRef } from "react";
import {
  DynamicDrawUsage,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  DoubleSide,
  EdgesGeometry,
  type Group,
  IcosahedronGeometry,
  type InstancedMesh,
  LineBasicMaterial,
  Matrix4,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
} from "three";
import { ParametricGeometry } from "three/examples/jsm/geometries/ParametricGeometry.js";
import { FORM_COUNT, formAngle, formPosition } from "../../choreo/digitalLayout";
import { frame } from "../../frame";
import { clamp, easeInOutCubic, hash, smoothstep } from "../../math";
import { uiTexture } from "./uiTextures";

/** Written by the digital world controller each frame. */
export const formsState = {
  /** 0..1 how present the ring is. */
  presence: 0,
  /** 0..1 per form: the one the story is talking about. */
  activity: new Array<number>(FORM_COUNT).fill(0),
};

/** The ring is off stage: forms skip their per-frame work (instance matrices, colours) entirely. */
const hidden = () => formsState.presence <= 0.002;

const SILVER = new Color("#c8d5db");
const EMBER = new Color("#ff8a2a");

function createFormMaterials() {
  return {
    glass: new MeshStandardMaterial({ color: "#0e1c25", metalness: 0.35, roughness: 0.18, transparent: true, opacity: 0.72, envMapIntensity: 1.2 }),
    solid: new MeshStandardMaterial({ color: "#1a2a34", metalness: 0.6, roughness: 0.28, envMapIntensity: 1 }),
    edge: new LineBasicMaterial({ color: SILVER, transparent: true, opacity: 0.6 }),
    node: new MeshStandardMaterial({ color: "#dfe8ec", emissive: new Color("#dfe8ec"), emissiveIntensity: 0.25, roughness: 0.35 }),
    accent: new MeshStandardMaterial({ color: EMBER, emissive: EMBER, emissiveIntensity: 1.1, roughness: 0.4 }),
  };
}
type Mats = ReturnType<typeof createFormMaterials>;

function applyActivity(m: Mats, a: number, presence: number) {
  m.edge.opacity = (0.22 + 0.58 * a) * presence;
  m.glass.opacity = (0.45 + 0.35 * a) * presence;
  m.node.emissiveIntensity = 0.12 + 0.55 * a;
  m.accent.emissiveIntensity = 0.25 + 1.5 * a;
}

const edgesOf = (g: BufferGeometry) => new EdgesGeometry(g, 25);

// ── WEB: layered browser windows ──────────────────────────────────────────────
function FormWeb({ index, m }: { index: number; m: Mats }) {
  const refs = useRef<(Group | null)[]>([]);
  const assets = useMemo(() => {
    const panel = new BoxGeometry(2.5, 1.56, 0.035);
    return {
      panel,
      panelEdges: edgesOf(panel),
      screenGeo: new PlaneGeometry(2.42, 1.5),
      screens: (["website", "dashboard", "website"] as const).map(
        (kind) => new MeshBasicMaterial({ map: uiTexture(kind), toneMapped: false, transparent: true }),
      ),
    };
  }, []);
  useFrame(() => {
    if (hidden()) return;
    const a = formsState.activity[index];
    const t = frame.elapsed;
    const fan = 0.35 + 0.45 * easeInOutCubic(a);
    refs.current.forEach((g, i) => {
      if (!g) return;
      g.position.set(-i * 0.45 * fan, 0.2 + i * 0.22 * fan + Math.sin(t * 0.8 + i) * 0.03, -i * fan);
      g.rotation.y = -0.12 * i * a;
      assets.screens[i].opacity = (i === 0 ? 0.45 + 0.55 * a : 0.22 + 0.3 * a) * formsState.presence;
    });
  });
  return (
    <group>
      {[0, 1, 2].map((i) => (
        <group key={i} ref={(g) => void (refs.current[i] = g)}>
          <mesh geometry={assets.panel} material={m.glass} />
          <lineSegments geometry={assets.panelEdges} material={m.edge} />
          <mesh geometry={assets.screenGeo} material={assets.screens[i]} position={[0, 0, 0.02]} />
        </group>
      ))}
    </group>
  );
}

// ── AI: a lattice that thinks ─────────────────────────────────────────────────
function FormAI({ index, m }: { index: number; m: Mats }) {
  const group = useRef<Group>(null);
  const nodesRef = useRef<InstancedMesh>(null);
  const assets = useMemo(() => {
    const n = 64;
    const pts: Vector3[] = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      pts.push(new Vector3(Math.cos(golden * i) * r, y, Math.sin(golden * i) * r).multiplyScalar(1.25));
    }
    const seg: number[] = [];
    const seen = new Set<string>();
    pts.forEach((p, i) => {
      pts
        .map((q, j) => ({ j, d: p.distanceTo(q) }))
        .filter((x) => x.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3)
        .forEach(({ j }) => {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (seen.has(key)) return;
          seen.add(key);
          seg.push(p.x, p.y, p.z, pts[j].x, pts[j].y, pts[j].z);
        });
    });
    const lines = new BufferGeometry();
    lines.setAttribute("position", new BufferAttribute(new Float32Array(seg), 3));
    const core = new IcosahedronGeometry(0.34, 1);
    return { pts, lines, core, coreEdges: new EdgesGeometry(core), node: new SphereGeometry(0.045, 10, 8), m4: new Matrix4(), c: new Color() };
  }, []);
  useFrame((_, dt) => {
    if (hidden()) return;
    const a = formsState.activity[index];
    if (group.current) group.current.rotation.y += dt * (0.08 + 0.25 * a) * frame.motion;
    const nodes = nodesRef.current;
    if (!nodes) return;
    const t = frame.elapsed;
    assets.pts.forEach((p, i) => {
      const pulse = Math.max(0, Math.sin(t * 2.2 - p.y * 3 + hash(i) * 6.28)) ** 6 * a;
      const s = 1 + pulse * 0.8;
      assets.m4.makeScale(s, s, s).setPosition(p);
      nodes.setMatrixAt(i, assets.m4);
      nodes.setColorAt(i, assets.c.copy(SILVER).lerp(EMBER, pulse));
    });
    nodes.instanceMatrix.needsUpdate = true;
    if (nodes.instanceColor) nodes.instanceColor.needsUpdate = true;
  });
  return (
    <group ref={group} position={[0, 0.4, 0]}>
      <lineSegments geometry={assets.lines} material={m.edge} />
      <instancedMesh ref={nodesRef} args={[assets.node, m.node, assets.pts.length]} instanceMatrix-usage={DynamicDrawUsage} />
      <mesh geometry={assets.core} material={m.accent} scale={0.9} />
      <lineSegments geometry={assets.coreEdges} material={m.edge} scale={1.35} />
    </group>
  );
}

// ── SOFTWARE: the system behind the business ──────────────────────────────────
const MODULES = [
  { x: -0.95, z: -0.55, w: 0.6, d: 0.55, h: 1.25 },
  { x: -0.2, z: -0.55, w: 0.6, d: 0.55, h: 0.8 },
  { x: 0.55, z: -0.55, w: 0.6, d: 0.55, h: 1.05 },
  { x: -0.95, z: 0.3, w: 0.6, d: 0.55, h: 0.55 },
  { x: -0.2, z: 0.3, w: 0.6, d: 0.55, h: 0.35 },
];

function FormSoftware({ index, m }: { index: number; m: Mats }) {
  const assets = useMemo(() => {
    const platform = new BoxGeometry(3.1, 0.07, 2.1);
    const modules = MODULES.map((mod) => new BoxGeometry(mod.w, mod.h, mod.d));
    const disc = new CylinderGeometry(0.34, 0.34, 0.16, 32);
    const trace = new BufferGeometry();
    const pts = [
      [-0.95, -0.2, -0.2, -0.2],
      [-0.2, -0.2, 0.55, -0.2],
      [0.55, -0.2, 0.55, 0.3],
      [0.55, 0.3, 0.95, 0.3],
      [-0.95, -0.2, -0.95, 0.02],
      [-0.2, 0.02, -0.2, -0.2],
    ].flatMap(([x1, z1, x2, z2]) => [x1, 0.045, z1, x2, 0.045, z2]);
    trace.setAttribute("position", new BufferAttribute(new Float32Array(pts), 3));
    return {
      platform,
      platformEdges: edgesOf(platform),
      modules,
      moduleEdges: modules.map(edgesOf),
      disc,
      discEdges: edgesOf(disc),
      trace,
      top: new PlaneGeometry(1, 1),
      topMats: MODULES.map(() => new MeshStandardMaterial({ color: "#1a2a34", emissive: EMBER, emissiveIntensity: 0 })),
    };
  }, []);
  useFrame(() => {
    if (hidden()) return;
    const a = formsState.activity[index];
    const t = frame.elapsed;
    assets.topMats.forEach((mat, i) => {
      mat.emissiveIntensity = a * (0.3 + 0.7 * Math.max(0, Math.sin(t * 1.6 - i * 0.9)) ** 4);
    });
  });
  return (
    <group position={[0, -0.55, 0]}>
      <mesh geometry={assets.platform} material={m.solid} />
      <lineSegments geometry={assets.platformEdges} material={m.edge} />
      <lineSegments geometry={assets.trace} material={m.edge} />
      {MODULES.map((mod, i) => (
        <group key={i} position={[mod.x, 0.035 + mod.h / 2, mod.z]}>
          <mesh geometry={assets.modules[i]} material={m.glass} />
          <lineSegments geometry={assets.moduleEdges[i]} material={m.edge} />
          <mesh
            geometry={assets.top}
            material={assets.topMats[i]}
            position={[0, mod.h / 2 + 0.002, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            scale={[mod.w * 0.8, mod.d * 0.8, 1]}
          />
        </group>
      ))}
      {/* the database */}
      {[0, 1, 2].map((k) => (
        <group key={k} position={[0.95, 0.12 + k * 0.2, 0.3]}>
          <mesh geometry={assets.disc} material={k === 2 ? m.accent : m.solid} />
          <lineSegments geometry={assets.discEdges} material={m.edge} />
        </group>
      ))}
    </group>
  );
}

// ── AUTOMATION: work that moves by itself ─────────────────────────────────────
function FormAutomation({ index, m }: { index: number; m: Mats }) {
  const packetsRef = useRef<InstancedMesh>(null);
  const phase = useRef(0);
  const assets = useMemo(() => {
    const curve = new CatmullRomCurve3(
      [
        new Vector3(-1.3, 0.9, 0),
        new Vector3(0, 1.25, 0.4),
        new Vector3(1.3, 0.9, 0),
        new Vector3(1.45, -0.2, -0.3),
        new Vector3(0.6, -0.9, 0),
        new Vector3(-0.6, -0.9, 0.35),
        new Vector3(-1.45, -0.2, -0.2),
      ],
      true,
      "centripetal",
    );
    const zAxis = new Vector3(0, 0, 1);
    const gates = [0.08, 0.42, 0.72].map((u) => ({
      p: curve.getPointAt(u),
      q: new Quaternion().setFromUnitVectors(zAxis, curve.getTangentAt(u)),
    }));
    return {
      curve,
      gates,
      track: new TubeGeometry(curve, 180, 0.022, 8, true),
      gate: new TorusGeometry(0.2, 0.018, 8, 40),
      packet: new BoxGeometry(0.11, 0.11, 0.11),
      m4: new Matrix4(),
      v: new Vector3(),
      s: new Vector3(),
      count: 12,
    };
  }, []);
  useFrame((_, dt) => {
    if (hidden()) return;
    const a = formsState.activity[index];
    phase.current += dt * (0.03 + 0.12 * a) * frame.motion;
    const packets = packetsRef.current;
    if (!packets) return;
    for (let i = 0; i < assets.count; i++) {
      const u = (phase.current + i / assets.count) % 1;
      assets.curve.getPointAt(u, assets.v);
      const s = 0.8 + 0.4 * a;
      assets.m4.makeRotationY(u * Math.PI * 6).scale(assets.s.set(s, s, s)).setPosition(assets.v);
      packets.setMatrixAt(i, assets.m4);
    }
    packets.instanceMatrix.needsUpdate = true;
  });
  return (
    <group position={[0, 0.2, 0]}>
      <mesh geometry={assets.track} material={m.node} />
      {assets.gates.map((g, i) => (
        <mesh key={i} geometry={assets.gate} material={m.accent} position={g.p} quaternion={g.q} />
      ))}
      <instancedMesh ref={packetsRef} args={[assets.packet, m.glass, assets.count]} instanceMatrix-usage={DynamicDrawUsage} />
    </group>
  );
}

// ── MOBILE: in your customers' pockets ────────────────────────────────────────
function FormMobile({ index, m }: { index: number; m: Mats }) {
  const front = useRef<Group>(null);
  const back = useRef<Group>(null);
  const note = useRef<Group>(null);
  const assets = useMemo(
    () => ({
      screen: new MeshBasicMaterial({ map: uiTexture("app"), toneMapped: false, transparent: true }),
      screenGeo: new PlaneGeometry(0.86, 1.78),
    }),
    [],
  );
  useFrame(() => {
    if (hidden()) return;
    const a = formsState.activity[index];
    const t = frame.elapsed;
    if (front.current) {
      front.current.position.set(0.42 + 0.12 * a, Math.sin(t * 0.9) * 0.04, 0.3 + 0.2 * a);
      front.current.rotation.y = -0.28 - 0.1 * a;
    }
    if (back.current) {
      back.current.position.set(-0.52 - 0.15 * a, 0.18 + Math.sin(t * 0.9 + 1.4) * 0.04, -0.35);
      back.current.rotation.y = 0.35 + 0.1 * a;
    }
    if (note.current) {
      const pop = smoothstep(0.35, 0.8, a);
      note.current.scale.setScalar(Math.max(0.0001, pop));
      note.current.position.set(0.72, 1.18 + pop * 0.12, 0.55);
    }
    assets.screen.opacity = (0.5 + 0.5 * a) * formsState.presence;
  });
  return (
    <group position={[0, 0.2, 0]}>
      <group ref={back}>
        <RoundedBox args={[0.95, 1.95, 0.08]} radius={0.1} smoothness={3} material={m.solid} />
        <mesh geometry={assets.screenGeo} material={assets.screen} position={[0, 0, 0.042]} />
      </group>
      <group ref={front}>
        <RoundedBox args={[0.95, 1.95, 0.08]} radius={0.1} smoothness={3} material={m.solid} />
        <mesh geometry={assets.screenGeo} material={assets.screen} position={[0, 0, 0.042]} />
      </group>
      <group ref={note}>
        <RoundedBox args={[0.5, 0.16, 0.04]} radius={0.06} smoothness={3} material={m.accent} />
      </group>
    </group>
  );
}

// ── CUSTOM: not limited to a box ──────────────────────────────────────────────
const BOX = 1.6;

function FormCustom({ index, m }: { index: number; m: Mats }) {
  const walls = useRef<(Group | null)[]>([]);
  const lid = useRef<Group>(null);
  const ribbon = useRef<Group>(null);
  const assets = useMemo(() => {
    const face = new PlaneGeometry(BOX, BOX);
    // a half-twisted ribbon, silver turning to ember — the same gesture as the Boaive mark
    const mobius = new ParametricGeometry(
      (u: number, v: number, target: Vector3) => {
        const a = u * Math.PI * 2;
        const w = (v - 0.5) * 0.55;
        const r = 0.62 + w * Math.cos(a / 2);
        target.set(r * Math.cos(a), w * Math.sin(a / 2) * 1.2, r * Math.sin(a));
      },
      160,
      8,
    );
    const uv = mobius.attributes.uv;
    const colors = new Float32Array(uv.count * 3);
    const c = new Color();
    for (let i = 0; i < uv.count; i++) {
      c.copy(SILVER).lerp(EMBER, smoothstep(0.3, 0.9, Math.abs(Math.sin(uv.getX(i) * Math.PI))));
      colors.set([c.r, c.g, c.b], i * 3);
    }
    mobius.setAttribute("color", new BufferAttribute(colors, 3));
    return {
      face,
      faceEdges: edgesOf(face),
      mobius,
      ribbonMat: new MeshStandardMaterial({ vertexColors: true, metalness: 0.75, roughness: 0.22, side: DoubleSide, emissive: EMBER, emissiveIntensity: 0.15 }),
      // flat panels: one pass is enough (transparent + double-sided would be drawn twice, re-checking the shader each time)
      faceMat: new MeshStandardMaterial({ color: "#0e1c25", metalness: 0.3, roughness: 0.25, transparent: true, opacity: 0.55, side: DoubleSide, forceSinglePass: true }),
    };
  }, []);
  useFrame((_, dt) => {
    if (hidden()) return;
    const a = easeInOutCubic(clamp(formsState.activity[index]));
    walls.current.forEach((g) => {
      if (g) g.rotation.x = a * 1.25; // fold outward around the bottom edge
    });
    if (lid.current) {
      lid.current.position.y = BOX + a * 0.9;
      lid.current.rotation.x = -a * 0.5;
    }
    if (ribbon.current) {
      ribbon.current.scale.setScalar(0.35 + 0.65 * a);
      ribbon.current.position.y = BOX * 0.5 + a * 0.55;
      ribbon.current.rotation.y += dt * (0.2 + 0.6 * a) * frame.motion;
      ribbon.current.rotation.z = 0.35;
    }
    assets.faceMat.opacity = (0.35 + 0.25 * (1 - a)) * formsState.presence;
    assets.ribbonMat.emissiveIntensity = 0.1 + 0.5 * a;
  });
  return (
    <group position={[0, -0.8, 0]}>
      <mesh geometry={assets.face} material={assets.faceMat} rotation={[-Math.PI / 2, 0, 0]} />
      <lineSegments geometry={assets.faceEdges} material={m.edge} rotation={[-Math.PI / 2, 0, 0]} />
      {[0, 1, 2, 3].map((i) => (
        <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
          <group position={[0, 0, BOX / 2]}>
            <group ref={(g) => void (walls.current[i] = g)}>
              <mesh geometry={assets.face} material={assets.faceMat} position={[0, BOX / 2, 0]} />
              <lineSegments geometry={assets.faceEdges} material={m.edge} position={[0, BOX / 2, 0]} />
            </group>
          </group>
        </group>
      ))}
      <group ref={lid} position={[0, BOX, 0]}>
        <mesh geometry={assets.face} material={assets.faceMat} rotation={[-Math.PI / 2, 0, 0]} />
        <lineSegments geometry={assets.faceEdges} material={m.edge} rotation={[-Math.PI / 2, 0, 0]} />
      </group>
      <group ref={ribbon}>
        <mesh geometry={assets.mobius} material={assets.ribbonMat} />
      </group>
    </group>
  );
}

const FORMS = [FormWeb, FormAI, FormSoftware, FormAutomation, FormMobile, FormCustom];

/** A form on the ring, facing outward (toward the camera's orbit). */
function Station({ index, children }: { index: number; children: ReactNode }) {
  const pos = useMemo(() => formPosition(index), [index]);
  return (
    <group position={pos} rotation={[0, Math.PI / 2 - formAngle(index), 0]}>
      {children}
    </group>
  );
}

export function CapabilityForms() {
  const group = useRef<Group>(null);
  const mats = useMemo(() => Array.from({ length: FORM_COUNT }, createFormMaterials), []);
  useFrame(() => {
    if (group.current) group.current.visible = formsState.presence > 0.002;
    mats.forEach((m, i) => applyActivity(m, formsState.activity[i], formsState.presence));
  });
  return (
    <group ref={group}>
      {FORMS.map((Form, i) => (
        <Station key={i} index={i}>
          <Form index={i} m={mats[i]} />
        </Station>
      ))}
    </group>
  );
}
