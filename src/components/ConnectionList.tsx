import { Rows3 } from 'lucide-react';
import styles from './ConnectionList.module.css';

export interface Connection {
  id: string;
  name: string;
  detail: string;
  /** Right-hand muted text, e.g. "06:12 today" or "412 calls". */
  status: string;
}

export interface ConnectionListProps {
  connections: Connection[];
}

/** Connections list on the Extractor dashboard (Figma 605:15193): green data icon, name, detail, last activity. Static. */
export default function ConnectionList({ connections }: ConnectionListProps) {
  return (
    <ul className={styles.list}>
      {connections.map((connection) => (
        <li key={connection.id} className={styles.row}>
          <Rows3 size={16} className={styles.icon} aria-label="Connected" />
          <div className={styles.text}>
            <p className={styles.name}>{connection.name}</p>
            <p className={styles.detail}>{connection.detail}</p>
          </div>
          <span className={styles.status}>{connection.status}</span>
        </li>
      ))}
    </ul>
  );
}
