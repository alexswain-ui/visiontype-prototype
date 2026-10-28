import type { ReactNode } from 'react';
import { Repeat, SearchX, Settings2, TriangleAlert } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Badge from '../components/Badge';
import Breadcrumbs from '../components/Breadcrumbs';
import Button from '../components/Button';
import CardTable, { type CardColumn } from '../components/CardTable';
import Chip from '../components/Chip';
import DateRangePicker from '../components/DateRangePicker';
import Delta from '../components/Delta';
import EmptyState from '../components/EmptyState';
import EntityHeader, { HeaderArtwork, HeaderFlag, HeaderPhoto } from '../components/EntityHeader';
import Flag from '../components/Flag';
import LabelShareList from '../components/LabelShareList';
import MarketBarList from '../components/MarketBarList';
import TopTenList from '../components/TopTenList';
import RightsCard from '../components/RightsCard';
import SectionCard from '../components/SectionCard';
import ShareBar from '../components/ShareBar';
import Artwork from '../components/Artwork';
import Timeline from '../components/Timeline';
import TopBar from '../components/TopBar';
import TrendBars from '../components/TrendBars';
import StreamsTrendCard from '../components/StreamsTrendCard';
import WeeklyTrendCard from '../components/WeeklyTrendCard';
import { cast } from '../lib/data';
import { useDateRange } from '../lib/dateRange';
import { rangedView } from '../lib/rangeViews';
import { useRangeName } from '../lib/useRangeStats';
import {
  artistView,
  countryView,
  FULL_EXAMPLE,
  millions,
  songView,
  type ArtistSongRow,
  type EntityKind,
  type EntityView,
  type LabelRow,
  type MarketRow,
} from '../lib/entities';
import { useNotInPrototype } from '../lib/notInPrototype';
import { useUser } from '../lib/user';
import styles from './EntityPage.module.css';

/** Breadcrumb "list tab" for each page: Data > Song / Artist / Country. */
const LIST_TAB: Record<EntityKind, { label: string; to: string; noun: string }> = {
  song: { label: 'Song', to: '/data/songs', noun: 'song' },
  artist: { label: 'Artist', to: '/data/artists', noun: 'artist' },
  country: { label: 'Country', to: '/data/countries', noun: 'country' },
};

const FULL_PATH: Record<EntityKind, string> = {
  song: `/song/${FULL_EXAMPLE.song.id}`,
  artist: `/artist/${FULL_EXAMPLE.artist.id}`,
  country: `/country/${FULL_EXAMPLE.country.id}`,
};

const trendMagnitude = (delta: number) => Math.min(1, 0.35 + Math.abs(delta) / 15);
const percent = (share: number) => `${+(share * 100).toFixed(share < 0.1 ? 1 : 0)}%`;

/** Empty state for detail cards that are only populated on the full example. */
function NotPopulated({ kind }: { kind: EntityKind }) {
  return (
    <EmptyState title="Not populated in this prototype">
      <p>
        This breakdown is only filled in for <Link to={FULL_PATH[kind]}>{FULL_EXAMPLE[kind].name}</Link>.
      </p>
    </EmptyState>
  );
}

/* Columns ---------------------------------------------------------------- */

const MARKET_COLUMNS: CardColumn<MarketRow>[] = [
  {
    key: 'market',
    header: 'Market',
    width: 312,
    tone: 'strong',
    sortValue: (r) => r.name,
    render: (r) => (
      <span className={styles.withIcon}>
        <Flag code={r.code} />
        <Link to={`/country/${r.code}`} className={styles.rowLink}>
          {r.name}
        </Link>
      </span>
    ),
  },
  {
    key: 'share',
    header: 'Share of total',
    width: 300,
    render: (r) => (
      <span className={styles.share}>
        <ShareBar value={r.share} width={200} />
        {percent(r.share)}
      </span>
    ),
  },
  { key: 'capped', header: 'Capped streams', width: 150, align: 'right', tone: 'numeric', sortValue: (r) => r.capped, render: (r) => r.capped.toLocaleString('en-GB') },
  { key: 'delta', header: 'Δ wk', width: 90, align: 'right', sortValue: (r) => r.delta, render: (r) => <Delta value={r.delta} /> },
  {
    key: 'trend',
    header: 'Trend',
    width: 60,
    render: (r) => <TrendBars values={r.bars} direction={r.delta >= 0 ? 'up' : 'down'} magnitude={trendMagnitude(r.delta)} seed={r.capped % 97} />,
  },
];

