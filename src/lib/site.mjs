// The words, photos and office details staff change in the editor (MF-315). Four files in src/site-content/,
// one per form in .pages.yml. Every page reads them through here and nowhere else.
//
// What happens to a bad save:
//   - one person, quote, slide or review with a problem is LEFT OUT, with a plain message in the build log;
//   - a wrong office detail, an unreadable file, or a list with nothing usable left STOPS the build, so the
//     website stays as it was.
// Staff text is always plain text: Astro escapes it, so HTML typed in a box shows as typed and runs nothing.
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

// The same limits are in .pages.yml (tests/site-content.test.mjs checks that they match).
export const LIMITS = {
  name: 60, title: 80, bio: 2000, quote: 1500, caption: 150, welcomeText: 600,
  email: 80, street: 80, suite: 30, city: 40, hours: 120,
};
export const MAX_ITEMS = { people: 20, testimonials: 60, slides: 6, reviews: 12 };

// The buttons a slide can carry. The choices are in .pages.yml; where they lead stays here, in code.
export const SLIDE_BUTTONS = {
  none: [],
  residential: [
    { label: 'View Residential Property For Sale', href: '/residential-property-for-sale' },
    { label: 'View Residential Property For Rent', href: '/residential-property-for-rent' },
  ],
  commercial: [
    { label: 'View Commercial Property For Sale', href: '/commercial-property-for-sale' },
    { label: 'View Commercial Property For Rent', href: '/commercial-property-for-rent' },
  ],
};

const root = () => process.env.SITE_ROOT || process.cwd(); // SITE_ROOT is only set by the tests

class SiteContentError extends Error {
  constructor(form, message) {
    super(`WEBSITE NOT UPDATED. The "${form}" form has a problem: ${message} The website stays as it was until this is fixed in the editor.`);
    this.name = 'SiteContentError';
    this.stack = this.message; // staff and Steve need the sentence, not a stack trace
  }
}

const said = new Set(); // the header and footer are on every page; say each thing once
function leftOut(form, what, why) {
  const line = `LEFT OFF THE WEBSITE: ${form}, ${what}: ${why}`;
  if (!said.has(line)) { said.add(line); console.warn(line); }
}

function readForm(form, file) {
  let data;
  try {
    data = parse(fs.readFileSync(path.join(root(), 'src/site-content', file), 'utf8'), { uniqueKeys: false, logLevel: 'error' });
  } catch (err) {
    throw new SiteContentError(form, `its file (${file}) is missing or can't be read.`);
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new SiteContentError(form, 'it is empty.');
  return data;
}

// Whatever the editor saved (text, a number, nothing) as clean text. Invisible control characters go; line breaks stay.
function text(v) {
  if (typeof v !== 'string') v = typeof v === 'number' || typeof v === 'boolean' ? String(v) : '';
  return v.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u200B-\u200F\u202A-\u202E\u2066-\u2069\uFEFF]/g, '').trim();
}

// A pasted web link has no spaces, so on a phone it would push the page sideways. Let long runs wrap.
const wrappable = (s) => s.replace(/\S{30,}/gu, (run) => [...run].reduce((out, ch, i) => out + (i && i % 20 === 0 ? '\u200B' : '') + ch, ''));

// A required box: the cleaned text, or the reason it can't be used.
function box(v, label, max) {
  const s = text(v);
  if (!s) throw new Error(`"${label}" is empty.`);
  if (s.length > max) throw new Error(`"${label}" is too long (${s.length} characters; the most is ${max}).`);
  return s;
}

const MAGIC = {
  jpg: (b) => b[0] === 0xff && b[1] === 0xd8,
  png: (b) => b.toString('latin1', 1, 4) === 'PNG',
  webp: (b) => b.toString('latin1', 0, 4) === 'RIFF' && b.toString('latin1', 8, 12) === 'WEBP',
};
MAGIC.jpeg = MAGIC.jpg;

// The photo's web address, once the file is really there and really a picture. Names are compared exactly:
// a Mac treats Dan.JPG and dan.jpg as one file, Cloudflare doesn't.
function photo(v) {
  const src = text(v);
  if (!src) throw new Error('there is no photo.');
  const parts = src.split('/').slice(1);
  if (!/^\/(img|uploads)\/./.test(src) || parts.some((p) => !p || p === '.' || p === '..')) throw new Error(`the photo "${src}" isn't one of the website's photos.`);
  const ext = src.split('.').pop().toLowerCase();
  if (!Object.hasOwn(MAGIC, ext)) throw new Error(`the photo "${src}" isn't a JPG, PNG or WebP picture.`);
  let dir = path.join(root(), 'public');
  for (const p of parts) {
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory() || !fs.readdirSync(dir).includes(p)) throw new Error(`the photo "${src}" can't be found (deleted or renamed?).`);
    dir = path.join(dir, p);
  }
  const head = Buffer.alloc(12);
  const fd = fs.openSync(dir, 'r');
  try { fs.readSync(fd, head, 0, 12, 0); } catch { /* a folder: not a picture */ } finally { fs.closeSync(fd); }
  if (!Object.values(MAGIC).some((is) => is(head))) throw new Error(`the photo "${src}" isn't a picture the website can show (an iPhone HEIC photo renamed to .jpg does this).`);
  return '/' + parts.map(encodeURIComponent).join('/');
}

