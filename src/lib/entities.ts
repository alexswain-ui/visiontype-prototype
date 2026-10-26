import lunaSkyPhoto from '../assets/entities/luna-sky.jpg';
import midnightStaticArt from '../assets/entities/midnight-static.jpg';
import odalieBraskPhoto from '../assets/entities/odalie-brask.jpg';
import saffronFerryArt from '../assets/entities/saffron-ferry.jpg';
import { artistById, cast, marketByCode, songById } from './data';

/**
 * Builds what the Song, Artist and Country pages show, from src/data/cast.json.
 * Saffron Ferry, Luna Sky and GB are fully populated. Any other id gets the same header and trend,
 * scaled from the closest full example, and the detail cards show an empty state.
 */

export type EntityKind = 'song' | 'artist' | 'country';

/** The fully populated example for each page. */
export const FULL_EXAMPLE: Record<EntityKind, { id: string; name: string }> = {
  song: { id: 'saffron-ferry', name: 'Saffron Ferry' },
  artist: { id: 'luna-sky', name: 'Luna Sky' },
  country: { id: 'GB', name: 'United Kingdom' },
};

/** Artwork and photos exported from the Figma entity pages. Everything else uses placeholders. */
const SONG_ART: Record<string, string> = { 'saffron-ferry': saffronFerryArt, 'midnight-static': midnightStaticArt };
const ARTIST_PHOTO: Record<string, string> = { 'luna-sky': lunaSkyPhoto, 'odalie-brask': odalieBraskPhoto };

export const songArt = (id?: string) => (id ? SONG_ART[id] : undefined);
export const artistPhoto = (id?: string) => (id ? ARTIST_PHOTO[id] : undefined);

export interface EntityStat {
  label: string;
  value: string;
  delta?: number;
  sub?: string;
  flag?: string;
}

export interface WeekRow {
  week: string;
  published: string;
  reported: number;
  total: number;
  restated: boolean;
  /** e.g. "1 redelivered Mon 5 Oct". Only shown for restated weeks. */
  note?: string;
  /** Percent change on the week before. Null for the oldest week. */
  delta: number | null;
  capped: number;
}

export interface Trend {
  current: number[];
  previous: number[];
  labels: string[];
}

export interface TrendList {
  code: string;
  name: string;
  /** Millions of capped streams. */
  value: number;
}

interface Base {
  /** False when the id is not in the data at all. */
  found: boolean;
  /** True for the fully populated examples. */
  full: boolean;
  title: string;
  meta: { label: string; to?: string }[];
  stats: EntityStat[];
  trend: Trend;
  weekly: WeekRow[];
}

export interface SongView extends Base {
  kind: 'song';
  art?: string;
  seed: number;
  topMarkets: TrendList[] | null;
  marketTable: MarketRow[] | null;
  history: { title: string; meta: string; detail: string }[] | null;
  rights: { open: number; text: string; checked: string } | null;
}

export interface ArtistView extends Base {
  kind: 'artist';
  photo?: string;
  songCount: number;
  topMarkets: TrendList[] | null;
  songs: ArtistSongRow[];
  labels: LabelRow[] | null;
}

export interface CountryView extends Base {
  kind: 'country';
  code: string;
  short: string;
  topArtists: RankRow[] | null;
  topSongs: RankRow[] | null;
  shareByLabel: { badge: string; note: string; rows: { name: string; value: string; share: number }[] } | null;
}

export type EntityView = SongView | ArtistView | CountryView;

export interface MarketRow {
  code: string;
  name: string;
  topDsp: string;
  share: number;
  capped: number;
  delta: number;
}

export interface ArtistSongRow {
  title: string;
  isrc: string;
  /** Set when the song has its own page. */
  id?: string;
  art?: string;
  seed: number;
  status: string | null;
  label: string;
  markets: number;
  capped: number;
  delta: number;
}

export interface LabelRow {
  label: string;
  distributor: string;
  songs: number;
  capped: string;
  share: number;
}

export interface RankRow {
  rank: number;
  name: string;
  sub?: string;
  to?: string;
  image?: string;
  seed: number;
  value: string;
  delta: number;
}

const regionNames = new Intl.DisplayNames(['en-GB'], { type: 'region' });

/** "United Kingdom" for "GB", including markets that are not in the cast list (e.g. Sweden). */
export const marketName = (code: string) => marketByCode(code)?.name ?? regionNames.of(code) ?? code;

const round1 = (value: number) => Math.round(value * 10) / 10;

/** "14.31M" from 14,310,000; "412.3M" from 412,300,000; "1.20bn" from 1,204,882,310. */
export function millions(streams: number): string {
  if (streams >= 1e9) return `${(streams / 1e9).toFixed(2)}bn`;
  const m = streams / 1e6;
  return `${m >= 100 ? m.toFixed(1) : m.toFixed(2)}M`;
}

