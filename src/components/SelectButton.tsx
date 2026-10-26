import type { ReactNode, Ref } from 'react';
import { ChevronDown, type LucideIcon } from 'lucide-react';
import type { DemoState } from '../lib/demoState';
import Button, { type ButtonSize } from './Button';
import styles from './SelectButton.module.css';

export interface SelectButtonProps {
  children: ReactNode;
  icon?: LucideIcon;
  /** Small orange count, e.g. number of active filters (proposed). */
  count?: number;
  /** Drawn as pressed while its menu is open. */
  open?: boolean;
  size?: ButtonSize;
  disabled?: boolean;
  onClick?: () => void;
  ref?: Ref<HTMLButtonElement>;
  /** Gallery only. */
  demoState?: DemoState;
}

/** Dropdown trigger (date range, Filters, results per page): a Secondary button with a chevron. */
export default function SelectButton({
  children,
  icon,
  count,
  open = false,
  size = 'medium',
  disabled,
  onClick,
  ref,
  demoState,
}: SelectButtonProps) {
  return (
    <Button
      ref={ref}
      variant="secondary"
      size={size}
      leadingIcon={icon}
      trailingIcon={ChevronDown}
      aria-haspopup="true"
      aria-expanded={open}
      disabled={disabled}
      onClick={onClick}
      demoState={demoState}
    >
      <span className={styles.content}>
        {children}
        {count !== undefined && count > 0 && <span className={styles.count}>{count}</span>}
      </span>
    </Button>
  );
}
