import { cx } from '../lib/cx';
import styles from './FilterPills.module.css';

export interface FilterPillsProps<T extends string> {
  options: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  /** Spoken name of the group, e.g. "Show changes". */
  label: string;
}

/** Small single-choice filter chips (Rules · History: All changes / DSPs / Enrichment). */
export default function FilterPills<T extends string>({ options, value, onChange, label }: FilterPillsProps<T>) {
  return (
    <div role="group" aria-label={label} className={styles.group}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={option.id === value}
          className={cx(styles.pill, option.id === value && styles.active)}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
