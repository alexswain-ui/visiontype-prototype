import { useId } from 'react';
import { cx } from '../lib/cx';
import type { DemoState } from '../lib/demoState';
import styles from './Field.module.css';

export interface TextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Shown in red under the field, and turns the border red. */
  error?: string;
  hint?: string;
  disabled?: boolean;
  required?: boolean;
  width?: number | string;
  /** Gallery only. */
  demoState?: DemoState;
}

/** Labelled text input with optional hint or error message (Figma "Input", Field / Field error). */
export default function TextInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  hint,
  disabled = false,
  required = false,
  width,
  demoState,
}: TextInputProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? hint;
  return (
    <div className={styles.field} style={{ width }}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div
        className={cx(styles.box, error && styles.error, disabled && styles.disabled)}
        data-demo={disabled ? undefined : demoState}
      >
        <input
          id={id}
          className={styles.input}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      {message && (
        <span id={messageId} className={cx(styles.hint, error && styles.hintError)}>
          {message}
        </span>
      )}
    </div>
  );
}
