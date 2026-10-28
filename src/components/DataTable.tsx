import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, SearchX } from 'lucide-react';
import { cx } from '../lib/cx';
import Button from './Button';
import Menu from './Menu';
import Pagination from './Pagination';
import SelectButton from './SelectButton';
import styles from './DataTable.module.css';

export interface Column<Row> {
  key: string;
  header: string;
  /** Numbers are right-aligned and SemiBold. */
  align?: 'left' | 'right';
  /** Fixed column width in px. Columns without one share the leftover space. */
  width?: number;
  /** Cell content. Default: the row's value at `key`. */
  render?: (row: Row) => ReactNode;
  /** Value used for sorting. Leave out to make the column unsortable. */
  sortValue?: (row: Row) => string | number;
  /** Visually hidden header, for status or icon columns. */
  hideHeader?: boolean;
  /** Keeps the (last) column fixed at the right edge while the table scrolls sideways. */
  pinned?: boolean;
}

export interface TableSort {
  key: string;
  direction: 'asc' | 'desc';
}

export interface DataTableProps<Row> {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  /** Header row text, e.g. "Showing 1–100 of 248,112 results". */
  title?: ReactNode;
  actions?: ReactNode;
  selectedKey?: string | null;
  /** A row to point out (Ask's "Apply to table"): purple tint, no sheet. */
  highlightKey?: string | null;
  onRowClick?: (row: Row) => void;
  /** Starting sort, e.g. { key: 'capped', direction: 'desc' }. */
  defaultSort?: TableSort;
  /** Controlled sort: pass it with onSortChange when the rows are sorted (and paged) outside the table. */
  sort?: TableSort | null;
  onSortChange?: (sort: TableSort) => void;
  /** Shows the footer with results-per-page and page buttons. */
  pagination?: {
    page: number;
    pageCount: number;
    onChange: (page: number) => void;
    perPage: number;
    onPerPageClick?: () => void;
    /** With onPerPageChange, the results-per-page button opens a menu of these sizes. */
    perPageOptions?: number[];
    onPerPageChange?: (perPage: number) => void;
    maxButtons?: number;
  };
  /** 6 skeleton rows (proposed). */
  loading?: boolean;
  /** Shown when there are no rows (proposed). */
  emptyText?: string;
  onClearFilters?: () => void;
  /** Spoken name of the table. */
  label: string;
}

/**
 * Results table in a card: header row, sortable column headers, 56px rows, selected row,
 * horizontal scroll inside the card, pagination footer. Loading and empty states are proposed.
 */
export default function DataTable<Row>({
  columns,
  rows,
  rowKey,
  title,
  actions,
  selectedKey,
  highlightKey,
  onRowClick,
  defaultSort,
  sort: controlledSort,
  onSortChange,
  pagination,
  loading = false,
  emptyText = 'No results for these filters',
  onClearFilters,
  label,
}: DataTableProps<Row>) {
  const [ownSort, setOwnSort] = useState(defaultSort ?? null);
  const sort = controlledSort !== undefined ? controlledSort : ownSort;

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

  const toggleSort = (key: string) => {
    const next: TableSort = sort?.key === key ? { key, direction: sort.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' };
    setOwnSort(next);
    onSortChange?.(next);
  };

  // Widths include the cell padding (22px outside the first and last columns), so they add up to the table width.
  const minWidth = columns.reduce((sum, c) => sum + (c.width ?? 120), 0);

  const onRowKeyDown = (event: KeyboardEvent, row: Row) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onRowClick?.(row);
    }
  };

  return (
    <section className={styles.card} aria-label={label}>
      {(title || actions) && (
        <header className={styles.header}>
          <div className={styles.title}>{title}</div>
          {actions && <div className={styles.actions}>{actions}</div>}
        </header>
      )}

      <div className={styles.scroll} tabIndex={0} aria-label={`${label}, scrolls sideways`}>
        <table className={styles.table} style={{ minWidth }}>
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
                    className={cx(right && styles.right, c.pinned && styles.pinned)}
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
            {loading &&
              Array.from({ length: 6 }, (_, i) => (
                <tr key={`skeleton-${i}`} className={styles.row} aria-hidden="true">
                  {columns.map((c) => (
                    <td key={c.key} className={cx(c.align === 'right' && styles.right, c.pinned && styles.pinned)}>
                      {!c.hideHeader && <span className={styles.skeleton} />}
                    </td>
                  ))}
                </tr>
              ))}
            {!loading &&
              sorted.map((row) => {
                const key = rowKey(row);
                const selected = key === selectedKey;
                const highlighted = key === highlightKey;
                return (
                  <tr
                    key={key}
                    className={cx(styles.row, onRowClick && styles.clickable, selected && styles.selected, highlighted && styles.highlighted)}
                    data-highlighted={highlighted || undefined}
                    aria-selected={onRowClick ? selected : undefined}
                    tabIndex={onRowClick ? 0 : undefined}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    onKeyDown={onRowClick ? (event) => onRowKeyDown(event, row) : undefined}
                  >
                    {columns.map((c) => (
                      <td key={c.key} className={cx(c.align === 'right' && styles.right, c.align === 'right' && styles.numeric, c.pinned && styles.pinned)}>
                        {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                );
              })}
          </tbody>
        </table>
        {loading && <span className="visually-hidden">Loading results</span>}
        {!loading && rows.length === 0 && (
          <div className={styles.empty}>
            <SearchX size={24} aria-hidden="true" />
            <p>{emptyText}</p>
            {onClearFilters && <Button onClick={onClearFilters}>Clear filters</Button>}
          </div>
        )}
      </div>

      {pagination && (
        <footer className={styles.footer}>
          <div className={styles.perPage}>
            <span>Results per page:</span>
            {pagination.perPageOptions && pagination.onPerPageChange ? (
              <Menu
                label="Results per page"
                align="start"
                width={120}
                items={pagination.perPageOptions.map((n) => ({
                  id: String(n),
                  label: String(n),
                  selected: n === pagination.perPage,
                  onSelect: () => pagination.onPerPageChange?.(n),
                }))}
                trigger={(props, open) => (
                  <SelectButton {...props} open={open}>
                    {pagination.perPage}
                  </SelectButton>
                )}
              />
            ) : (
              <SelectButton onClick={pagination.onPerPageClick}>{pagination.perPage}</SelectButton>
            )}
          </div>
          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            onChange={pagination.onChange}
            maxButtons={pagination.maxButtons}
          />
        </footer>
      )}
    </section>
  );
}
