#!/usr/bin/env node
/**
 * Capture real visuals of a live project for the portfolio.
 *
 *   npm run capture -- <slug> <url> [--at=<stops>] [--page=<name>:<url>] [--no-video]
 *
 *   --at     Where to take the desktop section shots, separated by "|". Each stop is a CSS selector
 *            ("#pricing"), "text:<heading text>", a pixel offset ("1800") or a fraction ("0.4").
 *            Default: three evenly spaced fractions.
 *   --page   Extra page to capture as page-<name>.webp (repeatable), e.g. a client portal.
 *
 * Writes to public/work/<slug>/:
 *   poster.webp        1600×1000  desktop first screen (3D screen + cards)
 *   poster-sm.webp      800×500   small variant for low-tier devices
 *   desktop-{n}.webp   1600×1000  desktop sections
 *   mobile-{n}.webp     720×1558  phone screenshots (first screen + first stop)
 *   page-{name}.webp   1600×1000  extra pages
 *   tour.mp4           1280×800   silent scroll-through (H.264, faststart)
 *
 * Requirements: a local Chrome/Edge (CHROME_PATH to override) and ffmpeg on PATH for the video.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import puppeteer from "puppeteer-core";
import sharp from "sharp";

const args = process.argv.slice(2);
const [slug, url] = args.filter((a) => !a.startsWith("--"));
if (!slug || !url) {
  console.error("Usage: npm run capture -- <slug> <url> [--at=#a|text:Heading|0.5] [--page=name:url] [--no-video]");
  process.exit(1);
}
const flag = (name) => args.filter((a) => a.startsWith(`--${name}=`)).map((a) => a.slice(name.length + 3));
const withVideo = !args.includes("--no-video");
const stops = flag("at")[0]?.split("|").filter(Boolean) ?? ["0.25", "0.5", "0.75"];
const extraPages = flag("page").map((p) => {
  const i = p.indexOf(":");
  return { name: p.slice(0, i), url: p.slice(i + 1) };
});

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const executablePath = CHROME_CANDIDATES.find((p) => existsSync(p));
if (!executablePath) {
  console.error("No Chrome/Edge found. Set CHROME_PATH.");
  process.exit(1);
}

const outDir = path.join(process.cwd(), "public", "work", slug);
mkdirSync(outDir, { recursive: true });
const tmp = path.join(tmpdir(), `boaive-capture-${slug}-${Date.now()}`);
mkdirSync(tmp, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Resolve a stop to an absolute scroll offset inside the page. */
async function resolveStop(page, stop) {
  return page.evaluate((stop) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const clamp = (v) => Math.max(0, Math.min(max, Math.round(v)));
    if (/^\d*\.\d+$/.test(stop)) return clamp(max * Number(stop));
    if (/^\d+$/.test(stop)) return clamp(Number(stop));
    let el = null;
    if (stop.startsWith("text:")) {
      const needle = stop.slice(5).toLowerCase();
      el = [...document.querySelectorAll("h1,h2,h3")].find((h) => h.textContent.toLowerCase().includes(needle));
      el = el?.closest("section") ?? el;
    } else {
      el = document.querySelector(stop);
    }
    if (!el) return null;
    return clamp(el.getBoundingClientRect().top + window.scrollY);
  }, stop);
}

/** Smoothly scroll to an absolute offset. */
async function scrollTo(page, to, durationMs) {
  await page.evaluate(
    async ({ to, durationMs }) => {
      const from = window.scrollY;
      if (durationMs <= 0) return void window.scrollTo(0, to);
      const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      await new Promise((resolve) => {
        const start = performance.now();
        const step = (now) => {
          const t = Math.min(1, (now - start) / durationMs);
          window.scrollTo(0, from + (to - from) * ease(t));
          if (t < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });
    },
    { to, durationMs },
  );
}

async function openPage(browser, target, viewport) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  await page.goto(target, { waitUntil: "networkidle2", timeout: 90_000 });
  await sleep(3000); // let intro animations settle
  return page;
}

async function toWebp(input, output, width, height) {
  await sharp(input).resize(width, height, { fit: "cover", position: "top" }).webp({ quality: 82, effort: 6 }).toFile(output);
  console.log("  ✓", path.relative(process.cwd(), output));
}

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--hide-scrollbars", "--autoplay-policy=no-user-gesture-required"],
});

