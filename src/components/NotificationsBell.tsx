import { useEffect, useId, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFollow } from '../lib/follow';
import Tooltip from './Tooltip';
import styles from './NotificationsBell.module.css';

/**
 * The bell in the top bar (Figma "BellSimple"): a popover of updates on what you follow.
 * A dot shows until it has been opened. Esc or a click outside closes it. The link at the bottom is for the presenter.
 */
export default function NotificationsBell() {
  const { updates, unread, markRead, simulateNext } = useFollow();
  const [open, setOpen] = useState(false);
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = (returnFocus = false) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(true);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    if (!open) markRead();
    setOpen(!open);
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <Tooltip label="Notifications" describe={false}>
        <button
          ref={buttonRef}
          type="button"
          className={styles.bell}
          aria-label={unread ? 'Notifications, new updates' : 'Notifications'}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? id : undefined}
          onClick={toggle}
        >
          <Bell size={24} aria-hidden="true" />
          {unread && <span className={styles.dot} aria-hidden="true" />}
        </button>
      </Tooltip>

      {open && (
        <div id={id} role="dialog" aria-label="Notifications" className={styles.popover}>
          <h2 className={styles.title}>Updates</h2>
          <ul className={styles.list}>
            {updates.map((update) => (
              <li key={update.id}>
                <Link to={update.to} className={styles.item} onClick={() => close()}>
                  <span className={styles.text}>{update.text}</span>
                  <span className={styles.when}>{update.when}</span>
                </Link>
              </li>
            ))}
          </ul>
          <button type="button" className={styles.simulate} onClick={simulateNext}>
            Simulate next Friday's update
          </button>
        </div>
      )}
    </div>
  );
}
