# MF-312 — Getting fully off Wix (plan, 2026-11-28)

**Why now:** Dan forwarded a Wix email on 11/28 and asked whether M&F still pays for Wix or should cancel. The new
site went live on 10/28. The plan was to keep Wix for two weeks and then cancel it. That never happened, so M&F is
probably still paying.
**Related:** go-live story (MF-312), cutover runbook (`MF-312-Cutover-Runbook-2026-10-28.md`), Ivy's listings feed
(MF-313), account move plan (`ivy-voice-assistant/docs/project/docs/MF-Account-Move-Plan-2026-10-02.md`, Stages 4, 5 and 8).

## Where things stand (checked 11/28 from public DNS and the live sites)

| Thing | Where it is | Still needs Wix? |
|---|---|---|
| Website `midgettfite.com` + `www` | New site. M&F's account serves it through the `mf-site-bridge` Worker in Steve's Found by Ford account | No |
| Old address `investment-property-management-tn.com` | DNS on Cloudflare, redirects to `midgettfite.com` (old page addresses land on the right new pages) | **Yes: Wix is still the registrar** (expires 2027-10-10) |
| Email (Zoho) | MX, SPF, DKIM and DMARC records in the Cloudflare zone | No |
| Helpful Forms (5 files) | Served from the new site, `/forms/...` | No |
| Payment portal | QuickClick link | No |
| Listing photos on the site | In the repo, `/uploads/...` | No |
| **Ivy's property emails** | PROD reads listings from the Wix rentals page unless `LISTINGS_SOURCE=feed` is set, and `wrangler.toml` doesn't set it. That page now redirects to the new site, so the reader very likely finds 0 listings and keeps its pre-10/28 cache. Those cached emails use **Wix-hosted photos** (`static.wixstatic.com`) and stale listings. | **Yes, and probably stale already** |
| DNS leftovers | `m` → `www42.wixdns.net` (Wix mobile). GoDaddy-era `email`, `e`, `pop`, `webmail`, `mobilemail` and `pda` → `secureserver.net` | No, just clutter |
| Who pays for Wix, which plan, when it renews | Unknown | Need the Wix login |

**Short answer for Dan:** yes, M&F is almost certainly still subscribed. Don't cancel yet. Two things still use Wix
(Ivy's property emails and the old domain's registration), and they take about a week to move. Then we cancel it.

## Tasks

Steps marked **beacon** mean deploys and DNS changes happen from beacon. **Dan** means only Dan (or the Wix account
holder) can do it.

### A. Find out what Wix is billing (Dan + Steve, 15 min)
1. Find out who has the Wix login. Dan's forwarded email went to the account's address, which is a good clue.
2. In Wix, open **Billing & Payments → Subscriptions** and write down each item: the plan (Premium/Business), the
   domain, any mailboxes or apps, the renewal date, the price and the card.
