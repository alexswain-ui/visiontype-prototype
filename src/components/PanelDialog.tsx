import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { firstFocusable, trapTab } from '../lib/focusTrap';
import IconButton from './IconButton';
import styles from './PanelDialog.module.css';

export interface PanelDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Left side of the footer, e.g. "Shows only data you can access". */
  footnote?: string;
  /** Footer buttons, right-aligned. */
  actions: ReactNode;
  /** Full-bleed body: lay out your own columns and padding. */
  children: ReactNode;
  width?: number;
}

/**
 * Large dialog with a divided header, body and footer (Figma "Modal / Add to dashboard").
 * Same behaviour as Modal: Esc and the scrim close it, focus stays inside and returns to the opener.
 */
export default function PanelDialog({ open, onClose, title, description, footnote, actions, children, width = 900 }: PanelDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    if (dialog) (firstFocusable(dialog.querySelector<HTMLElement>('[data-body]') ?? dialog) ?? dialog).focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
      else if (dialog) trapTab(event, dialog);
    };
    document.addEventListener('keydown', onKeyDown);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className={styles.scrim} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={styles.dialog}
        style={{ width }}
      >
        <header className={styles.header}>
          <div className={styles.titles}>
            <h2 id={titleId} className={styles.title}>
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className={styles.description}>
                {description}
              </p>
            )}
          </div>
          <IconButton icon={X} label="Close" size="small" onClick={onClose} />
        </header>
        <div className={styles.body} data-body>
          {children}
        </div>
        <footer className={styles.footer}>
          {footnote && <p className={styles.footnote}>{footnote}</p>}
          <div className={styles.actions}>{actions}</div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
