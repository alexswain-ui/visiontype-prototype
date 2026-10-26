import styles from './TrendBars.module.css';

export interface TrendBarsProps {
  direction: 'up' | 'down';
  /** 0-1: how steep the trend looks. */
  magnitude?: number;
  /** Changes the small wobble so neighbouring rows don't look identical. */
  seed?: number;
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

/** 7-bar sparkline: 2px bars on a 4px pitch, bottom-aligned in a 32x16 box. */
export default function TrendBars({ direction, magnitude = 0.7, seed = 1 }: TrendBarsProps) {
  const heights = trendHeights(direction, magnitude, seed);
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
