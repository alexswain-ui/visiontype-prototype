import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import { ask } from '../lib/ask';
import { cx } from '../lib/cx';
import { useNotInPrototype } from '../lib/notInPrototype';
import styles from './ModelPicker.module.css';

export interface ModelPickerProps {
  value: string;
  onChange: (model: string) => void;
}

/**
 * Model selector in the Ask composer (Figma "Model selector" and "Model menu", Ask · 4). Visual only:
 * the choice changes the label, never the answer. Opens upwards, or downwards when there is no room above.
 * Arrow keys move, Enter picks, Esc closes.
 */
export default function ModelPicker({ value, onChange }: ModelPickerProps) {
  const id = useId();
  const notInPrototype = useNotInPrototype();
  const [open, setOpen] = useState(false);
  const [below, setBelow] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const models = ask.home.modelGroups.flatMap((g) => g.models.map((m) => m.name));
  const MORE = models.length; // index of "More models"

  const focusItem = (index: number) => itemRefs.current[(index + MORE + 1) % (MORE + 1)]?.focus();

  const openMenu = (focus: 'selected' | 'first' | 'last' = 'selected') => {
    setOpen(true);
    const target = focus === 'first' ? 0 : focus === 'last' ? MORE : Math.max(0, models.indexOf(value));
    requestAnimationFrame(() => focusItem(target));
  };

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  // Flip below the composer before paint if the menu would run off the top of the window.
  useLayoutEffect(() => {
    if (!open) {
      setBelow(false);
      return;
    }
    const top = popoverRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 0) setBelow(true);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const onTriggerKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      openMenu(event.key === 'ArrowUp' ? 'last' : 'first');
    }
  };

  const onMenuKeyDown = (event: KeyboardEvent) => {
    const current = itemRefs.current.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === 'Escape') close();
    else if (event.key === 'Tab') close(false);
    else if (event.key === 'ArrowDown') focusItem(current + 1);
    else if (event.key === 'ArrowUp') focusItem(current - 1);
    else if (event.key === 'Home') focusItem(0);
    else if (event.key === 'End') focusItem(MORE);
    else return;
    if (event.key !== 'Tab') event.preventDefault();
  };

  let index = -1;
  return (
    <div ref={rootRef} className={styles.root}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Model: ${value}`}
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
      >
        {value}
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      {open && (
        <div
          ref={popoverRef}
          id={id}
          role="menu"
          aria-label="Choose a model"
          className={cx(styles.popover, below && styles.below)}
          onKeyDown={onMenuKeyDown}
        >
          {ask.home.modelGroups.map((group, g) => (
            <div key={group.label} role="group" aria-label={group.label} className={styles.group}>
              {g > 0 && <div className={styles.divider} role="separator" />}
              <p className={styles.section} aria-hidden="true">
                {group.label}
              </p>
              {group.models.map((model) => {
                const i = ++index;
                const selected = model.name === value;
                return (
                  <button
                    key={model.name}
                    ref={(el) => {
                      itemRefs.current[i] = el;
                    }}
                    type="button"
                    role="menuitemradio"
                    aria-checked={selected}
                    tabIndex={-1}
                    className={cx(styles.option, selected && styles.selected)}
                    onClick={() => {
                      onChange(model.name);
                      close();
                    }}
                  >
                    <span className={styles.text}>
                      <span className={styles.name}>{model.name}</span>
                      <span className={styles.description}>{model.description}</span>
                    </span>
                    {selected && <Check size={16} aria-hidden="true" className={styles.tick} />}
                  </button>
                );
              })}
            </div>
          ))}
          <div className={styles.divider} role="separator" />
          <button
            ref={(el) => {
              itemRefs.current[MORE] = el;
            }}
            type="button"
            role="menuitem"
            tabIndex={-1}
            className={cx(styles.option, styles.more)}
            onClick={() => {
              close();
              notInPrototype('More models');
            }}
          >
            <span className={styles.name}>More models</span>
            <ChevronRight size={16} aria-hidden="true" className={styles.tick} />
          </button>
        </div>
      )}
    </div>
  );
}
