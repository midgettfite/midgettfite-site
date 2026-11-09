# MF-312 — Go live at midgettfite.com, then retire Wix

**Kind:** story · **Status:** DRAFT · **Source:** `docs/MF-Website-Migration-Plan.md` §5 steps 5–6, §6 D3/D5; account move plan Stage 7
**Related:** punch list (MF-310), listings feed for Ivy (MF-313), account move plan Stage 5
**Part of:** Website

**As** Dan,
**I want** midgettfite.com to show the new site, and Wix cancelled,
**so that** I own my website outright and stop paying Wix.

## Background
Today midgettfite.com sends visitors to `investment-property-management-tn.com`, the Wix site. That domain is
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
7. Wix stays on for the overlap Dan picks; then it's cancelled, after checking nothing still depends on it.
8. **Listings refreshed from Wix one last time, the day of the switch** (Steve 10/12: the preview is a demo and is not kept
   in step with Wix day to day; refreshed 10/12 after a month, and once more at go-live). Same method as
   `MF-310-Listings-Side-By-Side-2026-10-06.md`: take down what Wix took down, add what's new, check every price.

## Decision needed from Dan
| Question | Recommended default |
|---|---|
| Go-live date | **A weekday morning**, after the punch list is OK'd and the DNS move is done. |
| `investment-property-management-tn.com` — keep it pointing at the new site, or let it lapse? | **Keep it and redirect it** to midgettfite.com, moved off Wix to Cloudflare. Old links and search results keep working. |
| How long to keep Wix after go-live? | **Two weeks**, then cancel. |
| Who has the Wix login, to cancel and to release the domain? | No default; needed before cancelling. |

## Status
DRAFT, 2026-10-03.
