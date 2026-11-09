# MF-308 — Transfer the domain from GoDaddy to Cloudflare

**Kind:** story · **Status:** DONE 2026-08-21 · **Source:** `docs/MF-Website-Migration-Plan.md` §5 step 4, §6 D2
**Related:** DNS move (MF-307)
**Part of:** Website — recorded after the fact

**As** Dan,
**I want** midgettfite.com registered at Cloudflare instead of GoDaddy,
**so that** it renews at cost (about $10 a year) and the domain, DNS and site are in one place.

## What was done
- **2026-08-04:** domain unlocked at GoDaddy. Paused there: GoDaddy texts its authorization code to Dan's phone,
  and Dan was at a closing.
- **2026-08-19:** restarted with Dan on hand. WHOIS privacy confirmed off, the authorization code retrieved, the
  transfer started in Cloudflare.
- **2026-08-21:** Dan approved Cloudflare's confirmation; GoDaddy's "Approve Transfer" needed a second click to
  register, then it completed within 30 minutes. Verified: registrar is Cloudflare, and email and the website
  came through untouched (the DNS was already on Cloudflare, MF-307).

## Acceptance criteria — met 8/21
1. ✅ Registrar is Cloudflare; the transfer added a year: **paid through 2027-09-29**. No separate GoDaddy renewal.
2. ✅ Email and the current website unaffected.

## Decisions from Dan
- 8/19: available live for GoDaddy's verification code; 8/21: approved the transfer on both sides.

## Status
DONE 2026-08-21. The transfer fee was $10.46. The registration is in
Steve's Cloudflare account until the account move (Stage 5) puts it in M&F's.
