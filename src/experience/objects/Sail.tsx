"use client";

import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { forwardRef, useMemo } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DoubleSide,
  type Group,
  MeshStandardMaterial,
  SRGBColorSpace,
} from "three";
import { frame } from "../frame";
import { hash } from "../math";

/**
 * Mast, boom and a mainsail woven from the "connected system" — the lattice of the
 * Outcome chapter, with the Boaive mark near the head. The finished product carries the boat.
 */
export const RIG = {
  mastX: 0.46,
  mastBottom: -0.1,
  mastTop: 3.15,
  boomY: 0.64,
  clewX: -1.12,
  headY: 3.02,
};

function createSailGeometry(segA = 18, segB = 22): BufferGeometry {
  const { mastX, boomY, clewX, headY } = RIG;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const width = mastX - clewX;
  for (let j = 0; j <= segB; j++) {
    const b = j / segB;
    for (let i = 0; i <= segA; i++) {
      const a = i / segA;
      // a runs along the foot (0 = mast, 1 = clew), b up the luff
      const x = mastX - a * (1 - b) * width;
      const y = boomY + 0.04 + b * (headY - boomY - 0.04) - a * (1 - b) * 0.02;
      const z = 0.26 * Math.sin(Math.PI * a) * Math.pow(1 - b, 0.9);
      positions.push(x, y, z);
      uvs.push((x - clewX) / width, (y - boomY) / (headY - boomY));
    }
  }
  const row = segA + 1;
  for (let j = 0; j < segB; j++) {
    for (let i = 0; i < segA; i++) {
      const p = j * row + i;
      indices.push(p, p + row, p + 1, p + 1, p + row, p + row + 1);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array(positions), 3));
  g.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}

/** Cloth + lattice + mark, drawn once into canvases (colour map and glow map). */
function paintSail(mark: HTMLImageElement) {
  const size = 1024;
  const make = () => {
    const c = document.createElement("canvas");
    c.width = c.height = size;
    return [c, c.getContext("2d")!] as const;
  };
  const [colour, cx] = make();
  const [glow, gx] = make();
  // UV space: tack (1,0) bottom-right, clew (0,0) bottom-left, head (1,1) top-right.
  const toPx = (u: number, v: number): [number, number] => [u * size, (1 - v) * size];
  const inside = (u: number, v: number) => u >= v + 0.04 && v >= 0.03 && u <= 0.97;

  cx.fillStyle = "#efe7da";
  cx.fillRect(0, 0, size, size);
  gx.fillStyle = "#2a1c12";
  gx.fillRect(0, 0, size, size);

  // cross-cut panel seams
  cx.strokeStyle = "rgba(60,40,20,0.10)";
  cx.lineWidth = 2;
  for (let k = 1; k < 8; k++) {
    const v = k / 8;
    cx.beginPath();
    cx.moveTo(...toPx(v, v));
    cx.lineTo(...toPx(1, v));
    cx.stroke();
  }

  // the connected system: nodes + links
  const nodes: [number, number][] = [];
  for (let i = 0; nodes.length < 22 && i < 400; i++) {
    const u = 0.12 + hash(i * 3.1) * 0.86;
    const v = 0.06 + hash(i * 7.7 + 1) * 0.78;
    if (inside(u, v) && !(u > 0.7 && v > 0.5 && v < 0.78)) nodes.push([u, v]);
  }
  const links: [number, number][] = [];
  nodes.forEach((a, i) => {
    const near = nodes
      .map((b, j) => ({ j, d: Math.hypot(a[0] - b[0], a[1] - b[1]) }))
      .filter((n) => n.j !== i)
      .sort((p, q) => p.d - q.d)
      .slice(0, 2);
    near.forEach((n) => {
      if (!links.some(([p, q]) => (p === n.j && q === i) || (p === i && q === n.j))) links.push([i, n.j]);
    });
  });
  for (const ctx of [cx, gx]) {
    ctx.strokeStyle = ctx === cx ? "rgba(242,112,14,0.85)" : "rgba(255,150,70,1)";
    ctx.lineWidth = ctx === cx ? 3 : 4;
    links.forEach(([i, j]) => {
      ctx.beginPath();
      ctx.moveTo(...toPx(...nodes[i]));
      ctx.lineTo(...toPx(...nodes[j]));
      ctx.stroke();
    });
    nodes.forEach(([u, v], i) => {
      ctx.fillStyle = ctx === cx ? "#f2700e" : "#ffb070";
      ctx.beginPath();
      ctx.arc(...toPx(u, v), i % 5 === 0 ? 11 : 7, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // the mark, near the head
  const h = size * 0.2;
  const w = h * (mark.width / mark.height);
  const [mx, my] = toPx(0.84, 0.66);
  cx.drawImage(mark, mx - w / 2, my - h / 2, w, h);
  gx.globalAlpha = 0.55;
  gx.drawImage(mark, mx - w / 2, my - h / 2, w, h);

  const map = new CanvasTexture(colour);
  const emissiveMap = new CanvasTexture(glow);
  map.colorSpace = emissiveMap.colorSpace = SRGBColorSpace;
  map.anisotropy = emissiveMap.anisotropy = 4;
  return { map, emissiveMap };
}

export const Sail = forwardRef<Group, { glow?: number }>(function Sail({ glow = 0.6 }, ref) {
  const mark = useTexture("/brand/mark-512.png");
  const assets = useMemo(() => {
    const { map, emissiveMap } = paintSail(mark.image as HTMLImageElement);
    const cloth = new MeshStandardMaterial({
      map,
      emissiveMap,
      emissive: new Color("#ffffff"),
      emissiveIntensity: glow,
      roughness: 0.92,
      side: DoubleSide,
    });
    const spar = new MeshStandardMaterial({ color: "#c4c7cc", metalness: 0.7, roughness: 0.35 });
    const mastLen = RIG.mastTop - RIG.mastBottom;
    const boomLen = RIG.mastX - RIG.clewX + 0.08;
    return {
      cloth,
      spar,
      sail: createSailGeometry(),
      mast: new CylinderGeometry(0.026, 0.03, mastLen, 10),
      mastLen,
      boom: new CylinderGeometry(0.022, 0.022, boomLen, 8),
      boomLen,
    };
  }, [mark, glow]);

  useFrame(() => {
    assets.cloth.emissiveIntensity = glow * (0.85 + 0.15 * Math.sin(frame.elapsed * 0.8));
  });

  return (
    <group ref={ref}>
      <mesh geometry={assets.mast} material={assets.spar} position={[RIG.mastX, RIG.mastBottom + assets.mastLen / 2, 0]} />
      <mesh
        geometry={assets.boom}
        material={assets.spar}
        position={[RIG.mastX - assets.boomLen / 2 + 0.04, RIG.boomY, 0]}
        rotation={[0, 0, Math.PI / 2]}
      />
      <mesh geometry={assets.sail} material={assets.cloth} />
    </group>
  );
});
