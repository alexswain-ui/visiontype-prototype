import { useState } from 'react';
import { ChartLine, Download, Ellipsis, Repeat, Star, TriangleAlert } from 'lucide-react';
import AiIcon from '../../components/AiIcon';
import AreaChart from '../../components/AreaChart';
import Artwork from '../../components/Artwork';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Card from '../../components/Card';
import ConflictCard from '../../components/ConflictCard';
import DataTable, { type Column } from '../../components/DataTable';
import Delta from '../../components/Delta';
import DspTile from '../../components/DspTile';
import Flag from '../../components/Flag';
import IconButton from '../../components/IconButton';
import LegendPill from '../../components/LegendPill';
import ShareBar from '../../components/ShareBar';
import SplitSheet from '../../components/SplitSheet';
import SplitView from '../../components/SplitView';
import StatTile from '../../components/StatTile';
import Timeline from '../../components/Timeline';
import TrendBars from '../../components/TrendBars';
import { artistById, cast, formatNumber, marketByCode, songById, type CanonicalRow } from '../../lib/data';
import GallerySection, { Group, Row } from './GallerySection';
import styles from './Gallery.module.css';

const WEEKS = ['W35', 'W36', 'W37', 'W38', 'W39', 'W40', 'W41', 'W42'];
const SERIES = cast.series['song:saffron-ferry'];

const COLUMNS: Column<CanonicalRow>[] = [
  { key: 'date', header: 'Date', width: 76, sortValue: (r) => r.date },
  {
    key: 'song',
    header: 'Song',
    width: 230,
    sortValue: (r) => songById(r.song)?.title ?? '',
    render: (r) => {
      const song = songById(r.song);
      return (
        <span className={styles.cellMedia}>
          <Artwork title={song?.title ?? ''} seed={song?.art ?? 0} />
          <span className={styles.cellText}>
            <span className={styles.cellPrimary}>{song?.title}</span>
            <span>{song?.isrc}</span>
          </span>
        </span>
      );
    },
  },
  {
    key: 'status',
    header: 'Status',
    width: 48,
    hideHeader: true,
    render: (r) =>
      r.status === 'conflict' ? (
        <Badge tone="amber" label="Conflict" icon={TriangleAlert} iconOnly />
      ) : r.status === 'restated' ? (
        <Badge tone="orange" label="Restated" icon={Repeat} iconOnly />
      ) : null,
  },
  {
    key: 'artist',
    header: 'Artist',
    width: 187,
    sortValue: (r) => artistById(songById(r.song)?.artist ?? '')?.name ?? '',
    render: (r) => {
      const artist = artistById(songById(r.song)?.artist ?? '');
      return (
        <span className={styles.cellMedia}>
          <Avatar name={artist?.name ?? ''} size={32} />
          <span className={styles.cellPrimary}>{artist?.name}</span>
        </span>
      );
    },
  },
  { key: 'licensor', header: 'Licensor', width: 167, sortValue: (r) => r.licensor },
  { key: 'label', header: 'Label', width: 151, sortValue: (r) => r.label },
  { key: 'distributor', header: 'Distributor', width: 164, sortValue: (r) => r.distributor },
  {
    key: 'market',
    header: 'Market',
    width: 76,
    sortValue: (r) => r.market,
    render: (r) => (
      <span className={styles.cellMedia}>
        <Flag code={r.market} />
        {marketByCode(r.market)?.short === 'USA' ? 'US' : r.market === 'GB' ? 'UK' : r.market}
      </span>
    ),
  },
  { key: 'capped', header: 'Capped streams', width: 130, align: 'right', sortValue: (r) => r.capped, render: (r) => formatNumber(r.capped) },
];

