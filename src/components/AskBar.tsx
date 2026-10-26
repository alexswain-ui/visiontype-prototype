import { useState, type FormEvent } from 'react';
import { ArrowUp, Sparkles } from 'lucide-react';
import IconButton from './IconButton';
import styles from './AskBar.module.css';

export interface AskBarProps {
  placeholder: string;
  /** Called with the typed question, or the placeholder when nothing was typed. */
  onSubmit: (question: string) => void;
}

/** "Ask" prompt bar on the dashboard (Figma 365:33584): purple outline, sparkle, purple send button (AI only). */
export default function AskBar({ placeholder, onSubmit }: AskBarProps) {
  const [value, setValue] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit(value.trim() || placeholder);
  };
  return (
    <form className={styles.bar} onSubmit={submit} role="search">
      <Sparkles size={16} className={styles.sparkle} aria-hidden="true" />
      <input
        className={styles.input}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label="Ask a question about your data"
      />
      <IconButton icon={ArrowUp} label="Ask" variant="tertiary" size="small" type="submit" />
    </form>
  );
}
