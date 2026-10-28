import { ArrowUpRight, LayoutDashboard } from 'lucide-react';
import Artwork from '../../components/Artwork';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import SectionLabel from '../../components/SectionLabel';
import SelectButton from '../../components/SelectButton';
import SheetTable from '../../components/SheetTable';
import FollowButton from '../../components/FollowButton';
import SplitSheet from '../../components/SplitSheet';
import TrendCard from '../../components/TrendCard';
import { artistSheet, formatCompact, formatNumber, type ArtistRow } from '../../lib/dataPage';
import { useDateRange } from '../../lib/dateRange';
import { rangeTrend, useRangeName, useRangeStats } from '../../lib/useRangeStats';
import { artworkFor, photoFor } from '../../lib/media';
import { useNotInPrototype } from '../../lib/notInPrototype';
import { useToast } from '../../lib/toast';
import styles from './sheets.module.css';

interface Props {
  row: ArtistRow;
  onClose: () => void;
  onOpenPage: () => void;
}

/** Artist sheet (Figma 512:5052): sheet filters, trend, songs table. */
export default function ArtistSheet({ row, onClose, onOpenPage }: Props) {
  const toast = useToast();
  const notInPrototype = useNotInPrototype();
  const { artist } = row;
  const sheet = artistSheet(artist);
  const key = `artist:${artist.id}`;
  const stats = useRangeStats(key);
  const { range } = useDateRange();
  const rangeName = useRangeName();
  const trend = rangeTrend(key, range);
  const total = stats.scaled(artist.capped);
  const songs = sheet.songs.map((s) => ({ ...s, capped: Math.round(stats.scaled(s.capped)) }));
  return (
    <SplitSheet
      headerAction={<FollowButton kind="artist" id={artist.id} size="small" />}
      title={artist.name}
      subtitle={`${row.licensor} · ${row.label}`}
      media={<Avatar name={artist.name} src={photoFor(artist.id)} size={56} />}
      chips={
        <>
          <Badge label={artist.artistId} size="small" />
          <Badge label={`${artist.songs} songs`} size="small" />
        </>
      }
      onClose={onClose}
      onExpand={onOpenPage}
      footer={
        <>
          <Button variant="primary" trailingIcon={ArrowUpRight} onClick={onOpenPage}>
            Open artist page
          </Button>
          <Button onClick={() => toast('Added to dashboard', LayoutDashboard)}>Add to dashboard</Button>
        </>
      }
    >
      <div className={styles.filters}>
        <SelectButton size="small" onClick={() => notInPrototype('Filtering the sheet by market')}>
          Markets: All
        </SelectButton>
        <SelectButton size="small" onClick={() => notInPrototype('Changing the sheet period')}>
          {rangeName}
        </SelectButton>
      </div>
      <TrendCard
        label="Streams · all markets"
        value={formatCompact(total, 1)}
        delta={stats.delta(artist.delta)}
        series={trend.values}
        labels={trend.labels}
        description={`${artist.name} capped streams for ${rangeName}, ${formatCompact(total, 1)} in total.`}
      />
      <section className={styles.group}>
        <SectionLabel label={`Songs · ${artist.songs}`} meta="Sorted by streams" />
        <SheetTable
          label={`${artist.name}, songs`}
          rows={songs}
          rowKey={(s) => s.id}
          rowHeight={40}
          columns={[
            {
              key: 'song',
              header: 'Song',
              render: (s) => (
                <span className={styles.cell}>
                  <Artwork title={s.title} src={artworkFor(s.id, songs.indexOf(s))} size={28} />
                  <span className={styles.cellText}>{s.title}</span>
                </span>
              ),
            },
            { key: 'streams', header: 'Streams', align: 'right', width: 100, tone: 'strong', render: (s) => formatNumber(s.capped) },
          ]}
          moreLabel={sheet.moreSongs > 0 ? `+ ${sheet.moreSongs} more songs` : undefined}
          onMore={onOpenPage}
        />
      </section>
    </SplitSheet>
  );
}
