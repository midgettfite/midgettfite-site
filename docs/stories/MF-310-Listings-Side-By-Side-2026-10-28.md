# MF-310 / MF-312 — Listings side by side with Wix (2026-10-28, go-live refresh)

Evidence for MF-312 criterion 8: listings refreshed from Wix one last time, on the day of the switch. Same method as
`MF-310-Listings-Side-By-Side-2026-10-06.md`.

**Wix read live on 2026-10-28, 10:59–11:00 AM CT** (all five listing pages: residential and commercial for rent,
residential and commercial for sale, land). Wix's sitemap shows every page last edited 2026-10-27.
Every gallery's full photo list was read from Wix's own page data. The counts match each gallery's "1/N" counter.
Each Wix original was then matched to the new site's photos by image fingerprint, not by eye. This is stricter than
10/06, and it found the photo problems listed below.

New-site commits (repo `midgettfite/midgettfite-site`, main): `85e4e92`, `3d6d508`, `7a509d2`, `3ccfd5f`.
Preview checked after the build at https://midgettfite-site.midgett-and-fite.workers.dev (11:23 AM): new prices,
UNDER CONTRACT, Suite B page, both removed pages 404, new photo files served byte-identical. The old
`midgettfite-site.pages.dev` address no longer resolves (DNS), so there was nothing to check there.

## Changed on the new site to match Wix

| Listing | Wix today | New site before | Now |
|---|---|---|---|
| 209 Burdock St (rent) | $1300/month, 2/1, 720 sf, 13 photos | $1,350/mo | **$1,300/mo** |
| 301C Martin Ave (rent) | Price Update! $1200/month, 2/1, ~800 sf, 18 photos | $1,300/mo | **$1,200/mo** (Price Update kept) |
| 462 South College St (rent) | $1400/month, 3/2, 1,124 sf, 17 photos | $1,500/mo | **$1,400/mo** |
| 102 East Main Street, Suite C (commercial rent) | $750/month, 270 sq ft, new description, 13 photos | "102C East Main Street, Unit C", $750, no sq ft, old description, 8 photos | **renamed Suite C, 270 sf, Wix's description, Wix's 13 photos.** Page address kept (`/property/commercial-rent-102c-e-main-unit-c`). 5 of the old 8 photos are in Wix's new gallery. The other 3 are no longer on Wix |
| 102 East Main Street, Suite B (commercial rent) | $750/month, 350 sq ft, 15 photos | missing | **added** |
| 700 E Main St, Unit C (commercial rent) | gone from Wix | LEASED | **removed** |
| 700 B Main St, Unit B (commercial rent) | gone from Wix | LEASED | **removed** |
| 1215 Meadow Road (sale) | UNDER CONTRACT! (price no longer shown) | $327,400, available | **UNDER CONTRACT badge** (price still shown, as for 215 Robertson; see questions) |
| 0 Greenvale Road (land) | Price Update! $139,000 | $149,000 | **$139,000** (Price Update kept) |

The two removals follow the 10/12 precedent: leased, and taken off Wix.

## Same on both

Price, status, beds/baths/sq ft and description all agree:
- 1528 Stone Hill Rd (leased), 1529 Stone Hill Rd (leased), 1605 Villa Circle (leased), 645 Longtail Ln (leased),
  403A Martin Ave (leased).
- 215 Robertson Lane (UNDER CONTRACT, 3/1.5, 2,094 sf, video link same).
- 1289 Hunters Point Pike, residential (Price Update! $395,000) and commercial ($395,000, no badge), both 3/2, 1,749 sf.
- 113 Jordan Drive (SOLD), 102 E Main St (SOLD).

All seven RealTracs "Property Information" links are identical on both sites and open (HTTP 200).
Photos are now identical to Wix, photo for photo and in Wix's order, for all 15 listings that have Wix photos.

## Photo problems found and fixed

- **Six listings were missing one Wix photo and showed another twice** (third place and last). This has been the case
  since the July copy, and 10/06's visual check missed it. Restored from Wix, duplicate dropped:
  0 Greenvale Road (Wix #11), 645 Longtail Ln (#12), 1215 Meadow Road (#3), 215 Robertson Lane (#14),
  1289 Hunters Point Pike residential (#3) and commercial (#10).
- Those six, plus 1529 Stone Hill, 1605 Villa Circle and 462 South College, had Wix's last photo in third place.
  All now follow Wix's order. Covers are unchanged. Photo 3 of each changes, and that photo also feeds the email
  thumbnails for the rentals.
- **113 Jordan Drive (4 photos) and 102 E Main St (21 photos), both sold:** Wix still returns "Forbidden" for every
  photo, as on 10/06. Both still show "Photo coming soon".

## On the new site but no longer on Wix — Dan to decide (10/06 list): current state

| Listing | New site today | Wix today |
|---|---|---|
| 316 Southwinds Dr (rent) | not on the site (removed in the 10/12 refresh) | not on Wix |
| 556 Victor Avenue (rent) | not on the site (removed 10/12) | not on Wix |
| 607 Tater Peeler Rd, Lot 15 (rent) | not on the site (removed 10/12) | not on Wix |
| 80 Sunrise Lane (rent) | not on the site (removed 10/12) | not on Wix |
| 556 Victor Ave (sale) | not on the site (removed 10/12) | not on Wix |
| 110 Fisher Drive (rent) | not on the site (removed 10/12) | not on Wix |

Nothing was changed for these today.

## Video tours

Only 215 Robertson Lane has a working video link on Wix (the same YouTube playlist the new site uses). Wix also shows
**"Video Tour" buttons on 1215 Meadow Road and both 1289 Hunters Point Pike listings, but they link nowhere** (no link is
set on the button in Wix). The new site shows no video button for these three.

## Questions for Dan

1. **215 Robertson Lane's "Property Information" link opens the wrong house.** Wix's link (`go.realtracs.com/1Q3HXA3`),
   copied as-is to the new site, opens *2176 Postings Pt, Antioch, TN 37013 (MLS# 2762813)*. What is the right link?
2. **Under-contract prices:** Wix hides the price on 215 Robertson and 1215 Meadow. The new site shows the last
   asking price with the UNDER CONTRACT badge ($175,000 and $327,400). Keep the prices or hide them?
3. **Video Tour buttons on Wix with no video** (1215 Meadow, 1289 Hunters Point Pike ×2): are there videos for these?
4. **Photos for 113 Jordan Drive and 102 E Main St (sold):** still blocked on Wix. Does the office have them? (Open since 10/06.)
5. **102 East Main, Unit C → Suite C:** Wix now calls it "Suite C" with new photos and 270 sq ft. Confirm it is the same
   space as the "102C East Main, Unit C" listed on 10/12.

## Wording copied as written

Suite B's and Suite C's descriptions are Wix's text (stray spaces trimmed). Everything else is unchanged from earlier refreshes.
