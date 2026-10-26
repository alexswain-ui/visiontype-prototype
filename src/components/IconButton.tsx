import type { ComponentPropsWithRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cx } from '../lib/cx';
import type { DemoState } from '../lib/demoState';
import type { ButtonSize, ButtonVariant } from './Button';
import Spinner from './Spinner';
import Tooltip from './Tooltip';
import styles from './Button.module.css';

export interface IconButtonProps extends ComponentPropsWithRef<'button'> {
  icon: LucideIcon;
  /** Spoken name for screen readers, and the hover title. Required: the button has no visible text. */
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Gallery only. */
  demoState?: DemoState;
}

/** Icon button v2: square 32 / 40 / 48, icon 14 on Small and 16 otherwise. Shows its label as a tooltip. */
export default function IconButton({
  icon: Icon,
  label,
  variant = 'secondary',
  size = 'medium',
  loading = false,
  demoState,
  className,
  onClick,
  type = 'button',
  ...rest
}: IconButtonProps) {
  const iconSize = size === 'small' ? 14 : 16;
  return (
    <Tooltip label={label} describe={false}>
      <button
        type={type}
        aria-label={label}
        className={cx(styles.button, styles.icon, styles[variant], styles[size], loading && styles.loading, className)}
        data-demo={demoState}
        aria-busy={loading || undefined}
        onClick={loading ? undefined : onClick}
        {...rest}
      >
        {loading ? <Spinner size={iconSize} /> : <Icon size={iconSize} aria-hidden="true" />}
      </button>
    </Tooltip>
  );
}
