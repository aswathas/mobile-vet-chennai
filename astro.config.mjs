import { defineConfig } from 'astro/config';
import { remarkReport } from './src/lib/remark-report.mjs';

export default defineConfig({
  output: 'static',
  build: {
    format: 'directory',
    inlineStylesheets: 'auto',
  },
  markdown: {
    remarkPlugins: [remarkReport],
    smartypants: false,
  },
  vite: {
    build: {
      assetsInlineLimit: 4096,
    },
  },
});