const seriesFor = (key: string) => cast.series[key as keyof typeof cast.series] as { current: number[]; previous: number[] };

/**
 * The full example's 8-week series, scaled so its latest week equals `latest` (millions).
 * With `delta`, the week before is nudged so the latest change matches the entity's own change.
 */
function scaledSeries(kind: EntityKind, latest: number, delta?: number) {
  const series = seriesFor(`${kind}:${FULL_EXAMPLE[kind].id}`);
  const n = series.current.length;
  const ratio = latest / series.current[n - 1];
  const scale = (values: number[]) => values.map((v) => +(v * ratio).toFixed(2));
  const current = scale(series.current);
  if (delta !== undefined) current[n - 2] = +(current[n - 1] / (1 + delta / 100)).toFixed(2);
  return { current, previous: scale(series.previous) };
}

function buildTrend(series: { current: number[]; previous: number[] }): Trend {
  const labels = [...cast.weeks].reverse().map((w) => w.w);
  return { current: series.current, previous: series.previous, labels };
}

/** Weekly trend table, newest first. Values and changes come from the same series as the chart. */
function buildWeekly(current: number[]): WeekRow[] {
  const newestFirst = [...current].reverse();
  return cast.weeks.map((week, i) => {
    const value = newestFirst[i];
    const before = newestFirst[i + 1];
    return {
      week: week.w,
      published: week.published,
      reported: week.reported,
      total: cast.week.dspsReported.total,
      restated: Boolean(week.restated),
      note: week.restated && week.note ? week.note.replace('DSP redelivered · ', 'redelivered ') : undefined,
      delta: before === undefined ? null : round1(((value - before) / before) * 100),
      capped: Math.round(value * 1e6),
    };
  });
}

const latestDelta = (current: number[]) => {
  const n = current.length;
  return round1(((current[n - 1] - current[n - 2]) / current[n - 2]) * 100);
};

/** Song titles in the artist page data that also have their own song page. */
const songIdByTitle = (title: string) => cast.songs.find((s) => s.title === title)?.id;
const artistIdByName = (name: string) => cast.artists.find((a) => a.name === name)?.id;

const EMPTY_TREND: Trend = { current: [], previous: [], labels: [] };

export function songView(id: string): SongView {
  const song = songById(id);
  if (!song) {
    return { kind: 'song', found: false, full: false, title: 'Song not found', meta: [], stats: [], trend: EMPTY_TREND, weekly: [], seed: 0, topMarkets: null, marketTable: null, history: null, rights: null };
  }
  const artist = artistById(song.artist);
  const distributor = cast.canonicalRows.find((r) => r.song === song.id)?.distributor;
  const detail = cast.songPage[id as keyof typeof cast.songPage];
  const series = detail ? seriesFor(`song:${id}`) : scaledSeries('song', song.capped / 1e6);
  const meta = [
    artist ? { label: artist.name, to: `/artist/${artist.id}` } : null,
    { label: song.isrc },
    artist ? { label: artist.label } : null,
    distributor ? { label: distributor } : null,
  ].filter((m): m is { label: string; to?: string } => m !== null);

  const base = { kind: 'song' as const, found: true, title: song.title, meta, art: songArt(id), seed: song.art, trend: buildTrend(series), weekly: buildWeekly(series.current) };

  if (detail) {
    const top = [...detail.marketTable].sort((a, b) => b.capped - a.capped);
    return {
      ...base,
      full: true,
      stats: detail.stats,
      topMarkets: top.slice(0, 5).map((m) => ({ code: m.market, name: marketName(m.market), value: m.capped / 1e6 })),
      marketTable: detail.marketTable.map((m) => ({ code: m.market, name: marketName(m.market), topDsp: m.topDsp, share: m.share, capped: m.capped, delta: m.delta })),
      history: detail.history.map((h) => ({ title: h.title, meta: h.meta.replace(/\s{2,}/g, ' · '), detail: h.lines.join(' ') })),
      rights: detail.rights,
    };
  }

  const conflicts = song.status === 'conflict' ? 1 : 0;
  return {
    ...base,
    full: false,
    stats: [
      { label: `Capped streams · ${cast.weeks[0].w}`, value: millions(song.capped), delta: latestDelta(series.current) },
      { label: 'Markets reporting', value: String(song.markets), sub: 'all reporting' },
      { label: 'Top market', value: '—', sub: 'Not in this prototype' },
      { label: 'Open conflicts', value: String(conflicts), sub: conflicts ? 'Raised 14 Oct' : 'Policy v3' },
    ],
    topMarkets: null,
    marketTable: null,
    history: null,
    rights: null,
  };
}

