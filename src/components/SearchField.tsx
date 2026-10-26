import { Search, X } from 'lucide-react';
import { cx } from '../lib/cx';
import type { DemoState } from '../lib/demoState';
import IconButton from './IconButton';
import styles from './Field.module.css';

export interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Spoken name when there is no visible label. */
  label?: string;
  disabled?: boolean;
  width?: number | string;
  /** Gallery only. */
  demoState?: DemoState;
}

/** Search box with leading magnifier and a clear (x) button once something is typed. */
export default function SearchField({
  value,
  onChange,
  placeholder = 'Search',
  label = 'Search',
  disabled = false,
  width,
  demoState,
}: SearchFieldProps) {
  return (
    <div
      className={cx(styles.box, disabled && styles.disabled)}
      style={{ width }}
      data-demo={disabled ? undefined : demoState}
    >
      <Search size={20} className={styles.icon} aria-hidden="true" />
      <input
        type="search"
        className={styles.input}
        value={value}
        placeholder={placeholder}
        aria-label={label}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && !disabled && (
        <IconButton icon={X} label="Clear search" variant="ghost" size="small" onClick={() => onChange('')} />
      )}
    </div>
  );
}
