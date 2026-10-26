import { cx } from '../lib/cx';
import styles from './Timeline.module.css';

export interface TimelineItem {
  title: string;
  meta?: string;
  detail?: string;
  /** Orange dot for the current / most recent steps. */
  active?: boolean;
}

/** Vertical timeline: rail with dots, then title, meta and detail lines (Figma sheet "Timeline"). */
export default function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className={styles.list}>
      {items.map((item, index) => (
        <li key={`${item.title}-${index}`} className={styles.item}>
          <span className={styles.rail} aria-hidden="true">
            <span className={cx(styles.dot, item.active && styles.active)} />
            {index < items.length - 1 && <span className={styles.line} />}
          </span>
          <div className={cx(styles.text, index < items.length - 1 && styles.spaced)}>
            <p className={styles.title}>{item.title}</p>
            {item.meta && <p className={styles.meta}>{item.meta}</p>}
            {item.detail && <p className={styles.detail}>{item.detail}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
