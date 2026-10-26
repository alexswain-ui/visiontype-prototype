import type { ReactNode } from 'react';
import { cx } from '../lib/cx';
import styles from './SectionCard.module.css';

export interface SectionCardProps {
  title: string;
  /** Muted text right after the title, e.g. "W42" or "42 markets · W42". */
  meta?: ReactNode;
  /** Right side of the header row (legend, badge, buttons). */
  aside?: ReactNode;
  /** Footer row, e.g. "Showing 10 of 42 markets · Show all". */
  footer?: ReactNode;
  /** Adds padding around the body (charts, timelines). Tables and lists run edge to edge. */
  padded?: boolean;
  className?: string;
  children: ReactNode;
}

/** Entity page card (Figma "Card / ..."): 56px header with title and muted meta, body, optional footer. */
export default function SectionCard({ title, meta, aside, footer, padded = false, className, children }: SectionCardProps) {
  return (
    <section className={cx(styles.card, className)} aria-label={title}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        {meta && <span className={styles.meta}>{meta}</span>}
        {aside && <div className={styles.aside}>{aside}</div>}
      </header>
      <div className={cx(styles.body, padded && styles.padded)}>{children}</div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </section>
  );
}
