import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { LangService } from './lang.service';
import { Lang, MsgKey } from './i18n';
import { shareWithFriend } from './share';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  readonly version = environment.version;
  readonly commitHash = environment.commitHash;
  readonly githubUrl = environment.githubUrl;
  shareStatus = signal<string | null>(null);

  constructor(private langSvc: LangService) {}

  lang() {
    return this.langSvc.lang();
  }

  msg(key: MsgKey): string {
    return this.langSvc.msg(key);
  }

  setLang(lang: Lang): void {
    this.langSvc.setLang(lang);
  }

  async share(): Promise<void> {
    const result = await shareWithFriend({
      title: this.msg('shareTitle'),
      text: this.msg('shareText'),
    });
    if (result === 'copied') {
      this.shareStatus.set(this.msg('shareCopied'));
      window.setTimeout(() => this.shareStatus.set(null), 4000);
    } else {
      this.shareStatus.set(null);
    }
  }
}
