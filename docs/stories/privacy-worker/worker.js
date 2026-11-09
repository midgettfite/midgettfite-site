/**
 * mf-privacy — serves Midgett & Fite's privacy policy on midgettfite.com until the new site goes live (MF-310).
 * Why it exists: the texting campaign needs a live privacy page, and midgettfite.com is still Wix, which no one
 * here can edit. Text approved by Dan 2026-10-19. The new site carries the same text at src/pages/privacy.astro;
 * keep the two in step. Retire this Worker (and its route) at go-live, when the new site serves /privacy itself.
 * Lives in Steve's (Found by Ford) Cloudflare only because the midgettfite.com zone is still there; it moves or
 * dies with the zone in the account move (docs/MF-Account-Move-Plan-2026-10-02.md).
 */
const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Privacy Policy | Midgett &amp; Fite Real Estate</title>
<meta name="description" content="How Midgett &amp; Fite Realty uses the information you give us when you call or text our office.">
<style>
  :root { --accent:#b0413e; --ink:#1f2937; }
  * { box-sizing:border-box; }
  body { margin:0; font-family:Georgia, 'Times New Roman', serif; color:var(--ink); background:#fff; line-height:1.6; }
  header { background:#2b2b2b; color:#fff; padding:16px; border-bottom:4px solid var(--accent); }
  header .wrap, main, footer .wrap { max-width:760px; margin:0 auto; }
  header .name { font-size:1.35rem; letter-spacing:.06em; }
  header a { color:#fff; }
  main { padding:24px 16px 8px; }
  h1 { color:var(--accent); font-weight:normal; margin:.2em 0 .6em; }
  h2 { font-size:1.1rem; margin:1.4em 0 .3em; }
  a { color:var(--accent); }
  footer { background:#f7f5f4; border-top:4px solid var(--accent); padding:20px 16px; margin-top:40px; font-size:.85rem; color:#4b5563; }
</style>
</head>
<body>
<header><div class="wrap"><div class="name">MIDGETT &amp; FITE REAL ESTATE</div>Give us a call today! <a href="tel:+16154443136">615-444-3136</a></div></header>
<main>
  <h1>Privacy Policy</h1>
  <p>Midgett &amp; Fite Realty collects the information you give us when you call or text our office, such as your name, phone number, and the kind of rental you're looking for. We use it to answer your questions and to contact you about rentals you've asked to hear about.</p>
  <h2>Text messages</h2>
  <p>If you give us permission to text you, we'll text only about the rentals you asked about. Message frequency varies. Message and data rates may apply. Reply STOP at any time to stop receiving texts, or HELP for help. We do not sell, rent, or share your phone number or your permission to text with anyone else for their own marketing.</p>
  <h2>Rental applicants</h2>
  <p>This privacy policy may be replaced for successful applicants of rental property in their Privacy Policy Lease Addendum.</p>
  <h2>Questions</h2>
  <p>Call <a href="tel:+16154443136">615-444-3136</a> or write to Midgett &amp; Fite Realty, 312 South Maple Street, Suite B, Lebanon, TN 37087.</p>
</main>
<footer><div class="wrap">Midgett &amp; Fite Real Estate · 312 South Maple Street, Lebanon, TN 37087 · <a href="https://www.midgettfite.com/">midgettfite.com</a></div></footer>
</body>
</html>`;

export default {
  async fetch() {
    return new Response(PAGE, {
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' },
    });
  },
};
