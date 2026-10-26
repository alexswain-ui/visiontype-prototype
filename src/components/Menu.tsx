import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode, type Ref } from 'react';
import { Check, type LucideIcon } from 'lucide-react';
import { cx } from '../lib/cx';
import styles from './Menu.module.css';

export interface MenuItem {
  id: string;
  label: string;
  /** Second line, e.g. "Direct dataset access". Makes the row 56px tall. */
  description?: string;
  icon?: LucideIcon;
  /** Small round badge before the text (e.g. "EN"), used by Switch user. */
  badge?: ReactNode;
  /** accent = orange-tinted badge (the IFPI user). */
  badgeTone?: 'neutral' | 'accent';
  /** Shows the tick. */
  selected?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export interface MenuTriggerProps {
  ref: Ref<HTMLButtonElement>;
  onClick: () => void;
  onKeyDown: (event: KeyboardEvent) => void;
  'aria-haspopup': 'menu';
  'aria-expanded': boolean;
  'aria-controls': string;
}

export interface MenuProps {
  /** Renders the button that opens the menu. Spread the props onto it. */
  trigger: (props: MenuTriggerProps, open: boolean) => ReactNode;
  items: MenuItem[];
  /** Spoken name of the menu. */
  label: string;
  /** Content above the options, e.g. the signed-in user. */
  header?: ReactNode;
  /** Small uppercase label above the options. */
  sectionLabel?: string;
  /** Content below the options, e.g. the Appearance switch. Not part of arrow-key movement. */
  footer?: ReactNode;
  align?: 'start' | 'end';
  width?: number;
  /** Gallery only: render open, in place. */
  demoOpen?: boolean;
}

/**
 * Menu / popover (Switch user, Export, More, Add). Arrow keys move, Enter selects,
 * Esc closes and returns focus to the button, click outside closes.
 */
export default function Menu({
  trigger,
  items,
  label,
  header,
  sectionLabel,
  footer,
  align = 'end',
  width = 320,
  demoOpen = false,
}: MenuProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const isOpen = open || demoOpen;

  const enabled = items.map((item, i) => (item.disabled ? -1 : i)).filter((i) => i >= 0);

  const focusItem = (index: number) => {
    setActive(index);
    itemRefs.current[index]?.focus();
  };

  const openMenu = (focus: 'first' | 'last' | 'selected' = 'selected') => {
    setOpen(true);
    const selected = items.findIndex((item) => item.selected && !item.disabled);
    const target = focus === 'last' ? enabled[enabled.length - 1] : focus === 'first' || selected < 0 ? enabled[0] : selected;
    requestAnimationFrame(() => focusItem(target));
  };

  const close = (returnFocus = true) => {
    setOpen(false);
    setActive(-1);
    if (returnFocus) triggerRef.current?.focus();
  };

  // Click outside closes.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const onTriggerKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openMenu(event.key === 'ArrowDown' ? 'first' : 'selected');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu('last');
    }
  };

  const listRef = useRef<HTMLDivElement>(null);

  const onMenuKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }
    // Arrow keys inside the footer (e.g. the Appearance radios) belong to that control.
    if (!listRef.current?.contains(event.target as Node)) return;
    const position = enabled.indexOf(active);
    if (event.key === 'ArrowDown') focusItem(enabled[(position + 1) % enabled.length]);
    else if (event.key === 'ArrowUp') focusItem(enabled[(position - 1 + enabled.length) % enabled.length]);
    else if (event.key === 'Home') focusItem(enabled[0]);
    else if (event.key === 'End') focusItem(enabled[enabled.length - 1]);
    else if (event.key === 'Escape') close();
    else if (event.key === 'Tab') {
      close(false);
      return;
    } else return;
    event.preventDefault();
  };

  const select = (item: MenuItem) => {
    item.onSelect();
    close();
  };

  const selectable = items.some((item) => item.selected !== undefined);

  return (
    <div ref={rootRef} className={cx(styles.root, demoOpen && styles.demo)}>
      {trigger(
        {
          ref: triggerRef,
          onClick: () => (open ? close(false) : openMenu()),
          onKeyDown: onTriggerKeyDown,
          'aria-haspopup': 'menu',
          'aria-expanded': isOpen,
          'aria-controls': id,
        },
        isOpen,
      )}
      {isOpen && (
        <div className={cx(styles.popover, styles[align])} style={{ width }} onKeyDown={onMenuKeyDown}>
          {header && (
            <>
              <div className={styles.header}>{header}</div>
              <div className={styles.divider} role="separator" />
            </>
          )}
          {sectionLabel && <p className={styles.sectionLabel}>{sectionLabel}</p>}
          <div ref={listRef} id={id} role="menu" aria-label={label} className={styles.list}>
            {items.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  type="button"
                  role={selectable ? 'menuitemradio' : 'menuitem'}
                  aria-checked={selectable ? Boolean(item.selected) : undefined}
                  disabled={item.disabled}
                  tabIndex={index === active ? 0 : -1}
                  className={cx(styles.item, item.description && styles.twoLine, item.selected && styles.selected)}
                  onClick={() => select(item)}
                  onMouseEnter={() => !item.disabled && setActive(index)}
                >
                  {item.badge && <span className={cx(styles.badge, item.badgeTone === 'accent' && styles.badgeAccent)}>{item.badge}</span>}
                  {Icon && <Icon size={20} aria-hidden="true" className={styles.icon} />}
                  <span className={styles.text}>
                    <span className={styles.label}>{item.label}</span>
                    {item.description && <span className={styles.description}>{item.description}</span>}
                  </span>
                  {item.selected && <Check size={16} aria-hidden="true" className={styles.tick} />}
                </button>
              );
            })}
          </div>
          {footer && (
            <>
              <div className={styles.divider} role="separator" />
              <div className={styles.footer}>{footer}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
