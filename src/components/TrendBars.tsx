import styles from './TrendBars.module.css';

export interface TrendBarsProps {
  direction: 'up' | 'down';
  /** 0-1: how steep the trend looks. */
  magnitude?: number;
  /** Changes the small wobble so neighbouring rows don't look identical. */
  seed?: number;
  /** Real weekly values (oldest first, up to 7). When given they draw the bars and set the colour. */
  values?: number[];
}

const BOX_W = 32;
const BOX_H = 16;
const BAR_W = 2;
const PITCH = 4;

/** Tiny deterministic random numbers (same seed, same bars). */
function random(seed: number) {
  let state = seed * 9301 + 49297;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}

/** Seven heights that grow (up) or shrink (down) left to right. */
export function trendHeights(direction: 'up' | 'down', magnitude = 0.7, seed = 1): number[] {
  const next = random(seed);
  const low = 1 + (1 - magnitude) * 7;
  const high = BOX_H - 1;
  const heights: number[] = [];
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const wobble = (next() - 0.5) * 2;
    heights.push(low + (high - low) * t ** 1.3 + wobble);
  }
  // Keep it steady: never go backwards.
  for (let i = 1; i < 7; i++) heights[i] = Math.max(heights[i], heights[i - 1]);
  const clamped = heights.map((h) => Math.round(Math.min(high, Math.max(1, h))));
  return direction === 'up' ? clamped : clamped.reverse();
}

/** One bar per value, scaled between the lowest and highest value of the series. */
function heightsFromValues(values: number[]) {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const span = hi - lo || 1;
  return values.map((v) => Math.round(2 + ((v - lo) / span) * (BOX_H - 3)));
}

/** 7-bar sparkline: 2px bars on a 4px pitch, bottom-aligned in a 32x16 box. */
export default function TrendBars({ direction: given, magnitude = 0.7, seed = 1, values }: TrendBarsProps) {
  const real = values && values.length > 0 ? values : null;
  const direction = real ? (real[real.length - 1] >= real[0] ? 'up' : 'down') : given;
  const heights = real ? heightsFromValues(real) : trendHeights(direction, magnitude, seed);
  return (
    <svg
      width={BOX_W}
      height={BOX_H}
      viewBox={`0 0 ${BOX_W} ${BOX_H}`}
      className={direction === 'up' ? styles.up : styles.down}
      role="img"
      aria-label={`Trend ${direction === 'up' ? 'rising' : 'falling'}`}
    >
      {heights.map((h, i) => (
        <rect key={i} x={PITCH * (i + 1) - BAR_W / 2} y={BOX_H - h} width={BAR_W} height={h} rx={BAR_W / 2} />
      ))}
    </svg>
  );
}
