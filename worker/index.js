// The website's staff API, used only by the office portal (Create listing and Change photos tiles, MF-205).
//
// Everything except /api/* is the static site, served from dist/ as before.
// /api/* lets the portal add listings and add, reorder and remove a listing's photos:
//
//   GET  /api/listings   every listing (from GitHub, so a listing saved a minute
//                        ago in Pages CMS is already here) with its photos
//   POST /api/blob       one already-shrunk photo -> a GitHub blob; returns its sha.
//                        The body is passed straight through, never parsed, so a
//                        big photo costs this Worker no CPU time.
//   POST /api/save       ONE commit: the new photos + the listing's new photo list
//                        + deletion of photos removed from the listing's own folder.
//   POST /api/create     ONE commit: a new listing file + its photos (the office portal's
//                        Create listing page, which Jasper helps fill in).
//
// Why one commit: Pages CMS saves every photo as its own commit. Several at once
// race each other on GitHub, so some fail and retries leave -1/-2/-3 copies.
//
// Secrets (Cloudflare dashboard -> Worker -> Settings -> Variables and Secrets):
//   GITHUB_TOKEN  fine-grained token, this repo only, Contents: read and write
//   UPLOAD_KEY    the portal's key; lives on the office box too, staff never see it
import { Document, parseDocument } from 'yaml';

const REPO = 'midgettfite/midgettfite-site';
const apiBase = (env) => env.GITHUB_API || 'https://api.github.com'; // override only for local testing
const BRANCH = 'main';
const LISTINGS_DIR = 'src/content/listings';
const UPLOADS_DIR = 'public/uploads';
const MAX_BLOB_BYTES = 6 * 1024 * 1024; // base64 JSON of a shrunk photo is ~0.5 MB
const MAX_PHOTOS = 60;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request);
    try {
      if (!env.GITHUB_TOKEN || !env.UPLOAD_KEY) {
        return json({ error: 'The photo uploader is not set up yet (missing secrets).' }, 503);
      }
      if (!(await keyMatches(request.headers.get('x-upload-key') || '', env.UPLOAD_KEY))) {
        return json({ error: 'Wrong passcode.' }, 401);
      }
      const gh = github(env.GITHUB_TOKEN, apiBase(env));
      if (url.pathname === '/api/listings' && request.method === 'GET') return json(await listListings(gh));
      if (url.pathname === '/api/blob' && request.method === 'POST') return await createBlob(request, env);
      if (url.pathname === '/api/save' && request.method === 'POST') return json(await save(gh, await request.json()));
      if (url.pathname === '/api/create' && request.method === 'POST') return json(await create(gh, await request.json()));
      return json({ error: 'Not found' }, 404);
    } catch (err) {
      return json({ error: err.message || String(err) }, err.status || 500);
    }
  },
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

async function keyMatches(given, expected) {
  // Compare hashes so the check takes the same time however much matches.
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(given)),
    crypto.subtle.digest('SHA-256', enc.encode(expected)),
  ]);
  const x = new Uint8Array(a), y = new Uint8Array(b);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

