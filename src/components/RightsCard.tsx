import { ArrowUpRight, Check } from 'lucide-react';
import { useNotInPrototype } from '../lib/notInPrototype';
import styles from './RightsCard.module.css';

export interface RightsCardProps {
  text: string;
  /** e.g. "Last checked 14 Oct" */
  checked: string;
}

/** Green "No open rights conflicts" box (Figma "Conflicts" on the Song page). */
export default function RightsCard({ text, checked }: RightsCardProps) {
  const notInPrototype = useNotInPrototype();
  return (
    <div className={styles.box}>
      <p className={styles.head}>
        <Check size={16} aria-hidden="true" className={styles.icon} />
        No open rights conflicts
      </p>
      <p className={styles.text}>{text}</p>
      <div className={styles.meta}>
        <span>{checked}</span>
        <button type="button" className={styles.link} onClick={() => notInPrototype('Raise an issue')}>
          Raise an issue
          <ArrowUpRight size={12} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
