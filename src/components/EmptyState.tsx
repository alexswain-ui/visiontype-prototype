import type { ReactNode } from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  title: string;
  children?: ReactNode;
  icon?: LucideIcon;
}

/** Friendly empty state inside a card (proposed; not designed in Figma). */
export default function EmptyState({ title, children, icon: Icon = Inbox }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <Icon size={24} aria-hidden="true" className={styles.icon} />
      <p className={styles.title}>{title}</p>
      {children && <div className={styles.text}>{children}</div>}
    </div>
  );
}
