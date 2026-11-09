# MF-315 — Let the office edit the team, testimonials and site details

**Kind:** story · **Status:** DRAFT · **Source:** Steve, 2026-10-29, after the office training (MF-314)
**Related:** listings editor (MF-302), office training (MF-314)
**Part of:** Website

**As** office staff,
**I want** to change the words and photos on the website's other pages the same way I change a listing,
**so that** a new team member, a new testimonial or new office hours don't have to wait for Steve.

## What staff can change today, and what this adds

Today the editor (Pages CMS) has one form: **Property Listings**. Everything else is written into the site's code,
so only Steve can change it. This story adds four forms next to Property Listings. Each works like a listing:
open it, change it, **Save**, and it's live in about 2 minutes.

| New form | What staff can change | Shows on |
|---|---|---|
| **Team** | Each person's name, title, photo and bio; add or remove a person; set the order | Meet the Team |
| **Testimonials** | Add, edit or remove a quote and the client's name; set the order | Testimonials |
| **Office details** | Phone, email, street address, office hours | Header, footer, Contact, and every page that shows the phone number (about 13 places today, each typed in separately) |
| **Home page** | The welcome text, and the slideshow photos with their captions | Home page |

**What stays with Steve, on purpose:** colors, fonts, the menu, page layout, and adding new pages. The editor
cannot change those, and that is a safeguard: it's how small-business sites end up broken or inconsistent.

## Acceptance criteria
1. The four forms appear in Pages CMS under Property Listings, with plain-English field names and hints, like
   the listing form.
2. **Nothing looks different on the website** when it's switched over: same pages, same words, same photos.
3. Changing the phone number once in **Office details** changes it everywhere it appears on the site.
4. A staff member can add a new team member with a photo, and remove one, without help.
5. A staff member can add a testimonial and change the order they appear in.
6. The staff guide gets a short new page covering the four forms.

## Decision needed from Dan
| Question | Recommended default |
|---|---|
| Which of the four forms? | **All four.** Team and Office details matter most. |
| Should **Company History** be editable too? | **Not yet.** It changes rarely and is long; Steve updates it on request. Easy to add later. |
| Who may change the Team and Home page? | **Anyone with an editor login**, same as listings. Every change is kept and can be undone. |
| Team photos | **Square, head-and-shoulders.** Phone photos must be shrunk first until the photo upload page is built, because the editor rejects photos over about 3.4 MB. |

## Status
DRAFT, 2026-10-29.

**2026-11-04, Dan:** low priority, in the backlog. "This is not a large bang for buck at this point because these do not change often.  The only way we are in a bind is if something happens to Steve." Parked.
