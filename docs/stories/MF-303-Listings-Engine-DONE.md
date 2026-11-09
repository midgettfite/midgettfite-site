# MF-303 — Listings engine: category pages, listing pages, badges

**Kind:** story · **Status:** DONE 2026-07-10 · **Source:** `docs/MF-Website-Migration-Plan.md` §3, §6 C3
**Related:** listings editor (MF-302), content from Wix (MF-304), listings feed for Ivy (MF-313)
**Part of:** Website — recorded after the fact

**As** someone looking for a property,
**I want** each kind of listing on its own page, and every property on a page of its own with photos,
**so that** I find what I'm looking for the way I could on the old site.

## What was done (2026-07-10, commit `49f137e`)
- One file per property, with the fields the editor fills in (MF-302).
- The five listing pages from Wix: residential, commercial and land for sale; residential and commercial for rent.
  Each shows only its own kind.
- A page per property: photo gallery, address and price, beds / baths / square feet, description, video tour
  button when there is one, contact button.
- Status: **active**, **pending**, or **sold / leased** (shown with a badge rather than deleted, so links don't
  break). The **"Price Update!"** badge appears when the box is ticked.
- Photos are resized and compressed for visitors automatically when the site is built.

## Acceptance criteria
1. ✅ Each category page shows only its listings, active first.
2. ✅ Listing pages render the gallery, details and badges from the file alone.
3. ⏳ A staffer creates, edits and removes a listing through the editor and sees it publish — proven during
   training (MF-314).

## Status
DONE 2026-07-10.
