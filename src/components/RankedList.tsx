import Delta from './Delta';
import styles from './RankedList.module.css';

export interface RankedListRow {
  id: string;
  title: string;
  subtitle: string;
  value: string;
  /** Percent change. Leave out to hide the change column. */
  delta?: number;
}

export interface RankedListProps {
  rows: RankedListRow[];
  /** Spoken name of the list. */
  label: string;
  /** Opens the row's page, e.g. the Song page. Without it rows are static. */
  onRowClick?: (row: RankedListRow) => void;
}

/** Ranked list with title and subtitle (Figma builder "Preview widget"; the split-sheet card is TopList): rank, title over subtitle, value, change. */
export default function RankedList({ rows, label, onRowClick }: RankedListProps) {
  return (
    <ol className={styles.list} aria-label={label}>
      {rows.map((row, i) => {
        const content = (
          <>
            <span className={styles.rank}>{i + 1}</span>
            <span className={styles.titles}>
              <span className={styles.title}>{row.title}</span>
              <span className={styles.subtitle}>{row.subtitle}</span>
            </span>
            <span className={styles.value}>{row.value}</span>
            {row.delta !== undefined && <Delta value={row.delta} />}
          </>
        );
        return (
          <li key={row.id}>
            {onRowClick ? (
              <button type="button" className={styles.row} onClick={() => onRowClick(row)}>
                {content}
              </button>
            ) : (
              <div className={styles.row}>{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
