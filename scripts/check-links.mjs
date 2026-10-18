// Fails when a built page links to a missing page or a missing heading anchor.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = 'dist';
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
const broken = [];
for (const page of pages) {
  for (const [, href] of readFileSync(page, 'utf8').matchAll(/href="(\/[^"]*)"/g)) {
    if (/^\/(_astro|pagefind)\/|\.(svg|css|js|xml|ico)$/.test(href)) continue;
    const [path, anchor] = href.replaceAll('&amp;', '&').split('#');
    const target = path.endsWith('/') ? join(root, path, 'index.html') : join(root, path);
    if (!existsSync(target) || (anchor && !ids.get(target)?.has(anchor))) broken.push(`${page}: ${href}`);
  }
}
if (broken.length) {
  console.error(`Broken internal links:\n${[...new Set(broken)].join('\n')}`);
  process.exit(1);
}
console.log(`Checked internal links in ${pages.length} pages.`);
