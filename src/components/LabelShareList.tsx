import { cx } from '../lib/cx';
import styles from './LabelShareList.module.css';

export interface LabelShare {
  name: string;
  /** e.g. "127.8M" */
  value: string;
  /** 0-1 */
  share: number;
  /** The "Other labels" row: muted name and grey bar. */
  rest?: boolean;
}

/** Share by label (Figma "Card / Share by label"): name, long bar, percentage, capped streams. */
export default function LabelShareList({ items }: { items: LabelShare[] }) {
  const max = Math.max(...items.map((i) => i.share));
  return (
    <ul className={styles.list}>
      {items.map((item) => {
        const pct = Math.round(item.share * 100);
        return (
          <li key={item.name} className={cx(styles.row, item.rest && styles.rest)}>
            <span className={styles.name}>{item.name}</span>
            <span className={styles.track} aria-hidden="true">
              <span className={styles.fill} style={{ width: `${(item.share / max) * 80}%` }} />
            </span>
            <span className={styles.pct}>{pct}%</span>
            <span className={styles.value}>{item.value}</span>
          </li>
        );
      })}
    </ul>
  );
}
