import AskLegend from './AskLegend';
import styles from './AskShareBars.module.css';

export interface AskShareBarsProps {
  /** Period labels, oldest first (e.g. "Q2 2026", "Q3 2026"). Shown newest first, as in Figma. */
  groups: string[];
  /** One value per group, in percent. The last series is drawn neutral ("All other distributors"). */
  series: { name: string; values: number[] }[];
}

/** Share bars (Figma "Share bars" in Ask · 3): one stacked 100% bar per period. */
export default function AskShareBars({ groups, series }: AskShareBarsProps) {
  const rows = groups.map((label, g) => ({ label, g })).reverse();
  return (
    <div className={styles.chart}>
      <div className={styles.rows}>
        {rows.map(({ label, g }) => {
          const total = series.reduce((sum, s) => sum + s.values[g], 0) || 1;
          const summary = series.map((s) => `${s.name} ${s.values[g]}%`).join(', ');
          return (
            <div key={label} className={styles.row}>
              <p className={styles.label}>{label}</p>
              <div className={styles.bar} role="img" aria-label={`${label}: ${summary}`}>
                {series.map((s, i) => (
                  <span
                    key={s.name}
                    className={styles.segment}
                    data-series={i === series.length - 1 ? 'rest' : i + 1}
                    style={{ flexGrow: s.values[g] / total }}
                    title={`${s.name} · ${s.values[g]}%`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <AskLegend items={series.map((s) => s.name)} />
    </div>
  );
}