3. Open **Domains** and confirm `investment-property-management-tn.com` is the only domain there (Steve, 11/28:
   it's the only one).
4. Check for anything else in the account: Wix Inbox or Contacts (old form submissions), Bookings, Payments, email
   marketing, other sites.
- **Done when:** the table above has a "billed" line for each Wix item, and we know the renewal date.

### B. Switch Ivy's property emails to the new site (Claude, beacon, ~1 hour + a week of watching)
1. Confirm the suspicion: check PROD worker logs for `[MF-038] listings page parsed to 0` since 10/28, and
   compare `listing_cache` (D1) against the 6 active rentals on the site.
2. In `ivy-voice-assistant/wrangler.toml` `[vars]`, set `LISTINGS_SOURCE = "feed"` and
   `LISTINGS_FEED_URL = "https://midgettfite.com/listings.json"` (the real address, not the workers.dev preview).
3. Point the "See all photos on our website" link (`LISTINGS_PAGE_URL` in `worker/property-email.js`) at
   `https://midgettfite.com/residential-property-for-rent/`.
4. Clear out listing rows that are no longer for rent and any row still holding `wixstatic.com` photos, so
   nothing points at Wix once it's gone.
5. Run the tests, deploy from beacon on main, then trigger a refresh and send one test property email to Steve.
   Its photos should load from `midgettfite.com`.
6. After a week on the feed with no fallbacks in the logs: remove the Wix reader (`listing-scrape.js`; this is
   MF-313's last criterion).
- **Done when:** a real property email shows current listings with photos from midgettfite.com, and nothing in Ivy
  mentions Wix.

### C. Move the old domain's registration off Wix (Steve + Dan, 20 min, then up to 5 days)
`investment-property-management-tn.com` keeps old links and Google results working. Keep it, as MF-312 recommends.
1. In Wix: **Domains → the domain → Advanced → Transfer away from Wix**. Unlock it and get the transfer code.
2. In **M&F's** Cloudflare account (not Steve's): **Domain Registration → Transfer**. Enter the code and pay about
   $10, which adds a year. The DNS zone needs to be in M&F's account first. If it's in Steve's today, copy it over
   the same way as Stage 4.
3. Approve the transfer emails, from Wix and from the registry.
4. Check that the redirect still works: `https://www.investment-property-management-tn.com/residential-property-for-rent`
   → `midgettfite.com/residential-property-for-rent/`.
- **Done when:** whois shows Cloudflare as registrar and the redirect works.

### D. Take a last copy of anything useful in Wix (Claude + Steve, 30 min)
1. Export contacts and form submissions (Wix Inbox/CRM) to a CSV, saved to M&F's files, not a repo.
2. Note the Wix site's Google Search Console and Analytics settings, if any.
3. Screenshot or PDF the key Wix pages, as a record of the old site.
- **Done when:** the export is saved, and Steve has said nothing else in Wix is worth keeping.

### E. Point the rest of the world at midgettfite.com (Steve or office, 30 min)
1. Google Business Profile: website → `https://midgettfite.com`.
2. Google Search Console: add `midgettfite.com`, submit the sitemap, and use **Change of Address** from the old
   domain.
3. Check other places that link to the old address: Facebook page, Zillow or Realtor profiles, email signatures,
   lease templates, yard signs.
- **Done when:** none of them show the Wix address.

### F. Cancel Wix (Dan or the account holder, 10 min, after B, C and D)
1. Check first: B has run a week on the feed, C's transfer is complete, and D's export is saved.
2. Turn off auto-renew and cancel the plan. Remove the card.
3. Ask about a refund of the unused term if the plan was renewed recently.
4. Save the cancellation confirmation, and tell Dan the date and any refund.
- **Done when:** Wix shows no active subscriptions and Dan has the confirmation.

### G. Clean up DNS (Claude, beacon, 10 min, any time)
1. Delete `m` → `www42.wixdns.net`.
2. Check that nobody uses the GoDaddy-era `email`, `e`, `pop`, `webmail`, `mobilemail` and `pda` records, then
   delete them. **Don't touch** `mail`, MX, SPF, DKIM (`zmail._domainkey`), DMARC or the Zoho, Telnyx or `ivy`,
   `jasper`, `privacy` records.
3. Run `website/bridge-worker/check-live.sh` afterwards.
- **Done when:** no Wix or GoDaddy records are left and the checks pass.

### H. Finish moving everything into M&F's Cloudflare (separate evening with Dan; account move plan Stages 3 to 8)
This part isn't about Wix. It's what's left of "everything in M&F's account":
- the `midgettfite.com` zone and its registration are still in Steve's account (Stages 4 and 5);
- the site reaches the domain through `mf-site-bridge` in the Found by Ford account. After Stage 5, attach the
  domain straight to `midgettfite-site` and delete the bridge;
- `privacy.midgettfite.com` (`mf-privacy` Worker in Steve's account) should forward to `midgettfite.com/privacy`,
  then be retired;
- Ivy, the dashboard, D1 and Jasper (Stages 6 and 6b), then retire the old copies (Stage 8).
- **Done when:** the account move plan's status table is all ✅.

## Order
A and B start now, in parallel. C and D need A (the login). E and G can happen any time. F waits for B (a week on
the feed), C and D. H is its own evening and doesn't block cancelling Wix.

A realistic date to cancel Wix is **about 12/8**, if the login turns up this week.

## After it's done
Update MF-312's status and the account move plan's Stage 7 line. The coordinator moves the board cards.
