import { cx } from '../lib/cx';
import styles from './LegendPill.module.css';

export interface LegendPillProps {
  label: string;
  /** 1-5 maps to chart-1 to chart-5. */
  series?: 1 | 2 | 3 | 4 | 5;
}

/** Chart legend pill (Figma "Legend pill"). Static. */
export default function LegendPill({ label, series = 1 }: LegendPillProps) {
  return (
    <span className={cx(styles.pill, styles[`s${series}`])}>
      <span className={styles.dot} aria-hidden="true" />
      {label}
    </span>
  );
}