function github(token, base) {
  return async function call(path, init = {}) {
    const res = await fetch(`${base}/repos/${REPO}${path}`, {
      ...init,
      headers: {
        authorization: `Bearer ${token}`,
        accept: 'application/vnd.github+json',
        'user-agent': 'midgettfite-add-photos',
        'x-github-api-version': '2022-11-28',
        ...(init.body ? { 'content-type': 'application/json' } : {}),
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new HttpError(res.status === 422 ? 409 : 502, `GitHub ${res.status} on ${path}: ${text.slice(0, 300)}`);
    }
    return res.json();
  };
}

// ---- listings -------------------------------------------------------------

function b64decodeUtf8(b64) {
  const bin = atob(b64.replace(/\n/g, ''));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function splitFrontmatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new HttpError(422, 'Listing file has no front matter.');
  return { front: m[1], body: m[2] };
}

export function readPhotos(md) {
  const doc = parseDocument(splitFrontmatter(md).front);
  const photos = doc.get('photos');
  return photos ? photos.toJSON().filter((p) => typeof p === 'string') : [];
}

export function writePhotos(md, photos) {
  const { front, body } = splitFrontmatter(md);
  const doc = parseDocument(front);
  if (photos.length) doc.set('photos', photos);
  else doc.delete('photos');
  return `---\n${doc.toString({ lineWidth: 0 }).replace(/\n+$/, '')}\n---\n${body}`;
}

async function listListings(gh) {
  const tree = await gh(`/git/trees/${BRANCH}?recursive=1`);
  const files = tree.tree.filter((t) => t.type === 'blob' && t.path.startsWith(`${LISTINGS_DIR}/`) && t.path.endsWith('.md'));
  const listings = await Promise.all(files.map(async (f) => {
    const blob = await gh(`/git/blobs/${f.sha}`);
    const md = b64decodeUtf8(blob.content);
    const doc = parseDocument(splitFrontmatter(md).front).toJSON() || {};
    return {
      file: f.path.slice(LISTINGS_DIR.length + 1),
      title: doc.title || doc.address || f.path,
      status: doc.status || 'active',
      category: doc.category || '',
      photos: readPhotos(md),
    };
  }));
  const order = { active: 0, pending: 1, 'sold-leased': 2 };
  listings.sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3) || a.title.localeCompare(b.title));
  return { listings };
}

// ---- photos ---------------------------------------------------------------

async function createBlob(request, env) {
  const len = Number(request.headers.get('content-length') || 0);
  if (!len || len > MAX_BLOB_BYTES) throw new HttpError(413, 'Photo is too large even after shrinking.');
  // The browser already sent {"content":"<base64>","encoding":"base64"}: forward it untouched.
  const res = await fetch(`${apiBase(env)}/repos/${REPO}/git/blobs`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      accept: 'application/vnd.github+json',
      'user-agent': 'midgettfite-add-photos',
      'x-github-api-version': '2022-11-28',
      'content-type': 'application/json',
    },
    body: request.body,
  });
  const text = await res.text();
  if (!res.ok) throw new HttpError(502, `GitHub ${res.status} saving photo: ${text.slice(0, 300)}`);
  return json({ sha: JSON.parse(text).sha });
}

const SAFE_FILE = /^[a-z0-9][a-z0-9._-]*\.md$/i;
const SHA = /^[0-9a-f]{40}$/;

/**
 * body = {
 *   file:   "residential-rent-115a-samantha-court.md",
 *   photos: [ "/uploads/...jpg" (kept) | { sha } (new, in this order) ],
 *   by:     "Jeanice" (optional, for the commit message)
 * }
 */