export function artistView(id: string): ArtistView {
  const artist = artistById(id);
  if (!artist) {
    return { kind: 'artist', found: false, full: false, title: 'Artist not found', meta: [], stats: [], trend: EMPTY_TREND, weekly: [], songCount: 0, topMarkets: null, songs: [], labels: null };
  }
  const detail = cast.artistPage[id as keyof typeof cast.artistPage];
  const series = detail ? seriesFor(`artist:${id}`) : scaledSeries('artist', artist.capped / 1e6, artist.delta);
  const meta = [artist.licensor, artist.label, artist.artistId].filter((m): m is string => Boolean(m)).map((label) => ({ label }));
  const base = { kind: 'artist' as const, found: true, title: artist.name, meta, photo: artistPhoto(id), songCount: artist.songs, trend: buildTrend(series), weekly: buildWeekly(series.current) };

  if (detail) {
    return {
      ...base,
      full: true,
      stats: detail.stats,
      topMarkets: detail.topMarkets.slice(0, 5).map(([code, value]) => ({ code: String(code), name: marketName(String(code)), value: Number(value) })),
      songs: detail.songs.map((s, i) => {
        const songId = songIdByTitle(s.title);
        return { title: s.title, isrc: s.isrc, id: songId, art: songArt(songId), seed: i, status: s.status, label: artist.label, markets: s.markets, capped: s.capped, delta: s.delta };
      }),
      labels: detail.labelsAndDistributors,
    };
  }

  // Closest data: the songs in the cast list that belong to this artist.
  const songs = cast.songs.filter((s) => s.artist === id);
  const top = songs[0];
  return {
    ...base,
    full: false,
    stats: [
      { label: `Capped streams · ${cast.weeks[0].w}`, value: millions(artist.capped), delta: artist.delta },
      { label: 'Songs in catalogue', value: String(artist.songs), sub: 'all active' },
      { label: 'Markets reporting', value: top ? String(top.markets) : '—', sub: top ? 'for the top song' : 'Not in this prototype' },
      { label: 'Top song', value: top?.title ?? '—', sub: top ? `${millions(top.capped)} capped streams` : 'Not in this prototype' },
    ],
    topMarkets: null,
    songs: songs.map((s) => ({ title: s.title, isrc: s.isrc, id: s.id, art: songArt(s.id), seed: s.art, status: s.status, label: artist.label, markets: s.markets, capped: s.capped, delta: artist.delta })),
    labels: null,
  };
}

export function countryView(rawCode: string): CountryView {
  const code = rawCode.toUpperCase();
  const market = marketByCode(code);
  if (!market) {
    return { kind: 'country', found: false, full: false, code, short: code, title: 'Country not found', meta: [], stats: [], trend: EMPTY_TREND, weekly: [], topArtists: null, topSongs: null, shareByLabel: null };
  }
  const detail = cast.countryPage[code as keyof typeof cast.countryPage];
  const series = detail ? seriesFor(`country:${code}`) : scaledSeries('country', market.capped / 1e6, market.delta);
  const base = { kind: 'country' as const, found: true, code, short: market.short, title: market.name, meta: [], trend: buildTrend(series), weekly: buildWeekly(series.current) };

  if (detail) {
    return {
      ...base,
      full: true,
      stats: detail.stats,
      topArtists: detail.topArtists.map(([name, value, delta], i) => {
        const artistId = artistIdByName(String(name));
        return { rank: i + 1, name: String(name), to: artistId ? `/artist/${artistId}` : undefined, image: artistPhoto(artistId), seed: i, value: String(value), delta: Number(delta) };
      }),
      topSongs: detail.topSongs.map(([title, artistName, capped, delta], i) => {
        const songId = songIdByTitle(String(title));
        return { rank: i + 1, name: String(title), sub: String(artistName), to: songId ? `/song/${songId}` : undefined, image: songArt(songId), seed: songById(songId ?? '')?.art ?? i, value: Number(capped).toLocaleString('en-GB'), delta: Number(delta) };
      }),
      shareByLabel: {
        badge: detail.shareByLabel.badge,
        note: detail.shareByLabel.note,
        rows: detail.shareByLabel.rows.map(([name, value, share]) => ({ name: String(name), value: String(value), share: Number(share) })),
      },
    };
  }

  return {
    ...base,
    full: false,
    stats: [
      { label: `Capped streams · ${cast.weeks[0].w}`, value: millions(market.capped), delta: market.delta },
      { label: 'Songs with streams', value: '—', sub: 'Not in this prototype' },
      { label: 'Top artist', value: '—', sub: 'Not in this prototype' },
      { label: 'Top song', value: '—', sub: 'Not in this prototype' },
    ],
    topArtists: null,
    topSongs: null,
    shareByLabel: null,
  };
}
