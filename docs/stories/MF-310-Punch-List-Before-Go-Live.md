# MF-310 — Punch list before go-live

**Kind:** story · **Status:** DRAFT · **Source:** `docs/MF-Website-Migration-Plan.md` §6 (C4, C5) and §8; account move plan Stage 7
**Related:** listings feed for Ivy (MF-313), go-live (MF-312)
**Part of:** Website

**As** Dan,
**I want** everything on the new site checked against today's Wix site and fixed,
**so that** the day it goes live nothing is missing, stale or broken.

## Background
The new site was built to match Wix in July: 18 listings (11 active, 7 sold or leased) with 355 photos,
all pages, the five Helpful Forms files, the contact form and the old-address redirects (build record:
the done stories MF-301 … MF-309). What it never got: video tour links, and a check of where contact-form
messages land now that the office is on Zoho. Wix has kept changing since; the new site hasn't.

## Acceptance criteria
1. **Listings refreshed against today's Wix:** every current listing present with today's price, status and
   photos; anything leased or sold since July marked so. A side-by-side list is the evidence.
2. **Contact form:** a test submission arrives in the office mailbox Dan names, on Zoho. The form service
   (Web3Forms) account is moved under `it@midgettfite.com` so M&F owns it, like everything else.
3. **Payment portal:** the link opens the real tenant payment page; the 3.45% fee wording matches what the
   office charges today.
4. **Helpful Forms:** all five files open from the new site (already copied off Wix); the online application
   link still works.
5. **Video tours:** every listing's video link is blank today (all 18). Each one Wix shows is copied over and
   opens the right video; property-information (RealTracs) links likewise.
6. **Every page side by side with Wix:** no missing page, text or image. Old Wix addresses land on the right
   new page.
7. Dan has looked at the preview and said it's OK to go live (this is the gate for MF-312).

## Decision needed from Dan
| Question | Recommended default |
|---|---|
| Keep the look as built (it matches Wix), or freshen it before go-live? | **Keep it as built.** Go live first; freshen later if you want. |
| Which mailbox should contact-form messages go to? | **The office's main Zoho mailbox.** |
| Sold and leased listings: keep them on the site marked SOLD / LEASED, or remove them? | **Keep them marked** for 90 days, then remove. |
| Is the 3.45% convenience fee on the payment page still right? | No default; please confirm. |

## Status
DRAFT, 2026-10-03.

**2026-10-23:** privacy policy page added (Dan's 10/19 text, for the texting registration). Live now at
https://privacy.midgettfite.com (Worker `mf-privacy`, `website/privacy-worker/`), and on the new site at `/privacy`
with a footer link (commit 3c5bdf9). At go-live, forward the subdomain to `midgettfite.com/privacy` and retire the Worker.

**2026-11-04 correction:** the form's emails were found addressed to `it@midgettfite.com` (10/31, 11/2, 11/3), not `office@` as recorded below. Steve wants them at the office; the Web3Forms change is still to do, then a browser test.

**2026-10-28 (criterion 2, contact form):** the old key delivered to `steve@foundbyford.com`. New Web3Forms account
under **`it@midgettfite.com`** (M&F-owned), form "Website contact", key `24bdcf87-…` in both forms (site commit
`b6bda63`); delivery set to **`office@midgettfite.com`** (alias of the Zoho Company group: Dan, Jeanice, Jeneva, Nate) and
verified. The site now shows `office@midgettfite.com` instead of the old Gmail address (header, footer, contact page,
error messages). Test sent by Steve from the preview ~3:46 PM; **office to confirm it arrived** (Web3Forms rejects
server-side posts, so tests must come from a browser). To verify, Steve was briefly added to the Company group
(first as steve@midgettfite.com, then steve@volunteer-ai.com) and removed; the group is back to its four members.
Listings refreshed the same day: `MF-310-Listings-Side-By-Side-2026-10-28.md`.
