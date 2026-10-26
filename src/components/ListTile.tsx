import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cx } from '../lib/cx';
import styles from './ListTile.module.css';

export interface ListTileProps {
  label: string;
  icon?: LucideIcon;
  /** Muted text on the right, e.g. a date. */
  meta?: string;
  /** Right-hand control instead of `meta`, e.g. a "View" CardLink. */
  trailing?: ReactNode;
  /** neutral = grey tile (Saved Searches, Reports); the others are tinted alert rows (Requires Attention). */
  tone?: 'neutral' | 'info' | 'warning' | 'destructive';
  /** Makes the whole tile a button. Leave out when `trailing` holds the control. */
  onClick?: () => void;
}

/** Rounded list row inside dashboard widgets (Figma 8px-radius rows in Saved Searches, Reports, Requires Attention). */
export default function ListTile({ label, icon: Icon, meta, trailing, tone = 'neutral', onClick }: ListTileProps) {
  const content = (
    <>
      {Icon && <Icon size={16} className={styles.icon} aria-hidden="true" />}
      <span className={styles.label}>{label}</span>
      {meta && <span className={styles.meta}>{meta}</span>}
    </>
  );
  if (onClick) {
    return (
      <button type="button" className={cx(styles.tile, styles[tone], styles.clickable)} onClick={onClick}>
        {content}
      </button>
    );
  }
  return (
    <div className={cx(styles.tile, styles[tone])}>
      {content}
      {trailing}
    </div>
  );
}
