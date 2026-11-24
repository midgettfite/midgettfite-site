// The online rental application (MF-316). Run: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FIELDS, applicationForJasper, handleApply, validate } from './apply.js';
import worker from './index.js';

const GOOD = {
  property: '115A Samantha Court, Mt Juliet',
  seen_in_person: 'yes', showing_agent: 'Nate', showing_date: '2026-11-20',
  full_name: 'Pat Example', email: 'pat@example.com', phone: '615-555-0100',
  employer: 'Example Co', current_address: '1 Main St, Lebanon TN 37087',
  smoker: 'no', pets: 'no', convicted: 'no', money_ready: 'Right away',
  agree: 'yes', signature: 'Pat Example',
};
const form = (o) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.append(k, v); return f; };

test('a complete application passes, and unknown fields are dropped', () => {
  const out = validate({ ...GOOD, ssn: '123-45-6789', dob: '1990-01-01', card: '4111111111111111' });
  assert.equal(out.full_name, 'Pat Example');
  assert.ok(!('ssn' in out) && !('dob' in out) && !('card' in out));
  assert.deepEqual(Object.keys(out), FIELDS.map(([n]) => n));
});

test('no application without seeing the property in person', () => {
  assert.throws(() => validate({ ...GOOD, seen_in_person: '' }), /Please answer/);
  assert.throws(() => validate({ ...GOOD, seen_in_person: 'no' }), /seen the property in person/);
});

test('terms must be agreed and signed', () => {
  assert.throws(() => validate({ ...GOOD, agree: '' }), /Please answer/);
  assert.throws(() => validate({ ...GOOD, signature: ' ' }), /Signature/);
});

test('a Social Security number typed into any answer is turned away', () => {
  for (const ssn of ['123-45-6789', '123 45 6789', 'my ssn is 123456789']) {
    assert.throws(() => validate({ ...GOOD, other_info: ssn }), /Social Security/, ssn);
  }
  // phone numbers, zip+4 and dates are fine
  for (const ok of ['615-444-3136', '6154443136', '37087-1234', '11/20/2026', '$1,250']) {
    assert.equal(validate({ ...GOOD, other_info: ok }).other_info, ok);
  }
});

test('yes-or-no questions, and the details a yes needs', () => {
  assert.throws(() => validate({ ...GOOD, smoker: 'maybe' }), /yes-or-no/);
  assert.throws(() => validate({ ...GOOD, pets: 'yes' }), /pets/);
  assert.equal(validate({ ...GOOD, pets: 'yes', pets_detail: 'One cat' }).pets_detail, 'One cat');
  assert.throws(() => validate({ ...GOOD, convicted: 'yes' }), /explain/);
  assert.throws(() => validate({ ...GOOD, email: 'not-an-email' }), /email/);
  assert.throws(() => validate({ ...GOOD, other_info: 'x'.repeat(2001) }), /too long/);
});

test('the form asks nothing about protected classes or ID numbers', () => {
  const words = FIELDS.map(([n, l]) => `${n} ${l}`).join(' ').toLowerCase();
  for (const bad of [/birth/, /\bdob\b/, /\bages?\b/, /\bssn\b/, /social security/, /licen[cs]e/, /relationship/,
    /child/, /kids?\b/, /married/, /marital/, /religio/, /\brace\b/, /national/, /citizen/, /disab/, /handicap/,
    /\bsex\b/, /gender/, /pregnan/]) {
    assert.ok(!bad.test(words), `form mentions ${bad}`);
  }
});

test('what Jasper receives: every answer in order, labelled, and nothing else', () => {
  const p = applicationForJasper(validate({ ...GOOD, ssn: '123-45-6789' }), new Date('2026-11-21T15:00:00Z'), 'id-1');
  assert.equal(p.kind, 'mf-316-application');
  assert.equal(p.id, 'id-1');
  assert.equal(p.received_at, '2026-11-21T15:00:00.000Z');
  assert.equal(p.property, '115A Samantha Court, Mt Juliet');
  assert.deepEqual(p.answers.find((x) => x.name === 'full_name'), { name: 'full_name', label: 'Full legal name', value: 'Pat Example' });
  assert.equal(p.answers.find((x) => x.name === 'past_employer').value, '');
  assert.equal(p.answers.length, FIELDS.length - 2); // the two must-be-yes ticks are implied
  assert.doesNotMatch(JSON.stringify(p), /ssn|123-45-6789/);
});

