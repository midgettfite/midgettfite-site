// Email-sized cover photo for each listing (MF-313): /thumbs/<listing-id>.jpg, 560x373 like Ivy's Wix photos.
// Built from the listing's first photo, so it follows whatever the office sets in the editor.
import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import sharp from 'sharp';
import path from 'node:path';

export const getStaticPaths: GetStaticPaths = async () =>
  (await getCollection('listings'))
    .filter((l) => l.data.photos.length > 0)
    .map((l) => ({ params: { id: l.id }, props: { photo: l.data.photos[0] } }));

export const GET: APIRoute = async ({ props }) => {
  const file = path.join(process.cwd(), 'public', props.photo);
  const jpg = await sharp(file).rotate().resize(560, 373, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer();
  return new Response(jpg, { headers: { 'Content-Type': 'image/jpeg' } });
};
