import { ChevronLeft, ChevronRight, Ellipsis } from 'lucide-react';
import { cx } from '../lib/cx';
import Button from './Button';
import styles from './Pagination.module.css';

export interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  /** How many page buttons to show, including first and last. Fewer fit a narrow table. */
  maxButtons?: number;
}

/** Page numbers between the first and last page, with ellipses where pages are skipped. */
export function pageWindow(page: number, pageCount: number, maxButtons: number): (number | 'gap')[] {
  if (pageCount <= maxButtons) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const inner = Math.max(1, maxButtons - 2);
  let start = Math.max(2, page - Math.floor((inner - 1) / 2));
  const end = Math.min(pageCount - 1, start + inner - 1);
  start = Math.max(2, end - inner + 1);
  const pages: (number | 'gap')[] = [1];
  if (start > 2) pages.push('gap');
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < pageCount - 1) pages.push('gap');
  pages.push(pageCount);
  return pages;
}

/** Previous · 1 2 3 … N · Next. Current page uses the accent fill. */
export default function Pagination({ page, pageCount, onChange, maxButtons = 9 }: PaginationProps) {
  return (
    <nav className={styles.nav} aria-label="Pagination">
      <Button size="small" leadingIcon={ChevronLeft} disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </Button>
      <ol className={styles.pages}>
        {pageWindow(page, pageCount, maxButtons).map((p, i) =>
          p === 'gap' ? (
            <li key={`gap-${i}`} className={styles.gap} aria-hidden="true">
              <Ellipsis size={16} />
            </li>
          ) : (
            <li key={p}>
              <button
                type="button"
                className={cx(styles.page, p === page && styles.current)}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Page ${p}`}
                onClick={() => onChange(p)}
              >
                {p}
              </button>
            </li>
          ),
        )}
      </ol>
      <Button size="small" trailingIcon={ChevronRight} disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
        Next
      </Button>
    </nav>
  );
}
