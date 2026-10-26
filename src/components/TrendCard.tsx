import AreaChart from './AreaChart';
import SectionCard from './SectionCard';
import styles from './TrendCard.module.css';

export interface TrendCardProps {
  title?: string;
  current: number[];
  previous: number[];
  labels: string[];
  /** Spoken summary of the chart. */
  description: string;
}

/** "Capped streams · last 8 weeks" card: legend in the header, area chart with the previous period behind. */
export default function TrendCard({ title = 'Capped streams · last 8 weeks', current, previous, labels, description }: TrendCardProps) {
  return (
    <SectionCard
      title={title}
      aside={
        <ul className={styles.legend} aria-label="Legend">
          <li>
            <span className={styles.keyCurrent} aria-hidden="true" />
            This period
          </li>
          <li>
            <span className={styles.keyPrevious} aria-hidden="true" />
            Previous 8 weeks
          </li>
        </ul>
      }
    >
      <div className={styles.chart}>
        <AreaChart current={current} previous={previous} labels={labels} currentName="This period" previousName="Previous 8 weeks" height={240} description={description} />
      </div>
    </SectionCard>
  );
}
