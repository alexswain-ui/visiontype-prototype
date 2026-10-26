import { useId, useState } from 'react';
import { ChevronDown, ChevronUp, Search, type LucideIcon } from 'lucide-react';
import Button from './Button';
import Checkbox from './Checkbox';
import styles from './FilterSection.module.css';

export interface FilterSectionOption {
  value: string;
  label: string;
  sub?: string;
}

export interface FilterSectionProps {
  title: string;
  icon: LucideIcon;
  options: FilterSectionOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  expanded: boolean;
  onToggle: () => void;
}

/**
 * One group in the Filters panel (Figma "Markets", "Artists"…): a header that opens and closes,
 * then Select All / Clear All, a search box and a checkbox list.
 */
export default function FilterSection({ title, icon: Icon, options, selected, onChange, expanded, onToggle }: FilterSectionProps) {
  const bodyId = useId();
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const visible = q ? options.filter((o) => `${o.label} ${o.sub ?? ''}`.toLowerCase().includes(q)) : options;
  const all = selected.length === options.length;
  const Chevron = expanded ? ChevronUp : ChevronDown;

  const toggle = (value: string, checked: boolean) =>
    onChange(checked ? [...selected, value] : selected.filter((v) => v !== value));

  return (
    <div className={styles.section}>
      <button type="button" className={styles.header} aria-expanded={expanded} aria-controls={bodyId} onClick={onToggle}>
        <Icon size={20} aria-hidden="true" />
        <span className={styles.title}>{title}</span>
        {selected.length > 0 && (
          <span className={styles.count} aria-label={`${selected.length} selected`}>
            {selected.length}
          </span>
        )}
        <Chevron size={16} aria-hidden="true" />
      </button>

      {expanded && (
        <div id={bodyId} className={styles.body} role="group" aria-label={title}>
          <div className={styles.top}>
            <div className={styles.selectRow}>
              <Checkbox
                label="Select All"
                checked={all}
                indeterminate={selected.length > 0 && !all}
                onChange={(checked) => onChange(checked ? options.map((o) => o.value) : [])}
              />
              <Button variant="ghost" size="small" onClick={() => onChange([])} disabled={selected.length === 0}>
                Clear All
              </Button>
            </div>
            <label className={styles.search}>
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                value={query}
                placeholder={`Search ${options.length} ${title.toLowerCase()}…`}
                aria-label={`Search ${title.toLowerCase()}`}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>
          <div className={styles.list}>
            {visible.map((o) => (
              <Checkbox
                key={o.value}
                label={o.label}
                sub={o.sub}
                checked={selected.includes(o.value)}
                onChange={(checked) => toggle(o.value, checked)}
              />
            ))}
            {visible.length === 0 && <p className={styles.empty}>No {title.toLowerCase()} match “{query}”</p>}
          </div>
        </div>
      )}
    </div>
  );
}
