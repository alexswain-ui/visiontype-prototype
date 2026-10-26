import { useState } from 'react';
import { AudioLines, Earth, MicVocal, Music } from 'lucide-react';
import Tabs, { type TabItem } from '../../components/Tabs';
import GallerySection, { Group } from './GallerySection';

const DATA_TABS: TabItem[] = [
  { id: 'canonical', label: 'Canonical Data', icon: AudioLines },
  { id: 'song', label: 'Song', icon: Music },
  { id: 'artist', label: 'Artist', icon: MicVocal },
  { id: 'country', label: 'Country', icon: Earth },
];

function LiveTabs() {
  const [value, setValue] = useState('canonical');
  return <Tabs label="Data views" items={DATA_TABS} value={value} onChange={setValue} />;
}

export default function TabsSection() {
  return (
    <GallerySection
      id="tabs"
      title="Tabs (segmented)"
      note="Figma: “Tabs (segmented) - Nova” on Data · Canonical (list). Live example: click, or focus it and use the arrow keys."
    >
      <Group title="Live">
        <LiveTabs />
      </Group>
      <Group title="States: active (Canonical Data), hover (Song), focus (Artist), default (Country)">
        <Tabs
          label="Tab states"
          value="canonical"
          onChange={() => {}}
          items={DATA_TABS.map((tab) =>
            tab.id === 'song' ? { ...tab, demoState: 'hover' } : tab.id === 'artist' ? { ...tab, demoState: 'focus' } : tab,
          )}
        />
      </Group>
      <Group title="Without icons">
        <Tabs
          label="Rules views"
          value="dsps"
          onChange={() => {}}
          items={[
            { id: 'dsps', label: 'DSPs' },
            { id: 'enrichment', label: 'Enrichment' },
            { id: 'history', label: 'History' },
          ]}
        />
      </Group>
    </GallerySection>
  );
}
