import type { ReactNode } from 'react';
import styles from './SectionLabel.module.css';

export interface SectionLabelProps {
  label: string;
  /** Small amber count after the label, e.g. open rights conflicts. */
  count?: number;
  /** Muted text on the right, e.g. "Week 42". */
  meta?: ReactNode;
}

/** Small heading inside a split sheet (Figma "Section label"): 12px label, optional count, muted meta on the right. */
export default function SectionLabel({ label, count, meta }: SectionLabelProps) {
  return (
    <div className={styles.row}>
      <h3 className={styles.label}>{label}</h3>
      {count !== undefined && <span className={styles.count}>{count}</span>}
      {meta && <span className={styles.meta}>{meta}</span>}
    </div>
  );
}
