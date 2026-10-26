import { Repeat, TriangleAlert } from 'lucide-react';
import Artwork from '../../components/Artwork';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import type { Column } from '../../components/DataTable';
import Delta from '../../components/Delta';
import EntityCell from '../../components/EntityCell';
import Flag from '../../components/Flag';
import ShareBar from '../../components/ShareBar';
import {
  formatNumber,
  marketLabel,
  type ArtistRow,
  type CanonicalRow,
  type CountryRow,
  type SongRow,
  type Status,
} from '../../lib/dataPage';
import { artworkFor, photoFor } from '../../lib/media';
import styles from './DataPage.module.css';

/* Column widths are the Figma cell widths (Data · Canonical, Song, Artist, Country frames), plus the 22px card padding on the first and last column. */

function StatusBadge({ status }: { status: Status }) {
  if (status === 'conflict') return <Badge tone="amber" label="Conflict" icon={TriangleAlert} iconOnly />;
  if (status === 'restated') return <Badge tone="orange" label="Restated" icon={Repeat} iconOnly />;
  return null;
}

const songCell = (row: { song: SongRow['song'] }) => (
  <EntityCell
    media={<Artwork title={row.song.title} src={artworkFor(row.song.id, row.song.art)} />}
    primary={row.song.title}
    secondary={row.song.isrc}
  />
);

const capped = { key: 'capped', header: 'Capped streams', align: 'right' as const };

export const CANONICAL_COLUMNS: Column<CanonicalRow>[] = [
  { key: 'date', header: 'Date', width: 86, sortValue: (r) => r.date },
  { key: 'song', header: 'Song', width: 218, sortValue: (r) => r.song.title, render: songCell },
  { key: 'status', header: 'Status', width: 48, hideHeader: true, render: (r) => <StatusBadge status={r.status} /> },
  {
    key: 'artist',
    header: 'Artist',
    width: 175,
    sortValue: (r) => r.artist.name,
    render: (r) => <EntityCell media={<Avatar name={r.artist.name} src={photoFor(r.artist.id)} />} primary={r.artist.name} />,
  },
  { key: 'licensor', header: 'Licensor', width: 143, sortValue: (r) => r.licensor },
  { key: 'label', header: 'Label', width: 139, sortValue: (r) => r.label },
  { key: 'distributor', header: 'Distributor', width: 152, sortValue: (r) => r.distributor },
  {
    key: 'market',
    header: 'Market',
    width: 64,
    sortValue: (r) => marketLabel(r.market),
    render: (r) => (
      <span className={styles.market}>
        <Flag code={r.market} />
        {marketLabel(r.market)}
      </span>
    ),
  },
  { ...capped, width: 135, sortValue: (r) => r.capped, render: (r) => formatNumber(r.capped) },
];

export const SONG_COLUMNS: Column<SongRow>[] = [
  { key: 'song', header: 'Song', width: 240, sortValue: (r) => r.song.title, render: songCell },
  { key: 'status', header: 'Status', width: 48, hideHeader: true, render: (r) => <StatusBadge status={r.song.status as Status} /> },
  { key: 'artist', header: 'Artist', width: 175, sortValue: (r) => r.artist.name, render: (r) => r.artist.name },
  { key: 'markets', header: 'Markets', width: 76, sortValue: (r) => r.song.markets, render: (r) => r.song.markets },
  { ...capped, width: 142, sortValue: (r) => r.song.capped, render: (r) => formatNumber(r.song.capped) },
];

export const ARTIST_COLUMNS: Column<ArtistRow>[] = [
  {
    key: 'artist',
    header: 'Artist',
    width: 260,
    sortValue: (r) => r.artist.name,
    render: (r) => (
      <EntityCell
        media={<Avatar name={r.artist.name} src={photoFor(r.artist.id)} />}
        primary={r.artist.name}
        secondary={r.artist.artistId}
      />
    ),
  },
  { key: 'label', header: 'Label', width: 140, sortValue: (r) => r.label },
  { key: 'songs', header: 'Songs', width: 64, sortValue: (r) => r.artist.songs, render: (r) => r.artist.songs },
  { key: 'delta', header: 'Δ wk', width: 70, sortValue: (r) => r.artist.delta, render: (r) => <Delta value={r.artist.delta} /> },
  { ...capped, width: 142, sortValue: (r) => r.artist.capped, render: (r) => formatNumber(r.artist.capped) },
];

export const COUNTRY_COLUMNS: Column<CountryRow>[] = [
  {
    key: 'country',
    header: 'Country',
    width: 242,
    sortValue: (r) => r.market.name,
    render: (r) => <EntityCell media={<Flag code={r.market.iso} size="medium" />} primary={r.market.name} />,
  },
  { key: 'code', header: 'Code', width: 70, sortValue: (r) => r.market.short, render: (r) => r.market.short },
  { key: 'delta', header: 'Δ wk', width: 80, sortValue: (r) => r.market.delta, render: (r) => <Delta value={r.market.delta} /> },
  { key: 'share', header: 'Share', width: 110, sortValue: (r) => r.market.share, render: (r) => <ShareBar value={r.market.share} width={90} /> },
  { ...capped, width: 142, sortValue: (r) => r.market.capped, render: (r) => formatNumber(r.market.capped) },
];
