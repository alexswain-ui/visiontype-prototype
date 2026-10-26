import { useState, type ReactNode } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  AudioLines,
  CalendarSearch,
  Columns3,
  DatabaseZap,
  Download,
  Earth,
  EllipsisVertical,
  FileChartColumn,
  FileSpreadsheet,
  FileText,
  Layers,
  LayoutDashboard,
  MicVocal,
  Music,
  Settings2,
  Snowflake,
  Sparkles,
  Star,
  type LucideIcon,
} from 'lucide-react';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import DataTable, { type Column, type TableSort } from '../../components/DataTable';
import FilterPanel from '../../components/FilterPanel';
import IconButton from '../../components/IconButton';
import Menu from '../../components/Menu';
import PageHeader from '../../components/PageHeader';
import SearchField from '../../components/SearchField';
import SelectButton from '../../components/SelectButton';
import SplitView from '../../components/SplitView';
import Tabs from '../../components/Tabs';
import {
  applyFilters,
  chipLabel,
  DATE_RANGE,
  DEFAULT_FILTERS,
  EXPORT_OPTIONS,
  entityPath,
  FILTER_GROUPS,
  MORE_OPTIONS,
  ROWS_BY_TAB,
  type ArtistRow,
  type CanonicalRow,
  type CountryRow,
  type DataTab,
  type Filters,
  type SongRow,
} from '../../lib/dataPage';
import { useNotInPrototype } from '../../lib/notInPrototype';
import { useToast } from '../../lib/toast';
import { useUser } from '../../lib/user';
import ArtistSheet from './ArtistSheet';
import CanonicalSheet from './CanonicalSheet';
import { ARTIST_COLUMNS, CANONICAL_COLUMNS, COUNTRY_COLUMNS, SONG_COLUMNS } from './columns';
import CountrySheet from './CountrySheet';
import SongSheet from './SongSheet';
import styles from './DataPage.module.css';

type AnyRow = CanonicalRow | SongRow | ArtistRow | CountryRow;

const TABS: { id: DataTab; label: string; icon: LucideIcon; list: string; rowBase: string; subtitle: string }[] = [
  { id: 'canonical', label: 'Canonical Data', icon: AudioLines, list: '/data', rowBase: '/data/canonical', subtitle: 'One row per ISRC × market × week' },
  { id: 'songs', label: 'Song', icon: Music, list: '/data/songs', rowBase: '/data/songs', subtitle: 'One row per song, all markets' },
  { id: 'artists', label: 'Artist', icon: MicVocal, list: '/data/artists', rowBase: '/data/artists', subtitle: 'One row per artist, all markets' },
  { id: 'countries', label: 'Country', icon: Earth, list: '/data/countries', rowBase: '/data/countries', subtitle: 'One row per market' },
];

const COLUMNS = {
  canonical: CANONICAL_COLUMNS,
  songs: SONG_COLUMNS,
  artists: ARTIST_COLUMNS,
  countries: COUNTRY_COLUMNS,
} as Record<DataTab, Column<AnyRow>[]>;

const BY_CAPPED: TableSort = { key: 'capped', direction: 'desc' };
/** Canonical keeps the Figma row order until a header is clicked; the other tabs open sorted by capped streams. */
const DEFAULT_SORT: Record<DataTab, TableSort | null> = { canonical: null, songs: BY_CAPPED, artists: BY_CAPPED, countries: BY_CAPPED };
const PER_PAGE_OPTIONS = [10, 25, 50];

const EXPORT_ICONS: LucideIcon[] = [FileSpreadsheet, FileSpreadsheet, FileText, Layers, Snowflake];
const MORE_ICONS: LucideIcon[] = [FileChartColumn, LayoutDashboard, DatabaseZap, Columns3];

/** Remembers a value for this browser tab, so filters survive a visit to an entity page and back. */
function useSessionState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = sessionStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch {
      return initial;
    }
  });
  const set = (next: T) => {
    setValue(next);
    try {
      sessionStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Storage blocked: keep it for this visit only.
    }
  };
  return [value, set] as const;
}

