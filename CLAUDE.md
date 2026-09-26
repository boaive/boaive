@AGENTS.md

# BOAIVE — project context

Official site for **Boaive** ("Float Your Thrive", boat + thrive), a digital studio: websites, software, apps, AI assistants, automation. The home page is one continuous, scroll-driven 3D story; `BOAIVE_CONCEPT.md` is the creative/technical source of truth — read it before changing the story, visual language or 3D architecture.

Story: boat at night → laptop slips overboard → dive → into the screen → digital deep → problem → what we build (6 capabilities) → how we build (5 steps) → work → outcome ("Not just a screen. A working system.") → studio → surface at sunrise (the boat returns with the finished product) → "Let's build".

## Commands

```bash
npm run dev          # http://localhost:3000 (dev output in .next/dev, so `next build` can run alongside)
npm run build        # all routes are static (SSG)
npm run lint         # eslint (flat config)
npm run typecheck    # tsc --noEmit
npm run capture -- <slug> <url> [--at="#sel|text:Heading|0.4"] [--page=name:url] [--no-video]
```

Visual QA (headless Chrome + real GPU; see "QA" below): `node scripts/qa/story.mjs …`, `node scripts/qa/page.mjs …`.

## Stack

Next.js 16 App Router (Turbopack) · React 19 · TypeScript · React Three Fiber + drei + three · GSAP ScrollTrigger · Lenis. Next 16 differs from older versions — async `params`, `PageProps<'/route'>`, metadata file conventions; check `node_modules/next/dist/docs/` before using an API.

## Map

- `src/content/` — **all copy** (`home.ts`: per-chapter copy, `workCopy`, `archiveCopy`) and `site.ts` (brand, contact, nav, SEO, `site.url` from `NEXT_PUBLIC_SITE_URL` → `VERCEL_PROJECT_PRODUCTION_URL` → localhost).
- `src/data/` — typed data: `projects.ts` (portfolio), `capabilities.ts`, `process.ts`, `needs.ts`, `types.ts`.
- `src/story/` — shared by DOM and 3D: `chapters.ts` (order, scroll length in viewport heights, depth, world), `timing.ts` (beat ranges), `moments.ts` (time conversions + physical moments), `store.ts` (mutable `story` + `useStory` for discrete values).
- `src/components/sections/` — one component per chapter; `Chapter.tsx` (`Chapter`, `ChapterLabel`, `Beats`).
- `src/components/motion/` — `ScrollDirector` (Lenis, chapter ScrollTriggers, beat choreography), `RevealObserver` (`data-reveal` on flowing pages).
- `src/components/work/` — `CaseStudy` (shared by the dialog and `/work/[slug]`), `ProjectDialog`, `KindBadge`, `ArchiveCard` + `ScreenPreview` + `ArchiveGauge` (the `/work` page).
- `src/app/` — `page.tsx` (home story), `work/page.tsx` (archive), `work/[slug]/page.tsx` (case study pages), `sitemap.ts`, `robots.ts`, `manifest.ts`, icons, `opengraph-image.jpg`/`twitter-image.jpg` (real render of the finale).
- `src/experience/` — everything WebGL, client-only and lazy: `Stage.tsx` (single canvas), `camera/` (keyframe tracks + rig), `scenes/` (`OceanWorld`, `DigitalWorld`), `objects/`, `choreo/` (story-time → scene state, layouts), `shaders/`, `quality.ts`.
- `src/lib/` — `navigation.ts` (veil chapter jumps, `goToChapter`, `scrollToChapterProgress`), `whatsapp.ts` (prefilled messages), `audio/` (synthesised opt-in sound).
- `scripts/` — `capture-project.mjs` (posters, galleries, phone shots, scroll-through video), `qa/`.
- `public/brand/` (logo mark, wordmark, icons), `public/work/<slug>/` (captured media).

## How the story works

