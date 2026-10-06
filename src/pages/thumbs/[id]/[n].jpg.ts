// Email-sized photos for each listing (MF-313): /thumbs/<listing-id>/1.jpg … 3.jpg, 560x373 like the Wix
// photos Ivy's property email used. Built from the listing's first three photos, so they follow whatever the
// office sets in the editor.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import sharp from 'sharp';
import path from 'node:path';

export const EMAIL_PHOTOS = 3;

export const getStaticPaths: GetStaticPaths = async () =>
  (await getCollection('listings')).flatMap((l) =>
    l.data.photos.slice(0, EMAIL_PHOTOS).map((photo, i) => ({ params: { id: l.id, n: String(i + 1) }, props: { photo } })));

export const GET: APIRoute = async ({ props }) => {
  const file = path.join(process.cwd(), 'public', props.photo);
  const jpg = await sharp(file, { failOn: 'none' }).rotate().resize(560, 373, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer();
  return new Response(jpg, { headers: { 'Content-Type': 'image/jpeg' } });
};
