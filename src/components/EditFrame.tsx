import { useRef, type DragEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Move, MoveDiagonal2, Trash } from 'lucide-react';
import { cx } from '../lib/cx';
import styles from './EditFrame.module.css';

export interface EditFrameProps {
  /** Widget name, used in the button labels ("Move Reports"). */
  title: string;
  /** Solid outline: the widget being dragged or moved with the keyboard. */
  selected?: boolean;
  /** Arrow keys on the move handle: -1 = earlier, +1 = later. */
  onMove: (direction: -1 | 1) => void;
  onResize: () => void;
  onRemove: () => void;
  /** Drag and drop: the page keeps track of which widget is moving. */
  onDragStart: () => void;
  onDragEnter: () => void;
  onDragEnd: () => void;
  children: ReactNode;
}

/**
 * Edit-mode chrome around a dashboard widget (Figma 484:2894): dimmed widget, dashed blue outline,
 * move handle top left, resize (blue) and remove (red) top right. The widget itself can't be used while editing.
 * Keyboard: focus the move handle and use the arrow keys to move the widget.
 */
export default function EditFrame({
  title,
  selected = false,
  onMove,
  onResize,
  onRemove,
  onDragStart,
  onDragEnter,
  onDragEnd,
  children,
}: EditFrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);

  const startDrag = (event: DragEvent) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', title);
    if (frameRef.current) event.dataTransfer.setDragImage(frameRef.current, 24, 24);
    onDragStart();
  };

  const onHandleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') onMove(-1);
    else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') onMove(1);
    else return;
    event.preventDefault();
  };

  return (
    <div
      ref={frameRef}
      className={cx(styles.frame, selected && styles.selected)}
      onDragEnter={onDragEnter}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => event.preventDefault()}
    >
      <div className={styles.content} inert>
        {children}
      </div>
      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.outline} aria-hidden="true" />
      <button
        type="button"
        className={cx(styles.handle, styles.move)}
        aria-label={`Move ${title}. Use the arrow keys, or drag.`}
        title="Drag to reorder"
        draggable
        onDragStart={startDrag}
        onDragEnd={onDragEnd}
        onKeyDown={onHandleKeyDown}
      >
        <Move size={14} aria-hidden="true" />
      </button>
      <div className={styles.tools}>
        <button type="button" className={cx(styles.handle, styles.resize)} aria-label={`Resize ${title}`} title="Resize" onClick={onResize}>
          <MoveDiagonal2 size={14} aria-hidden="true" />
        </button>
        <button type="button" className={cx(styles.handle, styles.remove)} aria-label={`Remove ${title}`} title="Remove" onClick={onRemove}>
          <Trash size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
