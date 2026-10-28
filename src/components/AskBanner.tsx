import { TriangleAlert } from 'lucide-react';
import styles from './AskBanner.module.css';

/** Amber notice above an illustrative answer. The text comes from the script. */
export default function AskBanner({ text }: { text: string }) {
  return (
    <p className={styles.banner} role="note">
      <TriangleAlert size={16} aria-hidden="true" className={styles.icon} />
      <span>{text}</span>
    </p>
  );
}
