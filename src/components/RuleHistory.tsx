import { useState } from 'react';
import type { FieldRule, RuleKind } from '../lib/rules';
import FilterPills from './FilterPills';
import HistoryRow from './HistoryRow';
import panel from './RulePanel.module.css';

type Filter = 'all' | RuleKind;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All changes' },
  { id: 'dsps', label: 'DSPs' },
  { id: 'enrichment', label: 'Enrichment' },
];

/** Rules · History: every saved version for the field, newest first, filterable by DSPs / Enrichment. */
export default function RuleHistory({ field }: { field: FieldRule }) {
  const [filter, setFilter] = useState<Filter>('all');
  const rows = field.history.filter((entry) => filter === 'all' || entry.kind === filter);
  const current = field.history[0];

  return (
    <div className={panel.section}>
      <div className={panel.body}>
        <div className={panel.intro}>
          <div className={panel.introText}>
            <h3 className={panel.introTitle}>Change history</h3>
            <p className={panel.introSub}>Every change is saved as a new version with who, when and why.</p>
          </div>
          <FilterPills options={FILTERS} value={filter} onChange={setFilter} label="Show changes" />
        </div>
        {rows.length > 0 ? (
          <ul className={panel.list}>
            {rows.map((entry) => (
              <HistoryRow key={entry.version} entry={entry} current={entry === current} />
            ))}
          </ul>
        ) : (
          <p className={panel.empty}>No {filter === 'enrichment' ? 'enrichment' : 'DSP'} changes for {field.label} yet.</p>
        )}
      </div>
    </div>
  );
}
