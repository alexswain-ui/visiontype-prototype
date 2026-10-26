import extra from '../data/data-page.json';
import { artistById, cast, songById, type Artist, type Song } from './data';

/**
 * Rows, filters, search and sheet content for the Data page (/data).
 * ALL DATA IS FICTIONAL. The 10 canonical rows in cast.json come first, exactly as in Figma; the other
 * song × market rows are derived from each song's capped streams so that totals stay plausible.
 */

export type DataTab = 'canonical' | 'songs' | 'artists' | 'countries';
export type FilterKey = 'markets' | 'artists' | 'songs' | 'labels' | 'distributors' | 'licensors';
/** Selected values per filter. An empty list means "no filter". */
export type Filters = Record<FilterKey, string[]>;
export type Status = 'conflict' | 'restated' | null;

export interface MarketInfo {
  code: string;
  iso: string;
  name: string;
  short: string;
  capped?: number;
  delta?: number;
  share?: number;
}

export const MARKETS: MarketInfo[] = [...cast.markets, ...extra.extraMarkets];
export const marketInfo = (code: string) => MARKETS.find((m) => m.iso === code.toUpperCase());
/** Label used in tables and chips: "UK" for GB, otherwise the ISO code. */
export const marketLabel = (code: string) => (code === 'GB' ? 'UK' : code);

export const DATE_RANGE = extra.dateRange;
export const EXPORT_OPTIONS = extra.exportOptions;
export const MORE_OPTIONS = extra.moreOptions;
export const WEEK_LABELS = ['W35', 'W36', 'W37', 'W38', 'W39', 'W40', 'W41', 'W42'];

export const EMPTY_FILTERS: Filters = { markets: [], artists: [], songs: [], labels: [], distributors: [], licensors: [] };
export const DEFAULT_FILTERS: Filters = { ...EMPTY_FILTERS, markets: extra.defaultMarkets };

/* ---------- Formatting ---------- */

/** "6,012,440" */
export const formatNumber = (value: number) => value.toLocaleString('en-GB');

