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
| Do you want this one? Where does it rank? | Your call. It saves retyping and lets people apply the same day. <br>**DECISION (Dan, 11/20 call):** medium-high, after the CRM. |
| How does someone show they've seen the property? | **A link the office gives them after the showing**, good for that property for a few days. Not on the public listing. <br>**DECISION (Dan, 11/20 call):** a required box, "Have you seen this property in person with one of our agents?" Without it the form says a showing comes first. Driving by doesn't count. Where possible it's checked against the showing records, so a ticked box alone isn't enough. (The office can still send a link that picks the property.) |
| The $300: paid online, or as today? | **As today** to start. Paying online means a payment service and its fees; it can come later. |
| Social Security numbers and dates of birth | **Left to SmartMove**, which already asks each applicant for them on its own secure site. The website never holds them. |
| Which questions? | **Today's paper application, word for word**, sent to Steve to turn into the form, then approved by you and Jeneva. |
| Who sees applications in Jasper? | **Dan and the property manager (Jeneva).** |
| **For Steve:** until Jasper can take applications, where does a finished one go? | **Into Jasper**, as criterion 5 says: the form stays off until Jasper has a page for applications. The other way, the whole application emailed to office@ (no SSN or birth date), could go live sooner but puts applicants' job, income and record details in a shared mailbox. <br>**DECISION (Steve, 11/23):** into Jasper. The site's Worker checks the application and hands it to Jasper on the box; Jasper stores it and emails the office with no personal details. The form stays switched off until Jasper can take applications. No interim email. |

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

**2026-11-23, what's holding it up.** Dan has ranked it and decided the seen-in-person rule (above). The rest waits on three things:
1. **Jeneva and Dan haven't seen the draft yet.** The draft form and its one-page summary (11/21) are on the website's
   PR #4, not on the board, and nobody has been asked about them. Its 10 questions boil down to Jeneva's wording points
   (questions 2, 4, 5, 7, 8 and 9) and Dan's two calls (question 3: flag or turn back an application with no showing on
   record; question 6: the conviction question). Each has a default they can just OK.
2. **Steve's choice:** where a finished application goes until Jasper can take one (the new row above).
3. **No preview link to show them.** Cloudflare's preview build fails on this PR, as it has on every website PR (#1 to #4),
   while builds of main pass. So it's the preview-build setup, not this form. Until that's fixed, Jeneva and Dan review
   the summary PDF, which lists every question.

**Next step:** put the summary PDF in front of Jeneva and Dan on the board, with the defaults. When they've answered, it goes to To do: their changes to the form, then the beacon setup
(Turnstile, email or Jasper, `/apply`).

**2026-11-23, Steve decided where applications go: into Jasper** (the row above). PR #4 now hands a checked application to
Jasper (`POST jasper-box.midgettfite.com/portal/applications`, with its own Cloudflare Access service token, the way Ivy reaches the box) instead of emailing it, and the Cloudflare email setup is gone from the plan. The
Jasper side (an endpoint that stores the application, a portal page, and the detail-free email) is written up in the jasper
repo: `docs/MF-316-Applications-Receive.md` on branch `scout/mf-316-applications`.
