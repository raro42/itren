import { Injectable, signal } from '@angular/core';
import { Lang, MsgKey, detectLang, t } from './i18n';

const LS_LANG = 'itren.lang';

@Injectable({ providedIn: 'root' })
export class LangService {
  readonly lang = signal<Lang>(detectLang());

  constructor() {
    document.documentElement.lang = this.lang();
  }

  msg(key: MsgKey, vars?: Record<string, string | number>): string {
    return t(this.lang(), key, vars);
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
    localStorage.setItem(LS_LANG, lang);
    document.documentElement.lang = lang;
  }
}
