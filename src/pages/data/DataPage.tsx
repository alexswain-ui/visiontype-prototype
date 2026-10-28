import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  AudioLines,
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
  Star,
  type LucideIcon,
} from 'lucide-react';
import AiIcon from '../../components/AiIcon';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import DateRangePicker from '../../components/DateRangePicker';
import DataTable, { type Column, type TableSort } from '../../components/DataTable';
import FilterPanel from '../../components/FilterPanel';
import IconButton from '../../components/IconButton';
import Menu from '../../components/Menu';
import PageHeader from '../../components/PageHeader';
import SearchField from '../../components/SearchField';
import SplitView from '../../components/SplitView';
import Tabs from '../../components/Tabs';
import {
  applyFilters,
  chipLabel,
  DEFAULT_FILTERS,
  EMPTY_FILTERS,
  marketInfo,
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
import AskPanel, { useAskPanelSession } from '../../components/AskPanel';
import { DATA_LINKS, type BenchScript } from '../../lib/ask';
import { useRangeName } from '../../lib/useRangeStats';
import { useNotInPrototype } from '../../lib/notInPrototype';
import { useToast } from '../../lib/toast';
import { useUser } from '../../lib/user';
import ArtistSheet from './ArtistSheet';
import CanonicalSheet from './CanonicalSheet';
import { ARTIST_COLUMNS, CANONICAL_COLUMNS, COUNTRY_COLUMNS, SONG_COLUMNS, withRange } from './columns';
import { useDateRange } from '../../lib/dateRange';
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
  const { range } = useDateRange();
  const periodName = useRangeName();
  const askSession = useAskPanelSession();
  const [askOpen, setAskOpen] = useState(false);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const [query, setQuery] = useSessionState('vt-data-query', '');
  const [filters, setFilters] = useSessionState<Filters>('vt-data-filters', DEFAULT_FILTERS);
  const [perPage, setPerPage] = useSessionState('vt-data-per-page', 10);
  const [sorts, setSorts] = useState(DEFAULT_SORT);
  const [pages, setPages] = useState<Record<DataTab, number>>({ canonical: 1, songs: 1, artists: 1, countries: 1 });

  // Deep links from Ask ("Open in Data"): ?markets=GB,FR and ?sort=capped apply once, then leave the URL.
  const linkMarkets = searchParams.get('markets');
  const linkSort = searchParams.get('sort');
  useEffect(() => {
    if (linkMarkets === null && linkSort === null) return;
    if (linkMarkets !== null) {
      const markets = linkMarkets.split(',').filter((code) => marketInfo(code)).map((code) => code.toUpperCase());
      setFilters({ ...EMPTY_FILTERS, markets: markets.length ? markets : DEFAULT_FILTERS.markets });
      setPages({ canonical: 1, songs: 1, artists: 1, countries: 1 });
      setQuery('');
    }
    if (linkSort === 'capped') setSorts(DEFAULT_SORT);
    const next = new URLSearchParams(searchParams);
    next.delete('markets');
    next.delete('sort');
    setSearchParams(next, { replace: true });
  }, [linkMarkets, linkSort]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll the pointed-out row into view once the table has re-rendered.
  useEffect(() => {
    if (!highlightId) return;
    const timer = window.setTimeout(() => document.querySelector('[data-highlighted]')?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 100);
    return () => window.clearTimeout(timer);
  }, [highlightId]);

  // Work out the tab and selected row from the URL.
  const [segment = '', id] = rest.split('/');
  const tab = (segment === '' ? 'canonical' : TABS.find((t) => t.id === segment)?.id) as DataTab | undefined;
  if (!tab || (segment === 'canonical' && !id) || rest.split('/').length > 2) return <Navigate to="/data" replace />;
  const config = TABS.find((t) => t.id === tab)!;
  const allRows = ROWS_BY_TAB[tab] as AnyRow[];
  const selected = id ? allRows.find((r) => r.id === id) : undefined;
  if (id && !selected) return <Navigate to={config.list} replace />;

  const columns = withRange(tab, COLUMNS[tab], range);
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

  // The Ask panel takes the sheet's place: opening it drops any open sheet, and opening a sheet closes the panel.
  const showAsk = askOpen && !selected;
  const toggleAsk = () => {
    if (showAsk) {
      setAskOpen(false);
      setHighlightId(null);
      return;
    }
    setAskOpen(true);
    if (selected) navigate(config.list);
  };

  // Expand: the Ask page, opened on the latest scripted answer (or a new chat when there is none yet).
  const expandAsk = () => {
    const last = [...askSession.turns].reverse().find((t) => t.kind === 'script');
    navigate(last && last.kind === 'script' ? `/ask/${last.scriptId}` : '/ask');
  };

  // "Apply to table": filter the markets, sort, and point out the row. Scripts with no table settings open their Data view.
  const applyFromAsk = (script: BenchScript) => {
    const apply = script.applyToTable;
    if (apply) {
      changeFilters({ ...EMPTY_FILTERS, markets: apply.markets });
      setQuery('');
      setSorts({ ...sorts, artists: { key: apply.sortBy, direction: 'desc' } });
      setHighlightId(apply.highlight);
      navigate('/data/artists');
      toast('Applied to table', AiIcon);
    } else if (DATA_LINKS[script.id]) {
      setHighlightId(null);
      navigate(DATA_LINKS[script.id]);
    }
  };

  const marketsText = (() => {
    const values = filters.markets;
    const isDefault = values.length === DEFAULT_FILTERS.markets.length && values.every((m) => DEFAULT_FILTERS.markets.includes(m));
    return values.length === 0 || isDefault ? 'All markets' : chipLabel('markets', values).replace(/^[^:]+:\s*/, '');
  })();
  const askContext = { tab: config.label, markets: marketsText, period: periodName, access: user.accessChip.split(' · ')[0] };
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
          {user.tier !== 'Enterprise' && <Chip label={user.accessChip} locked />}
        </div>
        <DateRangePicker />
        <Button trailingIcon={Settings2} aria-haspopup="dialog" aria-expanded={filtersOpen} onClick={() => setFiltersOpen(true)}>
          Filters
        </Button>
      </div>

      <SplitView
        sheet={
          showAsk ? (
            <div className={styles.sheetSlot}>
              <AskPanel context={askContext} session={askSession} onClose={toggleAsk} onExpand={expandAsk} onApplyToTable={applyFromAsk} />
            </div>
          ) : (
            sheet && <div className={styles.sheetSlot}>{sheet}</div>
          )
        }
      >
        <DataTable
          label={`${config.label} results`}
          columns={columns}
          rows={pageRows}
          rowKey={(r) => r.id}
          selectedKey={selected?.id ?? null}
          highlightKey={highlightId}
          onRowClick={(r) => {
            if (r.id === selected?.id) closeSheet();
            else {
              setAskOpen(false);
              navigate(`${config.rowBase}/${r.id}`);
            }
          }}
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
              <IconButton
                icon={AiIcon}
                label="Ask AI about these results"
                variant="tertiary"
                size="small"
                className={styles.askButton}
                aria-pressed={showAsk}
                aria-expanded={showAsk}
                onClick={toggleAsk}
              />
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
            maxButtons: selected || showAsk ? 4 : 9,
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
