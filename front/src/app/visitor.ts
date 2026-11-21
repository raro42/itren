/** Anonymous visitor id for soft stats (no account). */

const LS_VISITOR = 'itren.visitor';
const LEGACY = 'yonose.visitor';

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
