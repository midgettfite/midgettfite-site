# MF-316 — An online rental application on the website

**Kind:** story · **Status:** DRAFT · **Source:** Jeneva, on the board, 2026-11-19 (on the listing drafts story, MF-205)
**Related:** listing drafts (MF-205), the office's procedures (MF-225: the $300, credit score, pay stubs), the CRM (MF-221)
**Part of:** Website

**As** someone who has just toured a Midgett & Fite rental,
**I want** to fill in the application online, on midgettfite.com,
**so that** I can apply the same day, and the office isn't retyping paper applications.

## Background
Jeneva, 11/19: "I would like our website to have an online application (let us approve the form) because we do not accept
applications unless the customer has seen the property they are applying to see. This would be a great customer relations
improvement and automate our application process."

- The office used a JotForm application once; it charged once there were more than 10 a month, so it was dropped.
- Zillow's own applications are always switched off: Zillow charges the applicant a fee before they've seen the home and
  keeps it. The office wants applicants on its own application.
- What the office asks for today (MF-225): every adult who'll live there applies; $300 application money, $45 an adult of it
  paying for the credit and background check (SmartMove), the rest going to the first month or refunded if denied; credit
  score 520 or higher; 3 months of pay stubs, or 2 to 3 months of bank statements if self-employed; pets named on the
  application, since each owner decides about pets.

## Acceptance criteria
1. An **Apply** form on midgettfite.com with the office's own questions, worded as Dan and Jeneva approve them. The same
   questions for every applicant (Fair Housing).
2. Only someone who has **seen the property** can apply: the office gives them the link (or a code) after the showing.
3. The form names the property, and lets each adult in the household apply, linked as one household.
4. Pay stubs or bank statements can be added as photos or PDFs from a phone.
5. A finished application goes **into Jasper**, on a portal page the office works from, and into the CRM under that
   person and property. The office gets an email that one has arrived, with **no personal details** in the email.
6. **Social Security numbers and dates of birth are never stored by the website.** They're entered on the screening
   company's own site (SmartMove invites the applicant by email today). If the office wants them on the form, they're
   encrypted and only Dan and the property manager can see them.
7. Nothing is decided automatically: the office approves or denies, as today.

## Decision needed from Dan
| Question | Recommended default |
|---|---|
| Do you want this one? Where does it rank? | Your call. It saves retyping and lets people apply the same day. |
| How does someone show they've seen the property? | **A link the office gives them after the showing**, good for that property for a few days. Not on the public listing. |
| The $300: paid online, or as today? | **As today** to start. Paying online means a payment service and its fees; it can come later. |
| Social Security numbers and dates of birth | **Left to SmartMove**, which already asks each applicant for them on its own secure site. The website never holds them. |
| Which questions? | **Today's paper application, word for word**, sent to Steve to turn into the form, then approved by you and Jeneva. |
| Who sees applications in Jasper? | **Dan and the property manager (Jeneva).** |

## Status
DRAFT, 2026-11-20. In the backlog for Dan to rank.

**2026-11-20, call with Dan:** medium-high priority, after the CRM. "Who puts money down on something they haven't seen?"
- A required checkbox: **"Have you seen this property in person with one of our agents?"** Without it, the form says a
  showing comes first and doesn't take the application. Driving by doesn't count.
- Where possible, checked against the showing records, so a ticked box alone isn't enough.
- A check that the applicant is a person (Cloudflare's), since bots fill in applications.
- Jeneva has particular ideas for it and reviews the form before it goes live.

**2026-11-21, draft form built (scout, branch `scout/online-application`).** The paper application turned into a web form at
`/apply-draft`. It's not linked from the site and not indexed, and it turns applications away until it's switched on. It has the
seen-in-person checkbox and Cloudflare's person check, and it doesn't ask for an SSN, date of birth, driver's license number, or
occupants' relationships and birthdates. Every question, why it's there, and 10 open questions:
`MF-316-Application-Form-Summary-DRAFT-2026-11-21.md`. Next: Jeneva and Dan review it.
