import { ArrowUpRight, Download, SquareExclamationPoint } from 'lucide-react';
import Button from './Button';
import styles from './ReleaseCard.module.css';

export interface ReleaseCardProps {
  eyebrow: string;
  version: string;
  published: string;
  stats: { value: string; label: string }[];
  /** e.g. "48 of 51 DSPs included" */
  dspsIncluded: string;
  dspsOutstanding: string;
  onQuery: () => void;
  onDownload: () => void;
}

/** "Latest release" hero card on the Extractor dashboard (Figma 420:4200): orange-tinted gradient, version, stats, actions. */
export default function ReleaseCard({ eyebrow, version, published, stats, dspsIncluded, dspsOutstanding, onQuery, onDownload }: ReleaseCardProps) {
  return (
    <section className={styles.card} aria-label={`${eyebrow.toLowerCase()} ${version}`}>
      <div className={styles.top}>
        <div className={styles.titles}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 className={styles.version}>{version}</h2>
          <p className={styles.published}>{published}</p>
        </div>
        <div className={styles.dsps}>
          <p className={styles.dspsIncluded}>
            <SquareExclamationPoint size={16} aria-hidden="true" />
            {dspsIncluded}
          </p>
          <p className={styles.dspsOutstanding}>{dspsOutstanding}</p>
        </div>
      </div>
      <div className={styles.bottom}>
        <dl className={styles.stats}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <dt className={styles.statLabel}>{stat.label}</dt>
              <dd className={styles.statValue}>{stat.value}</dd>
            </div>
          ))}
        </dl>
        <div className={styles.actions}>
          <Button variant="ghost" size="small" trailingIcon={ArrowUpRight} onClick={onQuery}>
            Query in Databricks
          </Button>
          <Button variant="primary" leadingIcon={Download} onClick={onDownload}>
            Download CSV
          </Button>
        </div>
      </div>
    </section>
  );
}
