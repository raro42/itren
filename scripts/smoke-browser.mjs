/**
 * Optional local smoke: Chromium typeahead Pineda → El Masnou.
 * Needs playwright installed somewhere NODE can resolve, and Chromium.
 *
 *   YONOSE_URL=https://yonose.zeitfenster.de/ node scripts/smoke-browser.mjs
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('Install playwright in this environment, or skip this smoke script.');
  process.exit(1);
}

const url = process.env.YONOSE_URL || 'https://yonose.zeitfenster.de/';

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});

await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });

const why = await page.locator('#why-heading').textContent();
if (!why || !/why|por qu|per qu/i.test(why)) {
  throw new Error(`why band missing: ${why}`);
}

await page.getByTestId('from-input').click();
await page.getByTestId('from-input').fill('Pineda');
await page.waitForSelector('#from-listbox button', { timeout: 10000 });
await page.locator('#from-listbox button', { hasText: 'Pineda de Mar' }).first().click();
await page.waitForTimeout(250);

await page.getByTestId('to-input').click();
await page.getByTestId('to-input').fill('Masnou');
await page.waitForSelector('#to-listbox button', { timeout: 10000 });
await page.locator('#to-listbox button', { hasText: 'El Masnou' }).first().click();
await page.waitForTimeout(250);

const show = page.getByTestId('show-next');
for (let i = 0; i < 30; i++) {
  if (await show.isEnabled()) break;
  await page.waitForTimeout(100);
}
if (!(await show.isEnabled())) throw new Error('show-next stayed disabled');
await show.click();
await page.waitForSelector('.board', { timeout: 20000 });
const board = await page.locator('.board h2').textContent();
if (!/Pineda/i.test(board || '') || !/Masnou/i.test(board || '')) {
  throw new Error(`board title unexpected: ${board}`);
}
const deps = await page.locator('.deps li').count();
console.log(JSON.stringify({ ok: true, why, board, deps, errors }, null, 2));
await browser.close();
