import { Sparkles } from 'lucide-react';
import styles from './AskThinking.module.css';

/** The short "thinking" row shown before a scripted answer appears (proposed; not drawn in Figma). */
export default function AskThinking({ step }: { step: string }) {
  return (
    <div className={styles.row}>
      <Sparkles size={20} aria-hidden="true" className={styles.icon} />
      <span className={styles.text}>{step}…</span>
    </div>
  );
}
