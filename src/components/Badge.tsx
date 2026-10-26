import type { LucideIcon } from 'lucide-react';
import { cx } from '../lib/cx';
import styles from './Badge.module.css';

export type BadgeTone = 'neutral' | 'orange' | 'blue' | 'purple' | 'green' | 'amber' | 'red' | 'info';

export interface BadgeProps {
  /** Visible text. For icon-only badges this becomes the spoken label and hover title. */
  label: string;
  tone?: BadgeTone;
  icon?: LucideIcon;
  /** Small status dot before the text. */
  dot?: boolean;
  /** Square 8px-radius chip showing only the icon (table status: Conflict, Restated). */
  iconOnly?: boolean;
}

/** Status / tag chip (Figma "Badge"). Static: tinted fill, matching border, brighter text. */
export default function Badge({ label, tone = 'neutral', icon: Icon, dot = false, iconOnly = false }: BadgeProps) {
  if (iconOnly && Icon) {
    return (
      <span className={cx(styles.badge, styles[tone], styles.square)} role="img" aria-label={label} title={label}>
        <Icon size={14} aria-hidden="true" />
      </span>
    );
  }
  return (
    <span className={cx(styles.badge, styles[tone])}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {Icon && <Icon size={12} aria-hidden="true" />}
      {label}
    </span>
  );
}
