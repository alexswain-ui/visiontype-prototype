import type { ReactNode } from 'react';
import styles from './Gallery.module.css';

interface GallerySectionProps {
  id: string;
  title: string;
  /** One line on where the design came from, or that it is proposed. */
  note?: ReactNode;
  proposed?: boolean;
  /** Put Dark above Light instead of side by side (for wide content such as the split view). */
  stacked?: boolean;
  children: ReactNode;
}

/** One gallery section: the same content rendered in a Dark panel and a Light panel side by side. */
export default function GallerySection({ id, title, note, proposed, stacked, children }: GallerySectionProps) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <div className={styles.sectionHeader}>
        <h2 id={`${id}-title`} className={styles.sectionTitle}>
          {title}
        </h2>
        {proposed && <span className={styles.proposed}>Proposed</span>}
      </div>
      {note && <p className={styles.sectionNote}>{note}</p>}
      <div className={stacked ? styles.stacked : styles.columns}>
        {(['dark', 'light'] as const).map((theme) => (
          <div key={theme} data-theme={theme} className={styles.panel}>
            <p className={styles.panelTitle}>{theme === 'dark' ? 'Dark' : 'Light'}</p>
            {children}
          </div>
        ))}
      </div>
    </section>
  );
}

/** A labelled group inside a panel. */
export function Group({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className={styles.group}>
      {title && <h3 className={styles.groupTitle}>{title}</h3>}
      {children}
    </div>
  );
}

/** A grid with column headings (states) and labelled rows (variants). */
export function StateGrid({ columns, rows }: { columns: string[]; rows: { label: string; cells: ReactNode[] }[] }) {
  return (
    <div className={styles.gridScroll}>
      <table className={styles.grid}>
        <thead>
          <tr>
            <th />
            {columns.map((column) => (
              <th key={column} scope="col">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {row.cells.map((cell, index) => (
                <td key={index}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Items in a wrapping row. */
export function Row({ children }: { children: ReactNode }) {
  return <div className={styles.row}>{children}</div>;
}
