import { ArrowDown, ArrowUp } from 'lucide-react';
import { cx } from '../lib/cx';
import styles from './Delta.module.css';

export interface DeltaProps {
  /** Percent change. The sign sets the direction; it is never printed. */
  value: number;
  /** Muted text after the arrow, e.g. "vs last week" on stat tiles. */
  suffix?: string;
  /** inline = 14px in tables and tiles; pill = 16px tinted box (chart card header). */
  variant?: 'inline' | 'pill';
}

/** Change indicator: value then arrow. Up is green, down is red. No leading + or minus sign. */
export default function Delta({ value, suffix, variant = 'inline' }: DeltaProps) {
  const up = value >= 0;
  const Arrow = up ? ArrowUp : ArrowDown;
  const text = `${Math.abs(value)}%`;
  return (
    <span className={styles.wrap}>
      <span
        className={cx(styles.delta, styles[variant], up ? styles.up : styles.down)}
        aria-label={`${up ? 'Up' : 'Down'} ${text}`}
      >
        <span aria-hidden="true">{text}</span>
        <Arrow size={variant === 'pill' ? 16 : 12} aria-hidden="true" />
      </span>
      {suffix && <span className={styles.suffix}>{suffix}</span>}
    </span>
  );
}
