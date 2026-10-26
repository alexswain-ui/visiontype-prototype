import { AudioLines, Earth, House, MicVocal, Music } from 'lucide-react';
import { useLocation, useParams } from 'react-router-dom';
import { artistById, marketByCode, songById } from '../lib/data';
import { useUser } from '../lib/user';
import PlaceholderPage from './PlaceholderPage';

const DATA_TABS = [
  { to: '/data', label: 'Canonical data' },
  { to: '/data/songs', label: 'Song tab' },
  { to: '/data/artists', label: 'Artist tab' },
  { to: '/data/countries', label: 'Country tab' },
];

export function DashboardPage() {
  const { user } = useUser();
  const { search } = useLocation();
  const extractor = user.tier === 'Enterprise';
  return (
    <PlaceholderPage
      title="Dashboard"
      icon={House}
      subtitle={`${extractor ? 'Extractor' : 'Explorer'} dashboard · ${user.name}, ${user.tier}`}
      figmaNode={extractor ? '416:2629' : search.includes('state=alt') ? '374:36533' : '365:33581'}
      links={extractor ? [] : [{ to: '/dashboard/customise', label: 'Customise dashboard' }, { to: '/dashboard?state=alt', label: 'Alternate state' }]}
    >
      {extractor ? (
        <p>Dev’s Extractor dashboard: direct dataset access widgets.</p>
      ) : (
        <p>
          “Morning, {user.name}”, the Ask bar, Overall Roster Performance trend chart, Roster Performance table with trend bars,
          Saved Searches, Reports and Requires Attention cards. Roster rows open the Artist page.
        </p>
      )}
    </PlaceholderPage>
  );
}

export function CustomisePage() {
  return (
    <PlaceholderPage
      title="Customise dashboard"
      icon={House}
      subtitle="Edit mode with the widget gallery drawer"
      figmaNode="484:2894"
      links={[
        { to: '/dashboard', label: 'Done / Cancel' },
        { to: '/dashboard/customise/widget', label: 'Create custom widget' },
      ]}
    >
      <p>Widgets get drag handles, remove pills and resize handles with a blue outline; the drawer lists suggested widgets.</p>
    </PlaceholderPage>
  );
}

export function CustomWidgetPage() {
  return (
    <PlaceholderPage
      title="Custom widget"
      icon={House}
      subtitle="Widget builder, entry state"
      figmaNode="491:5545"
      links={[{ to: '/dashboard', label: 'Add to dashboard' }]}
    >
      <p>The widget builder modal over the new Data page (frames 491:5545 and 490:3028).</p>
    </PlaceholderPage>
  );
}

export function DataListPage({ tab }: { tab: 'canonical' | 'songs' | 'artists' | 'countries' }) {
  const config = {
    canonical: { node: '496:3121', icon: AudioLines, what: 'Canonical data list: search, tabs, chips row with the access chip, results table with pagination.' },
    songs: { node: '512:4213', icon: Music, what: 'Song tab: songs table; a row opens the split sheet with KPIs and performance by market.' },
    artists: { node: '512:5052', icon: MicVocal, what: 'Artist tab: artists table; the split sheet shows filters, trend and a songs table.' },
    countries: { node: '512:5893', icon: Earth, what: 'Country tab: countries table; the split sheet shows trend, top 10 artists and top 10 songs.' },
  }[tab];
  return (
    <PlaceholderPage
      title="Data"
      icon={AudioLines}
      subtitle="One row per ISRC × market × week"
      figmaNode={config.node}
      links={DATA_TABS.filter((t) => !t.to.endsWith(tab === 'canonical' ? '/data' : tab)).concat(
        tab === 'canonical' ? [{ to: '/data/canonical/r2', label: 'Row 2 in split view' }] : [],
      )}
    >
      <p>{config.what}</p>
    </PlaceholderPage>
  );
}

export function DataSplitPage({ tab }: { tab: 'canonical' | 'songs' | 'artists' | 'countries' }) {
  const { id = '' } = useParams();
  const node = { canonical: '496:3560', songs: '512:4213', artists: '512:5052', countries: '512:5893' }[tab];
  const back = tab === 'canonical' ? '/data' : `/data/${tab}`;
  return (
    <PlaceholderPage title="Data" icon={AudioLines} subtitle={`Split view · ${tab} · ${id}`} figmaNode={node} links={[{ to: back, label: 'Close the sheet' }]}>
      <p>The table narrows and a 444px sheet opens on the right for “{id}”.</p>
    </PlaceholderPage>
  );
}

export function SongPage() {
  const { id = '' } = useParams();
  const song = songById(id);
  return (
    <PlaceholderPage
      title={song?.title ?? 'Song'}
      icon={Music}
      subtitle={song ? `Song · ${song.isrc}` : `Song · ${id}`}
      figmaNode="515:4295"
      links={[{ to: '/data/songs', label: 'Back to Song tab' }]}
    >
      <p>Header card, trend chart, streams by DSP, market table with trend bars, weekly trend table, data history and rights card.</p>
    </PlaceholderPage>
  );
}

export function ArtistPage() {
  const { id = '' } = useParams();
  const artist = artistById(id);
  return (
    <PlaceholderPage
      title={artist?.name ?? 'Artist'}
      icon={MicVocal}
      subtitle={artist ? `Artist · ${artist.label}` : `Artist · ${id}`}
      figmaNode="516:4458"
      links={[{ to: '/data/artists', label: 'Back to Artist tab' }]}
    >
      <p>Header card, trend, top markets, songs table with trend bars, labels and distributors, weekly trend.</p>
    </PlaceholderPage>
  );
}

export function CountryPage() {
  const { code = '' } = useParams();
  const market = marketByCode(code.toUpperCase());
  return (
    <PlaceholderPage
      title={market?.name ?? 'Country'}
      icon={Earth}
      subtitle={`Country · ${code.toUpperCase()}`}
      figmaNode="517:4547"
      links={[{ to: '/data/countries', label: 'Back to Country tab' }]}
    >
      <p>Header card, trend, DSP split, top 10 artists and songs, share by label (“End-state, illustrative”), weekly trend.</p>
    </PlaceholderPage>
  );
}
