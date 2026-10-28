import { cx } from '../lib/cx';
import AreaChart from './AreaChart';
import SectionCard from './SectionCard';
import styles from './StreamsTrendCard.module.css';

export interface StreamsTrendCardProps {
  title?: string;
  current: number[];
  /** The previous period, same length. Leave empty to hide it; it is drawn dashed. */
  previous?: number[];
  labels: string[];
  /** Spoken summary of the chart. */
  description: string;
  /** Name of the dashed line, e.g. "Previous 3 weeks". */
  previousName?: string;
  /** Draw the previous period dashed (compare mode) instead of as a blue area. */
  dashedPrevious?: boolean;
  /** Name of the main line. Default "This period". */
  currentName?: string;
}

/** "Capped streams" card: legend in the header, area chart, optionally the previous period as a dashed line. */
export default function StreamsTrendCard({
  title = 'Capped streams · last 8 weeks',
  current,
  previous = [],
  labels,
  description,
  previousName = 'Previous 8 weeks',
  dashedPrevious = false,
  currentName = 'This period',
}: StreamsTrendCardProps) {
  const showPrevious = previous.length > 0;
  return (
    <SectionCard
      title={title}
      aside={
        <ul className={styles.legend} aria-label="Legend">
          <li>
            <span className={styles.keyCurrent} aria-hidden="true" />
            {currentName}
          </li>
          {showPrevious && (
            <li>
              <span className={cx(styles.keyPrevious, dashedPrevious && styles.keyDashed)} aria-hidden="true" />
              {previousName}
            </li>
          )}
        </ul>
      }
    >
      <div className={styles.chart}>
        <AreaChart
          current={current}
          previous={showPrevious ? previous : undefined}
          dashedPrevious={dashedPrevious}
          labels={labels}
          currentName={currentName}
          previousName={previousName}
          height={240}
          description={description}
        />
      </div>
    </SectionCard>
  );
}
