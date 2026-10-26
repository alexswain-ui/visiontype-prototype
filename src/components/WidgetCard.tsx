import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cx } from '../lib/cx';
import styles from './WidgetCard.module.css';

export interface WidgetCardProps {
  title: string;
  subtitle?: ReactNode;
  icon?: LucideIcon;
  /**
   * tile = 40px icon tile and 24px side padding (big chart and table widgets).
   * compact = plain 20px icon and 16px padding (list widgets).
   */
  variant?: 'tile' | 'compact';
  /** Right side of the header: a CardLink or a select button. */
  action?: ReactNode;
  /** Row under the body, e.g. "+160 more" and "See All". */
  footer?: ReactNode;
  /** No padding around the body (tables). */
  flush?: boolean;
  className?: string;
  children: ReactNode;
}

/** Dashboard widget (Figma dashboard cards): header with icon, title and action, then content. Static container. */
export default function WidgetCard({
  title,
  subtitle,
  icon: Icon,
  variant = 'compact',
  action,
  footer,
  flush = false,
  className,
  children,
}: WidgetCardProps) {
  return (
    <section className={cx(styles.card, styles[variant], className)} aria-label={title}>
      <header className={styles.header}>
        <div className={styles.heading}>
          {Icon &&
            (variant === 'tile' ? (
              <span className={styles.iconTile} aria-hidden="true">
                <Icon size={20} />
              </span>
            ) : (
              <Icon size={20} className={styles.icon} aria-hidden="true" />
            ))}
          <div className={styles.titles}>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        </div>
        {action && (
          <div className={styles.action} data-widget-action>
            {action}
          </div>
        )}
      </header>
      <div className={cx(styles.body, flush && styles.flush)}>{children}</div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </section>
  );
}
