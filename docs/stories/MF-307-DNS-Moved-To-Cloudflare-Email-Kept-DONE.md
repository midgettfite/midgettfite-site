# MF-307 — Move the domain's DNS to Cloudflare without breaking email

**Kind:** story · **Status:** DONE 2026-08-03 · **Source:** `docs/MF-Website-Migration-Plan.md` §5 steps 2–3, §6 D1
**Related:** domain transfer (MF-308), go-live (MF-312)
**Part of:** Website — recorded after the fact

**As** Dan,
**I want** midgettfite.com's settings moved to Cloudflare with my email and my current website untouched,
**so that** the domain is ready for the new site and the cheaper renewal, and nobody notices anything changed.

## Why this was the risky one
The settings that deliver mail to the office lived in Wix's DNS. Switching DNS providers moves all of them at
once: anything not copied first stops working, even though the mail server itself never changes. So every
record was copied and checked **before** the switch.

## What was done
- **2026-07-10:** the Cloudflare DNS zone built with all 22 existing records (website, mail, autodiscover, SPF,
  DMARC, DKIM), each set so Cloudflare passes it through unchanged. DNSSEC confirmed off; auto-renew confirmed on.
- **2026-08-03:** the zone re-checked against Wix's live DNS (no changes since 7/10), nameservers switched at
  GoDaddy to Cloudflare's, and verified once it took effect: Cloudflare answering for the domain, the mail
  records identical, the Wix site still loading at the same address.

## Acceptance criteria — met 8/03
1. ✅ Every record copied before the switch; mail records checked twice.
2. ✅ Email kept working; the old site kept loading. Nothing visible to visitors.

## Status
DONE 2026-08-03. The zone is still in Steve's Cloudflare account; it moves into M&F's account in the account
move plan (Stages 4–5), which go-live waits on (MF-312). The Zoho mail records were added later, on the
email track.