export async function save(gh, body) {
  const file = String(body.file || '');
  if (!SAFE_FILE.test(file)) throw new HttpError(400, 'Bad listing name.');
  if (!Array.isArray(body.photos) || body.photos.length > MAX_PHOTOS) throw new HttpError(400, `Up to ${MAX_PHOTOS} photos per listing.`);
  const slug = file.replace(/\.md$/i, '').toLowerCase();
  const by = String(body.by || '').replace(/[^\w .'-]/g, '').slice(0, 40);
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);

  // GitHub refuses to move main if someone else (Pages CMS) committed in between:
  // re-read and rebuild the commit on top, up to 3 times. Blobs are reused.
  for (let attempt = 0; ; attempt++) {
    try {
      return await commitOnce(gh, { file, slug, by, stamp, photos: body.photos });
    } catch (err) {
      if (err.status !== 409 || attempt >= 2) throw err;
    }
  }
}

async function commitOnce(gh, { file, slug, by, stamp, photos }) {
  const ref = await gh(`/git/ref/heads/${BRANCH}`);
  const head = await gh(`/git/commits/${ref.object.sha}`);
  const tree = await gh(`/git/trees/${head.tree.sha}?recursive=1`);
  const paths = new Set(tree.tree.filter((t) => t.type === 'blob').map((t) => t.path));

  const mdPath = `${LISTINGS_DIR}/${file}`;
  const mdEntry = tree.tree.find((t) => t.path === mdPath);
  if (!mdEntry) throw new HttpError(404, 'That listing no longer exists. Reload the page.');
  const md = b64decodeUtf8((await gh(`/git/blobs/${mdEntry.sha}`)).content);
  const before = readPhotos(md);

  const entries = [];
  const finalPhotos = [];
  let n = 0;
  for (const p of photos) {
    if (typeof p === 'string') {
      if (!before.includes(p)) throw new HttpError(409, 'The photo list changed since you opened it. Reload the page.');
      finalPhotos.push(p);
    } else if (p && SHA.test(p.sha)) {
      let name;
      do { n++; name = `${stamp}-${String(n).padStart(2, '0')}.jpg`; } while (paths.has(`${UPLOADS_DIR}/${slug}/${name}`));
      entries.push({ path: `${UPLOADS_DIR}/${slug}/${name}`, mode: '100644', type: 'blob', sha: p.sha });
      finalPhotos.push(`/uploads/${slug}/${name}`);
    } else {
      throw new HttpError(400, 'Bad photo entry.');
    }
  }

  // A photo taken off the listing is deleted for real, but only if it sits in this
  // listing's own folder and no other listing uses it. Shared/older files stay.
  const removed = before.filter((p) => !finalPhotos.includes(p));
  const usedElsewhere = new Set();
  if (removed.length) {
    for (const t of tree.tree) {
      if (t.type !== 'blob' || t.path === mdPath || !t.path.startsWith(`${LISTINGS_DIR}/`) || !t.path.endsWith('.md')) continue;
      const other = b64decodeUtf8((await gh(`/git/blobs/${t.sha}`)).content);
      for (const p of readPhotos(other)) usedElsewhere.add(p);
    }
  }
  let deleted = 0;
  for (const p of removed) {
    const repoPath = `public${p}`;
    if (p.startsWith(`/uploads/${slug}/`) && !usedElsewhere.has(p) && paths.has(repoPath)) {
      entries.push({ path: repoPath, mode: '100644', type: 'blob', sha: null });
      deleted++;
    }
  }

  entries.push({ path: mdPath, mode: '100644', type: 'blob', content: writePhotos(md, finalPhotos) });

  const added = photos.filter((p) => typeof p !== 'string').length;
  const parts = [];
  if (added) parts.push(`add ${added}`);
  if (removed.length) parts.push(`remove ${removed.length}`);
  if (!added && !removed.length) parts.push('reorder');
  const message = `Photos for ${file.replace(/\.md$/, '')}: ${parts.join(', ')} (office portal${by ? `, ${by}` : ''})`;

  const newTree = await gh('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: head.tree.sha, tree: entries }) });
  const commit = await gh('/git/commits', { method: 'POST', body: JSON.stringify({ message, tree: newTree.sha, parents: [head.sha] }) });
  await gh(`/git/refs/heads/${BRANCH}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: false }) });
  return { ok: true, commit: commit.sha, photos: finalPhotos, added, removed: removed.length, deleted };
}

// ---- new listing ----------------------------------------------------------

const CATEGORIES = ['residential-sale', 'commercial-sale', 'land-sale', 'residential-rent', 'commercial-rent'];

export function slugify(s) {
  return String(s).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

const line = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
function number(v, label, { required = false } = {}) {
  if (v === '' || v == null) {
    if (required) throw new HttpError(400, `Please fill in the ${label}.`);
    return undefined;
  }
  const n = Number(String(v).replace(/[$,\s]/g, ''));
  if (!Number.isFinite(n) || n < 0) throw new HttpError(400, `The ${label} should be a number.`);
  return n;
}

/** The listing's front matter, checked against the site's schema (src/content.config.ts), in the schema's order. */
export function listingData(input, today) {
  const i = input || {};
  const address = line(i.address, 120);
  if (!address) throw new HttpError(400, 'Please fill in the address.');
  const category = String(i.category || '');
  if (!CATEGORIES.includes(category)) throw new HttpError(400, 'Please choose what kind of listing it is.');
  const price = number(i.price, 'price', { required: true });
  if (!price) throw new HttpError(400, 'Please fill in the price.');
  const description = String(i.description ?? '').replace(/\r\n?/g, '\n').trim().slice(0, 5000);
  if (!description) throw new HttpError(400, 'Please write a description.');
  const zip = line(i.zip, 10);
  if (zip && !/^\d{5}$/.test(zip)) throw new HttpError(400, 'The zip code should be 5 digits.');
  const data = {
    title: line(i.title, 120) || address,
    category,
    status: 'active',
    price,
    priceUpdated: false,
    address,
    city: line(i.city, 60) || 'Lebanon',
    state: (line(i.state, 2) || 'TN').toUpperCase(),
  };
  if (zip) data.zip = zip;
  for (const [k, label] of [['beds', 'number of bedrooms'], ['baths', 'number of bathrooms'], ['sqft', 'square feet']]) {
    const n = number(i[k], label);
    if (n !== undefined) data[k] = n;
  }
  data.description = description;
  data.listedDate = today;
  return data;
}

export function listingMarkdown(data, photos) {
  const doc = new Document({ ...data, ...(photos.length ? { photos } : {}) });
  doc.get('description', true).type = 'BLOCK_LITERAL';
  return `---\n${doc.toString({ lineWidth: 0 }).replace(/\n+$/, '')}\n---\n`;
}

const chicagoDate = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' }).format(new Date());

/**
 * body = {
 *   listing: { title, category, price, address, city, state, zip, beds, baths, sqft, description },
 *   photos:  [ { sha }, ... ]   (already uploaded with /api/blob, in order; the first is the cover)
 *   by:      "Jeanice" (optional, for the commit message)
 * }
 */
export async function create(gh, body) {
  const data = listingData(body?.listing, chicagoDate());
  const photos = Array.isArray(body?.photos) ? body.photos : [];
  if (photos.length > MAX_PHOTOS) throw new HttpError(400, `Up to ${MAX_PHOTOS} photos per listing.`);
  if (!photos.every((p) => p && SHA.test(p.sha))) throw new HttpError(400, 'Bad photo entry.');
  const slug = `${data.category}-${slugify(data.address)}`;
  const by = String(body?.by || '').replace(/[^\w .'-]/g, '').slice(0, 40);
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  for (let attempt = 0; ; attempt++) {
    try {
      return await createOnce(gh, { data, slug, by, stamp, photos });
    } catch (err) {
      if (err.status !== 409 || err.final || attempt >= 2) throw err;
    }
  }
}

async function createOnce(gh, { data, slug, by, stamp, photos }) {
  const ref = await gh(`/git/ref/heads/${BRANCH}`);
  const head = await gh(`/git/commits/${ref.object.sha}`);
  const tree = await gh(`/git/trees/${head.tree.sha}?recursive=1`);
  const mdPath = `${LISTINGS_DIR}/${slug}.md`;
  if (tree.tree.some((t) => t.path.toLowerCase() === mdPath)) {
    const err = new HttpError(409, 'There is already a listing for that address. To change its photos, use "Change photos" instead.');
    err.final = true;
    throw err;
  }
  const entries = [];
  const paths = photos.map((p, i) => {
    const name = `${stamp}-${String(i + 1).padStart(2, '0')}.jpg`;
    entries.push({ path: `${UPLOADS_DIR}/${slug}/${name}`, mode: '100644', type: 'blob', sha: p.sha });
    return `/uploads/${slug}/${name}`;
  });
  entries.push({ path: mdPath, mode: '100644', type: 'blob', content: listingMarkdown(data, paths) });
  const n = paths.length;
  const message = `New listing: ${data.title}${n ? ` with ${n} photo${n === 1 ? '' : 's'}` : ''} (office portal${by ? `, ${by}` : ''})`;
  const newTree = await gh('/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: head.tree.sha, tree: entries }) });
  const commit = await gh('/git/commits', { method: 'POST', body: JSON.stringify({ message, tree: newTree.sha, parents: [head.sha] }) });
  await gh(`/git/refs/heads/${BRANCH}`, { method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: false }) });
  return { ok: true, commit: commit.sha, file: `${slug}.md`, url: `/property/${slug}/`, photos: paths };
}
