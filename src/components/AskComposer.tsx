import { useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowUp, Plus } from 'lucide-react';
import { useNotInPrototype } from '../lib/notInPrototype';
import IconButton from './IconButton';
import ModelPicker from './ModelPicker';
import styles from './AskComposer.module.css';

export interface AskComposerProps {
  placeholder: string;
  model: string;
  onModelChange: (model: string) => void;
  /** Called with the trimmed question. The field clears itself. */
  onSubmit: (question: string) => void;
  /** While an answer is still arriving: typing is allowed, sending is not. */
  busy?: boolean;
  autoFocus?: boolean;
}

/**
 * Ask composer (Figma: purple-outlined field with attach, model selector and send).
 * Enter sends, Shift+Enter adds a line. The send button is the AI (tertiary, purple) button.
 */
export default function AskComposer({ placeholder, model, onModelChange, onSubmit, busy = false, autoFocus = false }: AskComposerProps) {
  const id = useId();
  const notInPrototype = useNotInPrototype();
  const [text, setText] = useState('');
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const send = (event?: FormEvent) => {
    event?.preventDefault();
    if (busy) return;
    if (!text.trim()) {
      fieldRef.current?.focus();
      return;
    }
    onSubmit(text.trim());
    setText('');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  return (
    <form className={styles.composer} onSubmit={send} onClick={(e) => e.target === e.currentTarget && fieldRef.current?.focus()}>
      <label htmlFor={id} className="visually-hidden">
        Ask a question
      </label>
      <textarea
        ref={fieldRef}
        id={id}
        className={styles.field}
        rows={1}
        placeholder={placeholder}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={onKeyDown}
        autoFocus={autoFocus}
      />
      <div className={styles.actions}>
        <IconButton icon={Plus} label="Attach" variant="ghost" size="small" onClick={() => notInPrototype('Attachments')} />
        <span className={styles.spacer} />
        <ModelPicker value={model} onChange={onModelChange} />
        <IconButton icon={ArrowUp} label="Send" variant="tertiary" size="small" type="submit" disabled={busy} />
      </div>
    </form>
  );
}
