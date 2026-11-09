# MF-305 — Contact form

**Kind:** story · **Status:** DONE 2026-07-12 (delivery check owed) · **Source:** `docs/MF-Website-Migration-Plan.md` §6 C5
**Related:** punch list (MF-310)
**Part of:** Website — recorded after the fact

**As** someone visiting the site,
**I want** to send the office a message from the website,
**so that** I can get in touch without picking up the phone.

## What was done (2026-07-12, commits `0cc2d24`, `7246c19`, `706ab97`)
- The full "Get In Touch" form from Wix (name, email, phone, address, subject, message) on the home page and
  the contact page.
- Messages are delivered by Web3Forms, a free form-to-email service, so the site needs no server of its own.

## Acceptance criteria
1. ✅ The form submits and shows a confirmation.
2. ⏳ A test message arrives in the right office mailbox. The destination was set before the office moved to
   Zoho and hasn't been re-checked — carried to the punch list (MF-310), along with moving the Web3Forms
   account under `it@midgettfite.com`.

## Status
DONE 2026-07-12; delivery verification carried to MF-310.
