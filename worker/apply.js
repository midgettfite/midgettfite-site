// The online rental application (MF-316), DRAFT for Jeneva and Dan to approve.
//
//   POST /api/apply   the form at /apply-draft (not linked from the site, not indexed)
//
// Public: unlike the rest of /api/*, it needs no portal passcode. Instead it checks, in order:
//   1. APPLY_ENABLED is "true". It stays unset until Jasper can take applications and the office has approved the
//      form, so every application is turned away with "not open yet", even if this code is deployed.
//   2. Jasper's address and service token are set (below). If not, nothing is taken: there is nowhere else to send it.
//   3. Cloudflare Turnstile says a person sent it (TURNSTILE_SECRET), checked here on the server, since the
//      widget alone can be skipped by a bot posting straight to this address.
//   4. "I have seen this property in person with one of your agents" is ticked. Without it, no application.
//   5. Only the fields on the approved form are kept (FIELDS below). Anything else is dropped, so a Social
//      Security number, date of birth or card number can't come in under some other name, and free text that
//      looks like a Social Security number is turned away with a message.
// Then it hands the application to Jasper (Steve's decision, 11/23): a JSON POST to the office box, through
// Cloudflare Access with the website's own service token, the way Ivy reaches the box. Jasper stores it, checks the
// showing against the Callback List, and emails the office that one has arrived, with no personal details in the
// email. The applicant is told it went through only when Jasper says it has it. Nothing is stored here and
// nothing is emailed from here.
//
// The Jasper side is written up in the jasper repo: docs/MF-316-Applications-Receive.md.
//
// Settings (Cloudflare dashboard -> Worker -> Settings -> Variables and Secrets), set on beacon only:
//   APPLY_ENABLED              "true" to take applications
//   TURNSTILE_SECRET           the Turnstile widget's secret key
//   JASPER_APPLY_URL           https://jasper-box.midgettfite.com/portal/applications
//   JASPER_ACCESS_CLIENT_ID    the Access service token for the website (its own, not Ivy's)
//   JASPER_ACCESS_CLIENT_SECRET

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

// What Jasper receives: every question in the form's order, with its label so Jasper can show it without its own
// copy of the form. `id` lets Jasper ignore the same application sent twice. The showing is not checked here.
export function applicationForJasper(a, receivedAt = new Date(), id = crypto.randomUUID()) {
  return {
    kind: 'mf-316-application',
    version: 1,
    id,
    received_at: receivedAt.toISOString(),
    property: a.property,
    seen_in_person_ticked: true,
    answers: FIELDS.filter(([name]) => !MUST_BE_YES.includes(name)).map(([name, label]) => ({ name, label, value: a[name] })),
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

const NOT_SET_UP = 'The online application is not set up yet. Please call the office at (615) 444-3136.';
const NOT_SENT = "We couldn't send your application just now. Nothing was sent. Please try again later, or call the office at (615) 444-3136.";

export async function handleApply(request, env, fetchImpl = fetch) {
  if (request.method !== 'POST') throw new ApplyError(405, 'Use POST.');
  if (env.APPLY_ENABLED !== 'true') {
    throw new ApplyError(503, "Online applications aren't open yet. Please call the office at (615) 444-3136.");
  }
  if (!env.TURNSTILE_SECRET || !env.JASPER_APPLY_URL || !env.JASPER_ACCESS_CLIENT_ID || !env.JASPER_ACCESS_CLIENT_SECRET) {
    throw new ApplyError(503, NOT_SET_UP);
  }
  if (!env.JASPER_APPLY_URL.startsWith('https://')) throw new ApplyError(503, NOT_SET_UP);
  const size = Number(request.headers.get('content-length') || 0);
  if (size > MAX_BODY) throw new ApplyError(413, 'That application is too large.');
  const form = await request.formData();
  const ok = await verifyTurnstile(form.get('cf-turnstile-response'), env.TURNSTILE_SECRET,
    request.headers.get('cf-connecting-ip'), fetchImpl);
  if (!ok) throw new ApplyError(403, "We couldn't confirm you're a person. Please reload the page and try again.");
  const a = validate(form);
  let res;
  try {
    res = await fetchImpl(env.JASPER_APPLY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CF-Access-Client-Id': env.JASPER_ACCESS_CLIENT_ID,
        'CF-Access-Client-Secret': env.JASPER_ACCESS_CLIENT_SECRET,
      },
      body: JSON.stringify(applicationForJasper(a)),
      redirect: 'manual', // an Access sign-in redirect means the token was refused, not success
    });
  } catch {
    throw new ApplyError(502, NOT_SENT);
  }
  if (res.status !== 200 && res.status !== 201) throw new ApplyError(502, NOT_SENT);
  let reply;
  try { reply = await res.json(); } catch { reply = null; }
  if (!reply || reply.ok !== true) throw new ApplyError(502, NOT_SENT);
  return { ok: true };
}
