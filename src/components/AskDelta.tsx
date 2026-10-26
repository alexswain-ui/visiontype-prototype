import { ArrowDown, ArrowUp } from 'lucide-react';
import { cx } from '../lib/cx';
import styles from './AskDelta.module.css';

export interface AskDeltaProps {
  /** A number is a percent change (12 = "12%"). Text such as "−3,114" or "+1.5" keeps its unit but loses the sign. */
  value: number | string;
  /** xs = 12px (answer tables), 2xs = 11px (chart labels). */
  size?: 'xs' | '2xs';
}

const MINUS = /^[−-]/;

/**
 * Compact change indicator for Ask answers: value then arrow, green up, red down, never a leading + or minus.
 * The same rule as Delta, at the smaller sizes the Ask tables and charts use. Zero shows muted, with no arrow.
 */
export default function AskDelta({ value, size = 'xs' }: AskDeltaProps) {
  const text = typeof value === 'number' ? `${Math.abs(value)}%` : value.replace(/^[+−-]/, '');
  const down = typeof value === 'number' ? value < 0 : MINUS.test(value);
  const zero = typeof value === 'number' ? value === 0 : Number.parseFloat(text.replace(/,/g, '')) === 0;
  const Arrow = down ? ArrowDown : ArrowUp;
  if (zero) return <span className={cx(styles.delta, styles[size === 'xs' ? 'xs' : 'xxs'], styles.flat)}>{text}</span>;
  return (
    <span className={cx(styles.delta, styles[size === 'xs' ? 'xs' : 'xxs'], down ? styles.down : styles.up)} aria-label={`${down ? 'Down' : 'Up'} ${text}`}>
      <span aria-hidden="true">{text}</span>
      <Arrow size={size === 'xs' ? 12 : 10} aria-hidden="true" />
    </span>
  );
}
