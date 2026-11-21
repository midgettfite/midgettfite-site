// The online rental application (MF-316), DRAFT for Jeneva and Dan to approve.
//
//   POST /api/apply   the form at /apply-draft (not linked from the site, not indexed)
//
// Public: unlike the rest of /api/*, it needs no portal passcode. Instead it checks, in order:
//   1. APPLY_ENABLED is "true". Until the office approves the form, it isn't, and every application is turned
//      away with "not open yet", even if this code is deployed.
//   2. Cloudflare Turnstile says a person sent it (TURNSTILE_SECRET), checked here on the server, since the
//      widget alone can be skipped by a bot posting straight to this address.
//   3. "I have seen this property in person with one of your agents" is ticked. Without it, no application.
//   4. Only the fields on the approved form are kept (FIELDS below). Anything else is dropped, so a Social
//      Security number, date of birth or card number can't come in under some other name, and free text that
//      looks like a Social Security number is turned away with a message.
// Then it emails the application to the office (APPLY_EMAIL, a Cloudflare Email Service send binding).
//
// Not in this draft, on purpose (see docs/stories/MF-316-Application-Form-Summary-DRAFT-2026-11-21.md):
//   - nothing is stored, and nothing is sent to Jasper. The story wants the application in Jasper with a
//     detail-free email; this draft emails the details instead, until that's built.
//   - no check against the showing records (Jasper's Callback List appointments, MF-247).
//   - no pay stub uploads, no $300, no SSN or date of birth (SmartMove asks for those on its own site).
//
// Settings (Cloudflare dashboard -> Worker -> Settings -> Variables and Secrets), set on beacon only:
//   APPLY_ENABLED     "true" to take applications
//   TURNSTILE_SECRET  the Turnstile widget's secret key
//   APPLY_TO          where applications go (default office@midgettfite.com)
//   APPLY_FROM        the sender, on a domain onboarded to Email Sending (default applications@midgettfite.com)
// and in wrangler.jsonc:  "send_email": [{ "name": "APPLY_EMAIL" }]

const MAX_FIELD = 2000; // characters, any one answer
const MAX_BODY = 64 * 1024; // bytes, the whole application

// Every question on the form, in the order the office reads them. [name, label, required]
export const FIELDS = [
  ['property', 'Property applying for', true],
  ['seen_in_person', 'Seen in person with a Midgett & Fite agent', true],
  ['showing_agent', 'Agent who showed it', false],
  ['showing_date', 'Date of the showing', false],

  ['full_name', 'Full legal name', true],
  ['email', 'Email', true],
  ['phone', 'Phone', true],
  ['other_applicants', 'Other adults applying for this property', false],

  ['employer', 'Current employer', true],
  ['employer_how_long', 'How long there', false],
  ['employer_phone', 'Employer phone', false],
  ['employer_email', 'Employer email', false],
  ['supervisor', "Supervisor's name", false],
  ['past_employer', 'Past employer', false],
  ['past_employer_phone', 'Past employer phone', false],
  ['past_employer_how_long', 'How long there', false],
  ['past_employer_email', 'Past employer email', false],
  ['past_supervisor', "Past supervisor's name", false],
  ['job_history_more', 'More job history (past 5+ years)', false],
  ['other_income', 'Other income sources', false],

  ['current_address', 'Current address', true],
  ['current_how_long', 'How long at this address', false],
  ['current_landlord', 'Current landlord', false],
  ['current_landlord_phone', 'Landlord phone', false],
  ['current_landlord_email', 'Landlord email', false],
  ['current_rent', 'Current rent', false],
  ['why_moving', 'Why are you moving?', false],
  ['past_address', 'Past address', false],
  ['past_landlord', 'Past landlord', false],
  ['past_landlord_phone', 'Past landlord phone', false],
  ['past_how_long', 'How long there', false],
  ['past_landlord_email', 'Past landlord email', false],

  ['occupants', 'Everyone else who will live there (legal names)', false],

  ['reference_name', 'Personal reference', false],
  ['reference_phone', 'Reference phone', false],

  ['smoker', 'Will anyone who lives there smoke?', true],
  ['pets', 'Do you expect to have pets there?', true],
  ['pets_detail', 'About the pets', false],
  ['convicted', 'Ever convicted of a felony or misdemeanor?', true],
  ['convicted_detail', 'About the conviction(s)', false],
  ['money_ready', 'When the deposit, first month and pet fee would be ready', true],
  ['other_info', 'Anything else', false],

  ['sms_consent', 'OK to text', false],
  ['agree', 'Agreed to the terms', true],
  ['signature', 'Signature (typed name)', true],
];

