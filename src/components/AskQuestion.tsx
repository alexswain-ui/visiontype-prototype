import styles from './AskQuestion.module.css';

/** The user's question (Figma "Question"): a blue bubble on the right, at most 520px wide. */
export default function AskQuestion({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <div className={styles.row}>
      <p className={`${styles.bubble} ${compact ? styles.compact : ''}`}>
        <span className="visually-hidden">You asked: </span>
        {text}
      </p>
    </div>
  );
}
