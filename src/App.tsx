import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import { useUser } from './lib/user';
import AskPage from './pages/AskPage';
import Gallery from './pages/Gallery';
import {
  ArtistPage,
  CountryPage,
  CustomisePage,
  CustomWidgetPage,
  DashboardPage,
  DataListPage,
  DataSplitPage,
  RulesPage,
  SongPage,
} from './pages/placeholders';

/** Rules is only for the IFPI user; anyone else goes to their own landing page. */
function IfpiOnly({ children }: { children: ReactNode }) {
  const { user } = useUser();
  return user.seesRules ? children : <Navigate to={user.landing} replace />;
}

function Landing() {
  const { user } = useUser();
  return <Navigate to={user.landing} replace />;
}

/** Routes from docs/screens-manifest.md. */
export default function App() {
  return (
    <Routes>
      <Route path="/gallery" element={<Gallery />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/customise" element={<CustomisePage />} />
        <Route path="/dashboard/customise/widget" element={<CustomWidgetPage />} />

        <Route path="/data" element={<DataListPage tab="canonical" />} />
        <Route path="/data/canonical/:id" element={<DataSplitPage tab="canonical" />} />
        <Route path="/data/songs" element={<DataListPage tab="songs" />} />
        <Route path="/data/songs/:id" element={<DataSplitPage tab="songs" />} />
        <Route path="/data/artists" element={<DataListPage tab="artists" />} />
        <Route path="/data/artists/:id" element={<DataSplitPage tab="artists" />} />
        <Route path="/data/countries" element={<DataListPage tab="countries" />} />
        <Route path="/data/countries/:id" element={<DataSplitPage tab="countries" />} />
        <Route path="/song/:id" element={<SongPage />} />
        <Route path="/artist/:id" element={<ArtistPage />} />
        <Route path="/country/:code" element={<CountryPage />} />

        <Route path="/rules" element={<IfpiOnly><RulesPage tab="dsps" /></IfpiOnly>} />
        <Route path="/rules/enrichment" element={<IfpiOnly><RulesPage tab="enrichment" /></IfpiOnly>} />
        <Route path="/rules/history" element={<IfpiOnly><RulesPage tab="history" /></IfpiOnly>} />

        <Route path="/ask" element={<AskPage />} />
        <Route path="/ask/:script" element={<AskPage />} />

        <Route path="*" element={<Landing />} />
      </Route>
    </Routes>
  );
}
