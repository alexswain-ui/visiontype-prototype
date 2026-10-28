import { cast } from './data';
import { millions, type EntityView, type MarketRow, type TrendList, type WeekRow } from './entities';
import { ALL_TIME_FROM, LATEST, publishedLabel, weekLabel, weekList, weekSpanLabel, type WeekIdx, type WeekRange } from './dates';
import { contextWeeks, rangeDelta, rangeScale, rangeTotal, weeklySeries } from './series';

/**
 * Re-computes an entity page's numbers for the selected weeks. The page data is built for the latest week (W42);
 * this applies the rules:
 *  - a value for the range = its W42 value x (the entity's weekly total over the range / its W42 week)
 *  - the change = the range total against the previous equal-length range (a single week against the week before)
 *  - charts plot one point per week (a single week shows the 8 weeks up to it)
 *  - trend bars = the last 7 weeks of the range (fewer if the range is shorter)
 * For the latest week alone nothing changes, so the default page is exactly as designed.
 */
export interface RangeInput {
  range: WeekRange;
  compare: boolean;
}

const round1 = (value: number) => Math.round(value * 10) / 10;
const seeded = (text: string) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  h ^= h >>> 15;
  return ((h >>> 0) % 10000) / 10000;
};

/** Parses "8.41M", "412.3M" or "5,840,120" into a number of streams. */
const parseValue = (text: string) => (/M$/i.test(text) ? parseFloat(text) * 1e6 : parseFloat(text.replace(/,/g, '')));

export function titleFor(range: WeekRange, mode: 'week' | 'range' | 'all') {
  if (mode === 'week') return 'last 8 weeks';
  if (mode === 'all') return 'all time';
  return weekSpanLabel(range.from, range.to);
}

/** Week rows for the weekly trend table, newest first. */
function weeklyRows(key: string, weeks: WeekRange, base: { current: number[]; previous: number[] }): WeekRow[] {
  const before = weeklySeries(key, weeks.from - 1, weeks.to, base);
  return weekList(weeks.from, weeks.to)
    .map((week, i): WeekRow => {
      const value = before[i + 1];
      const last = before[i];
      const known = week > LATEST - cast.weeks.length ? cast.weeks[-week] : undefined;
      return {
        week: weekLabel(week),
        published: known ? known.published : publishedLabel(week),
        reported: known ? known.reported : cast.week.dspsReported.total,
        total: cast.week.dspsReported.total,
        restated: Boolean(known?.restated),
        note: known?.restated && known.note ? known.note.replace('DSP redelivered · ', 'redelivered ') : undefined,
        delta: week === ALL_TIME_FROM ? null : round1(((value - last) / last) * 100),
        capped: Math.round(value * 1e6),
      };
    })
    .reverse();
}

export interface EntityRef {
  kind: 'song' | 'artist' | 'country';
  id: string;
}

/** The range-aware version of an entity view. `ref` names the entity whose weekly series drives the numbers. */
export function rangedView<V extends EntityView>(view: V, ref: EntityRef, input: RangeInput): V {
  if (!view.found) return view;
  const { range, compare } = input;
  const key = `${ref.kind}:${ref.kind === 'country' ? ref.id.toUpperCase() : ref.id}`;
  const latestOnly = range.from === LATEST && range.to === LATEST;
  const mode = range.from === range.to ? 'week' : range.from === ALL_TIME_FROM && range.to === LATEST ? 'all' : 'range';
  const base = { current: view.trend.current, previous: view.trend.previous };

  const scale = rangeScale(key, range);
  const total = rangeTotal(key, range);
  const computed = rangeDelta(key, range);
  const storedHeader = view.stats[0]?.delta;
  /** A row's change: the entity's change for the range, shifted by how far the row's own weekly change sat from the entity's. */
  const rowDelta = (stored: number) => (latestOnly ? stored : round1(computed + (stored - (storedHeader ?? stored))));
  const headerName = mode === 'all' ? 'All time' : weekSpanLabel(range.from, range.to);

  // Trend chart: one point per week of the range (a single week: the 8 weeks up to it), previous period dashed.
  const weeks = contextWeeks(range);
  const length = weeks.to - weeks.from + 1;
  const current = weeklySeries(key, weeks.from, weeks.to, base);
  const previous = compare ? weeklySeries(key, weeks.from - length, weeks.to - length, base) : [];
  const labels = weekList(weeks.from, weeks.to).map(weekLabel);

  // Trend bars: the last 7 weeks of the range (fewer when shorter); a single week uses the 7 weeks up to it.
  const barFrom: WeekIdx = range.from === range.to ? range.to - 6 : Math.max(range.from, range.to - 6);
  const barValues = weeklySeries(key, barFrom, range.to, base);
  const bars = (seed: string) => barValues.map((v, i) => v * (1 + (seeded(`${seed}:${i}`) - 0.5) * 0.05));

  const scaleText = (text: string) => text.replace(/([\d.]+)M capped streams/, (_, n) => `${millions(parseFloat(n) * 1e6 * scale)} capped streams`);

  const stats = view.stats.map((stat, i) => {
    if (latestOnly) return stat;
    if (i === 0) {
      return { ...stat, label: `Capped streams · ${headerName}`, value: millions(total * 1e6), delta: computed, deltaSuffix: Number.isFinite(computed) ? (range.from === range.to ? 'vs last week' : 'vs previous period') : 'no earlier data' };
    }
    return stat.sub ? { ...stat, sub: scaleText(stat.sub) } : stat;
  });

  const trend = {
    current,
    previous,
    labels,
    title: `Capped streams · ${titleFor(range, mode)}`,
    previousName: range.from === range.to ? 'Previous 8 weeks' : `Previous ${length} weeks`,
    compare,
  };
  const weekly = weeklyRows(key, weeks, base);

  const next: EntityView = { ...view, stats, trend, weekly };
  if (next.kind === 'song') {
    next.topMarkets = scaleMarkets(next.topMarkets, scale, latestOnly);
    next.marketTable = next.marketTable && next.marketTable.map((m): MarketRow => ({ ...m, capped: Math.round(m.capped * scale), delta: rowDelta(m.delta), bars: bars(m.code) }));
  } else if (next.kind === 'artist') {
    next.topMarkets = scaleMarkets(next.topMarkets, scale, latestOnly);
    next.songs = next.songs.map((s) => ({ ...s, capped: Math.round(s.capped * scale), delta: rowDelta(s.delta), bars: bars(s.isrc) }));
    if (next.labels && !latestOnly) next.labels = next.labels.map((l) => ({ ...l, capped: `${((parseValue(l.capped) * scale) / 1e6).toFixed(1)}M` }));
  } else if (!latestOnly) {
    next.topArtists = next.topArtists && next.topArtists.map((a) => ({ ...a, value: millions(parseValue(a.value) * scale), delta: rowDelta(a.delta) }));
    next.topSongs = next.topSongs && next.topSongs.map((s) => ({ ...s, value: Math.round(parseValue(s.value) * scale).toLocaleString('en-GB'), delta: rowDelta(s.delta) }));
    if (next.shareByLabel) next.shareByLabel = { ...next.shareByLabel, rows: next.shareByLabel.rows.map((r) => ({ ...r, value: millions(parseValue(r.value) * scale) })) };
  }
  return next as V;
}

const scaleMarkets = (items: TrendList[] | null, scale: number, latestOnly: boolean) =>
  items && (latestOnly ? items : items.map((m) => ({ ...m, value: m.value * scale })));

