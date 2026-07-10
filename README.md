# Midgett & Fite Real Estate — website

Static site: **Astro** + **Pages CMS**, hosted on **Cloudflare Pages**, source in **GitHub**.
Full context & migration steps: `MF-Website-Migration-Plan.md` (in the Consulting folder).

## Develop / build
```
npm install
npm run dev      # local preview at http://localhost:4321
npm run build    # outputs static site to dist/
```
Cloudflare Pages build settings: build command `npm run build`, output directory `dist`.

## Structure
- `src/content.config.ts` — listing schema (Astro content collection, glob loader)
- `src/content/listings/*.md` — one file per property (two samples included; the CMS edits these)
- `src/pages/*` — home, 5 category pages (exact existing slugs), static stubs
- `src/pages/property/[id].astro` — listing detail (gallery, "Price Update!" badge, video, contact)
- `src/layouts/Base.astro` — header/nav/footer (matches current site IA)
- `.pages.yml` — Pages CMS config (the listing form)
- `public/uploads/` — listing photos (committed by the CMS)

## Pages CMS (staff editing — no GitHub accounts)
1. Sign in at app.pagescms.org with the repo owner's GitHub, install its GitHub App on this repo.
2. It reads `.pages.yml` and shows the "Property Listings" form.
3. Invite Dan, Jeneva, Jeanice, Nate by email — they get a magic-link login, no GitHub account.

## Still TODO (the real build — for Claude Code)
- Migrate real content from Wix: team bios, company history, service-page copy, testimonials, resource-logo images, the tenant-payment URL (`payment-portal.astro`).
- Import real listings + photos (replace the two samples).
- Design pass to match the current look/feel (this is a clean, neutral skeleton).
- Wire the contact form handler (Cloudflare Pages Forms or a Worker → office@midgettfite.com).
- Use `astro:assets` `<Image>` for gallery optimization once real photos land.

## Status of the skeleton
Builds clean. Listings engine, category filtering, detail pages, and the "Price Update!" badge all work against the sample data. Pipeline-ready to push and connect to Cloudflare Pages.
