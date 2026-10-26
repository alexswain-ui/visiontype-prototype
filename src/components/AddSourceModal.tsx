import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';
import { cx } from '../lib/cx';
import { firstFocusable, trapTab } from '../lib/focusTrap';
import Button from './Button';
import DspTile from './DspTile';
import IconButton from './IconButton';
import SearchField from './SearchField';
import styles from './AddSourceModal.module.css';

export interface AddSourceModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
  /** "Add a DSP" */
  title: string;
  /** "It will be ranked 6th of 10. You can reorder it afterwards." */
  description: string;
  /** Sources that can be added, in display order. */
  options: string[];
  /** How many exist in total (e.g. 46 other DSPs); the prototype only lists `options`. */
  totalCount?: number;
  /** "DSP" or "enrichment source", used in the search placeholder and messages. */
  noun: string;
  addLabel: string;
}

/**
 * Picker modal (Figma "Modal / Add DSP"): search, "Not yet ranked" options with a tick on the
 * chosen one, Cancel and Add. Up/Down choose, Enter adds, Esc closes.
 */
export default function AddSourceModal({
  open,
  onClose,
  onAdd,
  title,
  description,
  options,
  totalCount,
  noun,
  addLabel,
}: AddSourceModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const listId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const [query, setQuery] = useState('');
  const [chosen, setChosen] = useState<string | null>(null);

  const total = totalCount ?? options.length;
  const shown = options.filter((o) => o.toLowerCase().includes(query.trim().toLowerCase()));
  const selected = chosen && shown.includes(chosen) ? chosen : shown[0] ?? null;

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setChosen(null);
    const opener = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    if (dialog) (dialog.querySelector<HTMLElement>('input') ?? firstFocusable(dialog) ?? dialog).focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
      else if (dialog) trapTab(event, dialog);
    };
    document.addEventListener('keydown', onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, [open]);

  if (!open) return null;

  const add = () => {
    if (selected) onAdd(selected);
  };

  // Arrow keys move the choice from the search box or the list; Enter adds it.
  const onListKeys = (event: ReactKeyboardEvent) => {
    if (!shown.length) return;
    const index = selected ? shown.indexOf(selected) : -1;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setChosen(shown[(index + step + shown.length) % shown.length]);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      add();
    }
  };

  const note = query.trim()
    ? shown.length
      ? `${shown.length} match${shown.length === 1 ? '' : 'es'} in this prototype`
      : `No ${noun}s match “${query.trim()}” in this prototype`
    : total > options.length
      ? `Showing ${options.length} of ${total} · type to find the rest`
      : null;

  return createPortal(
    <div className={styles.scrim} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={styles.dialog}
      >
        <div className={styles.header}>
          <div className={styles.titles}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            <p id={descriptionId} className={styles.description}>
              {description}
            </p>
          </div>
          <IconButton icon={X} label="Close" size="small" onClick={onClose} />
        </div>

        <div className={styles.search} onKeyDown={onListKeys}>
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder={`Search ${total} other ${noun}s`}
            label={`Search ${noun}s`}
          />
        </div>

        <p className={styles.groupLabel} id={`${listId}-label`}>
          Not yet ranked
        </p>
        {shown.length > 0 && (
          <div
            role="listbox"
            id={listId}
            aria-labelledby={`${listId}-label`}
            aria-activedescendant={selected ? `${listId}-${shown.indexOf(selected)}` : undefined}
            tabIndex={0}
            className={styles.list}
            onKeyDown={onListKeys}
          >
            {shown.map((option, index) => {
              const isSelected = option === selected;
              return (
                <div
                  key={option}
                  id={`${listId}-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  className={cx(styles.option, isSelected && styles.selected)}
                  onClick={() => setChosen(option)}
                  onDoubleClick={() => onAdd(option)}
                >
                  <DspTile name={option} />
                  <span className={styles.optionName}>{option}</span>
                  {isSelected && <Check size={18} aria-hidden="true" className={styles.tick} />}
                </div>
              );
            })}
          </div>
        )}
        {note && <p className={styles.note}>{note}</p>}

        <div className={styles.footer}>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={add} disabled={!selected}>
            {addLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
