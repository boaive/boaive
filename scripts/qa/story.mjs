/**
 * Screenshots of the home page story at given chapter positions.
 *
 *   node scripts/qa/story.mjs <url> <outPrefix> <width> <height> <point>...
 *   point = <chapterId>:<pinnedProgress> (e.g. work:0.2) or "top"
 *   RM=1 emulates prefers-reduced-motion. Add ?3d=off to the URL for the CSS fallback.
 *
 * e.g. node scripts/qa/story.mjs http://localhost:3000/ .qa/work 1440 900 work:0.2 work:0.95
 */
import { ensureDir, launch, openPage, printLogs, sleep } from "./browser.mjs";

const [url, prefix, w = "1440", h = "900", ...points] = process.argv.slice(2);
if (!url || !prefix) {
  console.error("Usage: node scripts/qa/story.mjs <url> <outPrefix> <width> <height> <chapter:progress>...");
  process.exit(1);
}
ensureDir(prefix);

const browser = await launch();
const { page, logs } = await openPage(browser, url, +w, +h);
await sleep(2500);
const stage = await page.evaluate(() => document.documentElement.dataset.stage);
console.log("stage:", stage);

let n = 0;
for (const point of points) {
  const [id, progress] = point.split(":");
  await page.evaluate(
    ({ id, progress }) => {
      if (id === "top") return window.scrollTo(0, 0);
      const el = document.getElementById(id);
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo(0, Math.round(top + (el.offsetHeight - window.innerHeight) * Number(progress)));
    },
    { id, progress },
  );
  await sleep(1400);
  const file = `${prefix}-${String(n++).padStart(2, "0")}-${id}-${progress ?? ""}.png`;
  await page.screenshot({ path: file });
  console.log("saved", file);
}

printLogs(logs);
await browser.close();
