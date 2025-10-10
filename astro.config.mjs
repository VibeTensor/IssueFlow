import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import UnoCSS from '@unocss/astro';

export default defineConfig({
  site: 'https://issueflow.pages.dev',
  integrations: [
    UnoCSS({ injectReset: true }),
    svelte()
  ],
  output: 'static',
  build: {
    inlineStylesheets: 'auto'
  }
});
