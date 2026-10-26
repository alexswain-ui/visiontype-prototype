import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { BriefcaseBusiness, DiscAlbum, Globe, MicVocal, Music, Package, Settings2, X, type LucideIcon } from 'lucide-react';
import { EMPTY_FILTERS, FILTER_GROUPS, type FilterKey, type Filters } from '../lib/dataPage';
import { firstFocusable, trapTab } from '../lib/focusTrap';
import Button from './Button';
import FilterSection from './FilterSection';
import IconButton from './IconButton';
import styles from './FilterPanel.module.css';

const ICONS: Record<FilterKey, LucideIcon> = {
  markets: Globe,
  artists: MicVocal,
  songs: Music,
  labels: DiscAlbum,
  distributors: Package,
  licensors: BriefcaseBusiness,
};

export interface FilterPanelProps {
  open: boolean;
  /** The filters in use. The panel edits a copy until Apply Filters is pressed. */
  filters: Filters;
  onApply: (filters: Filters) => void;
  onClose: () => void;
}

/**
 * Filters side panel (Figma "Data · Filter panel", 605:11982): 368px, full height, on the right.
 * Changes are a draft until Apply Filters. Close, Esc or a click outside discards them. Focus stays inside while open.
 */
export default function FilterPanel({ open, filters, onApply, onClose }: FilterPanelProps) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState(filters);
  const [expanded, setExpanded] = useState<FilterKey[]>(['markets']);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Start each visit from the filters in use.
  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const panel = ref.current;
    if (panel) (firstFocusable(panel) ?? panel).focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
      else if (panel) trapTab(event, panel);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (panel && !panel.contains(event.target as Node)) closeRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      opener?.focus();
    };
  }, [open]);

  if (!open) return null;

  const toggle = (key: FilterKey) =>
    setExpanded((list) => (list.includes(key) ? list.filter((k) => k !== key) : [...list, key]));

  return createPortal(
    <div ref={ref} className={styles.panel} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
      <header className={styles.header}>
        <span className={styles.iconTile} aria-hidden="true">
          <Settings2 size={20} />
        </span>
        <h2 id={titleId} className={styles.title}>
          Filters
        </h2>
        <IconButton icon={X} label="Close filters" variant="ghost" onClick={onClose} />
      </header>

      <div className={styles.sections}>
        {FILTER_GROUPS.map((group) => (
          <FilterSection
            key={group.key}
            title={group.title}
            icon={ICONS[group.key]}
            options={group.options}
            selected={draft[group.key]}
            onChange={(values) => setDraft((d) => ({ ...d, [group.key]: values }))}
            expanded={expanded.includes(group.key)}
            onToggle={() => toggle(group.key)}
          />
        ))}
      </div>

      <footer className={styles.footer}>
        <Button size="large" onClick={() => setDraft(EMPTY_FILTERS)}>
          Clear Filters
        </Button>
        <Button variant="primary" size="large" onClick={() => onApply(draft)}>
          Apply Filters
        </Button>
      </footer>
    </div>,
    document.body,
  );
}
