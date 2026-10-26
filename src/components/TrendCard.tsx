import { useId } from 'react';
import { smoothPath, type Point } from '../lib/chartMath';
import { useElementWidth } from '../lib/useElementWidth';
import Delta from './Delta';
import styles from './TrendCard.module.css';

export interface TrendCardProps {
  /** e.g. "Streams · all markets". */
  label: string;
  /** Headline value, e.g. "18.4M". */
  value: string;
  /** Percent change vs last week. */
  delta: number;
  /** Oldest to newest. */
  series: number[];
  /** One per point, e.g. "W35". */
  labels: string[];
  /** Spoken summary of the chart. */
  description: string;
}

const HEIGHT = 70;
const PAD_TOP = 10;
const DOT = 4;

/** Small trend card in a split sheet (Figma "Trend card"): value and change, orange area line, week labels. */
export default function TrendCard({ label, value, delta, series, labels, description }: TrendCardProps) {
  const id = useId().replace(/:/g, '');
  const [ref, width] = useElementWidth<HTMLDivElement>(374);

  const lo = Math.min(...series);
  const hi = Math.max(...series);
  const span = hi - lo || 1;
  const plotWidth = Math.max(1, width - DOT);
  const points: Point[] = series.map((v, i) => ({
    x: (plotWidth * i) / Math.max(1, series.length - 1),
    // Lowest value sits 6px above the baseline, highest 10px below the top, as in Figma.
    y: PAD_TOP + (1 - (v - lo) / span) * (HEIGHT - PAD_TOP - 6),
  }));
  const line = smoothPath(points);
  const last = points[points.length - 1];
  const area = `${line} L${last.x},${HEIGHT} L0,${HEIGHT} Z`;

  return (
    <section className={styles.card} aria-label={label}>
      <header className={styles.head}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value}>{value}</span>
        <Delta value={delta} variant="small" />
      </header>
      <div ref={ref} className={styles.chart}>
        <svg width={width} height={HEIGHT} role="img" aria-label={description}>
          <defs>
            <linearGradient id={`trend-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" className={styles.stopTop} />
              <stop offset="100%" className={styles.stopBottom} />
            </linearGradient>
          </defs>
          {[0.5, HEIGHT / 2, HEIGHT - 0.5].map((y) => (
            <line key={y} x1={0} x2={width} y1={y} y2={y} className={styles.grid} />
          ))}
          <path d={area} fill={`url(#trend-${id})`} />
          <path d={line} className={styles.line} />
          <circle cx={last.x} cy={last.y} r={DOT} className={styles.dot} />
        </svg>
      </div>
      <div className={styles.labels} aria-hidden="true">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </section>
  );
}