const JASPER = 'https://jasper-box.midgettfite.com/portal/applications';
function env(over = {}) {
  return { APPLY_ENABLED: 'true', TURNSTILE_SECRET: 's', JASPER_APPLY_URL: JASPER,
    JASPER_ACCESS_CLIENT_ID: 'cid', JASPER_ACCESS_CLIENT_SECRET: 'csec', ...over };
}
const req = (o) => new Request('https://midgettfite.com/api/apply', { method: 'POST', body: form(o) });
// A pretend internet: Turnstile answers `person`, Jasper answers `jasper` (a Response, or a function that throws).
function net({ person = true, jasper = () => Response.json({ ok: true, id: 'j1' }) } = {}) {
  const toJasper = [];
  const fetchImpl = async (url, init) => {
    if (url === 'https://challenges.cloudflare.com/turnstile/v0/siteverify') {
      assert.equal(init.body.get('response'), 'tok');
      return Response.json({ success: person });
    }
    assert.equal(url, JASPER);
    toJasper.push(init);
    return jasper();
  };
  return { fetchImpl, toJasper };
}
const signed = { ...GOOD, 'cf-turnstile-response': 'tok' };

test('applications are turned away until APPLY_ENABLED is "true"', async () => {
  const n = net();
  await assert.rejects(handleApply(req(signed), env({ APPLY_ENABLED: undefined }), n.fetchImpl), /aren't open yet/);
  assert.equal(n.toJasper.length, 0);
});

test('without Jasper\'s address and token, nothing is taken (fails closed)', async () => {
  for (const k of ['JASPER_APPLY_URL', 'JASPER_ACCESS_CLIENT_ID', 'JASPER_ACCESS_CLIENT_SECRET', 'TURNSTILE_SECRET']) {
    const n = net();
    await assert.rejects(handleApply(req(signed), env({ [k]: undefined }), n.fetchImpl), /not set up yet/, k);
    assert.equal(n.toJasper.length, 0);
  }
  const n = net();
  await assert.rejects(handleApply(req(signed), env({ JASPER_APPLY_URL: 'http://jasper-box.midgettfite.com/x' }), n.fetchImpl), /not set up yet/);
  assert.equal(n.toJasper.length, 0);
});

test('a failed or missing person check sends nothing', async () => {
  const n = net({ person: false });
  await assert.rejects(handleApply(req(signed), env(), n.fetchImpl), /a person/);
  const m = net();
  await assert.rejects(handleApply(req(GOOD), env(), m.fetchImpl), /a person/);
  assert.equal(n.toJasper.length + m.toJasper.length, 0);
});

test('a good application goes to Jasper with the website\'s service token', async () => {
  const n = net();
  assert.deepEqual(await handleApply(req(signed), env(), n.fetchImpl), { ok: true });
  assert.equal(n.toJasper.length, 1);
  const sent = n.toJasper[0];
  assert.equal(sent.method, 'POST');
  assert.equal(sent.headers['CF-Access-Client-Id'], 'cid');
  assert.equal(sent.headers['CF-Access-Client-Secret'], 'csec');
  assert.equal(sent.redirect, 'manual');
  const body = JSON.parse(sent.body);
  assert.equal(body.kind, 'mf-316-application');
  assert.doesNotMatch(sent.body, /cf-turnstile|tok/);
});

test('the applicant hears "sent" only when Jasper says it has the application', async () => {
  const bad = [
    () => new Response('no', { status: 500 }),
    () => new Response(null, { status: 302, headers: { location: 'https://midgettfite.cloudflareaccess.com/' } }),
    () => new Response('<html>sign in</html>', { status: 200 }),
    () => Response.json({ ok: false }),
    () => { throw new TypeError('network down'); },
  ];
  for (const jasper of bad) {
    await assert.rejects(handleApply(req(signed), env(), net({ jasper }).fetchImpl), /couldn't send your application/);
  }
});

test('/api/apply needs no portal passcode, and the passcode routes still do', async () => {
  const res = await worker.fetch(req(GOOD), {});
  assert.equal(res.status, 503); // not enabled; but not "Wrong passcode" or "missing secrets"
  assert.match((await res.json()).error, /aren't open yet/);
  const other = await worker.fetch(new Request('https://midgettfite.com/api/listings'), { GITHUB_TOKEN: 'x', UPLOAD_KEY: 'k' });
  assert.equal(other.status, 401);
});

test('the page asks exactly the questions the Worker keeps', async () => {
  const { readFile } = await import('node:fs/promises');
  const page = await readFile(new URL('../src/pages/apply-draft.astro', import.meta.url), 'utf8');
  const onPage = new Set([...page.matchAll(/\bname="([a-z_]+)"/g)].map((m) => m[1]));
  assert.deepEqual([...onPage].sort(), FIELDS.map(([n]) => n).sort());
});

test('the draft page is not in the navigation and is not indexed', async () => {
  const { readFile } = await import('node:fs/promises');
  const base = await readFile(new URL('../src/layouts/Base.astro', import.meta.url), 'utf8');
  const page = await readFile(new URL('../src/pages/apply-draft.astro', import.meta.url), 'utf8');
  assert.doesNotMatch(base, /apply/);
  assert.match(page, /<Base [^>]*noindex/);
});
