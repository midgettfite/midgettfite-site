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
| Do you want this one? Where does it rank? | Your call. It saves retyping and lets people apply the same day. <br>**DECISION (Dan, 11/20 call):** medium-high, after the CRM. <br>**DECISION (Dan, 11/24):** "Yes, medium-high is fine." |
| How does someone show they've seen the property? | **A link the office gives them after the showing**, good for that property for a few days. Not on the public listing. <br>**DECISION (Dan, 11/20 call):** a required box, "Have you seen this property in person with one of our agents?" Without it the form says a showing comes first. Driving by doesn't count. Where possible it's checked against the showing records, so a ticked box alone isn't enough. (The office can still send a link that picks the property.) <br>**Dan, 11/24 (asked of Jeneva and Nate):** "This looks like a good idea, and could prevent spammers from abusing the site and application process, but do you think it would be a deterrent for our applicants?" **Not answered yet.** <br>**DECISION (Dan, 11/24), in full below:** the box is required; a ticked box with no showing found is flagged for the office, never turned back. **Open:** the box's exact words. |
| The $300: paid online, or as today? | **As today** to start. Paying online means a payment service and its fees; it can come later. <br>**DECISION (Dan, 11/24):** "We only accept certified funds or cash for an application or lease signing." And: "We also accept money orders." So no cards and no personal checks; it was tried, and charges were denied and checks bounced. |
| Social Security numbers and dates of birth | **Left to SmartMove**, which already asks each applicant for them on its own secure site. The website never holds them. <br>**Dan, 11/24: "Let's discuss"** (not a decision; it differs from the default). Dan believes the SSN (or other ID) and date of birth are "absolutely necessary", to prosecute the lease and to verify who the person is. Dan proposes a process (below) and asks Jeneva, Nate, Steve and Jeanice for input. **Open.** |
| Which questions? | **Today's paper application, word for word**, sent to Steve to turn into the form, then approved by you and Jeneva. <br>**Dan, 11/24:** "I think this would be a great opportunity to start with what we have and have a discussion on how it could be better if online." Dan names pointers and Spanish translations. **Open:** the review, once Jeneva answers. |
| Who sees applications in Jasper? | **Dan and the property manager (Jeneva).** |
| **For Steve:** until Jasper can take applications, where does a finished one go? | **Into Jasper**, as criterion 5 says: the form stays off until Jasper has a page for applications. The other way, the whole application emailed to office@ (no SSN or birth date), could go live sooner but puts applicants' job, income and record details in a shared mailbox. |

## Dan's answers, 2026-11-24
On the board, 9:13 to 11:08 AM. Nothing is built or changed from these.

**Settled.**
- **The showing check.** "If they check the box that all have seen it, Jasper can flag it for office to check.  Don't turn it back.  If they don't fill in required
  information or check the "All adults have seen and approve..." box turn it back.  If they don't check the box, a message "All applicants are required to view the
  property with one of our staff before an application can be processed.""
- **The conviction question stays.** "Unless the law has changed recently we had an attorney review and were okay (as of a decade ago).  We regularly rent to
  applicants with a record.  We just want to see if they will be honest. (Same thing with our check box -- if they check the box and have not seen it they are lying.)"
  Dan was asked to choose between keeping it as it is (convictions only, never arrests) and limiting it to recent years. Dan
  didn't ask for a limit. The attorney's review is about ten years old, so whether the law has changed is worth asking.
- **The $300:** certified funds, cash or a money order.
- **Where they are kept today** (question 7, which asked Steve where a finished one goes): "Applications are scanned and placed on our secure server under
  PM/Owners & Leases/.../&lt;owner name&gt;/&lt;property address&gt;/&lt;tenant name&gt;/Application docs along with pay stubs, credit reports, etc." And: "When the application is
  received the SmartMove is initiated." Steve's 11/23 choice, into Jasper, stands unless the proposal below replaces it.
- **The review.** "Once Jeneva answers, I'd like us to review the application form."

**Proposed by Dan, "Let's discuss": not settled.**
1. "Application submitted online (and I would like to keep it simple, no attached files at this point), just a simple application with a button that says "I
   certify that all adults who will reside at this property have inspected and approve the property AS-IS."  If there are multiple applicants each have
   their own form and check box.  Required fields:  Name, DOB, SSN (or other identier such as Passport #) ... (We need to flesh out what is on the application and what is not.)"
2. "Jasper translates it to a PDF for our office to process."
3. "An employee loads it to the server and reviews for completeness.  Contacts the applicant and asks for pay stubs, etc."
4. "Once Jasper verifies that the application data is loaded and secure on the server, the application data is deleted from Jasper's files."

And: "We need to be sure Jasper adheres with our privacy policy also."

On who sees applications in Jasper (question 6): "No one needs to "see" it if Jasper produced the PDF with the information which is downloaded to our permanent
secure server." Whoever downloads the PDF does see it, so this is open too.

**Where this differs from what is written or built.**
- **SSN and date of birth.** Criterion 6 and the default leave them to SmartMove. The draft form leaves them off, asks people not to
  type them, and both the form and Jasper refuse an SSN. Criterion 6 does allow them if the office wants them: encrypted, and only Dan and
  the property manager can see them. Dan's "No one needs to "see" it" and "An employee loads it" don't match that limit.
- **Deleting.** Jasper's side keeps every application and nothing deletes them; they are in the nightly backup too.
- **The box's words.** 11/20: "Have you seen this property in person with one of our agents?" (one applicant, seen). 11/24: all adults who will
  live there have inspected it and approve it AS-IS. The draft form says "I have seen this property in person with one of Midgett & Fite's agents."
- **Every adult.** The draft's other adults each fill in their own application, which matches. But "all adults" in the box makes one person
  speak for the others, and each ticks it again on their own form.
- **Payment.** The draft summary, and the 11/23 question to Jeneva, say "check or money order". Personal checks aren't taken.
- **Uploads.** Criterion 4 (pay stubs from a phone) is put off: "no attached files at this point".

**Waiting on:** Jeneva (the six points asked 11/23, the deterrent question, the process), Nate (the deterrent question, the process),
Jeanice (the process), Steve (the process), then the review with Dan.

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
