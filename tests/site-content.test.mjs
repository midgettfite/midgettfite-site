// The content staff edit (MF-315): bad input can't break a page, the forms match the code, and the office's
// phone, email and address live in one file only.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, stringify } from 'yaml';
import { LIMITS, MAX_ITEMS, SLIDE_BUTTONS, checkLayoutPhotos, home, office, team, testimonials } from '../src/lib/site.mjs';

const REPO = fileURLToPath(new URL('..', import.meta.url));
const read = (file) => parse(fs.readFileSync(path.join(REPO, 'src/site-content', file), 'utf8'));
const FILES = { team: read('team.yml'), testimonials: read('testimonials.yml'), office: read('office.yml'), home: read('home.yml') };

// Run `fn` on a copy of the site where `change` has edited the content; returns its result and what was said.
function withSite(change, fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mf315-'));
  const c = structuredClone(FILES);
  const said = [];
  const warn = console.warn;
  console.warn = (m) => said.push(m);
  process.env.SITE_ROOT = dir;
  try {
    fs.mkdirSync(path.join(dir, 'src/site-content'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'public'));
    fs.cpSync(path.join(REPO, 'public/img'), path.join(dir, 'public/img'), { recursive: true });
    change(c, dir);
    for (const [k, v] of Object.entries(c)) {
      if (v !== undefined) fs.writeFileSync(path.join(dir, 'src/site-content', `${k}.yml`), typeof v === 'string' ? v : stringify(v));
    }
    return { result: fn(), said };
  } finally {
    delete process.env.SITE_ROOT;
    console.warn = warn;
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
const stops = (change, fn, why) => assert.throws(() => withSite(change, fn), (err) => {
  assert.match(err.message, /^WEBSITE NOT UPDATED\. The ".+" form has a problem: .+ stays as it was/);
  assert.match(err.message, why);
  return true;
});

test('the content in the repo is all usable: nothing is left off', () => {
  const { result, said } = withSite(() => {}, () => ({ t: team(), q: testimonials(), h: home(), o: office() }));
  assert.equal(result.t.length, FILES.team.people.length);
  assert.equal(result.q.length, FILES.testimonials.testimonials.length);
  assert.equal(result.h.slides.length, FILES.home.slides.length);
  assert.equal(result.h.reviews.length, FILES.home.reviews.length);
  assert.deepEqual(said, []);
  checkLayoutPhotos();
});

test('a person with a problem is left off, with a plain message, and the rest still show', () => {
  const bad = {
    'blank name': [{ name: '   ' }, /"Name" is empty/],
    'no title': [{ title: undefined }, /"Job title" is empty/],
    'no bio': [{ bio: null }, /"About this person" is empty/],
    'bio too long': [{ bio: 'a'.repeat(2001) }, /too long \(2001 characters; the most is 2000\)/],
    'no photo': [{ photo: '' }, /there is no photo/],
    'photo deleted': [{ photo: '/img/gone.jpg' }, /can't be found/],
    'photo name in the wrong case': [{ photo: '/img/team-dan.JPG' }, /can't be found/],
    'photo is a folder': [{ photo: '/img' }, /isn't one of the website's photos/],
    'photo from another website': [{ photo: 'https://example.com/a.jpg' }, /isn't one of the website's photos/],
    'photo outside the website': [{ photo: '/img/../../package.jpg' }, /isn't one of the website's photos/],
    'photo is a HEIC': [{ photo: '/img/a.heic' }, /isn't a JPG, PNG or WebP/],
    'HEIC renamed to jpg': [{ photo: '/img/fake.jpg' }, /isn't a picture/],
    'empty photo file': [{ photo: '/img/empty.jpg' }, /isn't a picture/],
    'photo is a list': [{ photo: ['/img/team-dan.jpg'] }, /there is no photo/],
  };
  for (const [what, [change, why]] of Object.entries(bad)) {
    const { result, said } = withSite((c, dir) => {
      fs.writeFileSync(path.join(dir, 'public/img/fake.jpg'), '\0\0\0\x18ftypheic____');
      fs.writeFileSync(path.join(dir, 'public/img/empty.jpg'), '');
      Object.assign(c.team.people[1], { name: `Test ${what}` }, change);
    }, team);
    assert.equal(result.length, FILES.team.people.length - 1, what);
    assert.equal(result[0].name, FILES.team.people[0].name);
    assert.equal(said.length, 1, what);
    assert.match(said[0], /^LEFT OFF THE WEBSITE: Team, /);
    assert.match(said[0], why, what);
  }
});

test('an empty item, or one that is not an item, is left off', () => {
  for (const junk of [{}, null, 'text', 7, []]) {
    const { result } = withSite((c) => { c.testimonials.testimonials.push(junk); c.home.slides.push(junk); c.home.reviews.push(junk); }, () => [testimonials(), home()]);
    assert.equal(result[0].length, FILES.testimonials.testimonials.length);
    assert.equal(result[1].slides.length, FILES.home.slides.length);
    assert.equal(result[1].reviews.length, FILES.home.reviews.length);
  }
});

test('removing everyone, or an empty list, stops the build', () => {
  for (const list of [[], undefined, null, 'x', [{}], {}]) {
    stops((c) => { c.team.people = list; }, team, /list of people/);
    stops((c) => { c.testimonials.testimonials = list; }, testimonials, /list of testimonials/);
    stops((c) => { c.home.slides = list; }, home, /list of slideshow photos/);
    stops((c) => { c.home.reviews = list; }, home, /list of reviews/);
  }
});

test('a missing, empty or scrambled file stops the build', () => {
  for (const [key, fn] of [['team', team], ['testimonials', testimonials], ['home', home], ['office', office]]) {
    for (const body of [undefined, '', '[]', 'just words', 'a: [1, 2', '\u0000']) stops((c) => { c[key] = body; }, fn, /./);
  }
  stops((c, dir) => fs.rmSync(path.join(dir, 'public/img/logo.jpg')), checkLayoutPhotos, /the logo is gone/);
});

test('a wrong office detail stops the build; the optional ones can be blank', () => {
  for (const [k, values] of Object.entries({
    phone: ['', '444-3136', '615-444-313', '(615) 444-31366', 'call us', '615-444-3136 ext 2', '<b>615-444-3136</b>', '015-444-3136'],
    email: ['', 'office', 'office@midgettfite', 'a b@c.com', 'office@midgettfite.com"><script>', "x'@y.com", 'a@b.com\nc@d.com'],
    street: ['', '  ', 'x'.repeat(81)], city: [''], state: ['Tennessee', 'tn', ''], zip: ['3708', '370877', 'abcde', ''],
    suite: ['x'.repeat(31)], hours: ['x'.repeat(121)],
  })) for (const v of values) stops((c) => { c.office[k] = v; }, office, /./);

  const { result } = withSite((c) => { delete c.office.suite; delete c.office.hours; }, office);
  assert.equal(result.hours, '');
  assert.equal(result.mailingAddress, result.address);
});

test('any usual way of typing the phone number gives the same three forms', () => {
  for (const phone of ['615-555-0100', '(615) 555-0100', '6155550100', 6155550100, '615.555.0100', '+1 615 555 0100', ' 1-615-555-0100 ']) {
    const { result } = withSite((c) => { c.office.phone = phone; }, office);
    assert.deepEqual([result.phone, result.phoneDashes, result.tel], ['(615) 555-0100', '615-555-0100', 'tel:+16155550100']);
  }
  const { result } = withSite((c) => { c.office.zip = 37090; c.office.hours = ' Mon to Fri\n8 to 5 '; }, office);
  assert.match(result.address, /TN 37090$/);
  assert.equal(result.hours, 'Mon to Fri 8 to 5');
});

test('odd but harmless text is kept as plain text', () => {
  const { result, said } = withSite((c) => {
    c.team.people = [
      { ...c.team.people[0], name: 'Pat "Skip" O\'Neil & Co', bio: 'One.\r\n\r\nTwo <b>bold</b> <script>alert(1)</script> {code} ${x}\n\n\nThree: https://example.com/' + 'a'.repeat(200) },
      { ...c.team.people[0] }, { ...c.team.people[0] }, // the same person twice: both show, in the list's order
      { ...c.team.people[0], name: 123, title: true },   // a name that looks like a number
    ];
  }, team);
  assert.deepEqual(said, []);
  assert.equal(result.length, 4);
  assert.equal(result[0].name, 'Pat "Skip" O\'Neil & Co');
  assert.equal(result[0].bio.length, 3);
  assert.equal(result[0].bio[1], 'Two <b>bold</b> <script>alert(1)</script> {code} ${x}');
  assert.ok(result[0].bio[2].split(/[\s\u200B]/).every((run) => run.length <= 20), 'a long link can wrap on a phone');
  assert.equal(result[3].name, '123');
});

test('hidden characters are removed, and a photo name with spaces works', () => {
  const { result } = withSite((c, dir) => {
    fs.copyFileSync(path.join(REPO, 'public/img/team-dan.jpg'), path.join(dir, 'public/img/My photo #1.jpg'));
    Object.assign(c.team.people[0], { name: 'Dan\u0000\u202E Midgett\uFEFF', photo: '/img/My photo #1.jpg' });
  }, team);
  assert.equal(result[0].name, 'Dan Midgett');
  assert.equal(result[0].photo, '/img/My%20photo%20%231.jpg');
});

test('slides: an unknown button choice shows no buttons, and extra slides are left off', () => {
  const { result, said } = withSite((c) => {
    c.home.slides[0].buttons = 'constructor'; c.home.slides[0].showWhole = 'yes';
    delete c.home.slides[1].buttons;
    while (c.home.slides.length < MAX_ITEMS.slides + 1) c.home.slides.push({ ...c.home.slides[1] });
  }, home);
  assert.deepEqual(result.slides[0].buttons, []);
  assert.equal(result.slides[0].showWhole, false);
  assert.deepEqual(result.slides[1].buttons, []);
  assert.equal(result.slides.length, MAX_ITEMS.slides);
  assert.match(said.join(), /more than 6 slideshow photos/);
  stops((c) => { c.home.welcomeText = ' '; }, home, /"Welcome text" is empty/);
});

test('every button a slide can carry leads to a page', () => {
  for (const b of Object.values(SLIDE_BUTTONS).flat()) assert.ok(fs.existsSync(path.join(REPO, `src/pages${b.href}.astro`)), b.href);
});

// ---- the forms ----

const CONFIG = parse(fs.readFileSync(path.join(REPO, '.pages.yml'), 'utf8'));
const form = (name) => CONFIG.content.find((c) => c.name === name);
const field = (f, ...names) => names.reduce((at, n) => at.fields.find((x) => x.name === n), f);

test('the forms sit under Property Listings and write the files the pages read', () => {
  assert.deepEqual(CONFIG.content.map((c) => c.name), ['listings', 'team', 'testimonials', 'office', 'home']);
  for (const name of Object.keys(FILES)) {
    const f = form(name);
    assert.deepEqual([f.type, f.format, f.path], ['file', 'yaml', `src/site-content/${name}.yml`]);
    assert.deepEqual(f.operations, { create: false, rename: false, delete: false });
  }
});

test('every box is in the file and every value in the file has a box (a save drops anything without one)', () => {
  const same = (f, obj, where) => {
    assert.deepEqual(f.fields.map((x) => x.name).sort(), Object.keys(obj).sort(), where);
    for (const x of f.fields) if (x.type === 'object') obj[x.name].forEach((item) => same(x, item, `${where}.${x.name}`));
  };
  for (const name of Object.keys(FILES)) same(form(name), FILES[name], name);
});

test('the forms and the code have the same limits', () => {
  const limit = (f) => f.options.maxlength;
  const t = field(form('team'), 'people'), q = field(form('testimonials'), 'testimonials'), h = form('home'), o = form('office');
  for (const k of ['name', 'title', 'bio']) assert.equal(limit(field(t, k)), LIMITS[k], k);
  for (const k of ['name', 'quote']) { assert.equal(limit(field(q, k)), LIMITS[k]); assert.equal(limit(field(h, 'reviews', k)), LIMITS[k]); }
  assert.equal(limit(field(h, 'slides', 'caption')), LIMITS.caption);
  assert.equal(limit(field(h, 'welcomeText')), LIMITS.welcomeText);
  for (const k of ['email', 'street', 'suite', 'city', 'hours']) assert.equal(limit(field(o, k)), LIMITS[k], k);
  const max = { people: t, testimonials: q, slides: field(h, 'slides'), reviews: field(h, 'reviews') };
  for (const [k, f] of Object.entries(max)) { assert.equal(f.list.max, MAX_ITEMS[k], k); assert.equal(f.list.min, 1); assert.equal(f.required, true); }
  assert.deepEqual(field(h, 'slides', 'buttons').options.values.map((v) => v.value), Object.keys(SLIDE_BUTTONS));
});

test('every photo in the content is in the folder its box allows', () => {
  const media = Object.fromEntries(CONFIG.media.map((m) => [m.name, m]));
  for (const f of [field(form('team'), 'people', 'photo'), field(form('home'), 'slides', 'photo'), field(form('home'), 'reviews', 'photo')]) {
    assert.equal(f.options.media, 'site');
    assert.equal(f.required, true);
  }
  for (const item of [...FILES.team.people, ...FILES.home.slides, ...FILES.home.reviews]) assert.ok(item.photo.startsWith(media.site.output + '/'), item.photo);
  assert.equal(media.images.input, 'public/uploads'); // listing photos: unchanged
});

test('the forms refuse bad input at the Save button, and accept what is there today', () => {
  const ok = (f, v) => (!f.required || v !== '') && (!f.pattern || new RegExp(f.pattern.regex).test(v)) && v.length <= (f.options?.maxlength ?? Infinity);
  const o = form('office');
  for (const x of o.fields) assert.ok(ok(x, FILES.office[x.name]), x.name);
  for (const [k, list] of Object.entries({
    phone: ['', '444-3136', 'call us', '615-444-31366'], email: ['', 'office', 'a b@c.com'], street: ['', '  '], city: [' '],
    state: ['Tennessee', 'tn'], zip: ['3708', 'abcde'], hours: ['x'.repeat(121)],
  })) for (const v of list) assert.ok(!ok(field(o, k), v), `${k}: ${v}`);
  for (const v of ['(615) 444-3136', '615.444.3136', '6154443136', '+1 615 444 3136']) assert.ok(ok(field(o, 'phone'), v), v);

  for (const [f, list] of [[field(form('team'), 'people'), FILES.team.people], [field(form('testimonials'), 'testimonials'), FILES.testimonials.testimonials],
    [field(form('home'), 'slides'), FILES.home.slides], [field(form('home'), 'reviews'), FILES.home.reviews]]) {
    assert.ok(list.length <= f.list.max);
    assert.equal(typeof f.list.collapsible, 'object'); // Pages CMS refuses a list setting without it
    for (const x of f.fields.filter((y) => y.type === 'string' || y.type === 'text')) {
      for (const item of list) assert.ok(ok(x, item[x.name]), `${x.name}: ${item[x.name]}`);
      for (const v of ['', '   ', 'x'.repeat(x.options.maxlength + 1)]) assert.ok(!ok(x, v), x.name);
    }
  }
});

test('every form setting is one Pages CMS knows (it refuses the whole file otherwise)', () => {
  const only = (obj, keys, where) => { for (const k of Object.keys(obj)) assert.ok(keys.includes(k), `${where}: ${k}`); };
  const fields = (list, where) => list.forEach((f) => {
    only(f, ['name', 'label', 'description', 'type', 'required', 'default', 'pattern', 'options', 'list', 'fields'], `${where}.${f.name}`);
    assert.match(f.name, /^[A-Za-z0-9_-]+$/);
    if (f.pattern) only(f.pattern, ['regex', 'message'], f.name);
    if (f.list) only(f.list, ['min', 'max', 'collapsible'], f.name);
    if (f.fields) fields(f.fields, `${where}.${f.name}`);
  });
  for (const m of CONFIG.media) only(m, ['name', 'label', 'input', 'output', 'rename', 'extensions'], 'media');
  for (const c of CONFIG.content.filter((x) => x.type === 'file')) {
    only(c, ['name', 'label', 'description', 'type', 'path', 'format', 'operations', 'fields'], c.name);
    fields(c.fields, c.name);
  }
});

test('opening a form and saving it unchanged leaves the file as it is', () => {
  // Pages CMS writes YAML with this same library and drops blank values.
  const noBlanks = (v) => (Array.isArray(v) ? v.map(noBlanks) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).filter(([, x]) => x !== '' && x != null).map(([k, x]) => [k, noBlanks(x)])) : v);
  for (const [name, data] of Object.entries(FILES)) {
    const saved = parse(stringify(noBlanks(data)), { strict: false, uniqueKeys: false });
    assert.deepEqual(saved, noBlanks(data), name);
    withSite((c) => { c[name] = stringify(noBlanks(data)); }, () => ({ t: team(), q: testimonials(), h: home(), o: office() }));
  }
});

// ---- one place for the phone number, email and address ----

// Company History says where the firm opened its offices in 2011; that page stays with Steve (MF-315).
const ALLOWED = [['src/pages/company-history.astro', /312 South Maple Street/]];

function codeFiles(dir) {
  return fs.readdirSync(path.join(REPO, dir), { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (p === path.join('src', 'content') || p === path.join('src', 'site-content')) return []; // staff's words
    return e.isDirectory() ? codeFiles(p) : [p];
  });
}

// Phone numbers in any spelling, plus the office's own email and street address, outside comments.
function hardCoded(source) {
  const o = office();
  const code = source.replace(/<!--[\s\S]*?-->/g, '').replace(/\{?\/\*[\s\S]*?\*\/\}?/g, '').replace(/(^|\s)\/\/.*$/gm, '');
  const street = FILES.office.street.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
  return [
    /(?<![\w./-])(?:\+?1[-.\s]?)?(?:\(\s*[2-9]\d{2}\s*\)|[2-9]\d{2})[-.\s\u2010-\u2014]?[2-9]\d{2}[-.\s\u2010-\u2014]?\d{4}(?![\w-])/g,
    /["'`]tel:\+?\d{3}/g,
    new RegExp(o.email.replace(/[.+]/g, '\\$&'), 'gi'),
    new RegExp(street, 'gi'),
  ].flatMap((re) => code.match(re) ?? []);
}

test('no page has the phone number, email or address typed into it', () => {
  const found = codeFiles('src').filter((f) => /\.(astro|[mc]?[jt]sx?|html|mdx?|css|json|ya?ml)$/.test(f)).flatMap((f) =>
    hardCoded(fs.readFileSync(path.join(REPO, f), 'utf8'))
      .filter((hit) => !ALLOWED.some(([file, ok]) => file === f && ok.test(hit)))
      .map((hit) => `${f}: "${hit}"`));
  assert.deepEqual(found, [], 'Use office() from src/lib/site.mjs, so Office Details in the editor stays the only place (MF-315).');
});

test('the check above really catches them', () => {
  for (const s of ['call (615) 444-3136.', '<a href="tel:+16154443136">', '615-444-3136', '615.444.3136', '6154443136', '615 444 3136', '+1 (615) 444-3136', '615\u2013444\u20133136', "'tel:411'", 'mailto:office@midgettfite.com', '312 South Maple Street, Suite B', '(615) 555-0100']) {
    assert.notDeepEqual(hardCoded(s), [], s);
  }
  for (const s of ['{site.phone}', 'href={site.tel}', 'type="tel"', '<!-- it was 615-444-3136 -->', 'cid=2622158749148926133', 'aspect-ratio:2544/681', '#1234567', '24bdcf87-2364-4451-b430-10321f6550bd']) {
    assert.deepEqual(hardCoded(s), [], s);
  }
});
