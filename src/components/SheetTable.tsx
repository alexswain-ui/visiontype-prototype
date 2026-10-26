import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { cx } from '../lib/cx';
import styles from './SheetTable.module.css';

export interface SheetColumn<Row> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  /** Fixed width in px; columns without one share the rest. */
  width?: number;
  /** strong = SemiBold foreground (the main number); muted = secondary number. */
  tone?: 'strong' | 'muted';
  render: (row: Row) => ReactNode;
}

export interface SheetTableProps<Row> {
  columns: SheetColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  /** Spoken name of the table. */
  label: string;
  /** 36 (market table) or 40 (rows with artwork). */
  rowHeight?: 36 | 40;
  /** Last row, e.g. "+ 35 more markets", with a chevron. */
  moreLabel?: string;
  onMore?: () => void;
}

/** Small table inside a split sheet (Figma "Market table", "Songs table"): 32px header, 36-40px rows, optional "more" row. */
export default function SheetTable<Row>({ columns, rows, rowKey, label, rowHeight = 36, moreLabel, onMore }: SheetTableProps<Row>) {
  return (
    <div className={styles.card}>
      <table className={styles.table} aria-label={label}>
        <colgroup>
          {columns.map((c) => (
            <col key={c.key} style={{ width: c.width }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" className={cx(c.align === 'right' && styles.right)}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className={styles[`h${rowHeight}`]}>
              {columns.map((c) => (
                <td key={c.key} className={cx(c.align === 'right' && styles.right, c.tone && styles[c.tone])}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {moreLabel && (
        <button type="button" className={styles.more} onClick={onMore}>
          {moreLabel}
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
