import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import TopBar from './TopBar';
import styles from './PageHeader.module.css';

export interface PageHeaderProps {
  title: string;
  icon?: LucideIcon;
  /** Supplementary line beneath the title. */
  subtitle?: ReactNode;
}

/** Page header (Figma "Frame 203"): orange icon + 32px title, supporting line, bell and avatar on the right. */
export default function PageHeader({ title, icon: Icon, subtitle }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.titles}>
        <div className={styles.titleRow}>
          {Icon && <Icon size={28} className={styles.icon} aria-hidden="true" />}
          <h1 className={styles.title}>{title}</h1>
        </div>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      <TopBar />
    </header>
  );
}
