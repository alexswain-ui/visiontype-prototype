import AskDelta from './AskDelta';
import AskLegend from './AskLegend';
import styles from './AskGroupedBars.module.css';

export interface AskGroupedBarsProps {
  /** One group per horizon (e.g. "Week on week"), one percent change per series. */
  groups: { label: string; values: { name: string; delta: number }[] }[];
}

/** Tallest bar, in px (Figma: +86% is 111.8px). */
const MAX_BAR = 112;

/**
 * Grouped bar chart of percent changes (Figma "Chart" in Ask · 1). Bars grow up from the baseline for gains
 * and down for falls; each bar carries its change above (or below) it. Series colours are chart-1 and chart-2.
 */
export default function AskGroupedBars({ groups }: AskGroupedBarsProps) {
  const names = groups[0]?.values.map((v) => v.name) ?? [];
  const maxAbs = Math.max(1, ...groups.flatMap((g) => g.values.map((v) => Math.abs(v.delta))));
  const height = (delta: number) => `${(Math.abs(delta) / maxAbs) * MAX_BAR}px`;
  const summary = groups
    .map((g) => `${g.label}: ${g.values.map((v) => `${v.name} ${v.delta < 0 ? 'down' : 'up'} ${Math.abs(v.delta)}%`).join(', ')}`)
    .join('. ');

  return (
    <div className={styles.chart}>
      <div className={styles.plot} role="img" aria-label={summary}>
        {groups.map((group) => (
          <div key={group.label} className={styles.group} aria-hidden="true">
            <div className={styles.up}>
              {group.values.map((v, i) => (
                <div key={v.name} className={styles.slot}>
                  {v.delta >= 0 && (
                    <>
                      <AskDelta value={v.delta} size="2xs" />
                      <span className={styles.bar} data-series={i + 1} style={{ height: height(v.delta) }} />
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className={styles.down}>
              {group.values.map((v, i) => (
                <div key={v.name} className={styles.slot}>
                  {v.delta < 0 && (
                    <>
                      <span className={`${styles.bar} ${styles.negative}`} data-series={i + 1} style={{ height: height(v.delta) }} />
                      <AskDelta value={v.delta} size="2xs" />
                    </>
                  )}
                </div>
              ))}
            </div>
            <p className={styles.label}>{group.label}</p>
          </div>
        ))}
      </div>
      <AskLegend items={names} />
    </div>
  );
}