- Each chapter is a tall `<section data-chapter>` with a sticky 100svh stage; length comes from `chapters.ts`. Chapter triggers are contiguous, so **story time = chapter index + chapter progress**. Scroll never re-renders React; the 3D reads `story`/`frame` in `useFrame`.
- Pinned progress `p` (0 = stage pins, 1 = releases) is the beat coordinate. `timeAt(ch, p)` → story time; `handoffTimeAt(ch, h)` covers the hand-off while a chapter slides in; `pinnedAt(ch, t)` inverts.
- Declarative choreography (ScrollDirector): `data-beat="in,out"` (+ `data-dy`, `data-fade`), `data-rise` (+ `data-rise-compact` for ≤1200px), `data-progress` (→ `--p`), `data-steps`/`data-step` (→ `aria-current`). Layouts that need room (e.g. the Problem chapter's floating needs) switch to a stacked version at the same `COMPACT` breakpoint — test phones down to 320×568. Ranges come from `timing.ts`, which the 3D also imports — text and camera stay in sync. Beats are hidden via `.js [data-beat]` in `globals.css`.
- Camera: `KeySpec` keys per world (`oceanTracks`, `digitalTracks`, `surfaceTracks`), Catmull-Rom, lens shift keeps subjects clear of the text (`projectionMatrix.elements[8] = -sx`, `[9] = -sy`); portrait uses `shiftPortrait`/`backPortrait`. Reduced motion holds still keys and cross-fades (`frame.t` is held, so derive scene state from `frame.t`, not wall-clock).
- Two worlds in one scene: ocean at the origin, digital deep at `DIGITAL_ORIGIN (0,-400,0)`; swaps happen behind full-frame fills. Light count is constant (no shader recompiles); `gl.compileAsync` warm-up.
- Quality tiers `high|medium|low` + adaptive DPR; `?3d=off` forces the CSS fallback, `?quality=low|medium|high` forces a tier.

## Work: projects, featured, the archive

- `Project.kind`: `client` | `experiment` (self-initiated build for a type of business — the current demo sites) | `prototype` (R&D). Anything not client work is grouped as **Experiments & prototypes**, gets a dashed badge and a `disclaimer`.
- `featured: true` puts a project on a screen in the home work chapter. **The chapter scales with the count**: `chapters.ts` derives its length and `timing.work.projects` is `sequence(featured.length, …)`. Keep 3–5 featured. Order everywhere: client first (`orderedProjects`).
- The work chapter ends with a closing beat (`timing.work.more`): the screens gather into a wall (`WALL`/`wallPosition` in `digitalLayout.ts`, `galleryState.gather`) beside "Everything we've built." → **`/work`**.
- `/work` lists every project (client rows, then the experiments grid); `/work/[slug]` is statically generated for every project. Header "Work" links to `/work` off the home page (`NavItem.page`).
- Adding a project: `npm run capture -- <slug> <url> …`, then an entry in `projects.ts` using `workMedia()`. Everything else is automatic.

## Content rules (non-negotiable)

- Never invent client results, metrics, testimonials or users. `outcome` stays undefined unless real.
- Never present experiments/prototypes as client work. The only client project today is **Shapio 3D** (its copy has a `reviewNote` to confirm with the team before launch). Clinic, Restaurant and Play are experiments.
- Contact: WhatsApp **+91 81108 23730** (primary, `wa.me/918110823730`), Instagram **@boaive**, email **boaive.tech@gmail.com**, phone same number. WhatsApp is always the primary CTA.
- Copy is short and concrete; banned: "unlock", "revolutionize", "next-generation", "cutting-edge".

## Gotchas

- **drei `Outlines`** with `screenspace` has inverted branches in this version (thickness became metres → giant black shells). Use `objects/inkOutline.ts` (inverted hull, clip-space pixel offset).
- **drei `Environment`** pulls EXR/RGBE/gain-map loaders into the bundle; use `StudioEnvironment` (custom PMREM).
- GLSL: `active` is reserved; no backticks inside GLSL template literals.
- CSS Modules require a local class in every selector — global attribute selectors (`[data-beat]`, `html.dialog-open`) live in `globals.css`.
- A page with a `position: fixed` backdrop at negative z-index needs `isolation: isolate` on its wrapper, or the body background paints over it.
- `ProjectDialog` adds `html.dialog-open` (hides `main`); it removes it on unmount too — keep that if you change navigation out of the dialog.
- ESLint: `react-hooks/immutability` is off for `src/experience/**` (three.js objects are mutated in `useFrame` by design). Avoid `Math.random` in render (use `hash()`).
- Windows/PowerShell: `Get-Content`/`Set-Content` mangle UTF-8 (em dashes) and add BOMs — edit files with the editor tools or node. Don't run `next build` with the shell cwd inside `.next` (EBUSY).

## QA

WebGL screenshots need a real GPU in headless Chrome: `--use-angle=d3d11 --enable-gpu --ignore-gpu-blocklist` (Intel Arc here).

- `node scripts/qa/story.mjs <url> <outPrefix> <w> <h> <chapter:progress>...` — story screenshots (`RM=1` for reduced motion). e.g. `node scripts/qa/story.mjs http://localhost:3000/ .qa/work 1440 900 work:0.2 work:0.95`
- `node scripts/qa/page.mjs <url> <outPrefix> <w> <h> [hoverSelector]` — flowing pages: scrolls to trigger reveals, full-page shot, optional hover (`SHOTS=1` for per-screen shots).
- Check desktop (1440×900, 1920×1000, short 1366×700), tablet and phone (390×844) plus `RM=1` and `?3d=off`.

## Open items

- Production domain: set `NEXT_PUBLIC_SITE_URL` (sitemap, robots, canonical and OG URLs use it).
- Shapio 3D case study copy needs the team's confirmation (`reviewNote` in `projects.ts`).
