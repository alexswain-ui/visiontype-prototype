import type { ReactNode } from 'react';
import {
  BadgeAlert,
  Bookmark,
  ChartColumn,
  ChartLine,
  ChartNoAxesColumnIncreasing,
  Clock,
  DiscAlbum,
  File,
  FileChartLine,
  Globe,
  List,
  MicVocal,
  Music,
  OctagonAlert,
  Repeat,
  Star,
  TableProperties,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import AreaChart from '../../components/AreaChart';
import Avatar from '../../components/Avatar';
import CardLink from '../../components/CardLink';
import DataTable, { type Column } from '../../components/DataTable';
import Delta from '../../components/Delta';
import ListTile from '../../components/ListTile';
import SelectButton from '../../components/SelectButton';
import TrendBars from '../../components/TrendBars';
import RankedList from '../../components/RankedList';
import WidgetCard from '../../components/WidgetCard';
import dashboard from '../../data/dashboard.json';
import { MORE_PHOTOS } from '../../lib/artistPhotos';
import { photoFor } from '../../lib/media';
import { artistById, cast, type Artist } from '../../lib/data';
import { customWidgetRows, rangeText, readCustomWidget } from './WidgetBuilder';
import styles from './Dashboard.module.css';

/** What a widget needs from the page: where to go, and the "Not part of this prototype" dialog. */
export interface WidgetContext {
  go: (to: string) => void;
  notInPrototype: (feature: string) => void;
}

interface WidgetDefinition {
  title: string;
  render: (ctx: WidgetContext) => ReactNode;
}

/** Raw stream counts as "18.41M" (Figma uses two decimals, e.g. "542.14K"). */
const formatStreams = (value: number) => `${(value / 1_000_000).toFixed(2)}M`;

interface RosterRow {
  rank: number;
  artist: Artist;
  lastWeek: number;
  thisWeek: number;
}

const rosterRows: RosterRow[] = dashboard.roster.artistIds.flatMap((id, i) => {
  const artist = artistById(id);
  if (!artist) return [];
  return [{ rank: i + 1, artist, thisWeek: artist.capped, lastWeek: Math.round(artist.capped / (1 + artist.delta / 100)) }];
});

const rosterColumns: Column<RosterRow>[] = [
  {
    key: 'artist',
    header: 'Artist',
    render: (row) => (
      <span className={styles.artistCell}>
        <span className={styles.rank}>{row.rank}.</span>
        <Avatar name={row.artist.name} src={photoFor(row.artist.id)} size={32} />
        <span className={styles.artistName}>{row.artist.name}</span>
      </span>
    ),
  },
  { key: 'lastWeek', header: 'Last Week', align: 'right', width: 88, render: (row) => <span className={styles.muted}>{formatStreams(row.lastWeek)}</span> },
  { key: 'thisWeek', header: 'This Week', align: 'right', width: 88, render: (row) => formatStreams(row.thisWeek) },
  { key: 'change', header: 'Change', align: 'right', width: 81, render: (row) => <Delta value={row.artist.delta} /> },
  {
    key: 'trend',
    header: 'Trend',
    align: 'right',
    width: 54,
    render: (row) => (
      <TrendBars direction={row.artist.delta >= 0 ? 'up' : 'down'} magnitude={Math.min(1, 0.4 + Math.abs(row.artist.delta) / 10)} seed={row.rank} />
    ),
  },
];

function legendLabel(label: string, series: 'current' | 'previous') {
  return (
    <span className={styles.legendLabel}>
      <span className={series === 'current' ? styles.dotCurrent : styles.dotPrevious} aria-hidden="true" />
      {label}
    </span>
  );
}

const TONE_ICON: Record<string, LucideIcon> = { info: Repeat, warning: TriangleAlert, destructive: OctagonAlert };

const songName = (id: string) => cast.songs.find((s) => s.id === id)?.title ?? id;

/** Every widget that can sit on Maya's dashboard. Keys are the ids stored in the layout. */
export const WIDGETS: Record<string, WidgetDefinition> = {
  overall: {
    title: dashboard.overall.title,
    render: ({ notInPrototype }) => (
      <WidgetCard title={dashboard.overall.title} subtitle={dashboard.overall.subtitle} icon={ChartLine} variant="tile">
        <div className={styles.chartTools}>
          <div className={styles.legend}>
            {/* Figma colours last week orange and this week blue on this card. */}
            <SelectButton onClick={() => notInPrototype('Choosing the comparison period')}>{legendLabel('Last Week', 'current')}</SelectButton>
            <SelectButton onClick={() => notInPrototype('Choosing the comparison period')}>{legendLabel('This Week', 'previous')}</SelectButton>
          </div>
          <Delta value={dashboard.overall.delta} variant="pill" />
        </div>
        <AreaChart
          current={dashboard.overall.lastWeek}
          previous={dashboard.overall.thisWeek}
          labels={dashboard.overall.labels}
          currentName="Last week"
          previousName="This week"
          height={290}
          description={`Capped streams per day for the whole catalogue. This week is down ${Math.abs(dashboard.overall.delta)}% on last week.`}
        />
      </WidgetCard>
    ),
  },

  roster: {
    title: dashboard.roster.title,
    render: ({ go, notInPrototype }) => (
      <WidgetCard
        title={dashboard.roster.title}
        subtitle={dashboard.roster.subtitle}
        icon={ChartNoAxesColumnIncreasing}
        variant="tile"
        flush
        className={styles.roster}
        action={
          <SelectButton icon={MicVocal} onClick={() => notInPrototype('Switching the catalogue to songs or labels')}>
            Artists
          </SelectButton>
        }
        footer={
          <>
            <span className={styles.more}>
              <span className={styles.faces} aria-hidden="true">
                {MORE_PHOTOS.map((src) => (
                  <img key={src} src={src} alt="" className={styles.face} />
                ))}
              </span>
              +{dashboard.roster.moreCount} more
            </span>
            <CardLink label="See All" to="/data/artists" ariaLabel="See all catalogue artists in Data" />
          </>
        }
      >
        <DataTable
          label="Catalogue performance this week"
          columns={rosterColumns}
          rows={rosterRows}
          rowKey={(row) => row.artist.id}
          onRowClick={(row) => go(`/artist/${row.artist.id}`)}
        />
      </WidgetCard>
    ),
  },

  'saved-searches': {
    title: 'Saved Searches',
    render: ({ notInPrototype }) => (
      <WidgetCard title="Saved Searches" icon={Star} action={<CardLink label="See All" ariaLabel="See all saved searches" onClick={() => notInPrototype('Saved searches')} />}>
        <div className={styles.tiles}>
          {dashboard.savedSearches.map((search) => (
            <ListTile key={search.id} label={search.name} meta={search.date} onClick={() => notInPrototype('Saved searches')} />
          ))}
        </div>
      </WidgetCard>
    ),
  },

  reports: {
    title: 'Reports',
    render: ({ notInPrototype }) => (
      <WidgetCard title="Reports" icon={FileChartLine} action={<CardLink label="See All" ariaLabel="See all reports" onClick={() => notInPrototype('Reports')} />}>
        <div className={styles.tiles}>
          {dashboard.reports.map((report) => (
            <ListTile
              key={report.id}
              label={report.name}
              icon={report.kind === 'sheet' ? TableProperties : File}
              meta={report.date}
              onClick={() => notInPrototype('Reports')}
            />
          ))}
        </div>
      </WidgetCard>
    ),
  },

  attention: {
    title: 'Requires Attention',
    render: ({ notInPrototype }) => (
      <WidgetCard title="Requires Attention" icon={BadgeAlert} action={<CardLink label="See All" ariaLabel="See all issues" onClick={() => notInPrototype('Issues')} />}>
        <div className={styles.tiles}>
          {dashboard.attention.map((item) => (
            <ListTile
              key={item.id}
              label={item.text}
              icon={TONE_ICON[item.tone]}
              tone={item.tone as 'info' | 'warning' | 'destructive'}
              trailing={<CardLink label="View" ariaLabel={`View ${item.text}`} onClick={() => notInPrototype('Issues')} />}
            />
          ))}
        </div>
      </WidgetCard>
    ),
  },

  custom: {
    title: 'Custom widget',
    render: ({ go }) => {
      const config = readCustomWidget();
      return (
        <WidgetCard title={config.title} subtitle={rangeText(config.range)} icon={List} flush>
          <RankedList rows={customWidgetRows(config)} label={config.title} onRowClick={(row) => go(`/song/${row.id}`)} />
        </WidgetCard>
      );
    },
  },

  // Gallery widgets (not designed as dashboard cards: simple proposals built from the same data).
  'market-share': {
    title: 'Market share by DSP',
    render: () => (
      <WidgetCard title="Market share by DSP" subtitle="Share of streams by platform · GB" icon={ChartColumn}>
        <div className={styles.tiles}>
          {cast.dspSplit['country:GB'].map(([dsp, , share]) => (
            <ListTile key={String(dsp)} label={String(dsp)} meta={`${Math.round(Number(share) * 100)}%`} />
          ))}
        </div>
      </WidgetCard>
    ),
  },

  'top-tracks': {
    title: 'Top tracks',
    render: ({ go }) => (
      <WidgetCard title="Top tracks" subtitle="Ranked tracks, week on week" icon={Music}>
        <div className={styles.tiles}>
          {cast.songs.slice(0, 4).map((song, i) => (
            <ListTile key={song.id} label={`${i + 1}. ${song.title}`} meta={formatStreams(song.capped)} onClick={() => go(`/song/${song.id}`)} />
          ))}
        </div>
      </WidgetCard>
    ),
  },

  'dsp-status': {
    title: 'DSP reporting status',
    render: () => (
      <WidgetCard title="DSP reporting status" subtitle="Which DSPs have delivered this week" icon={Clock}>
        <div className={styles.tiles}>
          {cast.weeks.slice(0, 3).map((week) => (
            <ListTile
              key={week.w}
              label={`${week.w} · ${week.published}`}
              meta={`${week.reported} of ${cast.week.dspsReported.total} DSPs`}
              tone={week.note ? 'info' : 'neutral'}
            />
          ))}
        </div>
      </WidgetCard>
    ),
  },

  'new-releases': {
    title: 'New releases',
    render: ({ go }) => (
      <WidgetCard title="New releases" subtitle="First-week performance of new releases" icon={DiscAlbum}>
        <div className={styles.tiles}>
          {['golden-hour-drive', 'low-tide', 'harmony-of-hearts'].map((id) => {
            const song = cast.songs.find((s) => s.id === id);
            return song ? <ListTile key={id} label={songName(id)} meta={formatStreams(song.capped)} onClick={() => go(`/song/${id}`)} /> : null;
          })}
        </div>
      </WidgetCard>
    ),
  },
};

/** Icons for the gallery drawer thumbnails. */
export const GALLERY_ICONS: Record<string, LucideIcon> = {
  'chart-column': ChartColumn,
  music: Music,
  clock: Clock,
  'disc-album': DiscAlbum,
  bookmark: Bookmark,
  globe: Globe,
};
