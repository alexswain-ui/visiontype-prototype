import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { firstFocusable, trapTab } from '../lib/focusTrap';
import IconButton from './IconButton';
import styles from './Modal.module.css';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Short supporting text under the title. */
  description?: ReactNode;
  /** Buttons, right-aligned. */
  actions?: ReactNode;
  children?: ReactNode;
  /** 440 for confirmations; up to 900 for pickers and builders. */
  width?: number;
  /** Text or controls on the right of the title (e.g. "Step 1 of 4"). */
  headerAside?: ReactNode;
  /** Shows a close (x) button in the corner. */
  showClose?: boolean;
  /** Gallery only: draw it in place on a scrim, not over the page. */
  preview?: boolean;
}

/**
 * Modal dialog (Figma "Modal" on a Scrim). Esc closes, focus stays inside while open
 * and goes back to where it was when it closes.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  actions,
  children,
  width = 440,
  headerAside,
  showClose = false,
  preview = false,
}: ModalProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open || preview) return;
    const opener = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    if (dialog) (firstFocusable(dialog) ?? dialog).focus();
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
  }, [open, preview]);

  if (!open) return null;

  const dialog = (
    <div className={preview ? styles.previewScrim : styles.scrim} onMouseDown={preview ? undefined : (e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal={preview ? undefined : true}
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={styles.dialog}
        style={{ width }}
      >
        <div className={styles.head}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          {headerAside}
          {showClose && <IconButton icon={X} label="Close" variant="ghost" size="small" onClick={onClose} />}
        </div>
        {description && (
          <p id={descriptionId} className={styles.description}>
            {description}
          </p>
        )}
        {children && <div className={styles.body}>{children}</div>}
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </div>
  );

  return preview ? dialog : createPortal(dialog, document.body);
}
