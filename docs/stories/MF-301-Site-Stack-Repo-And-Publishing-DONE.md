# MF-301 — Pick the stack, create the repo, publish on every change

**Kind:** story · **Status:** DONE 2026-07-10 · **Source:** Website proposal (July); `docs/MF-Website-Migration-Plan.md` §0, §2, §6 B1
**Related:** listings editor (MF-302), listings engine (MF-303), move into M&F's accounts (MF-309)
**Part of:** Website — recorded after the fact, for the record

**As** Dan,
**I want** a website I own outright, with no Wix subscription and no content locked in someone else's system,
**so that** I can't be priced out of my own site.

## What was done (2026-07-10)
- **Stack locked:** Astro (a fast static site), the site's code and every listing kept as plain files in a
  GitHub repo, Cloudflare for hosting (free), Pages CMS as the editor (MF-302). No paid service, no content
  database. Every change is saved as a version and can be undone.
- **Repo created** (`midgettfite-site`, first commit `49f137e`) and **connected to Cloudflare**, so every change
  publishes on its own. First deploy live on `midgettfite-site.pages.dev` the same day.

## Acceptance criteria — met 7/10
1. ✅ A change pushed to the repo appears on the preview site within about a minute.
2. ✅ No recurring fee anywhere in the stack.

## Decisions from Dan
- The no-subscription, content-in-Git model, signed off July 2026 (plan, closing note).

## Status
DONE 2026-07-10. Since 10/03 the repo and hosting live in M&F's own accounts (MF-309); the preview address
changed then.
