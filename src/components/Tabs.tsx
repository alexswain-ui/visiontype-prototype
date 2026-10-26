import { useRef, type KeyboardEvent } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cx } from '../lib/cx';
import styles from './Tabs.module.css';

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  /** Gallery only: make this tab look hovered or focused. */
  demoState?: 'hover' | 'focus';
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  /** Spoken name of the tab group, e.g. "Data views". */
  label: string;
}

/**
 * Segmented tabs (Figma "Tabs (segmented) - Nova").
 * Keyboard: Left/Right move between tabs, Home/End jump to the ends.
 */
export default function Tabs({ items, value, onChange, label }: TabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const last = items.length - 1;
    const next =
      event.key === 'ArrowRight' ? (index === last ? 0 : index + 1)
      : event.key === 'ArrowLeft' ? (index === 0 ? last : index - 1)
      : event.key === 'Home' ? 0
      : event.key === 'End' ? last
      : null;
    if (next === null) return;
    event.preventDefault();
    refs.current[next]?.focus();
    onChange(items[next].id);
  };

  return (
    <div role="tablist" aria-label={label} className={styles.list}>
      {items.map((item, index) => {
        const active = item.id === value;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            className={cx(styles.tab, active && styles.active)}
            data-demo={item.demoState}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {Icon && <Icon size={20} aria-hidden="true" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
