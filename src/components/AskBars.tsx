import type { BenchBarRow } from '../lib/ask';
import { cx } from '../lib/cx';
import styles from './AskBars.module.css';

export interface AskBarsProps {
  title: string;
  /** "M" for millions, "%" for percent change. */
  unit: string;
  /** Label, value, highlighted. */
  rows: BenchBarRow[];
}

const format = (value: number, unit: string) => `${value < 0 ? '\u2212' : ''}${Math.abs(value)}${unit}`;

/**
 * Horizontal bars for an Ask answer: label, track, value. The highlighted row is orange, the others muted.
 * Rows with negative values grow left from a zero line.
 */
export default function AskBars({ title, unit, rows }: AskBarsProps) {
  const min = Math.min(0, ...rows.map((r) => r[1]));
  const max = Math.max(0, ...rows.map((r) => r[1]));
  const span = max - min || 1;
  return (
    <figure className={styles.chart}>
      <figcaption className={styles.title}>{title}</figcaption>
      <ul className={styles.rows}>
        {rows.map(([label, value, highlight]) => (
          <li key={label} className={styles.row}>
            <span className={cx(styles.label, highlight && styles.strong)}>{label}</span>
            <span className={styles.track} role="img" aria-label={`${label}: ${format(value, unit)}`}>
              <span
                className={cx(styles.bar, highlight && styles.highlight)}
                style={{ left: `${((Math.min(value, 0) - min) / span) * 100}%`, width: `${(Math.abs(value) / span) * 100}%` }}
              />
              {min < 0 && <span className={styles.zero} style={{ left: `${((0 - min) / span) * 100}%` }} aria-hidden="true" />}
            </span>
            <span className={cx(styles.value, highlight && styles.strong)}>{format(value, unit)}</span>
          </li>
        ))}
      </ul>
    </figure>
  );
}
