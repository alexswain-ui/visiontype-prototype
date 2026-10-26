import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import styles from './TopList.module.css';

export interface TopListItem {
  id: string;
  name: string;
  /** Artist photo or artwork, 24px. */
  media?: ReactNode;
  value: string;
}

export interface TopListProps {
  title: string;
  items: TopListItem[];
  /** e.g. "See all 10". */
  actionLabel?: string;
  onAction?: () => void;
}

/** Ranked list card in a split sheet (Figma "Top 10 artists", "Top 10 songs"): rank, picture, name, value. */
export default function TopList({ title, items, actionLabel, onAction }: TopListProps) {
  return (
    <section className={styles.card} aria-label={title}>
      <header className={styles.head}>
        <h3 className={styles.title}>{title}</h3>
        {actionLabel && (
          <button type="button" className={styles.action} onClick={onAction}>
            {actionLabel}
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        )}
      </header>
      <ol className={styles.list}>
        {items.map((item, index) => (
          <li key={item.id || item.name} className={styles.row}>
            <span className={styles.rank}>{index + 1}</span>
            {item.media}
            <span className={styles.name}>{item.name}</span>
            <span className={styles.value}>{item.value}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
