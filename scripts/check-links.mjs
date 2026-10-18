// Fails when a built page links to a missing page or a missing heading anchor.
// Pages link to each other with relative URLs; the site itself is served under `base`.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = 'dist';
const base = '/ambrogio-docs/';
const site = 'https://example.invalid';
const pages = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (name.endsWith('.html')) pages.push(path);
  }
};
walk(root);

const ids = new Map(pages.map((page) => [page, new Set(
  [...readFileSync(page, 'utf8').matchAll(/id="([^"]+)"/g)].map((match) => match[1]))]));
const pageUrl = (page) => base + relative(root, page).split(sep).join('/').replace(/index\.html$/, '');
const broken = [];
for (const page of pages) {
  for (const [, raw] of readFileSync(page, 'utf8').matchAll(/href="([^"]+)"/g)) {
    const href = raw.replaceAll('&amp;', '&');
    if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) continue;
    const url = new URL(href, site + pageUrl(page));
    if (/\.(svg|css|js|xml|ico|png|webp|json)$/.test(url.pathname)) continue;
    if (!url.pathname.startsWith(base)) { broken.push(`${page}: ${href} (outside ${base})`); continue; }
    const path = url.pathname.slice(base.length);
    const target = path === '' || path.endsWith('/') ? join(root, path, 'index.html') : join(root, path);
    const anchor = decodeURIComponent(url.hash.slice(1));
    if (!existsSync(target) || (anchor && !ids.get(target)?.has(anchor))) broken.push(`${page}: ${href}`);
  }
}
if (broken.length) {
  console.error(`Broken internal links:\n${[...new Set(broken)].join('\n')}`);
  process.exit(1);
}
console.log(`Checked internal links in ${pages.length} pages.`);
