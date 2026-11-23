# MF-316 — The online application, question by question (DRAFT for Jeneva and Dan)

**Status:** DRAFT, 2026-11-21 · **Story:** MF-316 · **Page:** `/apply-draft`. It's not linked from the site and not
shown to search engines, and it turns every application away until you approve it and Jasper can take them.

It asks what today's paper application asks (`/forms/printable-application.pdf`), in the same order, with the same terms
to agree to. It's the same form for every applicant. Five things on the paper form are **left off**; see the bottom of the table.

| The form asks | Why |
|---|---|
| **Which property** (a list of the rentals on the site, or "another property") | The paper form's Property Address. The office can send a link that picks the property for them. |
| **"I have seen this property in person with one of Midgett & Fite's agents."** (required) | Dan, 11/20. Without the tick, the rest of the form stays closed and says to call for a showing. |
| Agent who showed it, and the date (optional) | Makes it easy to check against the showing records (question 3). |
| Full legal name, email, phone | Paper: Applicant, Email, Phone. |
| Other adults applying with you | Each adult fills in their own application; this links them as one household (story, point 3). |
| Current and past employer: how long, phone, email, supervisor; other jobs in 5 years; other income | Paper: Job History for past 5+ years, Other Income Sources. |
| Current address, how long, landlord, landlord phone and email, current rent, why moving | Paper: Current Landlord section. |
| Past address, past landlord, phone, how long, email | Paper: Past Landlord section. |
| **Legal names** of everyone else who will live there | Paper: "Legal Names of ALL others who will occupy the dwelling". **Names only**; see question 5. |
| Personal reference and phone | Paper. |
| Will anyone who lives there smoke? (smoking only outside) | Paper. |
| Pets? If yes, tell us about each | Paper. Owners decide about pets (MF-225 #7). |
| Ever convicted of a felony or misdemeanor? If yes, explain | Paper. See question 6. |
| When would the deposit, first month and pet fee be ready? | Paper. |
| Anything else | Paper: "Other". |
| The 8 "IMPORTANT" terms, word for word, then a tick and a typed name as the signature | Paper. Its note already says an electronic signature counts as a written one. |
| Texting box (optional, never pre-ticked, same wording as the contact form) | Matches the site's other forms (10DLC). See question 9. |
| **Left off:** date of birth, Social Security number, driver's license number | SmartMove asks for these on its own secure site; the website never holds them (story, point 6). The form asks people not to type them, and turns an answer away if it looks like a Social Security number. |
| **Left off:** each occupant's relationship and birthdate | They reveal children and family makeup (familial status, protected under Fair Housing). |

It also tells them what comes next: the $300 ($45 an adult for the check, the rest to the first month or refunded),
3 months of pay stubs (self-employed: 2 years of tax returns and 2 to 3 months of bank statements), and SmartMove's email.

## Questions for Jeneva and Dan
1. **Where an application goes. DECIDED (Steve, 11/23): into Jasper.** The website checks the application and hands it
   to Jasper, which keeps it on a page for the office (recommended: only Dan and Jeneva see it). The office gets an email that one has arrived, with
   **no personal details** in it. Nothing is emailed in full and nothing is kept on the website. So the form stays
   switched off until Jasper can take applications.
2. **The $300 and SmartMove: as today?** The form takes no money or card numbers. Recommended: the office sends the SmartMove
   invitation and takes the $300 the way it does now. How do online applicants pay the $300: at the office, by check or money order?
3. **Checking the showing.** For now a ticked box is enough. Next step (it needs Jasper first): when an application arrives,
   Jasper looks for that phone number or email on the Callback List with an appointment for that property (MF-247), and marks
   it "showing on record" or "no showing found: check before processing". Should "no showing found" only be flagged for the
   office, or should the application be turned back? Recommended: **flagged**, since some showings aren't on the list.
4. **The wording.** It's the paper form's wording, lightly tidied. Jeneva, anything you'd change or add? A move-in date isn't
   asked, because it isn't on the paper form.
5. **Who will live there.** The paper form asks each person's relationship and birthdate. The online form asks names only.
   Is that enough? If you need to know which people are adults, the form can ask "18 or older? yes/no" for each name, and
   nothing more. Occupancy limits are based on the number of people, which the names give you.
6. **The conviction question.** It's on the paper form, and it's not about a protected class. But HUD's 2016 guidance warns
   against turning people down for any record at all. Keep it as is (convictions only, never arrests), or limit it to recent
   years? Worth a word with your attorney.
7. **Assistance animals.** Should the pets question add: "Service and assistance animals aren't pets, and there's no pet fee
   for them"? That's the usual wording, and it asks nothing about disability.
8. **Pay stubs.** The story wants photos or PDFs uploaded from a phone. That needs somewhere safe to keep them, so it comes
   with Jasper. Until then, the form says the office will ask for them.
9. **Texting box.** Keep it on the application, as on the contact form?
10. **Turn it on.** Once you've approved the form and Jasper can take applications, Steve sets it up on beacon and adds an
   **Apply** link (see "For Steve" below).

## For Steve (technical, before it goes live, on beacon)
- Turnstile: create the widget for midgettfite.com, put its site key in `src/pages/apply-draft.astro` (now Cloudflare's
  always-passes test key), and set the `TURNSTILE_SECRET` secret on the Worker.
- Jasper: build the receiving side first (jasper repo, `docs/MF-316-Applications-Receive.md`): `POST /portal/applications`
  on the box, a narrow Access app on that path for a **new** service token just for the website, and the portal page.
  Set `JASPER_APPLY_URL`, `JASPER_ACCESS_CLIENT_ID` and `JASPER_ACCESS_CLIENT_SECRET` on the Worker, send one test
  application, then set `APPLY_ENABLED=true`. No Cloudflare email setup.
- Rename the page to `/apply` and link it from Helpful Forms. That also replaces the old JotForm link there.
