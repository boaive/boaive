/**
 * Frame cost per story point: fps, main-thread ms (all rAF callbacks), GPU ms (timer query around each
 * render), draw calls and triangles — at fixed canvas pixel ratios. Defaults to a phone (392×840 @2.75,
 * low tier). Compare numbers between runs on the same machine; the GPU column is meaningless with CPU throttling.
 *
 *   node scripts/qa/perf.mjs <url> [w] [h] [chapter:progress...]
 *   env DPR   device pixel ratio (default 2.75)
 *       DPRS  canvas pixel ratios to measure (default "1,1.75")
 *       CPU   CDP CPU throttling rate, e.g. 6 ≈ a mid-range phone's main thread (default 1)
 *
 * e.g. node scripts/qa/perf.mjs "http://localhost:3000/?quality=low" 392 840 process:0.2 work:0.2
 */
import { launch, sleep } from "./browser.mjs";
import { instrument } from "./perf-instrument.mjs";

const [rawUrl, w = "392", h = "840", ...rest] = process.argv.slice(2);
if (!rawUrl) {
  console.error("Usage: node scripts/qa/perf.mjs <url> [w] [h] [chapter:progress...]");
  process.exit(1);
}
const points = rest.length ? rest : ["float:0.3", "dive:0.5", "problem:0.4", "capabilities:0.4", "process:0.2", "work:0.2", "outcome:0.5", "studio:0.5", "contact:0.8"];
const dprs = (process.env.DPRS ?? "1,1.75").split(",").map(Number);
const cpuRate = Number(process.env.CPU ?? 1);
// ?dpr= pins the pixel ratio, so the adaptive resolution doesn't fight the measurement
const url = new URL(rawUrl);
if (!url.searchParams.has("dpr")) url.searchParams.set("dpr", String(dprs[0]));

const browser = await launch();
const page = await browser.newPage();
await page.evaluateOnNewDocument(instrument);
await page.setViewport({ width: +w, height: +h, deviceScaleFactor: Number(process.env.DPR ?? 2.75), isMobile: +w < 700, hasTouch: +w < 700 });
await page.goto(url.href, { waitUntil: "networkidle2", timeout: 120000 });
await sleep(5000); // shader warm-up and texture uploads
if (cpuRate > 1) {
  const cdp = await page.createCDPSession();
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpuRate });
}

const info = await page.evaluate(() => ({ timer: window.__perf.hasTimer, stage: document.documentElement.dataset.stage }));
console.log(`stage: ${info.stage} · GPU timer: ${info.timer ? "yes" : "no"} · CPU throttle: ${cpuRate}x`);
console.log("point".padEnd(18), dprs.map((d) => `@${d}: fps   cpu   gpu calls    tris`.padEnd(40)).join(""));

for (const p of points) {
  const [id, prog] = p.split(":");
  await page.evaluate(
    ({ id, prog }) => {
      const el = document.getElementById(id);
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, Math.round(top + (el.offsetHeight - window.innerHeight) * Number(prog)));
    },
    { id, prog },
  );
  await sleep(1500);
  const cols = [];
  for (const d of dprs) {
    const r = await page.evaluate(async (d) => {
      const perf = window.__perf;
      const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      perf.renderer.setPixelRatio(d);
      await wait(500);
      perf.frames = [];
      perf.recording = true;
      await wait(2000);
      perf.recording = false;
      await wait(400); // let the last GPU timings land
      const f = perf.frames.slice(2);
      const avg = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
      const dt = f.slice(1).map((x, i) => x.t - f[i].t);
      return {
        fps: 1000 / avg(dt),
        cpu: avg(f.map((x) => x.cpu)),
        gpu: avg(f.map((x) => x.gpu).filter((x) => x != null)),
        calls: avg(f.map((x) => x.calls)),
        tris: perf.renderer.info.render.triangles,
      };
    }, d);
    cols.push(`${r.fps.toFixed(0).padStart(7)} ${r.cpu.toFixed(1).padStart(5)} ${r.gpu.toFixed(2).padStart(5)} ${r.calls.toFixed(0).padStart(5)} ${String(r.tris).padStart(7)}`.padEnd(40));
  }
  console.log(p.padEnd(18), cols.join(""));
}
await browser.close();
