import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import { LangService } from './lang.service';
import { MsgKey } from './i18n';
import { shareWithFriend } from './share';
import { getVisitorId } from './visitor';

type Station = { id: string; name: string; lat: number | null; lon: number | null };
type Departure = {
  trip_id: string;
  line: string;
  headsign: string;
  scheduled: string;
  delay_seconds: number | null;
  realtime: boolean;
  cancelled?: boolean;
  delay_source?: 'live' | 'timetable' | 'unknown';
  wait_minutes: number;
  situation: string;
  suggest_leave: boolean;
};
type AlertItem = { header: string; description: string };
type NextResponse = {
  from: Station;
  to: Station;
  departures: Departure[];
  taxi: { maps: string; label: string } | null;
  attribution: string;
  empty_reason: string | null;
  live_mode?: 'live' | 'timetable' | 'timetable_only' | 'unknown';
  live_feed_ok?: boolean;
  alerts?: AlertItem[];
};
type Favorite = { fromId: string; toId: string; fromName: string; toName: string };
type ReportKind = 'on_time' | 'late' | 'no_show' | 'board_wrong';

const LS_FROM = 'itren.from';
const LS_TO = 'itren.to';
const LS_FAV = 'itren.favorites';

/** Maresme sample OD: always available even before search. */
const QUICK: Station[] = [
  { id: '79604', name: 'Pineda de Mar', lat: 41.6224449, lon: 2.69355042 },
  { id: '79500', name: 'Mataró', lat: 41.5333852, lon: 2.44553025 },
  { id: '79407', name: 'El Masnou', lat: 41.4770363, lon: 2.3103772 },
];