try {
  console.log(`Capturing ${slug} ← ${url}`);

  // Desktop stills
  const desktop = await openPage(browser, url, { width: 1440, height: 900, deviceScaleFactor: 1.5 });
  const heroPng = path.join(tmp, "desktop-0.png");
  await desktop.screenshot({ path: heroPng });
  await toWebp(heroPng, path.join(outDir, "poster.webp"), 1600, 1000);
  await toWebp(heroPng, path.join(outDir, "poster-sm.webp"), 800, 500);
  const offsets = [];
  for (const stop of stops) {
    const y = await resolveStop(desktop, stop);
    if (y == null) {
      console.warn(`  ! stop "${stop}" not found — skipped`);
      continue;
    }
    offsets.push({ stop, y });
    await scrollTo(desktop, y, 1000);
    await sleep(1800); // reveal animations
    const png = path.join(tmp, `desktop-${offsets.length}.png`);
    await desktop.screenshot({ path: png });
    await toWebp(png, path.join(outDir, `desktop-${offsets.length}.webp`), 1600, 1000);
  }
  await desktop.close();

  // Mobile stills: first screen + first stop
  const mobile = await openPage(browser, url, { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const mobileStops = [null, stops[0]];
  for (const [i, stop] of mobileStops.entries()) {
    if (stop) {
      const y = await resolveStop(mobile, stop);
      if (y == null) continue;
      await scrollTo(mobile, y, 800);
      await sleep(1800);
    }
    const png = path.join(tmp, `mobile-${i + 1}.png`);
    await mobile.screenshot({ path: png });
    await toWebp(png, path.join(outDir, `mobile-${i + 1}.webp`), 720, 1558);
  }
  await mobile.close();

  // Extra pages
  for (const extra of extraPages) {
    const page = await openPage(browser, extra.url, { width: 1440, height: 900, deviceScaleFactor: 1.5 });
    const png = path.join(tmp, `page-${extra.name}.png`);
    await page.screenshot({ path: png });
    await toWebp(png, path.join(outDir, `page-${extra.name}.webp`), 1600, 1000);
    await page.close();
  }

  // Scroll-through video
  if (withVideo) {
    const hasFfmpeg = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status === 0;
    if (!hasFfmpeg) {
      console.warn("  ! ffmpeg not found — skipping video");
    } else {
      const page = await openPage(browser, url, { width: 1280, height: 800, deviceScaleFactor: 1 });
      const raw = path.join(tmp, "tour.webm");
      const recorder = await page.screencast({ path: raw, quality: 18 });
      await sleep(2000);
      for (const { stop } of offsets) {
        const y = await resolveStop(page, stop);
        if (y == null) continue;
        await scrollTo(page, y, 1500);
        await sleep(1700);
      }
      await scrollTo(page, 0, 1800);
      await sleep(1000);
      await recorder.stop();
      await page.close();
      const mp4 = path.join(outDir, "tour.mp4");
      const res = spawnSync(
        "ffmpeg",
        ["-y", "-loglevel", "error", "-i", raw, "-vf", "fps=30,scale=1280:800:flags=lanczos,format=yuv420p", "-c:v", "libx264", "-preset", "slow", "-crf", "27", "-movflags", "+faststart", "-an", mp4],
        { stdio: "inherit" },
      );
      if (res.status === 0) console.log("  ✓", path.relative(process.cwd(), mp4));
    }
  }
} finally {
  await browser.close();
  rmSync(tmp, { recursive: true, force: true });
}
