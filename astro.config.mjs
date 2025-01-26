import { defineConfig } from 'astro/config';
import myExtIntegration from '/src/config/myExtIntegration';

// refs. https://docs.astro.build/ja/reference/configuration-reference/
export default defineConfig({
  site: 'https://debiru.net',
  trailingSlash: 'ignore',
  compressHTML: false,
  integrations: [myExtIntegration()],
  build: {
    format: 'file',
  },
});