function sortRows(rows: AnyRow[], columns: Column<AnyRow>[], sort: TableSort | null) {
  const getValue = columns.find((c) => c.key === sort?.key)?.sortValue;
  if (!sort || !getValue) return rows;
  const factor = sort.direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = getValue(a);
    const bv = getValue(b);
    return (typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv))) * factor;
  });
}

/**
 * Data page (/data, /data/songs, /data/artists, /data/countries, plus /<tab>/:id for the split view).
 * Figma: 496:3121, 496:3560, 512:4213, 512:5052, 512:5893, filter panel 605:11982.
 * Search, filters and results-per-page are shared by all four tabs and kept when switching.
 */
export default function DataPage() {
  const { '*': rest = '' } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useUser();
  const notInPrototype = useNotInPrototype();
  const toast = useToast();

  const [query, setQuery] = useSessionState('vt-data-query', '');
  const [filters, setFilters] = useSessionState<Filters>('vt-data-filters', DEFAULT_FILTERS);
  const [perPage, setPerPage] = useSessionState('vt-data-per-page', 10);
  const [sorts, setSorts] = useState(DEFAULT_SORT);
  const [pages, setPages] = useState<Record<DataTab, number>>({ canonical: 1, songs: 1, artists: 1, countries: 1 });

  // Work out the tab and selected row from the URL.
  const [segment = '', id] = rest.split('/');
  const tab = (segment === '' ? 'canonical' : TABS.find((t) => t.id === segment)?.id) as DataTab | undefined;
  if (!tab || (segment === 'canonical' && !id) || rest.split('/').length > 2) return <Navigate to="/data" replace />;
  const config = TABS.find((t) => t.id === tab)!;
  const allRows = ROWS_BY_TAB[tab] as AnyRow[];
  const selected = id ? allRows.find((r) => r.id === id) : undefined;
  if (id && !selected) return <Navigate to={config.list} replace />;

  const columns = COLUMNS[tab];
  const sort = sorts[tab];
  const rows = sortRows(applyFilters(allRows, filters, query), columns, sort);
  const pageCount = Math.max(1, Math.ceil(rows.length / perPage));
  const page = Math.min(pages[tab], pageCount);
  const pageRows = rows.slice((page - 1) * perPage, page * perPage);
  const first = rows.length === 0 ? 0 : (page - 1) * perPage + 1;
  const last = Math.min(rows.length, page * perPage);

  const resetPages = () => setPages({ canonical: 1, songs: 1, artists: 1, countries: 1 });
  const changeQuery = (next: string) => {
    setQuery(next);
    resetPages();
  };
  const changeFilters = (next: Filters) => {
    setFilters(next);
    resetPages();
  };

  const filtersOpen = searchParams.get('filters') === 'open';
  const setFiltersOpen = (open: boolean) => setSearchParams(open ? { filters: 'open' } : {}, { replace: true });

  const closeSheet = () => navigate(config.list);
  const openPage = (row: AnyRow) => navigate(entityPath(tab, row));

  const sheetProps = selected && { onClose: closeSheet, onOpenPage: () => openPage(selected) };
  let sheet: ReactNode = null;
  if (selected && sheetProps) {
    if (tab === 'canonical') sheet = <CanonicalSheet key={selected.id} row={selected as CanonicalRow} {...sheetProps} />;
    if (tab === 'songs') sheet = <SongSheet key={selected.id} row={selected as SongRow} {...sheetProps} />;
    if (tab === 'artists') sheet = <ArtistSheet key={selected.id} row={selected as ArtistRow} {...sheetProps} />;
    if (tab === 'countries') sheet = <CountrySheet key={selected.id} row={selected as CountryRow} {...sheetProps} />;
  }

  const activeFilters = FILTER_GROUPS.filter((g) => filters[g.key].length > 0);

  return (
    <>
      <PageHeader title="Data" icon={AudioLines} subtitle={config.subtitle} />

      <div className={styles.toolbar}>
        <SearchField value={query} onChange={changeQuery} placeholder="Search ISRC, song, artist, label…" label="Search data" width={352} />
        <Tabs
          label="Data views"
          value={tab}
          onChange={(next) => navigate(TABS.find((t) => t.id === next)!.list)}
          items={TABS.map((t) => ({ id: t.id, label: t.label, icon: t.icon }))}
        />
      </div>

      <div className={styles.filtersRow}>
        <div className={styles.chips}>
          {activeFilters.map((g) => (
            <Chip key={g.key} label={chipLabel(g.key, filters[g.key])} onRemove={() => changeFilters({ ...filters, [g.key]: [] })} />
          ))}
          <Chip label={user.accessChip} locked />
        </div>
        <SelectButton icon={CalendarSearch} onClick={() => notInPrototype('Choosing another week')}>
          <strong>{DATE_RANGE.week}</strong> · {DATE_RANGE.range}
        </SelectButton>
        <Button trailingIcon={Settings2} aria-haspopup="dialog" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(true)}>
          Filters
        </Button>
      </div>

      <SplitView sheet={sheet && <div className={styles.sheetSlot}>{sheet}</div>}>
        <DataTable
          label={`${config.label} results`}
          columns={columns}
          rows={pageRows}
          rowKey={(r) => r.id}
          selectedKey={selected?.id ?? null}
          onRowClick={(r) => (r.id === selected?.id ? closeSheet() : navigate(`${config.rowBase}/${r.id}`))}
          sort={sort}
          onSortChange={(next) => {
            setSorts({ ...sorts, [tab]: next });
            setPages({ ...pages, [tab]: 1 });
          }}
          title={
            <>
              <span aria-live="polite">
                {rows.length === 0 ? 'Showing 0 results' : `Showing ${first}–${last} of ${rows.length.toLocaleString('en-GB')} ${rows.length === 1 ? 'result' : 'results'}`}
              </span>
              <IconButton icon={Sparkles} label="Ask AI about these results" variant="tertiary" size="small" onClick={() => navigate('/ask')} />
            </>
          }
          actions={
            <>
              <IconButton icon={Star} label="Save search" onClick={() => toast('Search saved', Star)} />
              <Menu
                label="Export"
                width={240}
                items={EXPORT_OPTIONS.map((option, i) => ({
                  id: option,
                  label: option,
                  icon: EXPORT_ICONS[i],
                  onSelect: () => notInPrototype(`Export to ${option}`),
                }))}
                trigger={(props) => <IconButton {...props} icon={Download} label="Export" />}
              />
              <Menu
                label="More actions"
                width={240}
                items={MORE_OPTIONS.map((option, i) => ({
                  id: option,
                  label: option,
                  icon: MORE_ICONS[i],
                  onSelect: () => (option === 'Add to dashboard' ? toast('Added to dashboard', LayoutDashboard) : notInPrototype(option)),
                }))}
                trigger={(props) => <IconButton {...props} icon={EllipsisVertical} label="More actions" />}
              />
            </>
          }
          pagination={{
            page,
            pageCount,
            onChange: (next) => setPages({ ...pages, [tab]: next }),
            perPage,
            perPageOptions: PER_PAGE_OPTIONS,
            onPerPageChange: (next) => {
              setPerPage(next);
              resetPages();
            },
            maxButtons: selected ? 4 : 9,
          }}
          emptyText={query ? `No results for “${query}” with these filters` : 'No results for these filters'}
          onClearFilters={() => {
            changeFilters({ ...DEFAULT_FILTERS, markets: [] });
            setQuery('');
          }}
        />
      </SplitView>

      <FilterPanel
        open={filtersOpen}
        filters={filters}
        onClose={() => setFiltersOpen(false)}
        onApply={(next) => {
          changeFilters(next);
          setFiltersOpen(false);
        }}
      />
    </>
  );
}
