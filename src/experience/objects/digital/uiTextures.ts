import { CanvasTexture, SRGBColorSpace } from "three";
import { hash } from "../../math";

/**
 * Minimal interface drawings (drawn once into canvases) that make the abstract forms read as
 * real products: a website, a mobile app, a dashboard. Silver structure, one ember accent.
 */
type Kind = "website" | "app" | "dashboard";

const C = {
  bg: "#0b151c",
  panel: "#13222c",
  line: "#5f7c89",
  soft: "#2b3f4a",
  text: "#a8bcc5",
  accent: "#ff8a2a",
};

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function lines(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, count: number, gap: number, seed: number, color = C.line) {
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    const lw = w * (0.45 + hash(seed + i * 1.7) * 0.55);
    rr(ctx, x, y + i * gap, lw, gap * 0.34, gap * 0.17);
    ctx.fill();
  }
}

function drawWebsite(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  // browser chrome
  ctx.fillStyle = C.panel;
  ctx.fillRect(0, 0, W, H * 0.09);
  ["#56666f", "#56666f", "#56666f"].forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(W * 0.03 + i * W * 0.025, H * 0.045, H * 0.012, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = C.soft;
  rr(ctx, W * 0.14, H * 0.025, W * 0.5, H * 0.04, H * 0.02);
  ctx.fill();
  // nav
  lines(ctx, W * 0.06, H * 0.14, W * 0.12, 1, H * 0.04, 3, C.text);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = C.line;
    rr(ctx, W * (0.55 + i * 0.08), H * 0.145, W * 0.05, H * 0.012, 3);
    ctx.fill();
  }
  // hero
  ctx.fillStyle = C.text;
  rr(ctx, W * 0.06, H * 0.26, W * 0.5, H * 0.05, 6);
  ctx.fill();
  rr(ctx, W * 0.06, H * 0.33, W * 0.36, H * 0.05, 6);
  ctx.fill();
  lines(ctx, W * 0.06, H * 0.42, W * 0.38, 3, H * 0.035, 11);
  ctx.fillStyle = C.accent;
  rr(ctx, W * 0.06, H * 0.56, W * 0.14, H * 0.055, 6);
  ctx.fill();
  // hero image block
  const g = ctx.createLinearGradient(W * 0.62, H * 0.24, W * 0.94, H * 0.6);
  g.addColorStop(0, "#1f3440");
  g.addColorStop(1, "#122029");
  ctx.fillStyle = g;
  rr(ctx, W * 0.62, H * 0.24, W * 0.32, H * 0.38, 10);
  ctx.fill();
  // cards
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = C.panel;
    rr(ctx, W * (0.06 + i * 0.3), H * 0.7, W * 0.27, H * 0.24, 10);
    ctx.fill();
    lines(ctx, W * (0.08 + i * 0.3), H * 0.76, W * 0.2, 3, H * 0.04, 20 + i * 5);
  }
}

function drawApp(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.text;
  rr(ctx, W * 0.08, H * 0.07, W * 0.4, H * 0.03, 6);
  ctx.fill();
  // balance / hero card
  ctx.fillStyle = C.panel;
  rr(ctx, W * 0.08, H * 0.14, W * 0.84, H * 0.2, 18);
  ctx.fill();
  ctx.fillStyle = C.accent;
  rr(ctx, W * 0.14, H * 0.2, W * 0.34, H * 0.035, 8);
  ctx.fill();
  lines(ctx, W * 0.14, H * 0.27, W * 0.5, 1, H * 0.03, 5);
  // list
  for (let i = 0; i < 5; i++) {
    const y = H * (0.4 + i * 0.1);
    ctx.fillStyle = C.soft;
    ctx.beginPath();
    ctx.arc(W * 0.15, y + H * 0.03, W * 0.05, 0, Math.PI * 2);
    ctx.fill();
    lines(ctx, W * 0.26, y + H * 0.012, W * 0.55, 2, H * 0.028, 30 + i * 3);
  }
  // tab bar
  ctx.fillStyle = C.panel;
  ctx.fillRect(0, H * 0.91, W, H * 0.09);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = i === 0 ? C.accent : C.line;
    ctx.beginPath();
    ctx.arc(W * (0.14 + i * 0.24), H * 0.955, W * 0.025, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawDashboard(ctx: CanvasRenderingContext2D, W: number, H: number) {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.panel;
  ctx.fillRect(0, 0, W * 0.16, H);
  lines(ctx, W * 0.03, H * 0.1, W * 0.1, 7, H * 0.07, 50);
  // KPI tiles
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = C.panel;
    rr(ctx, W * (0.2 + i * 0.26), H * 0.08, W * 0.23, H * 0.2, 10);
    ctx.fill();
    ctx.fillStyle = i === 1 ? C.accent : C.text;
    rr(ctx, W * (0.23 + i * 0.26), H * 0.15, W * 0.09, H * 0.05, 5);
    ctx.fill();
  }
  // chart
  ctx.fillStyle = C.panel;
  rr(ctx, W * 0.2, H * 0.34, W * 0.49, H * 0.58, 10);
  ctx.fill();
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = Math.max(2, W * 0.005);
  ctx.beginPath();
  for (let i = 0; i <= 12; i++) {
    const x = W * (0.23 + (i / 12) * 0.43);
    const y = H * (0.82 - 0.35 * (0.3 + 0.7 * hash(i * 2.3 + 7)) * (0.4 + i / 20));
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  // table
  ctx.fillStyle = C.panel;
  rr(ctx, W * 0.72, H * 0.34, W * 0.24, H * 0.58, 10);
  ctx.fill();
  lines(ctx, W * 0.75, H * 0.4, W * 0.18, 9, H * 0.055, 70);
}

const cache = new Map<Kind, CanvasTexture>();

export function uiTexture(kind: Kind): CanvasTexture {
  const hit = cache.get(kind);
  if (hit) return hit;
  const canvas = document.createElement("canvas");
  const W = kind === "app" ? 360 : 1024;
  const H = kind === "app" ? 740 : 640;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  if (kind === "website") drawWebsite(ctx, W, H);
  else if (kind === "app") drawApp(ctx, W, H);
  else drawDashboard(ctx, W, H);
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  cache.set(kind, tex);
  return tex;
}
