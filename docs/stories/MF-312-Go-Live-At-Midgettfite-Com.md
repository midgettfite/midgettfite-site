# MF-312 — Go live at midgettfite.com, then retire Wix

**Kind:** story · **Status:** DRAFT · **Source:** `docs/MF-Website-Migration-Plan.md` §5 steps 5–6, §6 D3/D5; account move plan Stage 7
**Related:** punch list (MF-310), listings feed for Ivy (MF-313), account move plan Stage 5
**Part of:** Website

**As** Dan,
**I want** midgettfite.com to show the new site, and Wix retired,
**so that** I own my website outright and nothing depends on Wix once its prepaid term runs out.

## Background
*(As written 10/03; superseded by Status, 11/18 — the cut-over has happened and the redirect now runs the other way.)* Before go-live, midgettfite.com sent visitors to `investment-property-management-tn.com`, the Wix site. That domain is
registered **at Wix** (expires 2027-10-10). midgettfite.com is at Cloudflare, paid through 2027-09-29.

**Three things must be true first:**
1. The punch list is done and Dan has said OK (MF-310).
2. Ivy's property emails no longer read the Wix rentals page (MF-313). Turning Wix off before that breaks them.
3. midgettfite.com's DNS has moved into M&F's Cloudflare account (account move plan Stage 5). The site now
   lives in M&F's account, and Cloudflare attaches a domain to a site only within the same account.
   Stage 5 is scheduled after Phase 2 closes plus a clean week.

## Acceptance criteria
1. midgettfite.com and www.midgettfite.com show the new site, with a valid certificate.
2. **Email is untouched:** mail in and out of a Zoho mailbox verified before and after.
3. Ivy's dashboard (`ivy.midgettfite.com`) still loads.
4. Contact form, payment portal link and Ivy's property emails verified on the live address.
5. Old Wix page addresses land on the matching new page.
6. `investment-property-management-tn.com` handled the way Dan decides (below).
7. ~~Wix stays on for the overlap Dan picks; then it's cancelled~~ — moot (11/18): Wix is prepaid for three years, no refund; it lapses at term end. Check nothing still depends on it before then.
8. **Listings refreshed from Wix one last time, the day of the switch** (Steve 10/12: the preview is a demo and is not kept
   in step with Wix day to day; refreshed 10/12 after a month, and once more at go-live). Same method as
   `MF-310-Listings-Side-By-Side-2026-10-06.md`: take down what Wix took down, add what's new, check every price.

## Decision needed from Dan
| Question | Recommended default |
|---|---|
| Go-live date | **Moot — already live.** midgettfite.com was cut over to the new site before 2026-11-18 (Dan, 11/18). |
| `investment-property-management-tn.com` — keep it pointing at the new site, or let it lapse? | **Already redirecting** to midgettfite.com (checked 11/18, below). Still open: whether to renew it at Wix before 2027-10-10 or move it to Cloudflare Registrar, and which Cloudflare account its DNS sits in. |
| How long to keep Wix after go-live? | **Moot.** The Wix plan was prepaid for three years and can't be refunded (Dan, 11/18); it isn't being cancelled and simply lapses at the end of its term. |
| Who has the Wix login, to cancel and to release the domain? | **No longer needed to cancel.** Only needed if the old domain is ever moved off Wix or its renewal changed. |

## Status
DRAFT, 2026-10-03. **LIVE — cut over before 2026-11-18** (Dan, call with Steve, 11/18). Close-out checks below still open.

**2026-11-18, Dan (call with Steve):** midgettfite.com is already on the new site (Cloudflare Workers static
site, M&F's Cloudflare account). The Wix subscription is **not** being cancelled: it was prepaid for three
years and Wix won't refund it, so it just runs out at term end. "Cancel Wix" is no longer a task
(acceptance criterion 7 is moot).

**2026-11-18, public DNS/whois check of `investment-property-management-tn.com` (read-only):**
- **Registrar: Wix.com Ltd.**, created 2011-10-10, **expires 2027-10-10**; transfer- and update-locked at Wix.
- **Nameservers: Cloudflare** (`love` / `rodrigo.ns.cloudflare.com`). midgettfite.com uses a different
  Cloudflare pair (`sonia` / `gerardo`), so the two zones are very likely in **different Cloudflare accounts**.
- `@` and `www` resolve to Cloudflare proxy addresses; http and https on both **301 to `https://midgettfite.com/`,
  path and query kept** (e.g. `/rentals?x=1` → `midgettfite.com/rentals?x=1`), so old links reach the new site's
  Wix-path redirects.
- **MX: `webmail1.sitebuildit.com`** — a leftover from an old SiteBuildIt host, not Zoho. Nobody should be using
  mail at this domain; worth confirming before it's ever relied on or removed.

**Still open:**
1. Which Cloudflare account holds the old domain's zone (and who set up the redirect); move it into M&F's account
   if it isn't there.
2. Renew `investment-property-management-tn.com` at Wix before **2027-10-10**, transfer it to Cloudflare
   Registrar, or let it lapse — Dan's call. Moving it off Wix needs the Wix login.
3. The stale SiteBuildIt MX record on the old domain — leave or remove.
4. Close-out checks from the acceptance criteria not yet recorded as verified on the live site: Zoho mail in/out,
   Ivy's dashboard, contact form, payment link, Ivy's property emails (MF-313 — they read the Wix rentals page,
   which only lasts as long as the Wix plan).
