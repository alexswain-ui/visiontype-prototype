import { useEffect, useRef, type ReactNode } from 'react';
import { Check, Minus } from 'lucide-react';
import styles from './Checkbox.module.css';

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Shows a dash: some but not all items are selected (Select All). */
  indeterminate?: boolean;
  label: ReactNode;
  /** Muted text after the label, e.g. a market code. */
  sub?: string;
  disabled?: boolean;
}

/** Checkbox with label (Figma "Checkbox Group - Nova"): 16px box, orange when checked. A real input underneath. */
export default function Checkbox({ checked, onChange, indeterminate = false, label, sub, disabled }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const Mark = indeterminate ? Minus : checked ? Check : null;
  return (
    <label className={styles.row} data-disabled={disabled || undefined}>
      <input
        ref={ref}
        type="checkbox"
        className={styles.input}
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className={styles.box} aria-hidden="true">
        {Mark && <Mark size={12} strokeWidth={3} />}
      </span>
      <span className={styles.label}>{label}</span>
      {sub && <span className={styles.sub}>{sub}</span>}
    </label>
  );
}
