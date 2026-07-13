# Midgett & Fite — Brand & Design Assets (from Wix, 2026-07-12)

For the "match current look" design pass. All URLs are the **full-resolution originals** (Wix transform
suffix stripped). These are NOT part of the listing-photo migration — they're the site's brand imagery.

> Coordinate: if Claude Code is mid-edit on the repo, treat this as reference only and pull these in as a
> separate design pass to avoid conflicts.

## Images (download into `public/img/`)

| Asset | File suggestion | Source URL |
|---|---|---|
| Logo (house mark + wordmark) | `logo.jpg` | https://static.wixstatic.com/media/c47812_d747b10ce57f471da302478456fd4d8c~mv2.jpg |
| Hero collage (team + TN flag) | `hero-home.png` | https://static.wixstatic.com/media/c47812_143f0f24834348cb86d166bc37a157a2~mv2.png |
| Dan Midgett headshot | `team-dan.jpg` | https://static.wixstatic.com/media/c47812_00826beafbd5432188b25e6606709fa3~mv2.jpg |
| Jeneva Midgett headshot | `team-jeneva.jpg` | https://static.wixstatic.com/media/c47812_0ff99edd3c6f4ada8dfc46bcdcefc1d0~mv2.jpg |
| Jeanice Birch headshot | `team-jeanice.jpg` | https://static.wixstatic.com/media/c47812_d10438244e2643a1bf6e2027d71071c0~mv2.jpg |
| Nate Midgett headshot | `team-nate.jpg` | https://static.wixstatic.com/media/c47812_2cd9edbe967c4c1b977a1dde63c5d58e~mv2.jpg |

Download (network required — run in Claude Code, not the Cowork sandbox):

```
cd ~/Consulting/midgettfite-site && mkdir -p public/img
curl -L -o public/img/logo.jpg        "https://static.wixstatic.com/media/c47812_d747b10ce57f471da302478456fd4d8c~mv2.jpg"
curl -L -o public/img/hero-home.png   "https://static.wixstatic.com/media/c47812_143f0f24834348cb86d166bc37a157a2~mv2.png"
curl -L -o public/img/team-dan.jpg     "https://static.wixstatic.com/media/c47812_00826beafbd5432188b25e6606709fa3~mv2.jpg"
curl -L -o public/img/team-jeneva.jpg  "https://static.wixstatic.com/media/c47812_0ff99edd3c6f4ada8dfc46bcdcefc1d0~mv2.jpg"
curl -L -o public/img/team-jeanice.jpg "https://static.wixstatic.com/media/c47812_d10438244e2643a1bf6e2027d71071c0~mv2.jpg"
curl -L -o public/img/team-nate.jpg    "https://static.wixstatic.com/media/c47812_2cd9edbe967c4c1b977a1dde63c5d58e~mv2.jpg"
```

## Look & feel (current Wix site)
- **Header:** dark charcoal bar (~`#2b2b2b`), full-width. Logo top-left, phone line "Give us a call today!
  615-444-3136" beside it. Social icons top-right (email, Facebook, X/Twitter @MidgettandFite, Google Maps).
- **Nav:** horizontal, thin **red** (~`#b0413e`) links/underline on the dark header — Home · For Sale · For
  Rent · About Us · Services · Payment Portal · More.
- **Body:** light/near-white background, dark text. Warm, plain, trustworthy — not corporate.
- **Accent red** used site-wide (headings, prices, buttons): approx **`#b0413e`** (already used in the
  migrated pages: payment button, testimonials rule, SOLD/LEASED badges).
- **Logo type:** light serif wordmark "MIDGETT & FITE REAL ESTATE".

## Wiring notes (for the design pass)
- **Logo** → replace the text brand in `src/layouts/Base.astro` (`.brand`) with `<img src="/img/logo.jpg">`.
- **Headshots** → `src/pages/meet-the-team.astro` already has an `.avatar` placeholder per member; swap in the
  matching `/img/team-*.jpg`. (Keep names/titles as-is; Nate = "Maintenance Manager," confirmed by Dan 2026-07-12.)
- **Hero** → `src/pages/index.astro` top section; use `/img/hero-home.png` as the hero banner.
- Use Astro `<Image>`/`astro:assets` for optimization if importing into `src/`; or keep in `public/img/` for
  simple `<img>` use.

## Social / contact (for header + footer)
- Facebook: https://www.facebook.com/midgettandfite/
- X/Twitter: https://twitter.com/MidgettandFite
- Google Maps: https://maps.google.com/?cid=2622158749148926133
- Email: midgettandfiteoffice@gmail.com · Phone: (615) 444-3136

## Not yet captured
- Additional hero **slideshow** slides (Welcome / Residential / Commercial promo slides) — only the main team
  collage was pulled. Grab the rest if the design uses a rotating hero.
- Small resource-strip logos (Equal Housing, Realtor, TARNET, etc.) — we link out with text instead, so these
  aren't needed unless you want the logo images.
