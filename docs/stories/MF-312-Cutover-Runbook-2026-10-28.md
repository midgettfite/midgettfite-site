# MF-312 — Tonight's cutover runbook (2026-10-28, ~10:45 PM)

**Dan's go:** "We are a go to convert the website this evening" (email, 10/28).
**Who clicks:** Steve, in **his own** Cloudflare dashboard (the `midgettfite.com` zone is still in Steve's account;
M&F's account has the site). Claude runs the checks.
**Why a bridge:** Cloudflare attaches a domain only to a Worker in the same account. Until the domain moves to M&F
(account move plan Stage 5), a small Worker in Steve's account serves the site from M&F's account. Edits in the
editor show up live, because the bridge just passes requests through.

## Before (recorded 4:40 PM, from public DNS)
| record | value | touch? |
|---|---|---|
| `midgettfite.com` A ×3 | `185.230.63.171`, `185.230.63.186`, `185.230.63.107` (Wix), DNS only | **remove** |
| `www` CNAME | `cdn1.wixdns.net` (Wix), DNS only | **remove** |
| MX | `mx.zoho.com` 10, `mx2.zoho.com` 20, `mx3.zoho.com` 50 | ⛔ never |
| TXT on `midgettfite.com` | SPF, Zoho verification, Telnyx verification | ⛔ never |
| `_dmarc`, `zmail._domainkey`, `mail` A `45.61.169.166` | email | ⛔ never |
| `privacy`, `ivy`, `jasper`, others | Workers | ⛔ never |

Wix today: both addresses 301 to `www.investment-property-management-tn.com`.

## Steps
1. **Create the Worker.** Workers & Pages → Create → Worker → name **`mf-site-bridge`** → Deploy (Hello World) →
   **Edit code** → replace everything with `website/bridge-worker/worker.js` → Deploy.
2. **Test it before touching DNS.** Open its `….workers.dev` address. The new site must load with photos.
   Claude runs `bash website/bridge-worker/check-live.sh <that host>`. ⚠️ The local test couldn't reach the origin
   (sandbox network), so this is the first real test of the pass-through.
3. **DNS → Records:** delete the **three A records named `midgettfite.com`** and the **`www` CNAME**. Nothing else.
   (The site is briefly unreachable from here until step 4. A minute or two.)
4. **The Worker → Settings → Domains & Routes → Add → Custom domain:** `midgettfite.com`, then again for
   `www.midgettfite.com`. Cloudflare creates the records and the certificate.
5. Claude runs `bash website/bridge-worker/check-live.sh` (every page, old Wix addresses, contact-form key, www→apex,
   MX/SPF/DMARC/DKIM/mail unchanged, privacy/ivy/jasper answering).
6. Steve: open midgettfite.com on his phone (off Wi-Fi) and submit nothing; just look.

## Undo (if anything is wrong)
1. The Worker → Domains & Routes → remove both custom domains.
2. DNS → add back, **DNS only (grey cloud)**: A `midgettfite.com` → `185.230.63.171`, `185.230.63.186`, `185.230.63.107`;
   CNAME `www` → `cdn1.wixdns.net`.
Wix never changed, so the old site is back as soon as DNS catches up.

## After
- Tell Dan it's live; set tomorrow's training time.
- `privacy.midgettfite.com` keeps answering as is (MF-310 note: forward it to `/privacy` later).
- Wix stays on (MF-312: two-week overlap, then cancel; Ivy's property emails still read the Wix rentals page — MF-313).
- When the domain moves to M&F (Stage 5): attach `midgettfite.com` to `midgettfite-site` directly, delete `mf-site-bridge`.
- Update MF-312 status, the account move plan (Stage 7), and the client boards (`check-client-boards.py`).

## Done — 2026-10-28, 11:09 PM
- 10:58 PM `mf-site-bridge` created by Steve in **Found by Ford** (`mf-site-bridge.ccloudflare-acd.workers.dev`); all checks passed on it.
- 11:08 PM via the Cloudflare API connector (`mcp.cloudflare.com/mcp`, signed in as `accounts@volunteer-ai.com`, manual approval):
  deleted A `midgettfite.com` ×3 (Wix) and CNAME `www` → `cdn1.wixdns.net`; attached `midgettfite.com` and `www.midgettfite.com` to `mf-site-bridge`.
- 11:10 PM `check-live.sh` against midgettfite.com: **ALL CHECKS PASSED** (every page, old Wix addresses, contact key, www→apex,
  MX/SPF/DMARC/DKIM/mail unchanged, privacy/ivy/jasper answering).
- Still open: Steve's phone check off Wi-Fi; tell Dan.
- Noticed, not touched: leftover records `m` → `www42.wixdns.net` (Wix mobile) and GoDaddy-era `email`, `e`, `pop`, `webmail`, `mobilemail`, `pda` CNAMEs → `secureserver.net`. Candidates for cleanup later.
