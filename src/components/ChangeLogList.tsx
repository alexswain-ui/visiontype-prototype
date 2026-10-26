import { cx } from '../lib/cx';
import styles from './ChangeLogList.module.css';

export type ChangeKind = 'redelivery' | 'policy' | 'schema';

export interface ChangeLogEntry {
  id: string;
  title: string;
  date: string;
  detail: string;
  kind: ChangeKind;
}

const KIND_LABEL: Record<ChangeKind, string> = {
  redelivery: 'Redelivery',
  policy: 'Policy change',
  schema: 'Schema change',
};

export interface ChangeLogListProps {
  entries: ChangeLogEntry[];
}

/** Change Log (Figma 418:2682): coloured dot per kind (purple redelivery, orange policy, blue schema), legend at the bottom. Static. */
export default function ChangeLogList({ entries }: ChangeLogListProps) {
  return (
    <div className={styles.wrap}>
      <ul className={styles.list}>
        {entries.map((entry) => (
          <li key={entry.id} className={styles.entry}>
            <span className={cx(styles.dot, styles[entry.kind])} role="img" aria-label={KIND_LABEL[entry.kind]} />
            <div className={styles.text}>
              <p className={styles.title}>
                <strong>{entry.title}</strong>
                <span className={styles.date}>{entry.date}</span>
              </p>
              <p className={styles.detail}>{entry.detail}</p>
            </div>
          </li>
        ))}
      </ul>
      <ul className={styles.legend} aria-label="Key">
        {(Object.keys(KIND_LABEL) as ChangeKind[]).map((kind) => (
          <li key={kind} className={styles.legendItem}>
            <span className={cx(styles.legendDot, styles[kind])} aria-hidden="true" />
            {KIND_LABEL[kind]}
          </li>
        ))}
      </ul>
    </div>
  );
}
