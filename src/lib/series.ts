import { cast } from './data';
import { entityBaseSeries, FULL_EXAMPLE, type EntityKind } from './entities';
import { ALL_TIME_FROM, LATEST, weekList, weekNumber, type WeekIdx, type WeekRange, weeksBetween, previousRange } from './dates';

/**
 * Deterministic weekly series for every entity (no Math.random).
 * Values are millions of capped streams. The 16 weeks W27-W42 come from cast.json (the 8 weeks before W35 are
 * its "previous" series), so the default view is unchanged. Earlier weeks are generated backwards from the
 * oldest known week: mild growth, +/-4% seasonality and small seeded noise, always positive.
 *
 * Entities without their own series use the full example of their kind (Saffron Ferry, Luna Sky, GB) scaled to
 * the entity's current value, as the entity pages already do.
 */

const WEEKLY_GROWTH = 0.006;

/** Small stable number from a string, 0..1. */
function seeded(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507);
  h ^= h >>> 13;
  return (h >>> 0) / 4294967296;
}

const parseKey = (key: string) => {
  const [kind, id] = key.split(':') as [EntityKind, string];
  return { kind, id };
};

/** The known weeks for an entity: [W27..W42] oldest first, or null when nothing is known. */
function knownWeeks(key: string, base?: { current: number[]; previous: number[] }) {
  const { kind, id } = parseKey(key);
  const series = base ?? entityBaseSeries(kind, id) ?? entityBaseSeries(kind, FULL_EXAMPLE[kind].id);
  return series ? [...series.previous, ...series.current] : null;
}

const cache = new Map<string, number[]>();

/** All weeks from the start of the all-time range to the latest week. Index 0 is ALL_TIME_FROM. */
function fullSeries(key: string, base?: { current: number[]; previous: number[] }) {
  const cacheKey = base ? `${key}|${base.current[base.current.length - 1]}` : key;
  const hit = cache.get(cacheKey);
  if (hit) return hit;

  const known = knownWeeks(key, base) ?? [1];
  const total = LATEST - ALL_TIME_FROM + 1;
  const out = new Array<number>(total);
  const firstKnownIdx = LATEST - (known.length - 1);
  const phase = seeded(`${key}:phase`) * Math.PI * 2;
  const season = (week: WeekIdx) => 1 + 0.04 * Math.sin((2 * Math.PI * weekNumber(week)) / 52 + phase);

  for (let week = ALL_TIME_FROM; week <= LATEST; week++) {
    const slot = week - ALL_TIME_FROM;
    if (week >= firstKnownIdx) {
      out[slot] = known[week - firstKnownIdx];
    } else {
      const anchor = known[0];
      const noise = 1 + (seeded(`${key}:${week}`) - 0.5) * 0.03;
      const value = anchor * (1 + WEEKLY_GROWTH) ** (week - firstKnownIdx) * (season(week) / season(firstKnownIdx)) * noise;
      out[slot] = +Math.max(value, anchor * 0.05).toFixed(3);
    }
  }
  cache.set(cacheKey, out);
  return out;
}

/** Weekly capped streams (millions), oldest first, for the weeks `fromWeek` to `toWeek` inclusive. Weeks outside the data are clamped. */
export function weeklySeries(entityKey: string, fromWeek: WeekIdx, toWeek: WeekIdx, base?: { current: number[]; previous: number[] }): number[] {
  const all = fullSeries(entityKey, base);
  return weekList(fromWeek, toWeek).map((week) => all[Math.min(all.length - 1, Math.max(0, week - ALL_TIME_FROM))]);
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
const round1 = (value: number) => Math.round(value * 10) / 10;

/** Total capped streams in the range, in millions. */
export const rangeTotal = (key: string, range: WeekRange) => sum(weeklySeries(key, range.from, range.to));

/** How much bigger (or smaller) the range is than the latest week: use it to scale any W42 number. */
export function rangeScale(key: string, range: WeekRange) {
  const latest = weeklySeries(key, LATEST, LATEST)[0];
  return latest ? rangeTotal(key, range) / latest : 1;
}

/**
 * Change in percent: the range total against the previous equal-length range, or for a single week the week
 * against the week before. NaN when there is no earlier data (all time); the Delta component shows a dash.
 */
export function rangeDelta(key: string, range: WeekRange) {
  const current = rangeTotal(key, range);
  const previous = previousRange(range);
  // The previous range may reach back before the data starts: compare weekly averages over the weeks that exist.
  const available = Math.min(weeksBetween(previous.from, previous.to), previous.to - ALL_TIME_FROM + 1);
  if (available <= 0) return NaN;
  const before = rangeTotal(key, { from: previous.to - available + 1, to: previous.to });
  const length = weeksBetween(range.from, range.to);
  return before ? round1(((current / length - before / available) / (before / available)) * 100) : NaN;
}

/** The weeks a chart or weekly table shows: the range itself, or the 8 weeks up to a single week for context. */
export function contextWeeks(range: WeekRange): WeekRange {
  return range.from === range.to ? { from: Math.max(ALL_TIME_FROM, range.to - 7), to: range.to } : range;
}

/** Last 7 weeks of the range (fewer if shorter), for trend bars. */
export const trendWeeks = (key: string, range: WeekRange) => weeklySeries(key, Math.max(range.from, range.to - 6), range.to);

export { weeksBetween };
export const castSeriesKeys = Object.keys(cast.series).filter((k) => k !== '_note');
