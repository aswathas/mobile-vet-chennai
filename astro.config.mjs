import { defineConfig } from 'astro/config';
import { remarkReport } from './src/lib/remark-report.mjs';

// The site is served two ways: from a local preview at the root, and from
// GitHub Pages under the repository name. SITE_BASE carries the mount point
// so one set of pages works in both places — every internal link is written
// against import.meta.env.BASE_URL, never as a hard-coded absolute path.
// The trailing slash is part of the contract: BASE_URL is "/mobile-vet-chennai/"
// or "/", never the bare directory name, because the pages concatenate it
// directly onto "fonts/fonts.css".
const rawBase = process.env.SITE_BASE || '/';
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

export default defineConfig({
  site: process.env.SITE_URL || undefined,
  base,
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
