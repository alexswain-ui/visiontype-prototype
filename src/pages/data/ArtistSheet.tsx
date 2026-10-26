import { ArrowUpRight, LayoutDashboard } from 'lucide-react';
import Artwork from '../../components/Artwork';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import SectionLabel from '../../components/SectionLabel';
import SelectButton from '../../components/SelectButton';
import SheetTable from '../../components/SheetTable';
import SplitSheet from '../../components/SplitSheet';
import TrendCard from '../../components/TrendCard';
import { artistSheet, formatCompact, formatNumber, WEEK_LABELS, type ArtistRow } from '../../lib/dataPage';
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
  return (
    <SplitSheet
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
          Last 4 weeks
        </SelectButton>
      </div>
      <TrendCard
        label="Streams · all markets"
        value={formatCompact(artist.capped, 1)}
        delta={artist.delta}
        series={sheet.trend}
        labels={WEEK_LABELS}
        description={`${artist.name} capped streams over the last 8 weeks, ending at ${formatCompact(artist.capped, 1)}.`}
      />
      <section className={styles.group}>
        <SectionLabel label={`Songs · ${artist.songs}`} meta="Sorted by streams" />
        <SheetTable
          label={`${artist.name}, songs`}
          rows={sheet.songs}
          rowKey={(s) => s.id}
          rowHeight={40}
          columns={[
            {
              key: 'song',
              header: 'Song',
              render: (s) => (
                <span className={styles.cell}>
                  <Artwork title={s.title} src={artworkFor(s.id, sheet.songs.indexOf(s))} size={28} />
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
