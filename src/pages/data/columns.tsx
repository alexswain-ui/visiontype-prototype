import { Repeat, TriangleAlert } from 'lucide-react';
import Artwork from '../../components/Artwork';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import type { Column } from '../../components/DataTable';
import { RangeNumber } from '../../components/RangeValue';
import EntityCell from '../../components/EntityCell';
import Flag from '../../components/Flag';
import ShareBar from '../../components/ShareBar';
import {
  marketLabel,
  songIdLabel,
  type ArtistRow,
  type CanonicalRow,
  type CountryRow,
  type SongRow,
  type Status,
} from '../../lib/dataPage';
import { artworkFor, photoFor } from '../../lib/media';
import { rangeScale } from '../../lib/series';
import type { WeekRange } from '../../lib/dates';
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

const capped = { key: 'capped', header: 'Capped streams', align: 'right' as const, pinned: true };

/** Same widths and order as the Figma "Vlad's POC" tables. Capped streams is pinned to the right edge when the table scrolls sideways. */
const id = (key: string, header: string, get: (row: never) => string, width = 120) => ({ key, header, width, sortValue: get, render: get });

const artistCell = (artist: { id: string; name: string }) => (
  <EntityCell media={<Avatar name={artist.name} src={photoFor(artist.id)} />} primary={artist.name} />
);

export const CANONICAL_COLUMNS: Column<CanonicalRow>[] = [
  { key: 'date', header: 'Date', width: 86, sortValue: (r) => r.date },
  { key: 'song', header: 'Song Name', width: 218, sortValue: (r) => r.song.title, render: songCell },
  { key: 'status', header: 'Status', width: 48, hideHeader: true, render: (r) => <StatusBadge status={r.status} /> },
  id('songId', 'Song ID', (r: CanonicalRow) => songIdLabel(r.song.id)),
  { key: 'artist', header: 'Artist Name', width: 175, sortValue: (r) => r.artist.name, render: (r) => artistCell(r.artist) },
  id('artistId', 'Artist ID', (r: CanonicalRow) => r.artist.artistId),
  { key: 'licensor', header: 'Licensor', width: 143, sortValue: (r) => r.licensor },
  { key: 'label', header: 'Label', width: 139, sortValue: (r) => r.label },
  {
    key: 'market',
    header: 'Country',
    width: 100,
    sortValue: (r) => marketLabel(r.market),
    render: (r) => (
      <span className={styles.market}>
        <Flag code={r.market} />
        {marketLabel(r.market)}
      </span>
    ),
  },
  { key: 'distributor', header: 'Distributor', width: 152, sortValue: (r) => r.distributor },
  { ...capped, width: 135, sortValue: (r) => r.capped, render: (r) => <RangeNumber base={r.capped} entity={`song:${r.song.id}`} /> },
] as Column<CanonicalRow>[];

export const SONG_COLUMNS: Column<SongRow>[] = [
  { key: 'song', header: 'Song Title', width: 240, sortValue: (r) => r.song.title, render: songCell },
  { key: 'status', header: 'Status', width: 48, hideHeader: true, render: (r) => <StatusBadge status={r.song.status as Status} /> },
  { key: 'artist', header: 'Artist', width: 175, sortValue: (r) => r.artist.name, render: (r) => r.artist.name },
  id('songId', 'Song ID', (r: SongRow) => songIdLabel(r.song.id)),
  id('artistId', 'Artist ID', (r: SongRow) => r.artist.artistId),
  { key: 'licensor', header: 'Licensor', width: 160, sortValue: (r) => r.licensor },
  { key: 'label', header: 'Label', width: 140, sortValue: (r) => r.label },
  { key: 'distributor', header: 'Distributor', width: 160, sortValue: (r) => r.distributor },
  { ...capped, width: 142, sortValue: (r) => r.song.capped, render: (r) => <RangeNumber base={r.song.capped} entity={`song:${r.song.id}`} /> },
] as Column<SongRow>[];

export const ARTIST_COLUMNS: Column<ArtistRow>[] = [
  id('artistId', 'Artist ID', (r: ArtistRow) => r.artist.artistId, 130),
  { key: 'artist', header: 'Artist', width: 228, sortValue: (r) => r.artist.name, render: (r) => artistCell(r.artist) },
  { key: 'licensor', header: 'Licensor', width: 180, sortValue: (r) => r.licensor },
  { key: 'label', header: 'Label', width: 160, sortValue: (r) => r.label },
  { key: 'distributor', header: 'Distributor', width: 180, sortValue: (r) => r.distributor },
  { key: 'songs', header: 'Songs', width: 80, sortValue: (r) => r.artist.songs, render: (r) => r.artist.songs },
  { ...capped, width: 142, sortValue: (r) => r.artist.capped, render: (r) => <RangeNumber base={r.artist.capped} entity={`artist:${r.artist.id}`} /> },
] as Column<ArtistRow>[];

export const COUNTRY_COLUMNS: Column<CountryRow>[] = [
  {
    key: 'country',
    header: 'Country',
    width: 300,
    sortValue: (r) => r.market.name,
    render: (r) => <EntityCell media={<Flag code={r.market.iso} size="medium" />} primary={r.market.name} />,
  },
  { key: 'code', header: 'Country Code', width: 160, sortValue: (r) => r.market.short, render: (r) => r.market.short },
  { key: 'share', header: 'Share', width: 200, sortValue: (r) => r.market.share, render: (r) => <ShareBar value={r.market.share} width={90} /> },
  { ...capped, width: 142, sortValue: (r) => r.market.capped, render: (r) => <RangeNumber base={r.market.capped} entity={`country:${r.market.iso}`} /> },
] as Column<CountryRow>[];

/** Which entity a row's numbers belong to, and its latest-week capped streams, per tab. */
const ROW_ENTITY: Record<string, { entity: (row: never) => string; capped: (row: never) => number; delta?: (row: never) => number }> = {
  canonical: { entity: (r: CanonicalRow) => `song:${r.song.id}`, capped: (r: CanonicalRow) => r.capped },
  songs: { entity: (r: SongRow) => `song:${r.song.id}`, capped: (r: SongRow) => r.song.capped },
  artists: { entity: (r: ArtistRow) => `artist:${r.artist.id}`, capped: (r: ArtistRow) => r.artist.capped },
  countries: { entity: (r: CountryRow) => `country:${r.market.iso}`, capped: (r: CountryRow) => r.market.capped },
};

/**
 * The columns with sorting that matches what is shown for the selected range. (The tables no longer have a
 * weekly-change column, so only the Capped streams sorting needs the range.)
 */
export function withRange<Row>(tab: keyof typeof ROW_ENTITY, columns: Column<Row>[], range: WeekRange): Column<Row>[] {
  const rows = ROW_ENTITY[tab];
  return columns.map((column) =>
    column.key === 'capped' ? { ...column, sortValue: (r: Row) => rows.capped(r as never) * rangeScale(rows.entity(r as never), range) } : column,
  );
}
