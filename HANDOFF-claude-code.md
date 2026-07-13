# Handoff → Claude Code: Midgett & Fite site (photos + finish-up)

Context: Wix → Astro + Pages CMS migration. Cowork session on 2026-07-12 did the Pages CMS
connection, all static content, and all 18 real listings (text). This note is the remaining work,
which is better done here (you have the CLI token, network access to download files, and git push).

## 1. First thing: push the committed work
A commit is already staged locally and NOT yet pushed:

```
cd ~/Consulting/midgettfite-site
git log --oneline -1      # should show: aefe067 Migrate real content from Wix...
git push origin main       # deploys to midgettfite-site.pages.dev (preview, not live domain)
```

Do NOT touch DNS/nameservers/domain — that's a separate August task.

## 2. Repo facts you need
- Astro static site; listings are Markdown files in `src/content/listings/` (one file per property).
- Schema: `src/content.config.ts`. Each listing has a `photos: []` array of paths.
- Images live in `public/uploads/`. A path `"/uploads/foo/01.jpg"` in `photos` resolves to `public/uploads/foo/01.jpg`.
- ListingCard uses `photos[0]` as the cover; the detail page (`src/pages/property/[id].astro`) renders all `photos`.
- `npm install` then `npm run build` to verify. (Note: building inside a read-only mount throws a harmless
  EPERM on dist cleanup; the build itself completes — check for "✓ Completed"/"Complete!".)

## 3. The 18 listings and their photo counts (targets)
Slugs = the .md filenames in src/content/listings/. Photo counts confirmed from live Wix galleries:

Residential-sale: 556-victor-ave (31) · 215-robertson-lane (23) · 1215-meadow-road (35) · 1289-hunters-point-pike (15)
Commercial-sale: 113-jordan-drive (4, SOLD) · 102-e-main-st (21, SOLD) · 1289-hunters-point-pike (15)
Land-sale: 0-greenvale-road (16)
Residential-rent: 316-southwinds-dr (24) · 607-tater-peeler-rd (17) · 645-longtail-ln (19) · 556-victor-avenue (32) · 80-sunrise-lane (11) · 1528-stone-hill-rd (15, LEASED) · 403a-martin-ave (13, LEASED) · 110-fisher-drive (46, LEASED)
Commercial-rent: 700-e-main-unit-f (7, LEASED) · 700-b-main-unit-b (11, LEASED)

Total ≈ 300 photos.

## 4. Photo migration — two ways

### Option A (recommended): Wix Media Manager export
Steve is logged into Wix. In the Media Manager, download the listing photos (originals), then drop them
into `public/uploads/<listing-slug>/` (one folder per listing above). Then set each listing's `photos:`
array to the ordered file list, e.g. for 556 Victor:
```
photos:
  - /uploads/residential-sale-556-victor-ave/01.jpg
  - /uploads/residential-sale-556-victor-ave/02.jpg
```
This keeps everything in-Git (the project's constraint) with no external dependency.

### Option B: pull from the Wix CDN directly (you have network; Cowork's sandbox did not)
Wix serves each gallery image from `https://static.wixstatic.com/media/<mediaId>` where `<mediaId>` looks
like `c47812_<32-hex>~mv2.jpg`. The URL on the live page has a `/v1/fill/w_.../` transform suffix — STRIP
everything from `/v1/` onward to get the full-resolution original.

Getting the per-listing mediaId list requires driving the galleries, because Wix lazy-loads them (only ~3
images per gallery are in the DOM at once). The working technique (validated in Cowork):
- Each gallery has a next arrow: `[data-testid="gallery-nextButtonInner"]`. Count = number of galleries.
- Each gallery shows a caption `k/N` (current/total). Read N to know the count.
- Loop: record caption index → click the next arrow → poll until the index changes → collect any
  `img` src matching `static.wixstatic.com/media/...`, strip the `/v1/...` transform, dedupe → repeat
  until you've collected N unique IDs.
- Galleries mount only when scrolled into view, so scroll the whole page first.
- Map gallery → listing by photo count (counts are unique within each category page; see §3).

If you have browser automation, replicate the above to build `photo-manifest.json`
(`{ "<listing-slug>": ["https://static.wixstatic.com/media/<id>", ...] }`), then download each URL into
`public/uploads/<slug>/NN.jpg` and write the `photos:` arrays. If not, use Option A.

NOTE: the Cowork run already extracted ~8 of 18 galleries (residential-sale, commercial-sale, land) into the
Wix tab's `localStorage` key `__mf_photos` (values are mediaId arrays keyed like `res-sale::31`). If that
Chrome tab is still open you can read it; otherwise just re-extract — it's cheap.

## 5. Other open items
- **Helpful-forms docs** — `helpful-forms.astro` links to `/forms/*` which don't exist yet. Download these 5
  Wix-hosted files into `public/forms/` before Wix is retired (curl works; they're static):
  - printable-application.pdf ← https://www.investment-property-management-tn.com/_files/ugd/c47812_c496970b137d4982b8d8bb61fd9625b2.pdf
  - move-in-checklist.docx ← https://www.investment-property-management-tn.com/_files/ugd/c47812_db53d56db2fb4276a69e72e247af32ee.docx
  - move-out-checklist.docx ← https://www.investment-property-management-tn.com/_files/ugd/c47812_8afbc906fc5740339b4ae3eaf376ba22.docx
  - visitor-notice.doc ← https://www.investment-property-management-tn.com/_files/ugd/c47812_aa7348087ee14b69a6cfea1cb8f40284.doc
  - home-maintenance-tips.pdf ← https://www.investment-property-management-tn.com/_files/ugd/c47812_e75fa3f52a304528b5857c4fc5432673.pdf
  (The "Online Application" stays external: https://form.jotform.com/233547002774152)
- **Video tour URLs** — not yet captured per listing. On each listing the "Video Tour" button links to a
  YouTube short; "Property Information" links to RealTracs (`go.realtracs.com/...`). Grab per listing and set
  `videoUrl:` in the frontmatter.
- **Contact form** — `contact.astro` has the form markup but no delivery handler. Wire Cloudflare Pages Forms
  (or a Worker) → `midgettandfiteoffice@gmail.com` until Zoho email is live.
- **Nate Midgett title** — CONFIRMED by Dan (2026-07-12): "Maintenance Manager." Fixed in
  `meet-the-team.astro` (was "Repair Manager"); `company-history.astro` already had it right.
- **Resource links** — DONE (real URLs already wired on home + commercial-sale).
- **Staff CMS invites** — deferred to training (D4). Don't send yet.

## 6. Content reference
Full text inventory (bios, history, service copy, testimonials, all listing details) is in
`CONTENT-INVENTORY.md` in this repo.
