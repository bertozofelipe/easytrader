// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Ajustar quando o domínio definitivo estiver configurado.
  site: 'https://easytrader.pages.dev',
  trailingSlash: 'ignore',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [sitemap()]
});
