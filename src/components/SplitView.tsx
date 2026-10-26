import type { ReactNode } from 'react';
import styles from './SplitView.module.css';

export interface SplitViewProps {
  /** Usually the table. It narrows when the sheet is open. */
  children: ReactNode;
  /** The SplitSheet, or nothing when closed. */
  sheet?: ReactNode;
  /** Height shared by the table and the sheet. */
  height?: number | string;
}

/** Table + 444px sheet side by side, same height. */
export default function SplitView({ children, sheet, height }: SplitViewProps) {
  return (
    <div className={styles.split} style={{ height }} data-open={sheet ? 'true' : undefined}>
      <div className={styles.main}>{children}</div>
      {sheet}
    </div>
  );
}
