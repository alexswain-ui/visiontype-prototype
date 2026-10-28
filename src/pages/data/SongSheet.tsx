import { ArrowUpRight, LayoutDashboard } from 'lucide-react';
import Artwork from '../../components/Artwork';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Flag from '../../components/Flag';
import SectionLabel from '../../components/SectionLabel';
import SheetStat from '../../components/SheetStat';
import SheetTable from '../../components/SheetTable';
import FollowButton from '../../components/FollowButton';
import SplitSheet from '../../components/SplitSheet';
import { formatCompact, formatNumber, marketInfo, songSheet, type SongRow } from '../../lib/dataPage';
import { useDateRange } from '../../lib/dateRange';
import { useRangeName, useRangeStats } from '../../lib/useRangeStats';
import { artworkFor } from '../../lib/media';
import { useToast } from '../../lib/toast';
import styles from './sheets.module.css';

interface Props {
  row: SongRow;
  onClose: () => void;
  onOpenPage: () => void;
}

/** Song sheet (Figma 512:4213): KPIs and performance by market. */
export default function SongSheet({ row, onClose, onOpenPage }: Props) {
  const toast = useToast();
  const { song, artist } = row;
  const sheet = songSheet(song);
  const stats = useRangeStats(`song:${song.id}`);
  const rangeName = useRangeName();
  const { mode } = useDateRange();
  const kpis = [
    { ...sheet.kpis[0], value: formatCompact(stats.scaled(sheet.base.total)), delta: stats.delta(sheet.base.totalDelta) },
    sheet.kpis[1],
    { ...sheet.kpis[2], value: formatCompact(stats.scaled(sheet.base.capped)), delta: stats.delta(sheet.base.cappedDelta) },
  ];
  const markets = sheet.markets.map((m) => ({ ...m, streams: Math.round(stats.scaled(m.streams)), capped: Math.round(stats.scaled(m.capped)) }));
  return (
    <SplitSheet
      headerAction={<FollowButton kind="song" id={song.id} size="small" />}
      title={song.title}
      subtitle={`${artist.name} · ${song.isrc}`}
      media={<Artwork title={song.title} src={artworkFor(song.id, song.art)} size={56} />}
      chips={
        <>
          <Badge label={row.label} size="small" />
          <Badge label={`${song.markets} markets`} size="small" />
        </>
      }
      onClose={onClose}
      onExpand={onOpenPage}
      footer={
        <>
          <Button variant="primary" trailingIcon={ArrowUpRight} onClick={onOpenPage}>
            Open song page
          </Button>
          <Button onClick={() => toast('Added to dashboard', LayoutDashboard)}>Add to dashboard</Button>
        </>
      }
    >
      <div className={styles.kpis}>
        {kpis.map((k) => (
          <SheetStat key={k.label} {...k} deltaSuffix={mode === 'week' ? 'wk' : 'vs prev.'} />
        ))}
      </div>
      <section className={styles.group}>
        <SectionLabel label="Performance by market" meta={rangeName} />
        <SheetTable
          label={`${song.title}, performance by market`}
          rows={markets}
          rowKey={(m) => m.market}
          columns={[
            {
              key: 'market',
              header: 'Market',
              render: (m) => (
                <span className={styles.cell}>
                  <Flag code={m.market} />
                  <span className={styles.cellText}>{marketInfo(m.market)?.name}</span>
                </span>
              ),
            },
            { key: 'streams', header: 'Streams', align: 'right', width: 90, tone: 'strong', render: (m) => formatNumber(m.streams) },
            { key: 'capped', header: 'Capped', align: 'right', width: 90, tone: 'muted', render: (m) => formatNumber(m.capped) },
          ]}
          moreLabel={sheet.moreMarkets > 0 ? `+ ${sheet.moreMarkets} more markets` : undefined}
          onMore={onOpenPage}
        />
      </section>
    </SplitSheet>
  );
}
