import { formatNumber } from '../lib/data';
import { useRangeStats } from '../lib/useRangeStats';
import Delta from './Delta';

/** A latest-week number shown for the selected date range (see useRangeStats for the rule). */
export function RangeNumber({ base, entity }: { base: number; entity: string }) {
  const { scaled } = useRangeStats(entity);
  return <>{formatNumber(Math.round(scaled(base)))}</>;
}

/** The change for the selected date range. Shows the stored weekly change for the latest week. */
export function RangeDelta({ entity, base }: { entity: string; base?: number }) {
  const { delta } = useRangeStats(entity);
  return <Delta value={delta(base)} />;
}
