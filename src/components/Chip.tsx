import { LockKeyhole, X } from 'lucide-react';
import { cx } from '../lib/cx';
import type { DemoState } from '../lib/demoState';
import styles from './Chip.module.css';

export interface ChipProps {
  label: string;
  tone?: 'orange' | 'neutral';
  /** Shows the x button. Called when it is pressed. */
  onRemove?: () => void;
  /** Access-limit chip: lock icon, cannot be removed, no hover. */
  locked?: boolean;
  /** Gallery only: 'hover' or 'focus' on the remove button. */
  demoState?: DemoState;
}

/** Filter chip (Figma "Chip"). Removable filters are orange; the locked access chip is neutral. */
export default function Chip({ label, tone = 'orange', onRemove, locked = false, demoState }: ChipProps) {
  const removable = Boolean(onRemove) && !locked;
  return (
    <span
      className={cx(styles.chip, styles[locked ? 'neutral' : tone], removable && styles.removable)}
      title={locked ? 'Set by your access level' : undefined}
    >
      <span className={styles.label}>{label}</span>
      {locked && <LockKeyhole size={12} aria-label="Locked" className={styles.lock} />}
      {removable && (
        <button
          type="button"
          className={styles.remove}
          aria-label={`Remove ${label}`}
          onClick={onRemove}
          data-demo={demoState}
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