const YES_NO = new Set(['yes', 'no']);
const MUST_BE_YES = ['seen_in_person', 'agree'];
// ddd-dd-dddd, ddd dd dddd, or nine digits standing alone. A 10-digit phone number doesn't match.
const LOOKS_LIKE_SSN = /(?<!\d)\d{3}[- ]\d{2}[- ]\d{4}(?!\d)|(?<![\d-])\d{9}(?![\d-])/;

export class ApplyError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

// Form data (a Map-like with .get, or a plain object) -> { clean answers } or throws ApplyError with a message
// the applicant can act on.
export function validate(form) {
  const get = (k) => (typeof form.get === 'function' ? form.get(k) : form[k]);
  const out = {};
  for (const [name, label, required] of FIELDS) {
    let v = get(name);
    v = v == null ? '' : String(v).trim();
    if (v.length > MAX_FIELD) throw new ApplyError(400, `"${label}" is too long.`);
    if (required && !v) throw new ApplyError(400, `Please answer "${label}".`);
    if (v && LOOKS_LIKE_SSN.test(v)) {
      throw new ApplyError(400, `"${label}" looks like it has a Social Security number in it. Please leave it out: the screening company asks for it on its own secure site.`);
    }
    out[name] = v;
  }
  if (out.seen_in_person !== 'yes') {
    throw new ApplyError(400, 'We can only take an application after you have seen the property in person with one of our agents. Please call (615) 444-3136 to set up a showing.');
  }
  if (out.agree !== 'yes') throw new ApplyError(400, 'Please read and agree to the terms.');
  for (const k of ['smoker', 'pets', 'convicted']) {
    if (!YES_NO.has(out[k])) throw new ApplyError(400, 'Please answer each yes-or-no question.');
  }
  if (out.pets === 'yes' && !out.pets_detail) throw new ApplyError(400, 'Please tell us about the pets.');
  if (out.convicted === 'yes' && !out.convicted_detail) throw new ApplyError(400, 'Please explain the conviction(s).');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(out.email)) throw new ApplyError(400, 'Please check your email address.');
  return out;
}

// The email to the office: plain text, every question with its answer, blank answers shown as "-".
export function applicationEmail(a, receivedAt = new Date()) {
  const when = receivedAt.toLocaleString('en-US', { timeZone: 'America/Chicago', dateStyle: 'medium', timeStyle: 'short' });
  const lines = [
    `Online rental application (DRAFT FORM, MF-316), received ${when} Central.`,
    'No SSN, date of birth or driver\'s license number was asked for. Send the SmartMove invitation as usual.',
    '',
  ];
  for (const [name, label] of FIELDS) {
    if (MUST_BE_YES.includes(name)) continue;
    lines.push(`${label}: ${a[name] || '-'}`);
  }
  lines.push('', `Seen in person with an agent: YES (ticked by the applicant; not yet checked against the showing records)`);
  lines.push(`Agreed to the terms and signed as "${a.signature}".`);
  return {
    subject: `Rental application: ${a.property.slice(0, 120)}`,
    text: lines.join('\n'),
  };
}

export async function verifyTurnstile(token, secret, ip, fetchImpl = fetch) {
  if (!token) return false;
  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);
  const res = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  if (!res.ok) return false;
  const out = await res.json();
  return out.success === true;
}

export async function handleApply(request, env, fetchImpl = fetch) {
  if (request.method !== 'POST') throw new ApplyError(405, 'Use POST.');
  if (env.APPLY_ENABLED !== 'true') {
    throw new ApplyError(503, "Online applications aren't open yet. Please call the office at (615) 444-3136.");
  }
  if (!env.TURNSTILE_SECRET || !env.APPLY_EMAIL) {
    throw new ApplyError(503, 'The online application is not set up yet. Please call the office at (615) 444-3136.');
  }
  const size = Number(request.headers.get('content-length') || 0);
  if (size > MAX_BODY) throw new ApplyError(413, 'That application is too large.');
  const form = await request.formData();
  const ok = await verifyTurnstile(form.get('cf-turnstile-response'), env.TURNSTILE_SECRET,
    request.headers.get('cf-connecting-ip'), fetchImpl);
  if (!ok) throw new ApplyError(403, "We couldn't confirm you're a person. Please reload the page and try again.");
  const a = validate(form);
  const { subject, text } = applicationEmail(a);
  await env.APPLY_EMAIL.send({
    to: env.APPLY_TO || 'office@midgettfite.com',
    from: { email: env.APPLY_FROM || 'applications@midgettfite.com', name: 'Midgett & Fite Website' },
    replyTo: a.email,
    subject,
    text,
  });
  return { ok: true };
}
