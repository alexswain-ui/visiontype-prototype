import type { ComponentPropsWithRef, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cx } from '../lib/cx';
import type { DemoState } from '../lib/demoState';
import Spinner from './Spinner';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'brand' | 'tertiary' | 'destructive' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends ComponentPropsWithRef<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: LucideIcon;
  trailingIcon?: LucideIcon;
  loading?: boolean;
  /** Gallery only. */
  demoState?: DemoState;
  children: ReactNode;
}

/**
 * Button v2 (Figma design system "Button v2").
 * Primary = the main action (one per view). Secondary = default. Brand = edit/customise only.
 * Tertiary = AI only. Destructive = delete/remove. Ghost = low emphasis inside cards and rows.
 */
export default function Button({
  variant = 'secondary',
  size = 'medium',
  leadingIcon: Leading,
  trailingIcon: Trailing,
  loading = false,
  demoState,
  className,
  children,
  onClick,
  type = 'button',
  ...rest
}: ButtonProps) {
  const iconSize = size === 'small' ? 14 : 16;
  return (
    <button
      type={type}
      className={cx(styles.button, styles[variant], styles[size], loading && styles.loading, className)}
      data-demo={demoState}
      aria-busy={loading || undefined}
      onClick={loading ? undefined : onClick}
      {...rest}
    >
      {loading ? <Spinner size={iconSize} /> : Leading && <Leading size={iconSize} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
      {Trailing && <Trailing size={iconSize} aria-hidden="true" />}
    </button>
  );
}
