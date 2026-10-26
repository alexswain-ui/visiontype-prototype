import { cloneElement, useId, useRef, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import styles from './Tooltip.module.css';

export interface TooltipProps {
  label: string;
  /** One focusable element, e.g. an IconButton. */
  children: ReactElement<Record<string, unknown>>;
  /** Link the tooltip to the trigger for screen readers. Turn off when it repeats the trigger's own label. */
  describe?: boolean;
  /** Gallery only: keep it showing. */
  demoOpen?: boolean;
}

const DELAY_MS = 120;

/**
 * Dark tooltip with a pointer beneath (Figma "Tooltip"). Shows after 120ms on hover or keyboard focus,
 * hides on leave, blur or Esc (proposed for icon-only buttons).
 */
export default function Tooltip({ label, children, describe = true, demoOpen = false }: TooltipProps) {
  const id = useId();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const timer = useRef<number>(undefined);
  const [position, setPosition] = useState<{ x: number; y: number; host: Element } | null>(null);

  const show = () => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const el = wrapRef.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      // Render inside the nearest themed container so the tooltip follows its theme.
      const host = el.closest('[data-theme]') ?? document.body;
      setPosition({ x: box.left + box.width / 2, y: box.top, host });
    }, DELAY_MS);
  };
  const hide = () => {
    window.clearTimeout(timer.current);
    setPosition(null);
  };

  if (demoOpen) {
    return (
      <span className={styles.demo}>
        <span className={styles.bubbleWrap}>
          <span className={styles.bubble}>{label}</span>
          <span className={styles.arrow} />
        </span>
        {children}
      </span>
    );
  }

  return (
    <span
      ref={wrapRef}
      className={styles.wrap}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={(event) => {
        if ((event.target as HTMLElement).matches(':focus-visible')) show();
      }}
      onBlur={hide}
      onKeyDown={(event) => {
        if (event.key === 'Escape') hide();
      }}
    >
      {describe ? cloneElement(children, { 'aria-describedby': position ? id : undefined }) : children}
      {position &&
        createPortal(
          <span id={id} role="tooltip" className={styles.floating} style={{ left: position.x, top: position.y }}>
            <span className={styles.bubble}>{label}</span>
            <span className={styles.arrow} />
          </span>,
          position.host,
        )}
    </span>
  );
}
