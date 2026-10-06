// Listings feed for Ivy (MF-313): every rental on the site, as data. Ivy matches these to the Vacancies tab
// by address and takes the photo and description for her property email; rent and availability stay with
// the Vacancies tab. Paths are relative to the site, so the same feed works on the preview and the live domain.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const RENT = new Set(['residential-rent', 'commercial-rent']);

export const GET: APIRoute = async () => {
  const listings = (await getCollection('listings'))
    .filter((l) => RENT.has(l.data.category))
    .map(({ id, data: d }) => ({
      id,
      address: d.address,
      city: d.city,
      state: d.state,
      zip: d.zip ?? '',
      category: d.category,
      status: d.status,
      rent: d.price,
      beds: d.beds ?? null,
      baths: d.baths ?? null,
      sqft: d.sqft ?? null,
      description: d.description,
      page: `/property/${id}`,
      emailPhotos: d.photos.slice(0, 3).map((_, i) => `/thumbs/${id}/${i + 1}.jpg`),
      photos: d.photos,
    }));
  return new Response(JSON.stringify({ version: 1, generated: new Date().toISOString(), listings }, null, 1), {
    headers: { 'Content-Type': 'application/json' },
  });
};
