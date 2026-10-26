import { useEffect, useRef, useState, type DragEvent } from 'react';
import { ChevronDown, ChevronUp, GripVertical, Plus, X } from 'lucide-react';
import { cx } from '../lib/cx';
import { ordinal } from '../lib/rules';
import Badge from './Badge';
import DspTile from './DspTile';
import styles from './RankList.module.css';

export interface RankListProps {
  items: string[];
  onChange: (items: string[]) => void;
  /** Items not in the saved list: orange outline and a "New" chip. */
  newItems?: string[];
  max: number;
  /** "Add DSP" or "Add enrichment source". */
  addLabel: string;
  onAdd: () => void;
  /** Spoken name of the list, e.g. "DSP ranking". */
  label: string;
  emptyText: string;
}

/**
 * Ranked list (component inventory "RankList + RankRow"): rank number, grip, tile, name, remove,
 * up/down chevrons (disabled at the ends). Rows can also be dragged by the card.
 */
export default function RankList({ items, onChange, newItems = [], max, addLabel, onAdd, label, emptyText }: RankListProps) {
  const [announcement, setAnnouncement] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement | null>());
  const addRef = useRef<HTMLButtonElement>(null);
  const pendingFocus = useRef<string | null>(null);

  // Keep focus on the moved row's chevron (or the Add button after removing).
  useEffect(() => {
    const key = pendingFocus.current;
    if (!key) return;
    pendingFocus.current = null;
    const target = buttons.current.get(key);
    if (target && !target.disabled) target.focus();
    else {
      const [name, dir] = key.split('|');
      const other = buttons.current.get(`${name}|${dir === 'up' ? 'down' : 'up'}`);
      (other && !other.disabled ? other : addRef.current)?.focus();
    }
  }, [items]);

  const move = (from: number, to: number, focusDir?: 'up' | 'down') => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [name] = next.splice(from, 1);
    next.splice(to, 0, name);
    if (focusDir) pendingFocus.current = `${name}|${focusDir}`;
    setAnnouncement(`${name} moved to ${ordinal(to + 1)}`);
    onChange(next);
  };

  const remove = (index: number) => {
    const name = items[index];
    const next = items.filter((_, i) => i !== index);
    pendingFocus.current = next[index] ? `${next[index]}|remove` : next[index - 1] ? `${next[index - 1]}|remove` : 'add';
    setAnnouncement(`${name} removed`);
    onChange(next);
  };

  const onDrop = (event: DragEvent, index: number) => {
    event.preventDefault();
    if (dragIndex !== null) move(dragIndex, index);
    setDragIndex(null);
    setOverIndex(null);
  };

  const full = items.length >= max;
  const setRef = (key: string) => (el: HTMLButtonElement | null) => {
    buttons.current.set(key, el);
  };

  return (
    <div className={styles.wrap}>
      {items.length === 0 ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : (
        <ol className={styles.list} aria-label={label}>
          {items.map((name, index) => {
            const isNew = newItems.includes(name);
            return (
              <li
                key={name}
                className={cx(styles.row, dragIndex === index && styles.dragging, overIndex === index && dragIndex !== index && styles.over)}
                onDragOver={(event) => {
                  if (dragIndex === null) return;
                  event.preventDefault();
                  setOverIndex(index);
                }}
                onDrop={(event) => onDrop(event, index)}
              >
                <span className={styles.rank} aria-hidden="true">
                  {index + 1}.
                </span>
                <div
                  className={cx(styles.card, isNew && styles.isNew)}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.effectAllowed = 'move';
                    event.dataTransfer.setData('text/plain', name);
                    setDragIndex(index);
                  }}
                  onDragEnd={() => {
                    setDragIndex(null);
                    setOverIndex(null);
                  }}
                >
                  <GripVertical size={20} aria-hidden="true" className={styles.grip} />
                  <DspTile name={name} />
                  <span className={styles.name}>
                    <span className="visually-hidden">{ordinal(index + 1)}: </span>
                    {name}
                  </span>
                  {isNew && <Badge label="New" tone="orange" size="small" />}
                  <button
                    ref={setRef(`${name}|remove`)}
                    type="button"
                    className={styles.remove}
                    aria-label={`Remove ${name}`}
                    title={`Remove ${name}`}
                    onClick={() => remove(index)}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                </div>
                <div className={styles.reorder}>
                  <button
                    ref={setRef(`${name}|up`)}
                    type="button"
                    className={styles.chevron}
                    aria-label={`Move ${name} up`}
                    title="Move up"
                    disabled={index === 0}
                    onClick={() => move(index, index - 1, 'up')}
                  >
                    <ChevronUp size={16} aria-hidden="true" />
                  </button>
                  <button
                    ref={setRef(`${name}|down`)}
                    type="button"
                    className={styles.chevron}
                    aria-label={`Move ${name} down`}
                    title="Move down"
                    disabled={index === items.length - 1}
                    onClick={() => move(index, index + 1, 'down')}
                  >
                    <ChevronDown size={16} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <div className={styles.row}>
        <span className={styles.rank} aria-hidden="true" />
        <button
          ref={(el) => {
            addRef.current = el;
            buttons.current.set('add', el);
          }}
          type="button"
          className={styles.add}
          onClick={onAdd}
          disabled={full}
          title={full ? `Up to ${max} can be ranked. Remove one to add another.` : undefined}
        >
          <Plus size={20} aria-hidden="true" />
          <span>{addLabel}</span>
          <span className={styles.addCount}>
            {items.length} of {max}
          </span>
        </button>
      </div>
      <span className="visually-hidden" aria-live="polite">
        {announcement}
      </span>
    </div>
  );
}
