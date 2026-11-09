# MF-313 — Listings feed for Ivy

**Kind:** story · **Status:** DRAFT · **Source:** website plan "Requirement added 2026-09-23 (from MF-038)"; account move plan Stage 7
**Related:** Ivy's property email (MF-038, live on PROD); go-live (MF-312); rental listing drafts (In-House MF-205)
**Part of:** Website

**As** Ivy (and the office reading her property emails),
**I want** the new site to publish every listing as clean structured data,
**so that** her property emails get the photo and description straight from the website, not by scraping a Wix page.

## Background
Ivy's property email (live on PROD since 9/22) needs each listing's photo and description. Today it gets them
by reading the Wix rentals page, which is one hand-built page: text matches by address, photos don't. **That
breaks the day Wix goes off**, so this must ship before go-live (MF-312).

The new site already keeps each listing as its own record (address, price, beds, baths, status, description,
photos). This story publishes those records as one feed (a JSON file the site builds alongside its pages) and
points Ivy at it.

Two lists, two jobs: the **Vacancies tab** stays what Ivy reads for availability and price on calls; the
**website** supplies photo and description for the email. They are matched by address.

## Acceptance criteria
1. The site publishes a feed of every active rental: address, beds, baths, rent, status, description, photo
   links, and the listing's page link.
2. The feed updates automatically whenever staff change a listing in the editor.
3. Ivy's property email reads photo and description from the feed, matched to the Vacancies tab by address.
4. A vacancy with no matching website listing still gets an email (text only, as today), and the office
   sees one line saying the website listing is missing.
5. Proven on DEV first: a property email built from the feed on the preview site, before the live switch.
6. The Wix page reading is removed only after the feed has run on PROD for a week.

## Decision needed from Dan
| Question | Recommended default |
|---|---|
| When the website and the Vacancies tab disagree on price, which one wins in Ivy's email? | **The Vacancies tab** — it's what Ivy quotes on calls; the office sees the mismatch once. |
| Rentals only, or sale listings too? | **Rentals only.** Ivy doesn't handle sales. |
| How many photos in a property email? | **One** — the first photo on the listing. |

## Status
DRAFT, 2026-10-03. Touches Ivy's worker as well as the site.
