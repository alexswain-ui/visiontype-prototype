import type { ComponentPropsWithRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cx } from '../lib/cx';
import styles from './AskChip.module.css';

export interface AskChipProps extends ComponentPropsWithRef<'button'> {
  label: string;
  icon?: LucideIcon;
  /** suggestion = Ask home (13px, icon, 12px radius); followUp = under an answer (12px, muted, 14px radius). */
  variant?: 'suggestion' | 'followUp';
}

/** Outlined prompt chip on the Ask screens (Figma "Chip" in the Suggestions and Follow-ups rows). */
export default function AskChip({ label, icon: Icon, variant = 'suggestion', className, type = 'button', ...rest }: AskChipProps) {
  return (
    <button type={type} className={cx(styles.chip, styles[variant], className)} {...rest}>
      {Icon && <Icon size={16} aria-hidden="true" className={styles.icon} />}
      {label}
    </button>
  );
}
