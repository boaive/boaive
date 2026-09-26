"use client";

import { useEffect, useRef, useState } from "react";
import { story } from "@/story/store";
import { bench, debugLog, stageStats } from "./debug";

/** What the GPU behind the stage can do (read from the live context when there is one). */
function gpuReport(): string[] {
  const live = document.querySelector<HTMLCanvasElement>("canvas");
  const gl = (live?.getContext("webgl2") ?? document.createElement("canvas").getContext("webgl2")) as WebGL2RenderingContext | null;
  if (!gl) return ["webgl2: not available"];
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const highp = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  const exts = gl.getSupportedExtensions() ?? [];
  const has = (name: string) => (exts.includes(name) ? "yes" : "no");
  return [
    `gpu: ${info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER)}`,
    `vendor: ${info ? gl.getParameter(info.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR)}`,
    `fragment highp: ${highp && highp.precision > 0 ? `${highp.precision} bits` : "no"} · depth bits: ${gl.getParameter(gl.DEPTH_BITS)}`,
    `max texture: ${gl.getParameter(gl.MAX_TEXTURE_SIZE)} · frag uniforms: ${gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS)} · varyings: ${gl.getParameter(gl.MAX_VARYING_VECTORS)}`,
    `color_buffer_float: ${has("EXT_color_buffer_float")} · half_float: ${has("EXT_color_buffer_half_float")} · parallel compile: ${has("KHR_parallel_shader_compile")}`,
    `context lost: ${gl.isContextLost() ? "yes" : "no"}`,
  ];
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Frames per second over `ms`, counted with requestAnimationFrame. */
function measureFps(ms: number): Promise<number> {
  return new Promise((resolve) => {
    let frames = 0;
    let first = 0;
    const tick = (t: number) => {
      if (!first) first = t;
      else frames += 1;
      if (t - first < ms) requestAnimationFrame(tick);
      else resolve(Math.round((frames * 1000) / (t - first)));
    };
    requestAnimationFrame(tick);
  });
}

/**
 * The on-device test: the same spot measured as is, at lower pixel ratios, and with drawing skipped.
 * If fewer pixels help, the GPU is filling pixels too slowly; if only "no drawing" helps, it's the
 * number of things drawn; if nothing helps, it's scripts or the page itself.
 */
async function runTest(): Promise<string> {
  const steps: { label: string; dpr: number; skip: boolean }[] = [
    { label: "as is", dpr: 0, skip: false },
    { label: "dpr 1", dpr: 1, skip: false },
    { label: "dpr 0.5", dpr: 0.5, skip: false },
    { label: "no drawing", dpr: 0, skip: true },
  ];
  const where = `${story.active} ${(story.progress[story.active] ?? 0).toFixed(2)}`;
  const results: string[] = [];
  bench.active = true;
  try {
    for (const step of steps) {
      bench.dpr = step.dpr;
      bench.skipRender = step.skip;
      await wait(700);
      const fps = await measureFps(2500);
      results.push(`${step.label}${step.skip ? "" : ` (${stageStats.dpr.toFixed(2)}×)`}: ${fps} fps, js ${stageStats.frameMs.toFixed(1)} ms`);
    }
  } finally {
    bench.active = false;
    bench.dpr = 0;
    bench.skipRender = false;
  }
  return `test at ${where}: ${results.join(" | ")}`;
}

/** A copyable diagnostics report, shown with `?debug` on the home page. */
export default function DebugPanel() {
  const [report, setReport] = useState("");
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const tests = useRef<string[]>([]);

  useEffect(() => {
    let frames = 0;
    let fps = 0;
    let last = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      frames += 1;
      if (t - last >= 1000) {
        fps = Math.round((frames * 1000) / (t - last));
        frames = 0;
        last = t;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const update = () => {
      const s = stageStats;
      const lines = [
        `Boaive debug · ${new Date().toISOString()}`,
        `url: ${location.href}`,
        `ua: ${navigator.userAgent}`,
        `screen: ${screen.width}×${screen.height} @${window.devicePixelRatio}x · viewport: ${innerWidth}×${innerHeight}`,
        `stage: ${story.stage} · quality: ${story.quality} · fps: ${fps} · reduced motion: ${story.reducedMotion}`,
        s.width
          ? `canvas: ${s.width}×${s.height} @ ${s.dpr.toFixed(2)}× · draw calls: ${s.calls} · triangles: ${s.triangles} · frame js: ${s.frameMs.toFixed(1)} ms`
          : "canvas: (not drawing yet)",
        ...gpuReport(),
        ...tests.current,
        `log (${debugLog.length}):`,
        ...(debugLog.length ? debugLog : ["(no errors)"]),
      ];
      setReport(lines.join("\n"));
    };
    update();
    const id = window.setInterval(update, 1000);
    return () => {
      window.clearInterval(id);
      cancelAnimationFrame(raf);
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked: select the text so it can be copied by hand
      const range = document.createRange();
      const node = document.getElementById("boaive-debug-report");
      if (node) {
        range.selectNodeContents(node);
        window.getSelection()?.removeAllRanges();
        window.getSelection()?.addRange(range);
      }
    }
  };

  const test = async () => {
    if (testing || !stageStats.width) return;
    setTesting(true);
    try {
      tests.current = [...tests.current, await runTest()].slice(-4);
    } finally {
      setTesting(false);
    }
  };

  const button: React.CSSProperties = {
    padding: "6px 10px",
    border: "1px solid rgba(243,240,235,.3)",
    borderRadius: 4,
    background: "rgba(255,138,42,.18)",
    color: "#f3f0eb",
    font: "600 12px system-ui, sans-serif",
  };

  return (
    <div
      role="region"
      aria-label="Debug report"
      style={{
        position: "fixed",
        left: 8,
        right: 8,
        bottom: 8,
        zIndex: 1000,
        maxHeight: open ? "46vh" : "auto",
        display: "grid",
        gridTemplateRows: "auto minmax(0, 1fr)",
        gap: 8,
        padding: 10,
        borderRadius: 6,
        border: "1px solid rgba(243,240,235,.2)",
        background: "rgba(5,8,12,.94)",
        color: "#f3f0eb",
      }}
    >
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <strong style={{ font: "600 12px system-ui, sans-serif", flex: 1 }}>{testing ? "Testing… keep still" : "Debug report"}</strong>
        <button type="button" style={button} onClick={test} disabled={testing}>
          {testing ? "…" : "Run test"}
        </button>
        <button type="button" style={button} onClick={copy}>
          {copied ? "Copied" : "Copy report"}
        </button>
        <button type="button" style={button} onClick={() => setOpen((o) => !o)}>
          {open ? "Hide" : "Show"}
        </button>
      </div>
      {open ? (
        <pre
          id="boaive-debug-report"
          style={{ margin: 0, overflow: "auto", font: "11px/1.45 ui-monospace, Menlo, monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        >
          {report}
        </pre>
      ) : null}
    </div>
  );
}