function fold(s: string): string {
  return s
    .trim()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

function bestStation(query: string, hits: Station[]): Station | undefined {
  const q = fold(query);
  if (!q) return undefined;
  const exact = hits.find((s) => fold(s.name) === q);
  if (exact) return exact;
  const starts = hits.filter((s) => fold(s.name).startsWith(q) || fold(s.name).includes(q));
  if (starts.length === 1) return starts[0];
  const loose = hits.filter((s) => fold(s.name).includes(q) || q.includes(fold(s.name)));
  if (loose.length === 1) return loose[0];
  return undefined;
}

function migrateLs(): void {
  const pairs: [string, string][] = [
    ['yonose.from', LS_FROM],
    ['yonose.to', LS_TO],
    ['yonose.favorites', LS_FAV],
  ];
  for (const [oldK, newK] of pairs) {
    if (!localStorage.getItem(newK) && localStorage.getItem(oldK)) {
      localStorage.setItem(newK, localStorage.getItem(oldK)!);
    }
  }
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {
  fromId = signal('');
  toId = signal('');
  fromQuery = '';
  toQuery = '';
  fromHits = signal<Station[]>([]);
  toHits = signal<Station[]>([]);
  fromOpen = signal(false);
  toOpen = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);
  result = signal<NextResponse | null>(null);
  favorites = signal<Favorite[]>([]);
  shareStatus = signal<string | null>(null);
  selected = signal<Departure | null>(null);
  reportStatus = signal<string | null>(null);
  reportAgg = signal<Record<string, number> | null>(null);
  knownNames = new Map<string, string>();
  readonly githubStarUrl = environment.githubUrl;

  private fromTimer: ReturnType<typeof setTimeout> | null = null;
  private toTimer: ReturnType<typeof setTimeout> | null = null;
  private fromBlurTimer: ReturnType<typeof setTimeout> | null = null;
  private toBlurTimer: ReturnType<typeof setTimeout> | null = null;
  private picking = false;

  constructor(
    private http: HttpClient,
    private langSvc: LangService,
  ) {
    for (const s of QUICK) this.knownNames.set(s.id, s.name);
  }

  ngOnInit(): void {
    migrateLs();
    this.favorites.set(this.readFavorites());
    const from = localStorage.getItem(LS_FROM) || '';
    const to = localStorage.getItem(LS_TO) || '';
    if (from) {
      this.fromId.set(from);
      this.fromQuery = this.stationName(from);
      void this.resolveName(from, 'from');
    }
    if (to) {
      this.toId.set(to);
      this.toQuery = this.stationName(to);
      void this.resolveName(to, 'to');
    }
    if (from && to) void this.loadNext();
  }

  ngOnDestroy(): void {
    if (this.fromTimer) clearTimeout(this.fromTimer);
    if (this.toTimer) clearTimeout(this.toTimer);
    if (this.fromBlurTimer) clearTimeout(this.fromBlurTimer);
    if (this.toBlurTimer) clearTimeout(this.toBlurTimer);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selected()) this.closeDetail();
  }

  msg(key: MsgKey, vars?: Record<string, string | number>): string {
    return this.langSvc.msg(key, vars);
  }

  lang() {
    return this.langSvc.lang();
  }

  canShow(): boolean {
    if (this.loading()) return false;
    if (this.fromId() && this.toId()) return true;
    return fold(this.fromQuery).length >= 2 && fold(this.toQuery).length >= 2;
  }

  stationName(id: string): string {
    return this.knownNames.get(id) || id;
  }

  onFromInput(value: string): void {
    this.fromQuery = value;
    if (this.fromId() && fold(value) !== fold(this.stationName(this.fromId()))) {
      this.fromId.set('');
    }
    this.fromOpen.set(true);
    if (this.fromTimer) clearTimeout(this.fromTimer);
    this.fromTimer = setTimeout(() => this.searchStations(value, 'from'), 160);
  }

  onToInput(value: string): void {
    this.toQuery = value;
    if (this.toId() && fold(value) !== fold(this.stationName(this.toId()))) {
      this.toId.set('');
    }
    this.toOpen.set(true);
    if (this.toTimer) clearTimeout(this.toTimer);
    this.toTimer = setTimeout(() => this.searchStations(value, 'to'), 160);
  }

  selectFrom(s: Station, ev?: Event): void {
    ev?.preventDefault();
    this.picking = true;
    this.knownNames.set(s.id, s.name);
    this.fromId.set(s.id);
    this.fromQuery = s.name;
    this.fromOpen.set(false);
    this.fromHits.set([]);
    localStorage.setItem(LS_FROM, s.id);
    window.setTimeout(() => {
      this.picking = false;
    }, 0);
  }

  selectTo(s: Station, ev?: Event): void {
    ev?.preventDefault();
    this.picking = true;
    this.knownNames.set(s.id, s.name);
    this.toId.set(s.id);
    this.toQuery = s.name;
    this.toOpen.set(false);
    this.toHits.set([]);
    localStorage.setItem(LS_TO, s.id);
    window.setTimeout(() => {
      this.picking = false;
    }, 0);
  }

  onFromBlur(): void {
    if (this.fromBlurTimer) clearTimeout(this.fromBlurTimer);
    this.fromBlurTimer = setTimeout(() => {
      if (this.picking) return;
      this.commitTyped('from');
      this.fromOpen.set(false);
    }, 280);
  }

  onToBlur(): void {
    if (this.toBlurTimer) clearTimeout(this.toBlurTimer);
    this.toBlurTimer = setTimeout(() => {
      if (this.picking) return;
      this.commitTyped('to');
      this.toOpen.set(false);
    }, 280);
  }

  swap(): void {
    const a = this.fromId();
    const b = this.toId();
    const aq = this.fromQuery;
    const bq = this.toQuery;
    this.fromId.set(b);
    this.toId.set(a);
    this.fromQuery = bq;
    this.toQuery = aq;
    if (b) localStorage.setItem(LS_FROM, b);
    else localStorage.removeItem(LS_FROM);
    if (a) localStorage.setItem(LS_TO, a);
    else localStorage.removeItem(LS_TO);
  }

  async loadNext(): Promise<void> {
    this.error.set(null);
    this.closeDetail();
    const from = await this.ensureStation('from');
    const to = await this.ensureStation('to');
    if (!from || !to) {
      this.error.set(this.msg('pickBoth'));
      return;
    }
    this.loading.set(true);
    this.http
      .get<NextResponse>(`${environment.apiBase}/next`, { params: { from, to, limit: 5 } })
      .subscribe({
        next: (res) => {
          this.knownNames.set(res.from.id, res.from.name);
          this.knownNames.set(res.to.id, res.to.name);
          this.fromQuery = res.from.name;
          this.toQuery = res.to.name;
          this.result.set(res);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set(this.msg('error'));
        },
      });
  }

  openDetail(d: Departure): void {
    this.selected.set(d);
    this.reportStatus.set(null);
    this.reportAgg.set(null);
  }

  closeDetail(): void {
    this.selected.set(null);
    this.reportStatus.set(null);
    this.reportAgg.set(null);
  }

  sourceLabel(d: Departure): string {
    const src = d.delay_source || (d.realtime ? 'unknown' : 'timetable');
    if (src === 'live') return this.msg('detailSourceLive');
    if (src === 'timetable') return this.msg('detailSourceTimetable');
    return this.msg('detailSourceUnknown');
  }

  liveBannerKey(): MsgKey {
    const mode = this.result()?.live_mode;
    if (mode === 'live') return 'liveBannerLive';
    if (mode === 'timetable' || mode === 'timetable_only') return 'liveBannerTimetable';
    return 'liveBannerUnknown';
  }

  sendReport(kind: ReportKind): void {
    const d = this.selected();
    const res = this.result();
    if (!d || !res) return;
    this.http
      .post<{ ok: boolean; aggregates?: Record<string, number> }>(`${environment.apiBase}/report`, {
        visitor_id: getVisitorId(),
        from_id: res.from.id,
        to_id: res.to.id,
        trip_id: d.trip_id,
        scheduled: d.scheduled,
        kind,
      })
      .subscribe({
        next: (r) => {
          this.reportStatus.set(this.msg('reportThanks'));
          if (r.aggregates) this.reportAgg.set(r.aggregates);
        },
        error: () => {
          this.reportStatus.set(this.msg('error'));
        },
      });
  }

  saveFavorite(): void {
    const from = this.fromId();
    const to = this.toId();
    if (!from || !to) return;
    const fav: Favorite = {
      fromId: from,
      toId: to,
      fromName: this.stationName(from),
      toName: this.stationName(to),
    };
    const next = [fav, ...this.favorites().filter((f) => !(f.fromId === from && f.toId === to))].slice(
      0,
      6,
    );
    this.favorites.set(next);
    localStorage.setItem(LS_FAV, JSON.stringify(next));
  }

  useFavorite(f: Favorite): void {
    this.knownNames.set(f.fromId, f.fromName);
    this.knownNames.set(f.toId, f.toName);
    this.selectFrom({ id: f.fromId, name: f.fromName, lat: null, lon: null });
    this.selectTo({ id: f.toId, name: f.toName, lat: null, lon: null });
    void this.loadNext();
  }

  formatTime(iso: string): string {
    try {
      return new Date(iso).toLocaleTimeString(this.lang(), { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  }

  delayLabel(d: Departure): string {
    if (d.cancelled) return this.msg('cancelled');
    if (d.delay_seconds == null) return d.realtime ? '±?' : 'timetable';
    const m = Math.round(d.delay_seconds / 60);
    if (Math.abs(m) <= 1) return 'OK';
    return m > 0 ? `+${m} min` : `${m} min`;
  }

  async share(): Promise<void> {
    const from = this.fromId() ? this.stationName(this.fromId()) : '';
    const to = this.toId() ? this.stationName(this.toId()) : '';
    const text =
      from && to
        ? this.msg('shareTextTrip', { from, to })
        : this.msg('shareText');
    const result = await shareWithFriend({
      title: this.msg('shareTitle'),
      text,
    });
    if (result === 'copied') {
      this.shareStatus.set(this.msg('shareCopied'));
      window.setTimeout(() => this.shareStatus.set(null), 4000);
    } else {
      this.shareStatus.set(null);
    }
  }

  commitTyped(side: 'from' | 'to'): void {
    const query = side === 'from' ? this.fromQuery : this.toQuery;
    const hits = side === 'from' ? this.fromHits() : this.toHits();
    const pool = hits.length ? hits : QUICK;
    const best = bestStation(query, pool);
    if (!best) return;
    if (side === 'from') this.selectFrom(best);
    else this.selectTo(best);
  }

  private async ensureStation(side: 'from' | 'to'): Promise<string> {
    const existing = side === 'from' ? this.fromId() : this.toId();
    if (existing) return existing;
    const query = side === 'from' ? this.fromQuery : this.toQuery;
    const localHits = side === 'from' ? this.fromHits() : this.toHits();
    const local = bestStation(query, localHits.length ? localHits : QUICK);
    if (local) {
      if (side === 'from') this.selectFrom(local);
      else this.selectTo(local);
      return local.id;
    }
    const q = query.trim();
    if (q.length < 2) return '';
    try {
      const res = await firstValueFrom(
        this.http.get<{ stations: Station[] }>(`${environment.apiBase}/stations`, {
          params: { q, limit: 12 },
        }),
      );
      const hits = res.stations || [];
      for (const s of hits) this.knownNames.set(s.id, s.name);
      const best = bestStation(q, hits);
      if (!best) return '';
      if (side === 'from') this.selectFrom(best);
      else this.selectTo(best);
      return best.id;
    } catch {
      return '';
    }
  }

  private searchStations(query: string, side: 'from' | 'to'): void {
    const q = query.trim();
    if (q.length < 2) {
      const hits = QUICK;
      if (side === 'from') this.fromHits.set(hits);
      else this.toHits.set(hits);
      return;
    }
    this.http
      .get<{ stations: Station[] }>(`${environment.apiBase}/stations`, {
        params: { q, limit: 12 },
      })
      .subscribe({
        next: (res) => {
          const hits = res.stations || [];
          for (const s of hits) this.knownNames.set(s.id, s.name);
          if (side === 'from') this.fromHits.set(hits);
          else this.toHits.set(hits);
          const best = bestStation(q, hits);
          const exact = best && fold(best.name) === fold(q);
          const unique = best && hits.length === 1 && fold(q).length >= 3;
          if (best && (exact || unique)) {
            if (side === 'from') this.selectFrom(best);
            else this.selectTo(best);
          }
        },
        error: () => {
          if (side === 'from') this.fromHits.set([]);
          else this.toHits.set([]);
        },
      });
  }

  private async resolveName(id: string, side: 'from' | 'to'): Promise<void> {
    if (this.knownNames.has(id) && !/^\d+$/.test(this.knownNames.get(id)!)) {
      if (side === 'from') this.fromQuery = this.knownNames.get(id)!;
      else this.toQuery = this.knownNames.get(id)!;
      return;
    }
    try {
      const res = await firstValueFrom(
        this.http.get<{ stations: Station[] }>(`${environment.apiBase}/stations`, {
          params: { q: id, limit: 5 },
        }),
      );
      const hit = (res.stations || []).find((s) => s.id === id);
      if (!hit) return;
      this.knownNames.set(hit.id, hit.name);
      if (side === 'from') this.fromQuery = hit.name;
      else this.toQuery = hit.name;
    } catch {
      /* keep id as query */
    }
  }

  private readFavorites(): Favorite[] {
    try {
      return JSON.parse(localStorage.getItem(LS_FAV) || '[]') as Favorite[];
    } catch {
      return [];
    }
  }
}
