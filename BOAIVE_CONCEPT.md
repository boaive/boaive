# BOAIVE — Creative & Technical Concept

> **Float Your Thrive.** Boat + thrive. A digital studio that turns ideas, problems and business needs into things that work.

This document is the source of truth for *why* the site looks and behaves the way it does. Read it before changing the story, the visual language or the 3D architecture.

---

## 1. The idea in one sentence

The website is not a portfolio with 3D on top. It is **one continuous story** that shows how Boaive works, told with camera, light, type and motion:

```
BOAT → LAPTOP FALLS → WATER → UNDERWATER → INTO THE SCREEN → DIGITAL WORLD
     → PROBLEM → WHAT WE BUILD → HOW WE BUILD → WORK → CONNECTED SYSTEM → SURFACE → LET'S BUILD
```

A person has an idea. It floats. Boaive dives in, explores it, designs and builds it, and the result is a working system that carries the business forward — literally: the boat that opened the site closes it with a **sail made of the connected system**, moving into a sunrise.

## 2. Questions the visitor answers, in order

| # | Question in the visitor's head | Where it is answered |
|---|---|---|
| 1 | Who is Boaive? | Hero (headline + lede), Studio |
| 2 | What does Boaive do? | Hero lede, Problem, Capabilities |
| 3 | Can Boaive build what I need? | Problem ("you bring the problem"), Capabilities (incl. CUSTOM) |
| 4 | How does Boaive work? | Process (Understand → Launch) |
| 5 | What has Boaive built? | Work — client work first, samples clearly labelled |
| 6 | What would I receive? | Process ("you get …"), Outcome |
| 7 | How do I start? | Persistent "Let's build", Contact (WhatsApp first) |

Every section must keep answering its question. If a visual does not help one of these, it goes.

## 3. Chapters

Each chapter is a `<section data-chapter="…">` with real, semantic HTML content. The 3D stage reads the scroll progress of these sections; it never owns the content.

| # | Chapter | DOM (always readable) | 3D (enhancement) |
|---|---|---|---|
| 01 | **Float** (hero) | H1, lede, tagline, scroll cue | Blue-hour ocean, small boat, doodle engineer coding, laptop glow. The boat rolls; the laptop slips over the side. |
| 02 | **Dive** | Two short lines | Splash → camera follows the laptop under the surface → boat silhouette above, light shafts → screen boots the Boaive mark → camera flies into the screen. |
| 03 | **Problem** | "Your business has a problem. You have an idea. You need something that works." + floating needs | Digital deep: dark, architectural, particles. Needs rise like bubbles. |
| 04 | **What we build** | Web · AI · Software · Automation · Mobile · Custom | Six forms on a ring. The camera orbits to each. Custom = a box that unfolds ("not limited to a box"). |
| 05 | **How we build** | Understand → Design → Build → Refine → Launch | One object transforms: scattered points → structure → blueprint → assembled → polished → launched. |
| 06 | **Work** | Client work, then Samples, each with a case study | Projects are screens in the deep, playing the real site. Selecting one pushes the camera in. |
| 07 | **Outcome** | "Not just a screen. A working system." | Everything built so far gets connected by light. |
| 08 | **Studio** | Who we are, how we work | The camera rises toward the light. |
| 09 | **Surface** | BOAIVE · Float Your Thrive · Let's build · WhatsApp / Instagram / email / call | Sunrise. The boat returns with a sail woven from the connected system and the Boaive mark. The engineer waves. |

## 4. Visual language

**Direction:** premium studio × architectural visualisation × cinematic product film × modern software.

### Colour — taken from the logo, justified by the story

| Token | Value | Role |
|---|---|---|
| `--ink-950` | `#05080C` | Deepest background (the deep) |
| `--ink-900` | `#0A1016` | Panels, dialog |
| `--sea-800` | `#0C1E29` | Underwater / digital-world tint |
| `--sea-600` | `#1D3A4A` | Lines, secondary surfaces |
| `--bone-50` | `#F3F0EB` | Primary text (logo white) |
| `--bone-300` | `#B9B6B0` | Secondary text |
| `--ember-400` | `#FFA448` | Logo accent (dot under the A) |
| `--ember-500` | `#FF8A2A` | Primary action, highlights |
| `--ember-600` | `#F2700E` | Pressed / deep accent (the "b" ribbon) |

- Orange is **the spark**: the laptop glow, the sunrise, active states, the primary CTA. It is never used as a large gradient.
- Silver/bone is **structure**: the built things.
- Deep blue-black is **possibility and depth**.
- No purple/blue "AI gradient", no neon, no glassmorphism cards.

### Typography

