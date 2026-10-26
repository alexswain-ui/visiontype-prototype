import styles from './ShareBar.module.css';

export interface ShareBarProps {
  /** 0-1 */
  value: number;
  /** Show the percentage to the right of the bar. */
  showLabel?: boolean;
  width?: number | string;
}

/** Thin horizontal bar for a share of a total (e.g. market share, DSP split). */
export default function ShareBar({ value, showLabel = false, width = 120 }: ShareBarProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <span className={styles.wrap}>
      <span className={styles.track} style={{ width }} role="img" aria-label={`${pct}%`}>
        <span className={styles.fill} style={{ width: `${pct}%` }} />
      </span>
      {showLabel && <span className={styles.label}>{pct}%</span>}
    </span>
  );
}
