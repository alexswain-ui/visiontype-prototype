import { Repeat } from 'lucide-react';
import { cx } from '../lib/cx';
import type { WeekRow } from '../lib/entities';
import Badge from './Badge';
import CardTable, { type CardColumn } from './CardTable';
import Delta from './Delta';
import SectionCard from './SectionCard';
import styles from './WeeklyTrendCard.module.css';

const COLUMNS: CardColumn<WeekRow>[] = [
  { key: 'week', header: 'Week', width: 78, tone: 'strong', render: (r) => r.week },
  { key: 'published', header: 'Published', width: 220, render: (r) => r.published },
  {
    key: 'reported',
    header: 'DSPs reported',
    render: (r) => (
      <span className={styles.delivery}>
        {r.restated && <Badge label="Restated" tone="orange" icon={Repeat} size="small" />}
        <span className={cx(r.reported < r.total && styles.short)}>
          {r.reported} of {r.total} DSPs reported
          {r.note && ` · ${r.note}`}
        </span>
      </span>
    ),
  },
  {
    key: 'delta',
    header: 'Δ wk',
    width: 88,
    align: 'right',
    render: (r) => (r.delta === null ? <span aria-label="No earlier week">—</span> : <Delta value={r.delta} />),
  },
  {
    key: 'capped',
    header: 'Capped streams',
    width: 160,
    align: 'right',
    tone: 'numeric',
    render: (r) => r.capped.toLocaleString('en-GB'),
    sortValue: (r) => r.capped,
  },
];

/** Weekly trend card: one row per published Friday, with "X of 51 DSPs reported" and restatements. */
export default function WeeklyTrendCard({ rows }: { rows: WeekRow[] }) {
  return (
    <SectionCard title="Weekly trend" meta="Data as published">
      <CardTable columns={COLUMNS} rows={rows} rowKey={(r) => r.week} density="compact" defaultSort={{ key: 'capped', direction: 'desc' }} label="Weekly trend" />
    </SectionCard>
  );
}
