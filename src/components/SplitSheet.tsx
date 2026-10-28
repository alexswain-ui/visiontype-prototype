import { useEffect, useRef, type ReactNode } from 'react';
import { Expand, X } from 'lucide-react';
import contourFlow from '../assets/textures/contour-flow.svg';
import IconButton from './IconButton';
import styles from './SplitSheet.module.css';

export interface SplitSheetProps {
  title: string;
  subtitle?: ReactNode;
  /** Artwork, photo or flag shown before the title. */
  media?: ReactNode;
  /** Small chips under the subtitle (ISRC, Conflict, ...). */
  chips?: ReactNode;
  /** Extra button before expand and close, e.g. Follow. */
  headerAction?: ReactNode;
  onClose: () => void;
  /** Shows the "expand to page" button. */
  onExpand?: () => void;
  /** One or two buttons. */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * 444px detail sheet beside a table (Figma "Sheet" on Data · Canonical + split).
 * Slides in over 200ms. Esc closes it. Focus moves to the sheet when it opens.
 */
export default function SplitSheet({ title, subtitle, media, chips, headerAction, onClose, onExpand, footer, children }: SplitSheetProps) {
  const ref = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // On open: move focus into the sheet and listen for Esc.
  useEffect(() => {
    ref.current?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <aside ref={ref} className={styles.sheet} aria-label={title} tabIndex={-1}>
      <header className={styles.header}>
        <img src={contourFlow} alt="" className={styles.texture} width={238} height={171} />
        {media && <div className={styles.media}>{media}</div>}
        <div className={styles.titles}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {chips && <div className={styles.chips}>{chips}</div>}
        </div>
        <div className={styles.buttons}>
          {headerAction}
          {onExpand && <IconButton icon={Expand} label="Open as page" size="small" onClick={onExpand} />}
          <IconButton icon={X} label="Close" size="small" onClick={onClose} />
        </div>
      </header>
      <div className={styles.body}>{children}</div>
      {footer && <footer className={styles.footer}>{footer}</footer>}
    </aside>
  );
}
