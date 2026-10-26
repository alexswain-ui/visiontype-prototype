import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cx } from '../lib/cx';
import styles from './SegmentedControl.module.css';

export interface SegmentOption<Value extends string> {
  value: Value;
  /** Visible content: text, or an icon and text for the tile look. */
  label: ReactNode;
  /** Spoken name when `label` isn't plain text. */
  ariaLabel?: string;
}

export interface SegmentedControlProps<Value extends string> {
  /** Spoken name of the group, e.g. "Show top". */
  label: string;
  options: SegmentOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  /** pill = 32px segmented bar (builder options); tile = 72px tiles with an icon (widget type). */
  look?: 'pill' | 'tile';
}

/**
 * Single choice from a few options (Figma builder "Segmented" and "Type tiles"). A radio group:
 * Tab enters at the chosen option, arrow keys move and choose.
 */
export default function SegmentedControl<Value extends string>({ label, options, value, onChange, look = 'pill' }: SegmentedControlProps<Value>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div className={cx(styles.group, styles[look])} role="radiogroup" aria-label={label}>
      {options.map((option, i) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={option.ariaLabel}
            tabIndex={checked ? 0 : -1}
            className={cx(styles.option, checked && styles.checked)}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, i)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
