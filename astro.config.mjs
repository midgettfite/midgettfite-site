import { defineConfig } from 'astro/config';
import { checkLayoutPhotos, home, office, team, testimonials } from './src/lib/site.mjs';

// Checks the content staff edit (MF-315) before anything is built, and hands the office email to the
// contact forms' browser scripts, which can't read the content files.
const siteContent = {
  name: 'site-content',
  hooks: {
    'astro:config:setup': ({ updateConfig }) => {
      checkLayoutPhotos(); team(); testimonials(); home();
      updateConfig({ vite: { define: { __OFFICE_EMAIL__: JSON.stringify(office().email) } } });
    },
  },
};

// Static site. Cloudflare Pages build: `npm run build` -> output `dist/`.
export default defineConfig({
  site: 'https://midgettfite.com',
  integrations: [siteContent],
});