| Family | Use |
|---|---|
| **Archivo** (variable weight + width) | Headlines (expanded width echoes the wide wordmark) and body |
| **IBM Plex Mono** | Technical metadata: chapter indices, depth gauge, labels — like annotations on an architectural drawing |
| **Instrument Serif** *(italic)* | Rare human lines ("Every product starts as an idea…"). Maximum one per chapter. |

### Layout
Asymmetric editorial grid, thin 1px rules, small mono annotations, generous negative space. Text sits where the camera leaves room for it — the 3D composition and the DOM layout are designed together.

### The brand character
A simple doodle engineer: round head, dot eyes, an orange beanie, ink outline. Adult proportions, no mascot antics. In 3D it codes (hero) and sails / waves (surface). It represents the people behind Boaive.

## 5. Motion principles

1. **Scroll is the camera.** Scroll progress drives a deterministic camera track — scroll back and the story rewinds exactly.
2. **Every move means something:** entering, discovering, transforming, building, connecting, completing.
3. **One easing family** (`power3`-like in/out) for everything cinematic; UI micro-interactions are short (150–250 ms).
4. **Physical transitions only.** No page-load fades to black. World changes happen when something physically fills the frame (the laptop screen, the water column).
5. **Pointer = parallax, not control.** Mouse movement nudges the camera a little. Click = meaningful action. There is no "game" navigation.
6. **Reduced motion:** camera choreography is replaced by still compositions per chapter with short cross-fades; ambient motion stops.

## 6. Technical architecture

```
src/
  app/                    Next.js App Router (server components by default)
  content/                Site config + all copy (edit text here, not in components)
  data/                   Projects, capabilities, process, needs — typed data
  components/             DOM: layout, sections, work/case study, UI, brand
  experience/             Everything WebGL (client-only, lazy-loaded)
    Stage.tsx             The single <Canvas>
    story/                Chapter list + scroll/story store (no React re-renders per frame)
    camera/               Camera track (keyframes over story time) + rig
    scenes/               OceanWorld (Hero/Dive/Final), DigitalWorld (Problem/Capabilities/Build/Work/Outcome)
    objects/              Ocean, Sky, Boat, Sail, Character, Laptop, particles, forms…
    shaders/              GLSL as TS strings
    fx/                   Screen-space overlay (veil, vignette, grain, waterline)
  lib/                    WhatsApp links, audio engine, navigation, motion prefs
scripts/                  Asset tooling (project capture)
public/                   brand/, work/<slug>/ (posters, galleries, videos)
```

### Story time
- Every chapter section registers a scroll range. Ranges are contiguous, so any scroll position maps to exactly one `(chapter, localProgress)`.
- `storyTime = chapterIndex + localProgress` (0 → 9). The camera track and all scenes are functions of story time; they read it inside `useFrame` from a mutable store, so scrolling never re-renders React.
- Two worlds share one canvas: **OceanWorld** (surface + underwater) and **DigitalWorld**. World swaps are hidden inside a full-frame moment (the laptop screen, or the open water column) — a "cut on the fill".

### Loading strategy
1. HTML + CSS render immediately (server components). The hero shows a CSS horizon that matches the first 3D frame.
2. After hydration, `Experience` checks WebGL support, reduced-motion and device tier, then dynamically imports the 3D bundle.
3. The ocean world is procedural (no downloads). Project posters/videos load only when the Work chapter is near.
4. Shaders are pre-compiled after the first frame (`gl.compileAsync`) so later chapters don't hitch.

### Quality tiers
`high` (desktop), `medium` (laptops/tablets), `low` (phones / weak GPUs). Tiers change DPR, ocean resolution, particle counts, voxel counts and overlay grain. A performance monitor steps DPR down if frames drop. No WebGL → a designed CSS fallback per chapter; the story still reads.

## 7. Content rules

- Never invent client results, metrics, users or revenue. `outcome` is optional in project data and only shown when real.
- Samples (self-initiated builds) are always labelled **Sample** and grouped separately from **Client work**. Figures and reviews inside sample sites are illustrative, and the site says so.
- Copy is concrete and short. Banned: "unlock", "revolutionize", "next-generation", "cutting-edge", "empower … digital future".

## 8. Adding or changing things

- **New project:** add an entry to `src/data/projects.ts`, drop media in `public/work/<slug>/` (or run `npm run capture -- <slug> <url>`). Layout, 3D screen, case study page, sitemap and OG image pick it up automatically.
- **Copy:** `src/content/*.ts`.
- **Contact details / domain:** `src/content/site.ts` (domain can also come from `NEXT_PUBLIC_SITE_URL`).
- **3D models:** objects are procedural today. To swap in a Blender asset, export GLB (Draco/Meshopt + KTX2 textures), put it in `public/models/`, and replace the body of the matching component in `src/experience/objects/` with `useGLTF` — the scene code only relies on the component's props and group transforms.
