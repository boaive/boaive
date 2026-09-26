/**
 * QA for flowing pages (/work, /work/<slug>): scrolls through to trigger reveals, saves the
 * first screen and a full-page shot, and optionally hovers an element (e.g. a card's video).
 *
 *   node scripts/qa/page.mjs <url> <outPrefix> <width> <height> [hoverSelector]
 *   SHOTS=1 also saves a screenshot per scroll step. RM=1 emulates reduced motion.
 *
 * e.g. node scripts/qa/page.mjs http://localhost:3000/work .qa/archive 390 844 "#lab li:first-child article"
 */
import { ensureDir, launch, openPage, printLogs, sleep } from "./browser.mjs";

const [url, prefix, w = "1440", h = "900", hover] = process.argv.slice(2);
if (!url || !prefix) {
  console.error("Usage: node scripts/qa/page.mjs <url> <outPrefix> <width> <height> [hoverSelector]");
  process.exit(1);
}
ensureDir(prefix);

const browser = await launch();
const { page, logs } = await openPage(browser, url, +w, +h);
await sleep(1800);
await page.screenshot({ path: `${prefix}-00-top.png` });

const height = await page.evaluate(() => document.documentElement.scrollHeight);
let step = 1;
for (let y = 0; y < height; y += Math.round(+h * 0.8)) {
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await sleep(900);
  if (process.env.SHOTS) await page.screenshot({ path: `${prefix}-${String(step++).padStart(2, "0")}-y${y}.png` });
}
await page.evaluate(() => window.scrollTo(0, 0));
await sleep(600);
await page.screenshot({ path: `${prefix}-full.png`, fullPage: true });

if (hover) {
  const el = await page.$(hover);
  if (el) {
    await el.scrollIntoView();
    await sleep(600);
    await el.hover();
    await sleep(2500);
    const video = await page.evaluate((sel) => {
      const v = document.querySelector(sel)?.querySelector("video");
      return v ? { src: v.getAttribute("src"), paused: v.paused, time: v.currentTime } : null;
    }, hover);
    console.log("hover video:", JSON.stringify(video));
    await page.screenshot({ path: `${prefix}-hover.png` });
  } else {
    console.log("hover target not found:", hover);
  }
}

const report = await page.evaluate(() => ({
  reveals: `${document.querySelectorAll("[data-revealed]").length}/${document.querySelectorAll("[data-reveal]").length}`,
  horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
}));
console.log(JSON.stringify({ ...report, height }));
printLogs(logs);
await browser.close();
