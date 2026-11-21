import { environment } from '../environments/environment';

export type SharePayload = {
  title: string;
  text: string;
  url?: string;
};

export function shareUrl(): string {
  return environment.publicUrl.replace(/\/$/, '');
}

/** Native share sheet when available; otherwise copy link and return 'copied'. */
export async function shareWithFriend(payload: SharePayload): Promise<'shared' | 'copied' | 'aborted'> {
  const url = payload.url || shareUrl();
  const data = { title: payload.title, text: payload.text, url };

  const nav = navigator as Navigator & {
    share?: (data: ShareData) => Promise<void>;
    canShare?: (data: ShareData) => boolean;
  };

  if (typeof nav.share === 'function') {
    try {
      if (!nav.canShare || nav.canShare(data)) {
        await nav.share(data);
        return 'shared';
      }
    } catch (err) {
      const name = err && typeof err === 'object' && 'name' in err ? String((err as { name: string }).name) : '';
      if (name === 'AbortError') return 'aborted';
      // fall through to clipboard
    }
  }

  try {
    const line = `${payload.text}\n${url}`;
    await navigator.clipboard.writeText(line);
    return 'copied';
  } catch {
    // last resort: prompt
    window.prompt(payload.title, `${payload.text}\n${url}`);
    return 'copied';
  }
}
