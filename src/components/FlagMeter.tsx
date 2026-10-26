import { Flag } from 'lucide-react';
import { cx } from '../lib/cx';
import styles from './FlagMeter.module.css';

export interface FlagMeterProps {
  label: string;
  count: number;
  /** The largest count in the group: its bar is full width. */
  max: number;
  tone: 'warning' | 'destructive' | 'info';
}

/** One row of "Flags in This Release" (Figma 418:2812): flag icon, label, count, then a 4px bar. Static. */
export default function FlagMeter({ label, count, max, tone }: FlagMeterProps) {
  const percent = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className={cx(styles.meter, styles[tone])}>
      <p className={styles.row}>
        <Flag size={16} className={styles.icon} aria-hidden="true" />
        <span className={styles.label}>{label}</span>
        <span className={styles.count}>{count}</span>
      </p>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.bar} style={{ width: `${percent}%` }} />
      </span>
    </div>
  );
}
