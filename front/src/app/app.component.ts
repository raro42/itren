import { HttpClient } from '@angular/common/http';
import { Component, OnInit, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { LangService } from './lang.service';
import { Lang, MsgKey } from './i18n';
import { shareWithFriend } from './share';
import { getVisitorId } from './visitor';

type PublicStats = {
  day: string;
  requests_today: number;
  requests_total: number;
  visitors_today: number;
  returning_today: number;
  likes: number;
  dislikes: number;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  readonly version = environment.version;
  readonly commitHash = environment.commitHash;
  readonly githubUrl = environment.githubUrl;
  shareStatus = signal<string | null>(null);
  stats = signal<PublicStats | null>(null);
  myVote = signal<'like' | 'dislike' | null>(null);
  voteThanks = signal(false);

  constructor(
    private langSvc: LangService,
    private http: HttpClient,
    private title: Title,
  ) {}

  ngOnInit(): void {
    this.syncDocumentTitle();
    // Soft metrics after first paint so LCP is not blocked on /visit + /stats.
    this.whenIdle(() => {
      const visitor = getVisitorId();
      this.http.post(`${environment.apiBase}/visit`, { visitor_id: visitor }).subscribe({
        error: () => undefined,
      });
      this.refreshStats();
    });
    try {
      const v = localStorage.getItem('itren.vote') as 'like' | 'dislike' | null;
      if (v === 'like' || v === 'dislike') this.myVote.set(v);
    } catch {
      /* ignore */
    }
  }

  lang() {
    return this.langSvc.lang();
  }

  msg(key: MsgKey, vars?: Record<string, string | number>): string {
    return this.langSvc.msg(key, vars);
  }

  setLang(lang: Lang): void {
    this.langSvc.setLang(lang);
    this.syncDocumentTitle();
  }

  vote(v: 'like' | 'dislike'): void {
    this.http
      .post<{ ok: boolean; likes?: number; dislikes?: number }>(`${environment.apiBase}/vote`, {
        visitor_id: getVisitorId(),
        vote: v,
      })
      .subscribe({
        next: (r) => {
          this.myVote.set(v);
          try {
            localStorage.setItem('itren.vote', v);
          } catch {
            /* ignore */
          }
          this.voteThanks.set(true);
          if (typeof r.likes === 'number' && typeof r.dislikes === 'number') {
            const cur = this.stats();
            this.stats.set({
              day: cur?.day || '',
              requests_today: cur?.requests_today || 0,
              requests_total: cur?.requests_total || 0,
              visitors_today: cur?.visitors_today || 0,
              returning_today: cur?.returning_today || 0,
              likes: r.likes,
              dislikes: r.dislikes,
            });
          } else {
            this.refreshStats();
          }
        },
      });
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

  private syncDocumentTitle(): void {
    this.title.setTitle(`${this.msg('brand')} · ${this.msg('tagline')}`);
  }

  private refreshStats(): void {
    this.http.get<PublicStats>(`${environment.apiBase}/stats`).subscribe({
      next: (s) => this.stats.set(s),
      error: () => undefined,
    });
  }

  private whenIdle(fn: () => void): void {
    const ric = (
      window as Window & {
        requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      }
    ).requestIdleCallback;
    if (typeof ric === 'function') {
      ric(() => fn(), { timeout: 2500 });
    } else {
      window.setTimeout(fn, 400);
    }
  }
}
