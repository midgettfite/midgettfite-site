import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const listings = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/listings' }),
  schema: z.object({
    title: z.string(),
    category: z.enum([
      'residential-sale', 'commercial-sale', 'land-sale',
      'residential-rent', 'commercial-rent',
    ]),
    status: z.enum(['active', 'pending', 'sold-leased']).default('active'),
    price: z.number(),
    priceUpdated: z.boolean().default(false),
    address: z.string(),
    city: z.string().default('Lebanon'),
    state: z.string().default('TN'),
    zip: z.string().optional(),
    beds: z.number().optional(),
    baths: z.number().optional(),
    sqft: z.number().optional(),
    photos: z.array(z.string()).default([]),
    videoUrl: z.string().url().or(z.literal('')).optional(),
    infoUrl: z.string().url().or(z.literal('')).optional(),
    description: z.string(),
    listedDate: z.coerce.date(),
  }),
});

export const collections = { listings };