function TableDemo({ narrow = false }: { narrow?: boolean }) {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(narrow ? 'r2' : null);
  const selectedRow = cast.canonicalRows.find((r) => r.id === selected);
  const detail = selected ? (cast.canonicalDetail as Record<string, (typeof cast.canonicalDetail)['r2']>)[selected] : undefined;
  const song = selectedRow ? songById(selectedRow.song) : undefined;
  const artist = song ? artistById(song.artist) : undefined;

  const table = (
    <DataTable
      label="Canonical data"
      columns={COLUMNS}
      rows={cast.canonicalRows}
      rowKey={(r) => r.id}
      selectedKey={selected}
      onRowClick={(r) => setSelected(r.id === selected ? null : r.id)}
      defaultSort={{ key: 'capped', direction: 'desc' }}
      title={
        <>
          Showing 1–100 of 248,112 results
          <IconButton icon={AiIcon} label="Ask AI about these results" variant="secondary" size="small" />
        </>
      }
      actions={
        <>
          <IconButton icon={Star} label="Save search" />
          <IconButton icon={Download} label="Export" />
          <IconButton icon={Ellipsis} label="More" />
        </>
      }
      pagination={{ page, pageCount: 500, onChange: setPage, perPage: 100, maxButtons: selected ? 4 : 9 }}
    />
  );

  return (
    <SplitView
      height={selected ? 760 : undefined}
      sheet={
        selectedRow &&
        song && (
          <SplitSheet
            title={song.title}
            subtitle={`${artist?.name} · ${selectedRow.market === 'GB' ? 'UK' : selectedRow.market} · Week 42`}
            media={<Artwork title={song.title} seed={song.art} size={56} />}
            chips={
              <>
                <Badge label={song.isrc} size="small" />
                {selectedRow.status === 'conflict' && <Badge tone="amber" label="Conflict" icon={TriangleAlert} size="small" />}
                {selectedRow.status === 'restated' && <Badge tone="orange" label="Restated" icon={Repeat} size="small" />}
              </>
            }
            onClose={() => setSelected(null)}
            onExpand={() => {}}
            footer={
              <>
                <Button>Raise an issue</Button>
                <Button>View full history</Button>
              </>
            }
          >
            {detail ? (
              <>
                <ConflictCard title={detail.conflict.title} state={detail.conflict.state} meta={detail.conflict.raised}>
                  {detail.conflict.text}
                </ConflictCard>
                <Timeline
                  items={detail.timeline.map((t, i) => ({ title: t.title, meta: t.meta, detail: t.lines[0], active: i < 2 }))}
                />
              </>
            ) : (
              <p className={styles.sectionNote}>No conflicts or history for this row in the prototype data.</p>
            )}
          </SplitSheet>
        )
      }
    >
      {table}
    </SplitView>
  );
}

