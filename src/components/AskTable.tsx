import type { AskCell } from '../lib/ask';
import AskDelta from './AskDelta';
import styles from './AskTable.module.css';

export interface AskTableProps {
  columns: string[];
  rows: AskCell[][];
  /** Spoken name of the table. */
  caption: string;
  /** Column indexes shown as changes with arrows, in addition to headers that start with "Δ". */
  deltaColumns?: number[];
}

/**
 * Compact answer table (Figma "Table" in the Ask answers): 11px muted headers, 12px rows, hairline dividers.
 * The first column is the row name. Columns whose header starts with "Δ" show changes with arrows.
 */
export default function AskTable({ columns, rows, caption, deltaColumns = [] }: AskTableProps) {
  const isDelta = columns.map((c, i) => c.startsWith('Δ') || deltaColumns.includes(i));
  return (
    <table className={styles.table}>
      <caption className="visually-hidden">{caption}</caption>
      <thead>
        <tr>
          {columns.map((column, i) => (
            <th key={i} scope="col">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={String(row[0])}>
            {row.map((cell, i) =>
              i === 0 ? (
                <th key={i} scope="row">
                  {cell}
                </th>
              ) : (
                <td key={i}>{isDelta[i] ? <AskDelta value={cell} /> : cell}</td>
              ),
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
