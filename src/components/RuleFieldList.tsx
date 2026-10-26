import { ChevronRight, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cx } from '../lib/cx';
import { personById, type FieldRule } from '../lib/rules';
import Avatar from './Avatar';
import styles from './RuleFieldList.module.css';

export interface RuleFieldListProps {
  fields: FieldRule[];
  selectedId: string;
  /** Link for each field, e.g. "/rules?field=licensor". */
  hrefFor: (fieldId: string) => string;
}

/** Left panel on Rules (Figma "Field rules"): one row per field with "Last updated ... by". */
export default function RuleFieldList({ fields, selectedId, hrefFor }: RuleFieldListProps) {
  return (
    <nav className={styles.panel} aria-label="Field rules">
      <div className={styles.header}>
        <span className={styles.iconTile} aria-hidden="true">
          <List size={20} />
        </span>
        <h2 className={styles.title}>Field rules</h2>
      </div>
      <ul className={styles.list}>
        {fields.map((field) => {
          const selected = field.id === selectedId;
          const person = personById(field.updatedBy);
          const Icon = field.icon;
          return (
            <li key={field.id}>
              <Link
                to={hrefFor(field.id)}
                className={cx(styles.row, selected && styles.selected)}
                aria-current={selected ? 'page' : undefined}
              >
                <span className={styles.text}>
                  <span className={styles.label}>
                    <Icon size={20} aria-hidden="true" />
                    {field.label}
                  </span>
                  <span className={styles.updated}>
                    Last updated {field.updatedOn} by
                    <span className={styles.person}>
                      <Avatar name={person.name} src={person.photo} size={18} />
                      {person.name}
                    </span>
                  </span>
                </span>
                <ChevronRight size={16} aria-hidden="true" className={styles.chevron} />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
