import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cx } from '../lib/cx';
import styles from './Card.module.css';

export interface CardProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  /** Shown in a 40px tile before the title. */
  icon?: LucideIcon;
  /** Buttons on the right of the header row. */
  actions?: ReactNode;
  /** No padding around the body (tables, lists that run edge to edge). */
  flush?: boolean;
  className?: string;
  children: ReactNode;
}

/** Card: 20px radius, 22px padding, card surface, 1px border. Optional header row. */
export default function Card({ title, subtitle, icon: Icon, actions, flush = false, className, children }: CardProps) {
  const hasHeader = title || actions;
  return (
    <section className={cx(styles.card, className)}>
      {hasHeader && (
        <header className={styles.header}>
          <div className={styles.heading}>
            {Icon && (
              <span className={styles.iconTile} aria-hidden="true">
                <Icon size={20} />
              </span>
            )}
            <div className={styles.titles}>
              {title && <h3 className={styles.title}>{title}</h3>}
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
          </div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}
      <div className={cx(styles.body, flush && styles.flush)}>{children}</div>
    </section>
  );
}
