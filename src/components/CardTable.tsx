import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cx } from '../lib/cx';
import styles from './CardTable.module.css';

export interface CardColumn<Row> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  /** Fixed width in px. Columns without one share the leftover space. */
  width?: number;
  /** strong = 14px foreground (first column), numeric = SemiBold foreground, muted = default body text. */
  tone?: 'strong' | 'numeric' | 'muted';
  render: (row: Row) => ReactNode;
  /** Value used for sorting. Leave out to make the column unsortable. */
  sortValue?: (row: Row) => string | number;
  /** Visually hidden header (status and trend columns). */
  hideHeader?: boolean;
}

export interface CardTableProps<Row> {
  columns: CardColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  defaultSort?: { key: string; direction: 'asc' | 'desc' };
  /** regular = 52px rows, compact = 48px rows (weekly trend). */
  density?: 'regular' | 'compact';
  /** Spoken name of the table. */
  label: string;
}

/**
 * Table that sits inside an entity page card (Figma "Performance by market", "Songs", "Weekly trend"):
 * 40px column headers, 52px or 48px rows, sortable headers with the arrow on the outer side.
 */
export default function CardTable<Row>({ columns, rows, rowKey, defaultSort, density = 'regular', label }: CardTableProps<Row>) {
  const [sort, setSort] = useState(defaultSort ?? null);

  const sorted = useMemo(() => {
    const column = columns.find((c) => c.key === sort?.key);
    if (!sort || !column?.sortValue) return rows;
    const getValue = column.sortValue;
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = getValue(a);
      const bv = getValue(b);
      return (typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))) * factor;
    });
  }, [rows, columns, sort]);

  const toggleSort = (key: string) =>
    setSort((current) =>
      current?.key === key ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'desc' },
    );

  const minWidth = columns.reduce((sum, c) => sum + (c.width ?? 200), 0) + 44;

  return (
    <div className={styles.scroll} tabIndex={0} aria-label={`${label}, scrolls sideways`}>
      <table className={styles.table} style={{ minWidth }} aria-label={label}>
        <colgroup>
          {columns.map((c) => (
            <col key={c.key} style={{ width: c.width }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((c) => {
              const active = sort?.key === c.key;
              const SortIcon = !active ? ArrowUpDown : sort.direction === 'asc' ? ArrowUp : ArrowDown;
              const right = c.align === 'right';
              return (
                <th
                  key={c.key}
                  scope="col"
                  className={cx(right && styles.right)}
                  aria-sort={active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                >
                  {c.hideHeader ? (
                    <span className="visually-hidden">{c.header}</span>
                  ) : c.sortValue ? (
                    <button type="button" className={cx(styles.sort, active && styles.sorted)} onClick={() => toggleSort(c.key)}>
                      {right && <SortIcon size={12} aria-hidden="true" />}
                      {c.header}
                      {!right && <SortIcon size={12} aria-hidden="true" />}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr key={rowKey(row)} className={cx(styles.row, styles[density])}>
              {columns.map((c) => (
                <td key={c.key} className={cx(c.align === 'right' && styles.right, styles[c.tone ?? 'muted'])}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
