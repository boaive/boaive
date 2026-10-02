# Boaive — SEO playbook

How search works on boaive.com: what's built in the code, what has to be done outside it, and the monthly loop that keeps it improving.

**Positioning (use these exact words everywhere — site, schema, Google Business Profile, Instagram, LinkedIn):**

> **Boaive — Creative Website Design & Development Studio**, based in Chengalpattu, serving Chennai and India.

Brand name is always **Boaive**. Don't use "Boaive Tech" / "Boaive Technologies" on profiles unless one becomes a registered legal name — then add it as `legalName` in `src/lib/schema.ts`.

---

## 1. What's in the code (invisible to visitors — no page text changed)

| Piece | Where |
|---|---|
| Site URL (`https://boaive.com` in production), page title, meta description, meta keywords | `src/content/site.ts` → `src/app/layout.tsx` |
| Structured data: Organization (service-area business in Chengalpattu, serving Chennai & India), WebSite, WebPage; CreativeWork + BreadcrumbList on case studies | `src/lib/schema.ts` |
| sitemap.xml (home + case studies + images), robots.txt, manifest, share image | `src/app/sitemap.ts`, `robots.ts`, `manifest.ts`, `opengraph-image.jpg` |
| Search Console HTML-tag verification (optional) | env var `GOOGLE_SITE_VERIFICATION` |

Never add hidden keyword text to pages — Google treats it as spam.

## 2. Ranking for more searches later
The homepage mainly ranks for "Boaive". To rank for searches like "website design Chengalpattu" or "3D website design", the site needs a visible page about each topic (e.g. `/website-design-chengalpattu`, `/3d-website-design`). Add those when you're ready to change the site.

## 3. Launch checklist (one-time, outside the code)

### Google Search Console
1. Add a **Domain property** for `boaive.com` (DNS TXT record at the domain registrar).
   - Alternative: URL-prefix property with the HTML tag — set `GOOGLE_SITE_VERIFICATION=<token>` in the hosting environment; `layout.tsx` renders it.
2. Submit `https://boaive.com/sitemap.xml`.
3. URL Inspection → Request indexing for `/`.
4. Also add the site to **Bing Webmaster Tools** (import from Search Console — 2 minutes).

### Hosting
- Point `boaive.com` (and `www` → 301 to the apex) at the deployment; HTTPS on.
- Production builds use `https://boaive.com` automatically. To override, set `NEXT_PUBLIC_SITE_URL`.
- Vercel preview deployments are automatically `Disallow: /` in robots.txt.

### Google Business Profile (if eligible)
Boaive has no public street address, so set it up as a **service-area business** (address hidden):
- Name: **Boaive** (no keywords in the name — that violates GBP rules)
- Primary category: *Website designer*; secondary: *Web developer* (optionally *Internet marketing service* only if offered)
- Service areas: Chengalpattu, Chennai (add nearby areas you genuinely serve)
- Website: `https://boaive.com` ; phone: +91 81108 23730
- Description: reuse the positioning line + 2–3 sentences from `/about`
- Services: one per landing page, same names
- Photos: logo, cover, screenshots of real projects
- Hours, and post a project update when you launch a site
- Ask every real client for a review. Never write or buy reviews.

### Consistent profiles (NAP + description)
Same name, website, phone, description and logo on: Instagram (already linked), LinkedIn company page, GitHub, Behance/Dribbble (post the case studies), Google Business Profile. Add each real profile URL to `sameAs` in `src/lib/schema.ts`.

## 4. Backlinks — legitimate only
- "Designed by Boaive" credit link in the footer of client sites (ask permission; Shapio 3D first).
- Case studies on Behance / Dribbble / LinkedIn linking to `/work/<project>`.
- Submit the homepage (3D site) to design showcases: Awwwards, CSS Design Awards, Godly, Three.js forum showcase, r/threejs.
- Local: JustDial, Sulekha, IndiaMART only if you'll maintain them; Chengalpattu/Chennai business groups and associations.
- Write-ups: "How we built a scroll-driven 3D site with Three.js" on dev.to / Medium / LinkedIn, linking to `/3d-website-design`.
- Never: paid link packages, PBNs, mass directory submissions, link exchanges.

## 5. Monthly Search Console loop
1. **Performance → Queries, last 3 months.** Export.
2. **Position 4–20 with impressions** → find the page ranking; strengthen it (add a section or FAQ answering that query, improve title/description, add an internal link from a related page with that anchor text).
3. **High impressions, CTR < 2%** → rewrite the `title` / `description` in `landing.ts` to match the query wording.
4. **Rising or unexpected queries** → add to the keyword map; if a real cluster appears with no page, create one (only with genuinely new content).
5. **Pages → Not indexed** → fix causes (duplicate, crawled-not-indexed = content too thin).
6. **Core Web Vitals report** → fix any "Poor" URLs.
7. Log what changed and the date, so next month you can see the effect.

Don't stuff every query into pages — only act where a query matches the page's intent.
