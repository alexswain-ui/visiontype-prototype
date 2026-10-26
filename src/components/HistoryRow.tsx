import { MessageSquare } from 'lucide-react';
import { personById, type HistoryEntry } from '../lib/rules';
import Avatar from './Avatar';
import Badge from './Badge';
import styles from './HistoryRow.module.css';

export interface HistoryRowProps {
  entry: HistoryEntry;
  current?: boolean;
}

/** One version in Rules · History: avatar, "X changed", change title, comment, date and version chip. */
export default function HistoryRow({ entry, current = false }: HistoryRowProps) {
  const person = personById(entry.who);
  return (
    <li className={styles.row}>
      <Avatar name={person.name} src={person.photo} size={32} />
      <div className={styles.text}>
        <p className={styles.who}>
          <span className={styles.name}>{person.name}</span> changed
        </p>
        <p className={styles.change}>{entry.change}</p>
        <p className={styles.comment}>
          <MessageSquare size={14} aria-hidden="true" className={styles.commentIcon} />
          <span>
            <span className="visually-hidden">Comment: </span>
            {entry.comment}
          </span>
        </p>
      </div>
      <div className={styles.when}>
        <span>{entry.when}</span>
        <span className={styles.chips}>
          {current && <Badge label="Current" tone="orange" size="small" />}
          <Badge label={entry.version} size="small" />
        </span>
      </div>
    </li>
  );
}
