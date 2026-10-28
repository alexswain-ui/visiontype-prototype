import { Check } from 'lucide-react';
import { cx } from '../lib/cx';
import styles from './Stepper.module.css';

export interface StepperProps {
  steps: string[];
  /** Zero-based index of the current step. Pass steps.length when everything is done. */
  current: number;
}

/**
 * Progress stepper for a wizard: done = orange circle with a tick, current = orange outline,
 * next = muted, joined by thin lines. Not interactive.
 */
export default function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className={styles.stepper} aria-label="Progress">
      {steps.map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'next';
        return (
          <li key={label} className={cx(styles.step, styles[state])} aria-current={state === 'current' ? 'step' : undefined}>
            <span className={styles.circle}>{state === 'done' ? <Check size={14} strokeWidth={3} aria-hidden="true" /> : i + 1}</span>
            <span className={styles.label}>
              {label}
              <span className="visually-hidden">{state === 'done' ? ' (done)' : state === 'current' ? ' (current step)' : ''}</span>
            </span>
            {i < steps.length - 1 && <span className={cx(styles.line, i < current && styles.lineDone)} aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  );
}
