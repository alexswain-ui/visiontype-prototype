import { useMemo, useState } from 'react';
import { Check, ChevronRight, LockKeyhole, Plus, X, type LucideIcon } from 'lucide-react';
import { cx } from '../lib/cx';
import Button from './Button';
import IconButton from './IconButton';
import SearchField from './SearchField';
import styles from './WidgetDrawer.module.css';

export interface GalleryWidget {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  /** add = can be added; added = already on the dashboard; locked = needs a higher access level. */
  status: 'add' | 'added' | 'locked';
}

export interface WidgetDrawerProps {
  title: string;
  intro: string;
  footnote: string;
  /** First one is "All". */
  categories: string[];
  widgets: GalleryWidget[];
  onAdd: (id: string) => void;
  onRequest: (id: string) => void;
  onCreateCustom: () => void;
  onClose: () => void;
}

/** "Add widgets" gallery drawer (Figma 484:2894): search, category filter, Create custom widget, suggested widgets. */
export default function WidgetDrawer({ title, intro, footnote, categories, widgets, onAdd, onRequest, onCreateCustom, onClose }: WidgetDrawerProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(categories[0]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return widgets.filter(
      (w) =>
        (category === categories[0] || w.category === category) &&
        (!q || w.title.toLowerCase().includes(q) || w.description.toLowerCase().includes(q)),
    );
  }, [widgets, query, category, categories]);

  return (
    <aside className={styles.drawer} aria-label={title}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <IconButton icon={X} label="Close" size="small" onClick={onClose} />
      </div>
      <p className={styles.intro}>{intro}</p>

      <SearchField value={query} onChange={setQuery} placeholder="Search widgets" label="Search widgets" />

      <div className={styles.categories} role="group" aria-label="Widget type">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            className={cx(styles.category, c === category && styles.categoryActive)}
            aria-pressed={c === category}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <button type="button" className={styles.create} onClick={onCreateCustom}>
        <span className={styles.createIcon} aria-hidden="true">
          <Plus size={20} />
        </span>
        <span className={styles.text}>
          <span className={styles.createTitle}>Create custom widget</span>
          <span className={styles.description}>Build one from a data search or a saved search</span>
        </span>
        <ChevronRight size={16} aria-hidden="true" />
      </button>

      <p className={styles.sectionLabel}>Suggested</p>
      <ul className={styles.list}>
        {shown.map((widget) => {
          const Icon = widget.icon;
          return (
            <li key={widget.id} className={cx(styles.item, widget.status === 'locked' && styles.locked)}>
              <span className={styles.thumb} aria-hidden="true">
                <Icon size={20} />
              </span>
              <span className={styles.text}>
                <span className={styles.itemTitle}>{widget.title}</span>
                <span className={styles.description}>{widget.description}</span>
              </span>
              {widget.status === 'add' && (
                <Button variant="secondary" size="small" leadingIcon={Plus} aria-label={`Add ${widget.title}`} onClick={() => onAdd(widget.id)}>
                  Add
                </Button>
              )}
              {widget.status === 'added' && (
                <span className={styles.added}>
                  <Check size={12} aria-hidden="true" />
                  Added
                </span>
              )}
              {widget.status === 'locked' && (
                <Button variant="ghost" size="small" leadingIcon={LockKeyhole} aria-label={`Request access to ${widget.title}`} onClick={() => onRequest(widget.id)}>
                  Request
                </Button>
              )}
            </li>
          );
        })}
        {shown.length === 0 && <li className={styles.empty}>No widgets match “{query}”.</li>}
      </ul>

      <p className={styles.footnote}>{footnote}</p>
    </aside>
  );
}
