# MF-306 — Match the look of the Wix site, keep old links working

**Kind:** story · **Status:** DONE 2026-07-13 (Dan's sign-off owed) · **Source:** `docs/MF-Website-Migration-Plan.md` §6 C1, §7 guardrails
**Related:** punch list (MF-310), go-live (MF-312)
**Part of:** Website — recorded after the fact

**As** Dan,
**I want** the new site to look like the one my customers know,
**so that** switching over doesn't feel like a different company.

## What was done (2026-07-12 → 07-13)
- **Home page rebuilt to match Wix:** full-width rotating banner (three slides with real residential and
  commercial photos; a wrong stock photo replaced), testimonials with all seven reviewers' photos, the contact
  form, the resource logos.
- **Header to Wix's scale:** large logo and name, icon badges, the current page highlighted.
- **Menu:** eleven links folded into the same five drop-downs Wix uses (For Sale, For Rent, About Us,
  Services, More) on one row.
- **Old links keep working:** old Wix page addresses redirect permanently to their new pages (`_redirects`),
  so search results and bookmarks don't break.

## Acceptance criteria
1. ✅ Side by side with Wix, the home page, header and menu match.
2. ✅ Old Wix addresses land on the right new page.
3. ⏳ Dan has looked and said it's right — part of the punch list (MF-310).

## Status
DONE 2026-07-13; Dan's sign-off is the punch list's last step.
