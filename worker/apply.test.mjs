// The online rental application (MF-316). Run: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { FIELDS, applicationEmail, handleApply, validate } from './apply.js';
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

test('the email lists every answer and says the showing is not yet checked', () => {
  const { subject, text } = applicationEmail(validate(GOOD), new Date('2026-11-21T15:00:00Z'));
  assert.equal(subject, 'Rental application: 115A Samantha Court, Mt Juliet');
  assert.match(text, /Full legal name: Pat Example/);
  assert.match(text, /Past employer: -/);
  assert.match(text, /not yet checked against the showing records/);
  assert.match(text, /Nov 21, 2026, 9:00/);
});

function env(over = {}) {
  const sent = [];
  return { sent, APPLY_ENABLED: 'true', TURNSTILE_SECRET: 's', APPLY_EMAIL: { send: async (m) => sent.push(m) }, ...over };
}
const req = (o) => new Request('https://midgettfite.com/api/apply', { method: 'POST', body: form(o) });
const turnstile = (success) => async (url, init) => {
  assert.equal(url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
  assert.equal(init.body.get('response'), 'tok');
  return new Response(JSON.stringify({ success }));
};

test('applications are turned away until APPLY_ENABLED is "true"', async () => {
  const e = env({ APPLY_ENABLED: undefined });
  await assert.rejects(handleApply(req({ ...GOOD, 'cf-turnstile-response': 'tok' }), e, turnstile(true)), /aren't open yet/);
  assert.equal(e.sent.length, 0);
});

test('a failed or missing person check sends nothing', async () => {
  const e = env();
  await assert.rejects(handleApply(req({ ...GOOD, 'cf-turnstile-response': 'tok' }), e, turnstile(false)), /a person/);
  await assert.rejects(handleApply(req(GOOD), e, turnstile(true)), /a person/);
  assert.equal(e.sent.length, 0);
});

test('a good application is emailed to the office, replying to the applicant', async () => {
  const e = env();
  assert.deepEqual(await handleApply(req({ ...GOOD, 'cf-turnstile-response': 'tok' }), e, turnstile(true)), { ok: true });
  assert.equal(e.sent.length, 1);
  assert.equal(e.sent[0].to, 'office@midgettfite.com');
  assert.equal(e.sent[0].replyTo, 'pat@example.com');
  assert.doesNotMatch(e.sent[0].text, /cf-turnstile/);
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
