import Delta from './Delta';
import styles from './SheetStat.module.css';

export interface SheetStatProps {
  label: string;
  value: string;
  /** Percent change vs last week. */
  delta?: number;
  /** Muted line when there is no change, e.g. "all reporting". */
  sub?: string;
  /** Text after the change. Default "wk". */
  deltaSuffix?: string;
}

/** Compact KPI tile for split sheets (Figma "KPI"): 11px label, 18px value, 12px change. */
export default function SheetStat({ label, value, delta, sub, deltaSuffix = 'wk' }: SheetStatProps) {
  return (
    <div className={styles.tile}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      {delta !== undefined ? <Delta value={delta} variant="small" suffix={deltaSuffix} /> : sub && <p className={styles.sub}>{sub}</p>}
    </div>
  );
}