/** "14.82M", "412.3M", "1.20bn" */
export function formatCompact(value: number, decimals = 2) {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}bn`;
  return `${(value / 1e6).toFixed(decimals)}M`;
}

/* ---------- Derived numbers ---------- */

/** Small stable number from a string, so derived figures never change between visits. */
function hash(text: string) {
  let h = 0;
  for (const char of text) h = (h * 31 + char.charCodeAt(0)) % 9973;
  return h;
}

/** Share of a song's capped streams per market, taken from Saffron Ferry's market table. */
const MARKET_WEIGHT: Record<string, number> = { IT: 0.012 };
for (const row of cast.songPage['saffron-ferry'].marketTable) MARKET_WEIGHT[row.market] = row.share;

const MARKET_ORDER = [...MARKETS].sort((a, b) => (MARKET_WEIGHT[b.iso] ?? 0) - (MARKET_WEIGHT[a.iso] ?? 0)).map((m) => m.iso);

const originalRow = (songId: string, market: string) => cast.canonicalRows.find((r) => r.song === songId && r.market === market);

function songMarketCapped(song: Song, market: string) {
  const original = originalRow(song.id, market);
  if (original) return original.capped;
  const jitter = 0.85 + (hash(song.id + market) % 30) / 100;
  return Math.round(song.capped * (MARKET_WEIGHT[market] ?? 0.01) * jitter);
}

/* ---------- Rows ---------- */

interface Rights {
  licensor: string;
  label: string;
  distributor: string;
}

/** Licensor, label and distributor for a song, from its canonical row. */
function rightsFor(songId: string): Rights {
  const row = cast.canonicalRows.find((r) => r.song === songId);
  return { licensor: row?.licensor ?? '', label: row?.label ?? '', distributor: row?.distributor ?? '' };
}

/** What a row can be filtered on. Leave a key out when the filter does not apply to that tab. */
type FilterValues = Partial<Record<FilterKey, string[]>>;

interface BaseRow {
  id: string;
  filterValues: FilterValues;
  searchText: string;
}

export interface CanonicalRow extends BaseRow, Rights {
  date: string;
  song: Song;
  artist: Artist;
  market: string;
  capped: number;
  status: Status;
}

export interface SongRow extends BaseRow, Rights {
  song: Song;
  artist: Artist;
}

export interface ArtistRow extends BaseRow, Rights {
  artist: Artist;
  songIds: string[];
}

export interface CountryRow extends BaseRow {
  market: MarketInfo & { capped: number; delta: number; share: number };
}

const text = (...parts: (string | number | undefined)[]) => parts.filter(Boolean).join(' ').toLowerCase();

function canonicalRow(id: string, song: Song, market: string, rights: Rights, capped: number, status: Status, date: string): CanonicalRow {
  const artist = artistById(song.artist)!;
  return {
    id,
    date,
    song,
    artist,
    market,
    capped,
    status,
    ...rights,
    filterValues: {
      markets: [market],
      artists: [artist.id],
      songs: [song.id],
      labels: [rights.label],
      distributors: [rights.distributor],
      licensors: [rights.licensor],
    },
    searchText: text(song.title, song.isrc, artist.name, rights.licensor, rights.label, rights.distributor, market, marketLabel(market), marketInfo(market)?.name),
  };
}

export const CANONICAL_ROWS: CanonicalRow[] = (() => {
  const rows = cast.canonicalRows.map((r) =>
    canonicalRow(r.id, songById(r.song)!, r.market, rightsFor(r.song), r.capped, r.status as Status, r.date),
  );
  for (const song of cast.songs) {
    const rights = rightsFor(song.id);
    for (const market of MARKET_ORDER) {
      if (originalRow(song.id, market)) continue;
      rows.push(canonicalRow(`${song.id}-${market.toLowerCase()}`, song, market, rights, songMarketCapped(song, market), null, '14 Oct'));
    }
  }
  return rows;
})();

export const SONG_ROWS: SongRow[] = cast.songs.map((song) => {
  const artist = artistById(song.artist)!;
  const rights = rightsFor(song.id);
  return {
    id: song.id,
    song,
    artist,
    ...rights,
    filterValues: {
      artists: [artist.id],
      songs: [song.id],
      labels: [rights.label],
      distributors: [rights.distributor],
      licensors: [rights.licensor],
    },
    searchText: text(song.title, song.isrc, artist.name, rights.licensor, rights.label, rights.distributor),
  };
});

export const ARTIST_ROWS: ArtistRow[] = cast.artists.map((artist) => {
  const songIds = cast.songs.filter((s) => s.artist === artist.id).map((s) => s.id);
  const rights = rightsFor(songIds[0] ?? '');
  const licensor = (artist as { licensor?: string }).licensor ?? rights.licensor;
  return {
    id: artist.id,
    artist,
    songIds,
    licensor,
    label: artist.label,
    distributor: rights.distributor,
    filterValues: {
      artists: [artist.id],
      songs: songIds,
      labels: [artist.label],
      distributors: [rights.distributor],
      licensors: [licensor],
    },
    searchText: text(artist.name, artist.artistId, artist.label, licensor, rights.distributor),
  };
});

export const COUNTRY_ROWS: CountryRow[] = cast.markets.map((market) => ({
  id: market.iso.toLowerCase(),
  market,
  filterValues: { markets: [market.iso] },
  searchText: text(market.name, market.iso, market.short, marketLabel(market.iso)),
}));

export const ROWS_BY_TAB = { canonical: CANONICAL_ROWS, songs: SONG_ROWS, artists: ARTIST_ROWS, countries: COUNTRY_ROWS };

/* ---------- Filtering and search ---------- */

/** Keeps rows that match every active filter (filters that do not apply to the row are skipped) and the search text. */
export function applyFilters<Row extends BaseRow>(rows: Row[], filters: Filters, query: string): Row[] {
  const q = query.trim().toLowerCase();
  return rows.filter((row) => {
    for (const key of Object.keys(filters) as FilterKey[]) {
      const selected = filters[key];
      const values = row.filterValues[key];
      if (selected.length === 0 || !values) continue;
      if (!values.some((v) => selected.includes(v))) return false;
    }
    return !q || row.searchText.includes(q);
  });
}

export interface FilterOption {
  value: string;
  label: string;
  /** Muted text after the label, e.g. the market code. */
  sub?: string;
  /** Short name for the chip, e.g. "UK". */
  short: string;
}

const named = (names: string[]): FilterOption[] => [...new Set(names)].sort().map((n) => ({ value: n, label: n, short: n }));

export const FILTER_GROUPS: { key: FilterKey; title: string; chip: string; options: FilterOption[] }[] = [
  {
    key: 'markets',
    title: 'Markets',
    chip: 'Market',
    options: MARKETS.map((m) => ({ value: m.iso, label: m.name, sub: marketLabel(m.iso), short: marketLabel(m.iso) })).sort((a, b) =>
      a.label.localeCompare(b.label),
    ),
  },
  { key: 'artists', title: 'Artists', chip: 'Artist', options: cast.artists.map((a) => ({ value: a.id, label: a.name, short: a.name })) },
  { key: 'songs', title: 'Songs', chip: 'Song', options: cast.songs.map((s) => ({ value: s.id, label: s.title, sub: s.isrc, short: s.title })) },
  { key: 'labels', title: 'Label', chip: 'Label', options: named(cast.canonicalRows.map((r) => r.label)) },
  { key: 'distributors', title: 'Distributors', chip: 'Distributor', options: named(cast.distributors) },
  { key: 'licensors', title: 'Licensor', chip: 'Licensor', options: named(cast.licensors) },
];

/** "Market: UK, FR, DE +5" */
export function chipLabel(key: FilterKey, values: string[]) {
  const group = FILTER_GROUPS.find((g) => g.key === key)!;
  const order = key === 'markets' ? values : [...values].sort();
  const names = order.map((v) => group.options.find((o) => o.value === v)?.short ?? v);
  return `${group.chip}: ${names.slice(0, 3).join(', ')}${names.length > 3 ? ` +${names.length - 3}` : ''}`;
}

/* ---------- Sheet content ---------- */

export function canonicalDetail(row: CanonicalRow) {
  const figma = (cast.canonicalDetail as Record<string, (typeof cast.canonicalDetail)['r2']>)[row.id];
  const conflict = (extra.conflicts as Record<string, (typeof extra.conflicts)['r2']>)[row.id];
  const timeline = figma
    ? figma.timeline.map((t) => ({ title: t.title, meta: t.meta, detail: t.lines[0] }))
    : [
        row.status === 'restated'
          ? { title: 'v4 · Restated', meta: 'Mon 12 Oct · DSP redelivery', detail: `${formatNumber(row.capped)} capped streams · Policy v3` }
          : { title: 'v3 · Published', meta: 'Fri 16 Oct · Week 42', detail: `${formatNumber(row.capped)} capped streams · Policy v3` },
        { title: 'DSP submissions', meta: 'Spotify · 15 Oct   YouTube · 13 Oct', detail: 'Same title and ISRC across all DSPs' },
        { title: 'First ingested · v1', meta: '09 Oct · initial delivery', detail: `${formatNumber(Math.round(row.capped * 0.96))} capped streams` },
      ];
  const fallbackConflict =
    row.status === 'conflict'
      ? {
          title: 'Licensor Challenge',
          state: 'Awaiting review',
          parts: [{ strong: row.licensor }, ` are named as licensor for ${row.song.title} in ${marketInfo(row.market)?.name}, but a second claim has been raised.`],
          meta: 'Raised 14 Oct',
        }
      : null;
  return { conflict: conflict ?? fallbackConflict, timeline: timeline.map((t, i) => ({ ...t, active: i < 2 })) };
}

export function songSheet(song: Song) {
  const kpi = (extra.songKpis as Record<string, (typeof extra.songKpis)['saffron-ferry']>)[song.id];
  const figma = (cast.songPage as Record<string, (typeof cast.songPage)['saffron-ferry']>)[song.id];
  const markets = figma
    ? figma.marketTable.map((m) => ({ market: m.market, streams: m.streams, capped: m.capped }))
    : MARKET_ORDER.map((market) => {
        const capped = songMarketCapped(song, market);
        return { market, capped, streams: Math.round(capped * (1.02 + (hash(market + song.id) % 5) / 100)) };
      }).sort((a, b) => b.streams - a.streams);
  return {
    kpis: [
      { label: 'Total streams', value: formatCompact(song.capped), delta: kpi.totalDelta },
      { label: 'Markets', value: String(song.markets), sub: 'all reporting' },
      { label: 'Capped streams', value: formatCompact(kpi.capped), delta: kpi.cappedDelta },
    ],
    markets: markets.slice(0, 7),
    moreMarkets: song.markets - 7,
  };
}

const scaleSeries = (series: number[], factor: number) => series.map((v) => +(v * factor).toFixed(2));

export function artistSheet(artist: Artist) {
  const base = cast.series['artist:luna-sky'];
  const figma = (cast.artistPage as Record<string, (typeof cast.artistPage)['luna-sky']>)[artist.id];
  const songs = figma
    ? figma.songs.map((s, i) => ({ id: songByTitle(s.title)?.id ?? `${artist.id}-${i}`, title: s.title, capped: s.capped }))
    : cast.songs.filter((s) => s.artist === artist.id).map((s) => ({ id: s.id, title: s.title, capped: s.capped }));
  const shown = songs.sort((a, b) => b.capped - a.capped).slice(0, 5);
  return {
    trend: artist.id === 'luna-sky' ? base.current : scaleSeries(base.current, artist.capped / 18412330),
    songs: shown,
    moreSongs: Math.max(0, artist.songs - shown.length),
  };
}

const songByTitle = (title: string) => cast.songs.find((s) => s.title === title);
const artistByName = (name: string) => cast.artists.find((a) => a.name === name);

export function countrySheet(market: CountryRow['market']) {
  const base = cast.series['country:GB'];
  const figma = (cast.countryPage as Record<string, (typeof cast.countryPage)['GB']>)[market.iso];
  const weight = MARKET_WEIGHT[market.iso] ?? 0.01;
  const artists = figma
    ? figma.topArtists.map(([name, value]) => ({ id: artistByName(name as string)?.id ?? '', name: name as string, value: value as string }))
    : [...cast.artists]
        .map((a) => ({ id: a.id, name: a.name, capped: Math.round(a.capped * weight * (0.85 + (hash(a.id + market.iso) % 30) / 100)) }))
        .sort((a, b) => b.capped - a.capped)
        .map((a) => ({ id: a.id, name: a.name, value: formatCompact(a.capped) }));
  const songs = figma
    ? figma.topSongs.map(([title, , capped]) => ({ id: songByTitle(title as string)?.id ?? '', title: title as string, value: formatNumber(capped as number) }))
    : [...cast.songs]
        .map((s) => ({ id: s.id, title: s.title, capped: songMarketCapped(s, market.iso) }))
        .sort((a, b) => b.capped - a.capped)
        .map((s) => ({ id: s.id, title: s.title, value: formatNumber(s.capped) }));
  return {
    trend: market.iso === 'GB' ? base.current : scaleSeries(base.current, market.capped / 412330120),
    artists: artists.slice(0, 3),
    songs: songs.slice(0, 3),
  };
}

/** Entity page for a selected row ("Open song page", the expand button). */
export function entityPath(tab: DataTab, row: CanonicalRow | SongRow | ArtistRow | CountryRow) {
  if (tab === 'artists') return `/artist/${(row as ArtistRow).artist.id}`;
  if (tab === 'countries') return `/country/${(row as CountryRow).market.iso.toLowerCase()}`;
  return `/song/${(row as SongRow).song.id}`;
}
