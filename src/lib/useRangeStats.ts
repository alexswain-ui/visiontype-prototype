import { useMemo } from 'react';
import { useDateRange } from './dateRange';
import { weekLabel, weekSpanLabel, type WeekRange } from './dates';
import { contextWeeks, rangeDelta, rangeScale, weeklySeries } from './series';

/** "Week 42" ... as a short name for the selected weeks: "W42", "W40 – W42" or "All time". */
export function useRangeName() {
  const { range, mode } = useDateRange();
  return mode === 'all' ? 'All time' : weekSpanLabel(range.from, range.to);
}

/**
 * Turns the latest-week (W42) numbers of one entity into numbers for the selected range.
 * `entity` is "song:saffron-ferry", "artist:luna-sky" or "country:GB". Rule: a value for the range is its W42
 * value x (the entity's weekly total over the range / its W42 week); the change is the range against the
 * previous equal-length range (a single week against the week before).
 */
export function useRangeStats(entity: string) {
  const { range } = useDateRange();
  return useMemo(() => {
    const latestOnly = range.from === 0 && range.to === 0;
    const scale = rangeScale(entity, range);
    const computed = rangeDelta(entity, range);
    return {
      scale,
      latestOnly,
      /** A W42 number for the selected range. */
      scaled: (value: number) => value * scale,
      /** The change in percent; for the latest week the entity's own stored change is kept. */
      delta: (stored?: number) => (latestOnly && stored !== undefined ? stored : computed),
    };
  }, [entity, range]);
}

/** Weekly capped streams (millions) for charts: the range itself, or the 8 weeks up to a single week. */
export function rangeTrend(entity: string, range: WeekRange, base?: { current: number[]; previous: number[] }) {
  const weeks = contextWeeks(range);
  const length = weeks.to - weeks.from + 1;
  return {
    from: weeks.from,
    to: weeks.to,
    values: weeklySeries(entity, weeks.from, weeks.to, base),
    labels: Array.from({ length }, (_, i) => weekLabel(weeks.from + i)),
  };
}

export const parseValue = (text: string) => (/M$/i.test(text) ? parseFloat(text) * 1e6 : parseFloat(text.replace(/,/g, '')));
