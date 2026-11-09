# Website — Wix → Midgett & Fite's own site

The new website, as user stories: the work already done since July, for the record, and the work left before
midgettfite.com switches over. Each story says what it is, how we'll know it's done, and what's yours to decide.

## The stories

### Done — for the record

| Story | What it is | Done |
|---|---|---|
| Stack, repo and publishing (MF-301) | Astro site in a GitHub repo, Cloudflare hosting, publishes on every change; no subscription anywhere | ✅ 7/10 |
| Listings editor connected (MF-302) | Pages CMS chosen; listing form defined; email sign-in verified, no GitHub accounts | ✅ 7/12 |
| Listings engine (MF-303) | The five listing pages, a page per property, sold/leased and "Price Update!" badges | ✅ 7/10 |
| Content moved from Wix (MF-304) | Every page, all 18 listings, 355 photos, the five Helpful Forms files | ✅ 7/12 (video links owed → punch list) |
| Contact form (MF-305) | The full "Get In Touch" form, delivered by Web3Forms | ✅ 7/12 (delivery check owed → punch list) |
| Look matched to Wix (MF-306) | Home page, header and menu rebuilt to match; old Wix links redirect | ✅ 7/13 (Dan's sign-off owed → punch list) |
| DNS moved to Cloudflare, email kept (MF-307) | All 22 records copied and checked before the switch; nothing visible changed | ✅ 8/03 |
| Domain transferred from GoDaddy (MF-308) | Registrar now Cloudflare, paid through 2027-09-29 | ✅ 8/21 |
| Move into M&F's own accounts (MF-309) | Repo to the M&F GitHub org; rebuilt as a Workers static-assets site in M&F's Cloudflare; editor reconnected; Steve's old copy deleted | ✅ 10/03 |

### Left to do

| Story | What it is | Status | Dan decisions it carries |
|---|---|---|---|
| Punch list before go-live (MF-310) | Listings refreshed against today's Wix; contact form to Zoho; payment link; forms; video links; page-by-page check; Dan's OK | DRAFT | Look as built or freshen; contact-form mailbox; keep sold/leased listings; 3.45% fee |
| Staff editor invites (MF-311) | Email invitations to the listings editor, no GitHub accounts | DRAFT | Who; when; publish directly or checked first |
| Go live at midgettfite.com, then retire Wix (MF-312) | Point the domain at the new site, verify email and Ivy, overlap, cancel Wix | DRAFT | Date; the old Wix domain; overlap length; who has the Wix login |
| Listings feed for Ivy (MF-313) | The site publishes listings as structured data; Ivy's property emails read it instead of the Wix page | DRAFT | Which list wins on price; rentals only; photos per email |
| Office training (MF-314) | Each person adds, edits, marks leased and deletes a test listing; one-page cheat sheet | DRAFT | In person or screen-share; who; who owns listings after go-live |
| Staff-editable pages (MF-315) | Team, testimonials, office details and home page become forms in the editor, like listings; design stays with Steve | DRAFT | Which forms; Company History too; who may edit; team photo style |

The done stories keep the same shape as the rest (As / I want / so that, acceptance criteria, Dan's decisions),
with "What was done" in place of a plan. Anything a done story left open is marked ⏳ and points at the
open story that carries it, so nothing falls between the two lists.

**How the drafts are fenced.** Every open question sits in the story's **"Decision needed from Dan"** box with a
recommended default. When he answers, the box gets a DECISION line (his words, dated).

## Build order
1. **Punch list** (MF-310) → Dan's OK on the preview.
2. **Listings feed for Ivy** (MF-313) — must be live and proven **before** Wix goes off, or Ivy's property
   emails lose their photos and descriptions.
3. **Editor invites + training** (MF-311, MF-314) — together, same day, so staff can keep listings current
   from the first day.
4. **Go live** (MF-312) — also waits on the DNS moving into M&F's Cloudflare (account move plan Stage 5, after
   Phase 2 closes plus a clean week), because the site now lives in M&F's account.
5. Wix cancelled after the overlap.
