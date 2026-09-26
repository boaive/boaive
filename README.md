# Boaive — Float Your Thrive

The official site of **Boaive**, a digital studio that designs and builds websites, software, apps, AI assistants and automation.

The home page is one continuous, scroll-driven story in 3D: a boat at night, a laptop that slips overboard, a dive into the screen, the digital deep where the work gets built — and back to the surface at sunrise, with the finished product. Every chapter is real, semantic HTML; the WebGL stage behind it is a progressive enhancement with a designed CSS fallback.

- **Creative & technical concept:** [`BOAIVE_CONCEPT.md`](BOAIVE_CONCEPT.md)
- **Working notes for contributors (and AI agents):** [`CLAUDE.md`](CLAUDE.md)

## Quick start

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

| Script | What it does |
|---|---|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` / `npm start` | Production build (every route is static) / serve it |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript, no emit |
| `npm run capture -- <slug> <url>` | Capture a project's posters, screens, phone shots and scroll-through video into `public/work/<slug>/` (needs Chrome/Edge and ffmpeg) |

Useful URL flags: `?3d=off` shows the CSS fallback, `?quality=low|medium|high` forces a 3D quality tier.

## Configuration

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Production URL, e.g. `https://boaive.com` — used for canonical URLs, Open Graph, the sitemap and robots.txt. On Vercel it falls back to the production domain automatically. |

Brand, contact channels (WhatsApp first), navigation and SEO defaults live in `src/content/site.ts`. All copy lives in `src/content/home.ts`.

## Pages

- `/` — the story: Float → Dive → The problem → What we build → How we build → Work → Outcome → Studio → Surface.
- `/work` — the archive: every project, in two halves — **Client work** and **Experiments & prototypes**.
- `/work/<slug>` — a case study per project (also opens as a side sheet from the story).

## Adding a project

1. Capture its visuals:
   ```bash
   npm run capture -- my-project https://example.com --at="text:Our services"
   ```
2. Add an entry to `src/data/projects.ts` using `workMedia()`.
   - `kind`: `"client"` for paid client work; `"experiment"` or `"prototype"` for anything self-initiated (always with a `disclaimer`).
   - `featured: true` also gives it a screen in the home story. Keep 3–5 featured; the work chapter's pacing scales with the count.
3. That's it — `/work`, the case study page, the sitemap and share images pick it up.

**Honesty rules:** never invent client results, metrics or testimonials (`outcome` stays empty unless it's real), and never present experiments or prototypes as client work.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · React Three Fiber, drei, three.js · GSAP ScrollTrigger · Lenis · CSS Modules with design tokens (`src/styles/tokens.css`). Sound is synthesised with WebAudio and strictly opt-in.

## Performance & accessibility

- The 3D bundle loads after the page is interactive; project media loads only near the work chapter. Quality tiers and adaptive resolution keep phones and weak GPUs smooth.
- `prefers-reduced-motion` replaces camera moves with still compositions and cross-fades.
- Full keyboard navigation: skip link, chapter navigation with focus management, native `<dialog>` case studies, visible focus styles.
- Without WebGL (or with `?3d=off`) the story still reads, with designed CSS scenes and real screenshots.

## Visual QA

`scripts/qa/` drives headless Chrome with the real GPU (ANGLE/D3D11 on Windows):

```bash
node scripts/qa/story.mjs http://localhost:3000/ .qa/work 1440 900 work:0.2 work:0.95
node scripts/qa/page.mjs http://localhost:3000/work .qa/archive 390 844
```

Screenshots land in `.qa/` (git-ignored). `RM=1` emulates reduced motion.

Frame cost per chapter (fps, main-thread and GPU ms, draw calls) on a phone-sized viewport — run it against a production build:

```bash
node scripts/qa/perf.mjs "http://localhost:3000/?quality=low"
```

On a real phone, open the site with `?debug`, stop where it feels slow, tap **Run test**, then **Copy report**.

## Deploying

Any Node host works; Vercel is the simplest (`next build` output is fully static). Set `NEXT_PUBLIC_SITE_URL` to the production domain.
