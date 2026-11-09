// Temporary bridge, 2026-10-28 (MF-312). Lives in Steve's Cloudflare account, where the
// midgettfite.com zone still is, and serves the new site from M&F's account until the
// domain moves there (account move plan Stage 5). Then the domain attaches to the site
// directly and this Worker is deleted.
const ORIGIN = 'midgettfite-site.midgett-and-fite.workers.dev';
const SITE = 'midgettfite.com';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.hostname === 'www.' + SITE) {
      url.hostname = SITE;
      return Response.redirect(url.toString(), 301);
    }

    url.hostname = ORIGIN;
    const res = await fetch(new Request(url, request), { redirect: 'manual' });

    // The site's own redirects (old Wix addresses, trailing slashes) name the origin; point them home.
    const loc = res.headers.get('location');
    if (loc && loc.includes(ORIGIN)) {
      const headers = new Headers(res.headers);
      headers.set('location', loc.replace(ORIGIN, SITE));
      return new Response(res.body, { status: res.status, headers });
    }
    return res;
  },
};
