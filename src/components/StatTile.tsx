import type { ReactNode } from 'react';
import { cx } from '../lib/cx';
import Delta from './Delta';
import styles from './StatTile.module.css';

export interface StatTileProps {
  label: string;
  value: ReactNode;
  /** Percent change vs last week. */
  delta?: number;
  /** Muted line under the value when there is no delta, e.g. "all reporting". */
  sub?: string;
  /** hero = solid orange, for the single most important number on a page. */
  variant?: 'standard' | 'hero';
  /** Smaller 24px value, for pages whose design uses it (Connections). */
  compact?: boolean;
}

/** Stat tile (Figma "Stat card"): label, big value, then change or a short sub line. */
export default function StatTile({ label, value, delta, sub, variant = 'standard', compact = false }: StatTileProps) {
  return (
    <div className={cx(styles.tile, styles[variant])}>
      <p className={styles.label}>{label}</p>
      <p className={cx(styles.value, compact && styles.compact)}>{value}</p>
      {delta !== undefined && variant === 'standard' && <Delta value={delta} suffix="vs last week" />}
      {sub && <p className={styles.sub}>{sub}</p>}
    </div>
  );
}
