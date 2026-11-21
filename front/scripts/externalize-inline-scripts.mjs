#!/usr/bin/env node
/**
 * Move any inline <script> bodies from index.html into external files.
 * Keeps Beasties critical-CSS performance without CSP script-src violations.
 */
import fs from 'node:fs';
import path from 'node:path';

const outDir = path.resolve('dist/front/browser');
const indexPath = path.join(outDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error(`missing ${indexPath}`);
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');
let n = 0;
html = html.replace(/<script(?![^>]*\bsrc\s*=)([^>]*)>([\s\S]*?)<\/script>/gi, (full, _attrs, code) => {
  const body = code.trim();
  if (!body) return full;
  n += 1;
  const name = `boot-${n}.js`;
  fs.writeFileSync(path.join(outDir, name), `${body}\n`);
  return `<script src="${name}"></script>`;
});

fs.writeFileSync(indexPath, html);
console.log(`externalize-inline-scripts: moved ${n} inline script(s)`);
