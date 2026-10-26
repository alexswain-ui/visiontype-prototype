import { useState, type FormEvent } from 'react';
import { MessageSquare } from 'lucide-react';
import { cx } from '../lib/cx';
import Button from './Button';
import field from './Field.module.css';
import styles from './SaveBar.module.css';

export interface SaveBarProps {
  onSave: (comment: string) => void;
  onDiscard: () => void;
  placeholder: string;
  /** False when the list itself cannot be saved (e.g. nothing ranked). */
  canSave?: boolean;
}

/** Save bar shown under an edited list: required "why" comment, Discard, Save changes (disabled until a comment is typed). */
export default function SaveBar({ onSave, onDiscard, placeholder, canSave = true }: SaveBarProps) {
  const [comment, setComment] = useState('');
  const ready = canSave && comment.trim().length > 0;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (ready) onSave(comment);
  };

  return (
    <form className={styles.bar} onSubmit={submit} aria-label="Unsaved changes">
      <div className={cx(field.box, styles.comment)}>
        <MessageSquare size={16} aria-hidden="true" className={field.icon} />
        <input
          className={field.input}
          value={comment}
          placeholder={placeholder}
          aria-label="Comment: what changed and why"
          aria-required="true"
          onChange={(event) => setComment(event.target.value)}
        />
      </div>
      <div className={styles.actions}>
        <Button onClick={onDiscard}>Discard</Button>
        <Button type="submit" variant="primary" disabled={!ready} title={ready ? undefined : canSave ? 'Add a comment to save' : 'Add at least one to save'}>
          Save changes
        </Button>
      </div>
    </form>
  );
}
