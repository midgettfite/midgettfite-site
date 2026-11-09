# MF-302 — Connect the listings editor (no GitHub accounts for staff)

**Kind:** story · **Status:** DONE 2026-07-12 · **Source:** `docs/MF-Website-Migration-Plan.md` §4, §6 B2
**Related:** staff editor invites (MF-311), office training (MF-314)
**Part of:** Website — recorded after the fact

**As** office staff,
**I want** to edit listings in a simple web form, signing in with my email,
**so that** I can keep the website current without a GitHub account or any code.

## What was done
- **7/10:** Pages CMS chosen over Sveltia. The deciding reason: staff are invited by email and sign in with a
  one-time link, with no GitHub account, which suits a non-technical office. The listing form is defined in
  `.pages.yml`: title, type (for sale / for rent, residential / commercial / land), status, price, the "Price
  Update!" badge, address, beds, baths, square feet, photos, video link, description, date listed.
- **7/12:** the editor's GitHub connection verified, and the email-invite flow checked end to end.

## Acceptance criteria
1. ✅ The editor opens the repo and shows the listings form with every listing.
2. ✅ The email-link sign-in works without a GitHub account.
3. ⏳ Staff invited — held back on purpose until training (MF-311, MF-314).

## Decisions from Dan
- Free hosted editor with the content kept in M&F's own repo, signed off July 2026.

## Status
DONE 2026-07-12. Reconnected to M&F's own repo on 10/03 (MF-309).
