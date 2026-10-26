import { Fragment } from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './Breadcrumbs.module.css';

export interface Crumb {
  label: string;
  /** Leave out for the current page (the last crumb). */
  to?: string;
}

/** Breadcrumb trail (entity pages): muted links, chevrons, current page in the foreground colour. */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className={styles.list}>
        {items.map((item, i) => (
          <Fragment key={`${item.label}-${i}`}>
            {i > 0 && <ChevronRight size={14} className={styles.chevron} aria-hidden="true" />}
            <li className={styles.item}>
              {item.to ? (
                <Link to={item.to} className={styles.link}>
                  {item.label}
                </Link>
              ) : (
                <span className={styles.current} aria-current="page">
                  {item.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