export default function DataDisplaySection() {
  return (
    <>
      <GallerySection id="avatar" title="Avatar" note="Figma: design system Avatar (initials in chart colours). Sizes 18 / 24 / 32 / 40 / 56. Photo avatars take an image.">
        <Row>
          {([18, 24, 32, 40, 56] as const).map((size) => (
            <Avatar key={size} name="Daniel Reyes" size={size} />
          ))}
          <Avatar name="Mara Voss" tone={1} />
          <Avatar name="The Lowlands" tone={2} />
          <Avatar name="Kite Sparrow" tone={3} />
          <Avatar name="Juno Reyes" tone={4} />
        </Row>
      </GallerySection>

      <GallerySection id="flag" title="Flag" note="country-flag-icons, 3px radius, 1px outline. Small 20x14 · Medium 26x19 · Large 56x40.">
        <Group title="Sizes">
          <Row>
            <Flag code="GB" />
            <Flag code="GB" size="medium" />
            <Flag code="GB" size="large" label="United Kingdom" />
          </Row>
        </Group>
        <Group title="Markets in the data">
          <Row>
            {['US', 'GB', 'DE', 'FR', 'BR', 'JP', 'CA', 'SE', 'ES', 'IT', 'MX'].map((code) => (
              <Flag key={code} code={code} size="medium" label={code} />
            ))}
          </Row>
        </Group>
      </GallerySection>

      <GallerySection id="dsp" title="DSP tile" note="Logos exported from the Figma prototype (Rules · DSPs). Unknown DSPs get a two-letter fallback.">
        <Row>
          {['Spotify', 'YouTube', 'Apple Music', 'Deezer', 'iTunes', 'Tidal', 'Amazon Music'].map((name) => (
            <DspTile key={name} name={name} />
          ))}
        </Row>
        <Group title="Sizes 24 / 32 / 40">
          <Row>
            <DspTile name="Spotify" size={24} />
            <DspTile name="Spotify" size={32} />
            <DspTile name="Spotify" size={40} />
          </Row>
        </Group>
      </GallerySection>

      <GallerySection id="delta" title="Delta" note="Value then arrow. No + or − sign. 14px text, 12px arrow, 4px gap.">
        <Row>
          <Delta value={5.8} />
          <Delta value={-3} />
          <Delta value={25.6} suffix="vs last week" />
          <Delta value={-5.4} variant="pill" />
          <Delta value={6} variant="pill" />
        </Row>
      </GallerySection>

      <GallerySection id="trend" title="Trend bars" note="7 bars, 2px wide on a 4px pitch, in a 32x16 box. Magnitude 0.3 / 0.6 / 1.">
        <Row>
          {[0.3, 0.6, 1].map((m, i) => (
            <TrendBars key={`u${m}`} direction="up" magnitude={m} seed={i + 1} />
          ))}
          {[0.3, 0.6, 1].map((m, i) => (
            <TrendBars key={`d${m}`} direction="down" magnitude={m} seed={i + 4} />
          ))}
        </Row>
      </GallerySection>

      <GallerySection
        id="area"
        title="Area chart"
        proposed
        note="Figma: Overall Roster Performance on the Explorer dashboard. Hover, or focus the chart and use the arrow keys, for the tooltip (proposed). Lines use chart-1 / chart-2 tokens."
      >
        <Row>
          <LegendPill label="Last 8 weeks" series={2} />
          <LegendPill label="This 8 weeks" series={1} />
        </Row>
        <div style={{ marginTop: 'var(--space-4)' }}>
          <AreaChart
            current={SERIES.current}
            previous={SERIES.previous}
            labels={WEEKS}
            currentName="This period"
            previousName="Previous"
            description="Saffron Ferry capped streams rose from 10.4M to 14.3M over 8 weeks, above the previous period."
          />
        </div>
      </GallerySection>

      <GallerySection id="share" title="Share bar">
        <Row>
          <ShareBar value={0.48} showLabel />
          <ShareBar value={0.24} showLabel />
          <ShareBar value={0.07} showLabel />
        </Row>
      </GallerySection>

      <GallerySection id="legend" title="Legend pill" note="Figma: design system Legend pill. Series 1–5 map to chart-1 to chart-5.">
        <Row>
          {([1, 2, 3, 4, 5] as const).map((s) => (
            <LegendPill key={s} label={`Series ${s}`} series={s} />
          ))}
        </Row>
      </GallerySection>

      <GallerySection id="card" title="Card" note="20px radius, 22px padding, card surface, 1px border. Header with icon tile, title, sub and actions.">
        <Card
          icon={ChartLine}
          title="Overall Roster Performance"
          subtitle="Capped Streams · All Markets"
          actions={<Delta value={-5.4} variant="pill" />}
        >
          Card body. Charts, lists and tables go here.
        </Card>
      </GallerySection>

      <GallerySection id="stat" title="Stat tile" note="Figma: design system Stat card. Hero (orange) is for the single most important number.">
        <div className={styles.tileGrid}>
          <StatTile variant="hero" label="Weekly streams, all markets" value="2.41bn" />
          <StatTile label="Capped streams · W42" value="14.31M" delta={5.8} />
          <StatTile label="Markets reporting" value="42" sub="all reporting" />
          <StatTile label="Open conflicts" value="0" delta={-2} />
        </div>
      </GallerySection>

      <GallerySection id="timeline" title="Timeline and conflict card" note="Figma: the sheet body on Data · Canonical + split.">
        <ConflictCard title="Licensor Challenge" state="In Progress" meta="Raised 14 Oct · Quillfern Records & Altamere">
          <strong>Quillfern Records</strong> claim Glass Orchard is in their repertoire in the UK. Currently awaiting answer from{' '}
          <strong>Altamere Music Group</strong>.
        </ConflictCard>
        <div style={{ marginTop: 'var(--space-6)' }}>
          <Timeline
            items={cast.canonicalDetail.r2.timeline.map((t, i) => ({ title: t.title, meta: t.meta, detail: t.lines[0], active: i < 2 }))}
          />
        </div>
      </GallerySection>

      <GallerySection
        id="table"
        stacked
        title="DataTable and split sheet"
        note="Figma: Data · Canonical (list) and Canonical + split. Click a column header to sort, click a row to open the sheet, Esc closes it. The table scrolls sideways inside the card."
      >
        <TableDemo />
      </GallerySection>

      <GallerySection id="table-states" title="DataTable: loading and empty" proposed>
        <Group title="Loading (6 skeleton rows)">
          <DataTable label="Loading example" columns={COLUMNS} rows={[]} rowKey={(r) => r.id} loading title="Loading results…" />
        </Group>
        <Group title="Empty">
          <DataTable label="Empty example" columns={COLUMNS} rows={[]} rowKey={(r) => r.id} title="Showing 0 results" onClearFilters={() => {}} />
        </Group>
      </GallerySection>
    </>
  );
}
