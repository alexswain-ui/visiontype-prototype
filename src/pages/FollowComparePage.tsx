import { useState } from 'react';
import { GitCompareArrows } from 'lucide-react';
import { Navigate, useParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import CardTable, { type CardColumn } from '../components/CardTable';
import Delta from '../components/Delta';
import Menu from '../components/Menu';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import SegmentedControl from '../components/SegmentedControl';
import SelectButton from '../components/SelectButton';
import StreamsTrendCard from '../components/StreamsTrendCard';
import { millions } from '../lib/entities';
import {
  entityIds,
  entityName,
  kindLabel,
  latestChange,
  marketAverage,
  parseFollowKey,
  rankOf,
  useFollow,
  weeklyValues,
  WEEK_LABELS,
} from '../lib/follow';
import styles from './FollowComparePage.module.css';

interface Row {
  key: string;
  name: string;
  streams: string;
  change: number;
  rank: string;
}

const COLUMNS: CardColumn<Row>[] = [
  { key: 'name', header: '', hideHeader: true, tone: 'strong', render: (r) => r.name },
  { key: 'streams', header: 'Streams · W42', align: 'right', tone: 'numeric', render: (r) => r.streams },
  { key: 'change', header: 'Change', align: 'right', render: (r) => <Delta value={r.change} suffix="vs last week" /> },
  { key: 'rank', header: 'Rank', align: 'right', render: (r) => r.rank },
];

/**
 * Compare (/following/compare/:id): a followed item against the market average and one peer.
 * No Figma design: the existing streams trend card (item orange, comparison blue dashed) and a small card table.
 */
/** Remount per item, so the peer choice starts fresh. */
export default function FollowComparePage() {
  const { id = '' } = useParams();
  return <Compare key={id} itemKey={id} />;
}

function Compare({ itemKey: key }: { itemKey: string }) {
  const { items } = useFollow();
  const { kind, id } = parseFollowKey(key);
  const item = items.find((i) => i.key === key);
  const itemValues = item ? weeklyValues(kind, id) : null;

  const peers = entityIds(kind).filter((p) => p.toUpperCase() !== id.toUpperCase());
  // Default peer: another followed item of the same kind, otherwise the first of that kind.
  const defaultPeer = items.find((i) => i.kind === kind && i.key !== key)?.id ?? peers[0];
  const [peerId, setPeerId] = useState(defaultPeer);
  const [mode, setMode] = useState<'market' | 'peer'>('market');

  if (!item || !itemValues) return <Navigate to="/following" replace />;

  const name = entityName(kind, id);
  const peerName = entityName(kind, peerId);
  const peerValues = weeklyValues(kind, peerId) ?? itemValues;
  const average = marketAverage(kind);
  const averageName = `${kindLabel(kind)} average`;
  const shown = mode === 'market' ? average : peerValues;
  const shownName = mode === 'market' ? averageName : peerName;

  const rowFor = (rowKey: string, label: string, values: number[], rank?: { rank: number; of: number }): Row => ({
    key: rowKey,
    name: label,
    streams: millions(values[values.length - 1] * 1e6),
    change: latestChange(values),
    rank: rank ? `#${rank.rank} of ${rank.of}` : '—',
  });
  const rows = [
    rowFor('item', name, itemValues, rankOf(kind, id)),
    rowFor('peer', peerName, peerValues, rankOf(kind, peerId)),
    rowFor('average', averageName, average),
  ];

  return (
    <div className={styles.page}>
      <Breadcrumbs items={[{ label: 'Following', to: '/following' }, { label: `Compare ${name}` }]} />
      <PageHeader title={name} icon={GitCompareArrows} subtitle={`Compared with the ${averageName.toLowerCase()} and one peer · W42`} />

      <div className={styles.controls}>
        <div className={styles.control}>
          <span className={styles.label}>Show</span>
          <SegmentedControl
            label="Compare with"
            options={[
              { value: 'market', label: averageName },
              { value: 'peer', label: peerName },
            ]}
            value={mode}
            onChange={setMode}
          />
        </div>
        <div className={styles.control}>
          <span className={styles.label}>Peer</span>
          <Menu
            label="Choose a peer"
            width={240}
            items={peers.map((p) => ({ id: p, label: entityName(kind, p), selected: p === peerId, onSelect: () => setPeerId(p) }))}
            trigger={(props, open) => (
              <SelectButton {...props} open={open}>
                {peerName}
              </SelectButton>
            )}
          />
        </div>
      </div>

      <StreamsTrendCard
        title="Capped streams · last 8 weeks"
        current={itemValues}
        previous={shown}
        previousName={shownName}
        currentName={name}
        dashedPrevious
        labels={WEEK_LABELS}
        description={`${name} against ${shownName}: capped streams from ${WEEK_LABELS[0]} to ${WEEK_LABELS[WEEK_LABELS.length - 1]}.`}
      />

      <SectionCard title="Side by side" meta="W42">
        <CardTable columns={COLUMNS} rows={rows} rowKey={(r) => r.key} label={`${name}, ${peerName} and the ${averageName.toLowerCase()}`} />
      </SectionCard>
    </div>
  );
}