// Every usable item of a list, in the editor's order. A list with nothing usable stops the build.
function items(form, list, what, max, read) {
  if (list != null && !Array.isArray(list)) throw new SiteContentError(form, `its list of ${what} can't be read.`);
  const good = [];
  (list ?? []).forEach((item, i) => {
    const label = text(item?.name) || text(item?.caption) || `number ${i + 1} in the list`;
    try {
      if (!item || typeof item !== 'object') throw new Error('it is empty.');
      const one = read(item);
      if (good.length >= max) throw new Error(`there are more than ${max} ${what}.`);
      good.push(one);
    } catch (err) {
      leftOut(form, `"${label}"`, err.message);
    }
  });
  if (!good.length) throw new SiteContentError(form, `it needs at least one complete entry in its list of ${what}.`);
  return good;
}

export function team() {
  return items('Team', readForm('Team', 'team.yml').people, 'people', MAX_ITEMS.people, (p) => ({
    name: wrappable(box(p.name, 'Name', LIMITS.name)),
    title: wrappable(box(p.title, 'Job title', LIMITS.title)),
    photo: photo(p.photo),
    // A blank line in the box starts a new paragraph.
    bio: box(p.bio, 'About this person', LIMITS.bio).split(/\n\s*\n/).map(wrappable),
  }));
}

export function testimonials() {
  return items('Testimonials', readForm('Testimonials', 'testimonials.yml').testimonials, 'testimonials', MAX_ITEMS.testimonials, (t) => ({
    quote: wrappable(box(t.quote, 'What they said', LIMITS.quote)),
    name: wrappable(box(t.name, "Client's name", LIMITS.name)),
  }));
}

export function home() {
  const form = 'Home page';
  const d = readForm(form, 'home.yml');
  let welcomeText;
  try { welcomeText = wrappable(box(d.welcomeText, 'Welcome text', LIMITS.welcomeText)); } catch (err) { throw new SiteContentError(form, err.message); }
  return {
    welcomeText,
    slides: items(form, d.slides, 'slideshow photos', MAX_ITEMS.slides, (s) => ({
      photo: photo(s.photo),
      caption: box(s.caption, 'Caption', LIMITS.caption),
      showWhole: s.showWhole === true,
      buttons: (Object.hasOwn(SLIDE_BUTTONS, s.buttons ?? '') && SLIDE_BUTTONS[s.buttons]) || [],
    })),
    reviews: items(form, d.reviews, 'reviews', MAX_ITEMS.reviews, (r) => ({
      name: wrappable(box(r.name, "Client's name", LIMITS.name)),
      photo: photo(r.photo),
      quote: wrappable(box(r.quote, 'Review', LIMITS.quote)),
    })),
  };
}

export function office() {
  const form = 'Office details';
  const d = readForm(form, 'office.yml');
  const need = (v, label, max, ok, hint) => {
    let s;
    try { s = box(v, label, max); } catch (err) { throw new SiteContentError(form, err.message); }
    if (/[\n\r]/.test(s) || !ok.test(s)) throw new SiteContentError(form, `"${label}" ${hint}`);
    return s;
  };
  const optional = (v, label, max) => {
    const s = text(v).replace(/\s*\n\s*/g, ' ');
    if (s.length > max) throw new SiteContentError(form, `"${label}" is too long (${s.length} characters; the most is ${max}).`);
    return s;
  };
  const digits = need(d.phone, 'Phone number', 20, /^(\+?1[-. ]?)?\(?[2-9]\d{2}\)?[-. ]?\d{3}[-. ]?\d{4}$/, 'must be a full phone number: area code and seven digits.')
    .replace(/\D/g, '').slice(-10);
  const [a, b, c] = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)];
  const email = need(d.email, 'Email', LIMITS.email, /^[A-Za-z0-9._+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/, 'must be an email address, like name@example.com.');
  const anyText = /\S/;
  const street = need(d.street, 'Street address', LIMITS.street, anyText, '');
  const suite = optional(d.suite, 'Suite', LIMITS.suite);
  const town = `${need(d.city, 'City', LIMITS.city, anyText, '')}, ${need(d.state, 'State', 2, /^[A-Z]{2}$/, 'must be two capital letters, like TN.')} ${need(d.zip, 'ZIP', 10, /^\d{5}(-\d{4})?$/, 'must be five digits.')}`;
  return {
    phone: `(${a}) ${b}-${c}`,      // most pages
    phoneDashes: `${a}-${b}-${c}`,  // the header, Privacy and Text Messages
    tel: `tel:+1${digits}`,
    email,
    mailto: `mailto:${email}`,
    address: `${street}, ${town}`,
    mailingAddress: [street, suite, town].filter(Boolean).join(', '), // Privacy page only
    hours: optional(d.hours, 'Office hours', LIMITS.hours), // blank: not shown anywhere
  };
}

// Photos the layout itself needs; the editor's photo list could delete them.
export function checkLayoutPhotos() {
  try { photo('/img/logo.jpg'); } catch (err) { throw new SiteContentError('Photos', `the logo is gone: ${err.message}`); }
}
