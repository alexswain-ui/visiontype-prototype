import AiIcon from './AiIcon';
import styles from './AskThinking.module.css';

/** The short "thinking" row shown before a scripted answer appears (proposed; not drawn in Figma). */
export default function AskThinking({ step }: { step: string }) {
  return (
    <div className={styles.row}>
      <AiIcon size={20} aria-hidden="true" className={styles.icon} />
      <span className={styles.text}>{step}…</span>
    </div>
  );
}