const SONG_COLUMNS: CardColumn<ArtistSongRow>[] = [
  {
    key: 'song',
    header: 'Song',
    tone: 'strong',
    sortValue: (r) => r.title,
    render: (r) => (
      <span className={styles.withIcon}>
        <Artwork title={r.title} src={r.art} seed={r.seed} />
        <span className={styles.twoLine}>
          {r.id ? (
            <Link to={`/song/${r.id}`} className={styles.rowLink}>
              {r.title}
            </Link>
          ) : (
            <span>{r.title}</span>
          )}
          <span className={styles.subLine}>{r.isrc}</span>
        </span>
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    width: 56,
    hideHeader: true,
    render: (r) =>
      r.status === 'restated' ? (
        <Badge label="Restated" tone="orange" icon={Repeat} iconOnly />
      ) : r.status === 'conflict' ? (
        <Badge label="Conflict" tone="amber" icon={TriangleAlert} iconOnly />
      ) : null,
  },
  { key: 'label', header: 'Label', width: 300, sortValue: (r) => r.label, render: (r) => r.label },
  { key: 'markets', header: 'Markets', width: 90, align: 'right', sortValue: (r) => r.markets, render: (r) => r.markets },
  { key: 'capped', header: 'Capped streams', width: 150, align: 'right', tone: 'numeric', sortValue: (r) => r.capped, render: (r) => r.capped.toLocaleString('en-GB') },
  { key: 'delta', header: 'Δ wk', width: 90, align: 'right', sortValue: (r) => r.delta, render: (r) => <Delta value={r.delta} /> },
  {
    key: 'trend',
    header: 'Trend',
    width: 60,
    render: (r) => <TrendBars values={r.bars} direction={r.delta >= 0 ? 'up' : 'down'} magnitude={trendMagnitude(r.delta)} seed={r.capped % 97} />,
  },
];

const LABEL_COLUMNS: CardColumn<LabelRow>[] = [
  { key: 'label', header: 'Label', width: 260, tone: 'strong', render: (r) => r.label },
  { key: 'distributor', header: 'Distributor', width: 260, render: (r) => r.distributor },
  { key: 'songs', header: 'Songs', width: 100, render: (r) => r.songs },
  {
    key: 'share',
    header: 'Share',
    width: 216,
    render: (r) => (
      <span className={styles.share}>
        <ShareBar value={r.share} width={120} />
        {percent(r.share)}
      </span>
    ),
  },
  { key: 'capped', header: 'Capped streams', align: 'right', tone: 'numeric', sortValue: (r) => r.share, render: (r) => r.capped },
];

/* Sections --------------------------------------------------------------- */

function TrendRow({ view, side }: { view: EntityView; side?: ReactNode }) {
  const { trend } = view;
  const total = trend.current.reduce((a, b) => a + b, 0);
  const description = `${view.title}: capped streams from ${trend.labels[0]} to ${trend.labels[trend.labels.length - 1]}, ${millions(total * 1e6)} in total${trend.compare ? `, compared with ${trend.previousName?.toLowerCase()}` : ''}.`;
  return (
    <div className={side ? styles.trendRow : undefined}>
      <StreamsTrendCard
        title={trend.title}
        current={trend.current}
        previous={trend.compare ? trend.previous : []}
        previousName={trend.previousName}
        dashedPrevious
        labels={trend.labels}
        description={description}
      />
      {side}
    </div>
  );
}

function TopMarketsCard({ kind, items }: { kind: EntityKind; items: { code: string; name: string; value: number }[] | null }) {
  const max = items ? Math.max(...items.map((i) => i.value)) : 1;
  const rangeName = useRangeName();
  return (
    <SectionCard title="Top markets" meta={rangeName}>
      {items ? (
        <MarketBarList items={items.map((i) => ({ code: i.code, name: i.name, value: millions(i.value * 1e6), share: i.value / max }))} />
      ) : (
        <NotPopulated kind={kind} />
      )}
    </SectionCard>
  );
}

function ShowAll({ text, feature }: { text: string; feature: string }) {
  const notInPrototype = useNotInPrototype();
  return (
    <>
      {text} ·
      <button type="button" className={styles.footerLink} onClick={() => notInPrototype(feature)}>
        Show all
      </button>
    </>
  );
}

/** The change column is "Δ wk" for one week and "Δ vs prev." for several. */
const withDeltaHeader = <R,>(columns: CardColumn<R>[], header: string) => columns.map((c) => (c.key === 'delta' ? { ...c, header } : c));

function SongSections({ view }: { view: ReturnType<typeof songView> }) {
  const song = cast.songs.find((s) => s.title === view.title);
  const { mode } = useDateRange();
  const rangeName = useRangeName();
  const deltaHeader = mode === 'week' ? 'Δ wk' : 'Δ vs prev.';
  return (
    <>
      <TrendRow view={view} side={<TopMarketsCard kind="song" items={view.topMarkets} />} />
      <SectionCard
        title="Performance by market"
        meta={`${song?.markets ?? 0} markets · ${rangeName}`}
        footer={view.marketTable && <ShowAll text={`Showing ${view.marketTable.length} of ${song?.markets ?? 0} markets`} feature="All markets" />}
      >
        {view.marketTable ? (
          <CardTable columns={withDeltaHeader(MARKET_COLUMNS, deltaHeader)} rows={view.marketTable} rowKey={(r) => r.code} defaultSort={{ key: 'capped', direction: 'desc' }} label="Performance by market" />
        ) : (
          <NotPopulated kind="song" />
        )}
      </SectionCard>
      <WeeklyTrendCard rows={view.weekly} />
      <SectionCard title="Data history and rights" meta="Canonical record">
        {view.history && view.rights ? (
          <div className={styles.history}>
            <Timeline items={view.history.map((h, i) => ({ ...h, active: i === 0 }))} />
            <RightsCard text={view.rights.text} checked={view.rights.checked} />
          </div>
        ) : (
          <NotPopulated kind="song" />
        )}
      </SectionCard>
    </>
  );
}

function ArtistSections({ view }: { view: ReturnType<typeof artistView> }) {
  const { mode } = useDateRange();
  const deltaHeader = mode === 'week' ? 'Δ wk' : 'Δ vs prev.';
  return (
    <>
      <TrendRow view={view} side={<TopMarketsCard kind="artist" items={view.topMarkets} />} />
      <SectionCard
        title="Songs"
        meta={`${view.songCount} songs · all markets`}
        footer={<ShowAll text={`Showing ${view.songs.length} of ${view.songCount} songs`} feature="All songs" />}
      >
        <CardTable columns={withDeltaHeader(SONG_COLUMNS, deltaHeader)} rows={view.songs} rowKey={(r) => r.isrc} defaultSort={{ key: 'capped', direction: 'desc' }} label="Songs" />
      </SectionCard>
      <SectionCard title="Labels and distributors" meta="Who is credited for this catalogue">
        {view.labels ? (
          <CardTable columns={LABEL_COLUMNS} rows={view.labels} rowKey={(r) => `${r.label}-${r.distributor}`} defaultSort={{ key: 'capped', direction: 'desc' }} label="Labels and distributors" />
        ) : (
          <NotPopulated kind="artist" />
        )}
      </SectionCard>
      <WeeklyTrendCard rows={view.weekly} />
    </>
  );
}

function CountrySections({ view }: { view: ReturnType<typeof countryView> }) {
  const rangeName = useRangeName();
  const meta = `Capped streams · ${rangeName}`;
  return (
    <>
      <TrendRow view={view} />
      <div className={styles.twoUp}>
        <SectionCard
          title="Top 10 artists"
          meta={meta}
          footer={
            view.topArtists && (
              <Link to="/data/artists" className={styles.footerLink}>
                Open full artist ranking for {view.short}
              </Link>
            )
          }
        >
          {view.topArtists ? <TopTenList items={view.topArtists} media="photo" label="Top 10 artists" /> : <NotPopulated kind="country" />}
        </SectionCard>
        <SectionCard
          title="Top 10 songs"
          meta={meta}
          footer={
            view.topSongs && (
              <Link to="/data/songs" className={styles.footerLink}>
                Open full song ranking for {view.short}
              </Link>
            )
          }
        >
          {view.topSongs ? <TopTenList items={view.topSongs} media="artwork" label="Top 10 songs" /> : <NotPopulated kind="country" />}
        </SectionCard>
      </div>
      <SectionCard title="Share by label" meta={meta} aside={view.shareByLabel && <Badge label={view.shareByLabel.badge} size="small" />}>
        {view.shareByLabel ? (
          <>
            <LabelShareList items={view.shareByLabel.rows.map((r) => ({ ...r, rest: r.name === 'Other labels' }))} />
            <p className={styles.note}>{view.shareByLabel.note}</p>
          </>
        ) : (
          <NotPopulated kind="country" />
        )}
      </SectionCard>
      <WeeklyTrendCard rows={view.weekly} />
    </>
  );
}

/* Page ------------------------------------------------------------------- */

function Toolbar({ market }: { market: string }) {
  const { user } = useUser();
  const notInPrototype = useNotInPrototype();
  return (
    <div className={styles.toolbar}>
      <Chip label={`Market: ${market}`} onRemove={() => notInPrototype('Changing the market filter')} />
      {user.tier !== 'Enterprise' && <Chip label={user.accessChip} locked />}
      <span className={styles.spacer} />
      <DateRangePicker />
      <Button trailingIcon={Settings2} onClick={() => notInPrototype('Filters')}>
        Filters
      </Button>
    </div>
  );
}

function buildView(kind: EntityKind, id: string): EntityView {
  if (kind === 'song') return songView(id);
  if (kind === 'artist') return artistView(id);
  return countryView(id);
}

/**
 * One template for the Song, Artist and Country pages (Figma 515:4295, 516:4458, 517:4547).
 * Same top row, header card, toolbar, trend and weekly trend; the middle sections change per kind.
 */
export default function EntityPage({ kind }: { kind: EntityKind }) {
  const params = useParams();
  const id = (kind === 'country' ? params.code : params.id) ?? '';
  const { range, compare } = useDateRange();
  const view = rangedView(buildView(kind, id), { kind, id }, { range, compare });
  const { user } = useUser();
  const tab = LIST_TAB[kind];
  const dsps = `${cast.week.dspsReported.reported} of ${cast.week.dspsReported.total} DSPs reported`;

  const crumbs = [{ label: 'Data', to: '/data' }, { label: tab.label, to: tab.to }, { label: view.found ? view.title : id }];

  if (!view.found) {
    return (
      <>
        <div className={styles.topRow}>
          <Breadcrumbs items={crumbs} />
          <TopBar />
        </div>
        <SectionCard title={view.title}>
          <EmptyState title={`We could not find the ${tab.noun} “${id}”`} icon={SearchX}>
            <p>
              Go back to the <Link to={tab.to}>{tab.label} tab</Link>, or open <Link to={FULL_PATH[kind]}>{FULL_EXAMPLE[kind].name}</Link> to see a
              full example.
            </p>
          </EmptyState>
        </SectionCard>
      </>
    );
  }

  const media =
    view.kind === 'song' ? (
      <HeaderArtwork src={view.art} seed={view.seed} />
    ) : view.kind === 'artist' ? (
      <HeaderPhoto src={view.photo} name={view.title} />
    ) : (
      <HeaderFlag code={view.code} />
    );

  const chips = view.kind === 'song' ? [dsps] : view.kind === 'artist' ? [`${view.songCount} songs`, dsps] : user.tier === 'Enterprise' ? [] : [user.accessChip];

  return (
    <>
      <div className={styles.topRow}>
        <Breadcrumbs items={crumbs} />
        <TopBar />
      </div>
      <EntityHeader title={view.title} media={media} meta={view.meta} chips={chips} stats={view.stats} follow={view.found ? { kind: view.kind, id } : undefined} />
      <Toolbar market={view.kind === 'country' ? view.title : 'All markets'} />
      {view.kind === 'song' && <SongSections view={view} />}
      {view.kind === 'artist' && <ArtistSections view={view} />}
      {view.kind === 'country' && <CountrySections view={view} />}
    </>
  );
}
