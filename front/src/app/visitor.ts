/** Anonymous visitor id for soft stats (no account). */

const LS_VISITOR = 'itren.visitor';
const LEGACY = 'yonose.visitor';
const LS_PULSE_OFF = 'itren.pulse';

function randomId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function getVisitorId(): string {
  try {
    let id = localStorage.getItem(LS_VISITOR) || localStorage.getItem(LEGACY) || '';
    if (!id || id.length < 16) {
      id = randomId();
    }
    localStorage.setItem(LS_VISITOR, id);
    return id;
  } catch {
    return randomId();
  }
}

/** Soft pulse only. Skip smoke / headless / explicit test browsers. */
export function shouldCountVisit(): boolean {
  try {
    if (typeof navigator !== 'undefined' && (navigator as Navigator & { webdriver?: boolean }).webdriver) {
      return false;
    }
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
    if (/HeadlessChrome|Playwright|Puppeteer/i.test(ua)) return false;
    const q = new URLSearchParams(window.location.search);
    if (q.get('itren_test') === '1' || q.get('pulse') === '0') return false;
    if (localStorage.getItem(LS_PULSE_OFF) === 'off') return false;
  } catch {
    /* count if checks fail */
  }
  return true;
}
