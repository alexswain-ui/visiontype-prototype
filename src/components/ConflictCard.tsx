import type { ReactNode } from 'react';
import { ArrowUpRight, TriangleAlert } from 'lucide-react';
import Badge from './Badge';
import styles from './ConflictCard.module.css';

export interface ConflictCardProps {
  title: string;
  /** Short state, e.g. "In Progress". */
  state?: string;
  /** Description. Use <strong> for party names. */
  children: ReactNode;
  meta?: string;
  linkLabel?: string;
  onOpen?: () => void;
}

/** Rights conflict card: amber tint, warning icon, title, state, description, meta and an "open" link. */
export default function ConflictCard({ title, state, children, meta, linkLabel = 'Open conflict', onOpen }: ConflictCardProps) {
  return (
    <article className={styles.card}>
      <header className={styles.head}>
        <TriangleAlert size={16} className={styles.icon} aria-hidden="true" />
        <h4 className={styles.title}>{title}</h4>
        {state && <Badge tone="amber" label={state} size="small" />}
      </header>
      <p className={styles.body}>{children}</p>
      <footer className={styles.meta}>
        {meta && <span>{meta}</span>}
        <button type="button" className={styles.link} onClick={onOpen}>
          {linkLabel}
          <ArrowUpRight size={12} aria-hidden="true" />
        </button>
      </footer>
    </article>
  );
}
