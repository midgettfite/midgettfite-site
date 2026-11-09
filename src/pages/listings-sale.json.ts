// For-sale feed for the office portal's For Sale tile: every sale listing on the site, as data.
// Kept apart from listings.json on purpose: that one is Ivy's (rentals only), and she should never see a sale.
// Paths are relative to the site, so the same feed works on the preview and the live domain.
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const SALE = new Set(['residential-sale', 'commercial-sale', 'land-sale']);

export const GET: APIRoute = async () => {
  const listings = (await getCollection('listings'))
    .filter((l) => SALE.has(l.data.category))
    .map(({ id, data: d }) => ({
      id,
      address: d.address,
      city: d.city,
      state: d.state,
      category: d.category,
      status: d.status,
      price: d.price,
      beds: d.beds ?? null,
      baths: d.baths ?? null,
      sqft: d.sqft ?? null,
      page: `/property/${id}`,
    }));
  return new Response(JSON.stringify({ version: 1, generated: new Date().toISOString(), listings }, null, 1), {
    headers: { 'Content-Type': 'application/json' },
  });
};
