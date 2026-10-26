import styles from './AskLegend.module.css';

export interface AskLegendProps {
  /** Series names in chart order. Colours follow chart-1, chart-2, then a neutral "everything else". */
  items: string[];
}

/** Plain dot legend under Ask charts (Figma "Legend": 8px dot, 11px muted label). */
export default function AskLegend({ items }: AskLegendProps) {
  return (
    <ul className={styles.legend}>
      {items.map((item, i) => (
        <li key={item} className={styles.item}>
          <span className={styles.dot} data-series={i + 1} aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}
