# MF-309 — Move the website into Midgett & Fite's own accounts

**Kind:** story · **Status:** DONE 2026-10-03 · **Source:** Steve, 10/02 (M&F owns its GitHub and Cloudflare; Steve administers, owns neither)
**Related:** `docs/MF-Account-Move-Plan-2026-10-02.md` Stage 1; `docs/MF-Website-Migration-Plan.md`
**Part of:** Website (Wix → new site)

**As** Dan,
**I want** the new website's code, hosting and editor to live in accounts Midgett & Fite owns,
**so that** the site never depends on Steve's personal accounts.

## What was done (2026-10-03)
- **Code:** the repo moved from Steve's GitHub to the M&F organization: `midgettfite/midgettfite-site`
  (public, history kept, old URL redirects). Steve's Mac copy repointed and verified.
- **Hosting:** rebuilt in M&F's Cloudflare account as a **Workers static-assets site**, not Pages — Cloudflare's
  create flow now defaults to Workers and Pages is maintenance-only. `wrangler.jsonc` added (commit `40d5d15`:
  name `midgettfite-site`, serves `./dist`). Workers Builds deploys on every push to the org repo, with preview
  builds on. Live preview: **https://midgettfite-site.midgett-and-fite.workers.dev** — home, pages, forms and
  images load; old Wix addresses redirect (301); unknown addresses 404.
- **Editor:** Pages CMS reconnected to `midgettfite/midgettfite-site`; the listings form loads with every entry.
- **Clean-up:** the old Pages project in Steve's Cloudflare account was deleted.

## Acceptance criteria — all met 10/03
1. ✅ The repo is owned by the M&F GitHub organization.
2. ✅ The site builds and deploys from M&F's Cloudflare account on push.
3. ✅ The editor writes to the org repo.
4. ✅ Nothing of the website is left in Steve's accounts.

## Decision needed from Dan
None. (Staff editor invites are their own story, MF-311.)

## Status
DONE 2026-10-03. Account housekeeping per the account move plan, not website build work.
