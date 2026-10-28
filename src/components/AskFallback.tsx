import { MessageCircleQuestion } from 'lucide-react';
import { ask } from '../lib/ask';
import { streamedText } from '../lib/useAnswerProgress';
import AskChip from './AskChip';
import styles from './AskFallback.module.css';

export interface AskFallbackProps {
  /** Lead-in before the fallback, e.g. "That follow-up isn't scripted in this prototype." */
  line?: string;
  /** Show only `line`: no generic sample-questions text and no chips. */
  lineOnly?: boolean;
  /** Sample questions to offer. Defaults to the Ask page's three. */
  suggestions?: string[];
  progress: number;
  /** Starts one of the three sample questions. */
  onSuggestion: (text: string) => void;
}

/** Reply to a question the prototype cannot answer: a friendly note and the three sample questions (proposed). */
export default function AskFallback({ line, lineOnly, suggestions = ask.behaviour.fallbackSuggestions, progress, onSuggestion }: AskFallbackProps) {
  const text = (lineOnly ? [line] : [line, ask.behaviour.fallback]).filter(Boolean).join(' ');
  return (
    <article className={styles.fallback} aria-busy={progress < 1}>
      <p className={styles.text}>
        <MessageCircleQuestion size={20} aria-hidden="true" className={styles.icon} />
        <span>{streamedText(text, progress)}</span>
      </p>
      {!lineOnly && progress >= 0.5 && (
        <div className={styles.suggestions}>
          {suggestions.map((suggestion) => (
            <AskChip key={suggestion} label={suggestion} variant="followUp" onClick={() => onSuggestion(suggestion)} />
          ))}
        </div>
      )}
    </article>
  );
}
