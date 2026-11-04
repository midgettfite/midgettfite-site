// Edit listing (MF-237). Run: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseDocument } from 'yaml';
import { editableFields, remove, update, writeDetails } from './index.js';

const MD = `---
title: 115A Samantha Court
category: residential-rent
status: active
price: 1990
priceUpdated: false
address: 115A Samantha Court
city: Mt Juliet
state: TN
zip: "37122"
beds: 3
baths: 2
sqft: 1488
photos:
  - /uploads/a/1.jpg
  - /uploads/a/2.jpg
videoUrl: https://example.com/tour
description: >+
  Lovely 3BR.

listedDate: 2026-11-03
---
`;
const FORM = {
  title: '115A Samantha Court', category: 'residential-rent', status: 'active', price: '1990', priceUpdated: false,
  address: '115A Samantha Court', city: 'Mt Juliet', state: 'TN', zip: '37122', beds: 3, baths: 2, sqft: 1488,
  videoUrl: 'https://example.com/tour', infoUrl: '', description: 'Lovely 3BR.',
};
const read = (md) => parseDocument(md.split('---\n')[1]).toJSON();

function fakeGitHub(md = MD, sha = 'aaa') {
  const calls = [];
  const gh = async (path, opts) => {
    if (opts?.method) calls.push({ path, body: JSON.parse(opts.body) });
    if (path.startsWith('/git/ref/')) return { object: { sha: 'head' } };
    if (path.startsWith('/git/commits/')) return { sha: 'head', tree: { sha: 'tree' } };
    if (path.startsWith('/git/trees/')) return { tree: [{ path: 'src/content/listings/a.md', type: 'blob', sha }] };
    if (path.startsWith('/git/blobs/')) return { content: Buffer.from(md).toString('base64') };
    if (path === '/git/trees') return { sha: 'newtree' };
    if (path === '/git/commits') return { sha: 'newcommit' };
    return {};
  };
  return { gh, calls };
}

test('price, status and wording change; photos and the date listed stay', () => {
  const d = read(writeDetails(MD, { ...FORM, price: '2,100', status: 'pending', priceUpdated: true, description: 'New words.' }));
  assert.equal(d.price, 2100);
  assert.equal(d.status, 'pending');
  assert.equal(d.priceUpdated, true);
  assert.equal(d.description.trim(), 'New words.');
  assert.deepEqual(d.photos, ['/uploads/a/1.jpg', '/uploads/a/2.jpg']);
  assert.equal(String(d.listedDate).slice(0, 10), '2026-11-03');
  assert.equal(d.zip, '37122');
});

test('a blanked optional box is removed', () => {
  const d = read(writeDetails(MD, { ...FORM, beds: '', zip: '', videoUrl: '' }));
  for (const k of ['beds', 'zip', 'videoUrl']) assert.equal(k in d, false, k);
});

test('bad input is refused', () => {
  assert.throws(() => writeDetails(MD, { ...FORM, status: 'gone' }), /status/);
  assert.throws(() => writeDetails(MD, { ...FORM, price: '' }), /price/);
  assert.throws(() => writeDetails(MD, { ...FORM, description: ' ' }), /description/);
  assert.throws(() => writeDetails(MD, { ...FORM, infoUrl: 'not a link' }), /web address/);
});

test('the form shows blanks for what a listing does not have', () => {
  const f = editableFields(read(MD));
  assert.equal(f.price, 1990);
  assert.equal(f.infoUrl, '');
});

test('update makes one commit, signed with who did it', async () => {
  const { gh, calls } = fakeGitHub();
  const r = await update(gh, { file: 'a.md', sha: 'aaa', listing: { ...FORM, price: 2100 }, by: 'Jeanice' });
  assert.equal(r.commit, 'newcommit');
  const commits = calls.filter((c) => c.path === '/git/commits');
  assert.equal(commits.length, 1);
  assert.match(commits[0].body.message, /Edit listing a \(office portal, Jeanice\)/);
});

test('someone else changed it in between: refused, nothing written', async () => {
  const { gh, calls } = fakeGitHub();
  await assert.rejects(update(gh, { file: 'a.md', sha: 'old', listing: FORM }), /Someone else changed/);
  assert.equal(calls.length, 0);
});

test('saving with no changes makes no commit', async () => {
  const once = writeDetails(MD, FORM);
  const { gh, calls } = fakeGitHub(once);
  assert.equal((await update(gh, { file: 'a.md', sha: 'aaa', listing: FORM })).unchanged, true);
  assert.equal(calls.length, 0);
});

test('a bad file name is refused', async () => {
  const { gh } = fakeGitHub();
  await assert.rejects(update(gh, { file: '../../x.md', sha: 'aaa', listing: FORM }), /Bad listing name/);
});

test('remove deletes only the listing file', async () => {
  const { gh, calls } = fakeGitHub();
  const r = await remove(gh, { file: 'a.md', sha: 'aaa', by: 'Steve' });
  assert.equal(r.ok, true);
  const tree = calls.find((c) => c.path === '/git/trees').body.tree;
  assert.deepEqual(tree, [{ path: 'src/content/listings/a.md', mode: '100644', type: 'blob', sha: null }]);
});
