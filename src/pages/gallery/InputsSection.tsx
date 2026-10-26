import { useState } from 'react';
import { CalendarSearch, Settings2 } from 'lucide-react';
import SearchField from '../../components/SearchField';
import SelectButton from '../../components/SelectButton';
import TextInput from '../../components/TextInput';
import GallerySection, { Group, Row } from './GallerySection';

const noop = () => {};
const PLACEHOLDER = 'Search ISRC, song, artist, label…';

function LiveSearch() {
  const [value, setValue] = useState('');
  return <SearchField value={value} onChange={setValue} placeholder={PLACEHOLDER} width={352} />;
}

function LiveSelect() {
  const [open, setOpen] = useState(false);
  return (
    <SelectButton icon={CalendarSearch} open={open} onClick={() => setOpen(!open)}>
      <span>
        <strong>Week 42</strong> · 10 Oct - 16 Oct 2026
      </span>
    </SelectButton>
  );
}

export default function InputsSection() {
  const [comment, setComment] = useState('');
  return (
    <>
      <GallerySection id="search" title="Search field" note="Figma: design system Input (search) and “Input / Email” on the Data toolbar. Focus swaps to a 2px orange border.">
        <Group title="Live (type to see the clear button)">
          <LiveSearch />
        </Group>
        <Group title="Default · Hover · Focus · Filled · Disabled">
          <Row>
            <SearchField value="" onChange={noop} placeholder={PLACEHOLDER} width={320} />
            <SearchField value="" onChange={noop} placeholder={PLACEHOLDER} width={320} demoState="hover" />
            <SearchField value="" onChange={noop} placeholder={PLACEHOLDER} width={320} demoState="focus" />
            <SearchField value="Saffron Ferry" onChange={noop} width={320} />
            <SearchField value="" onChange={noop} placeholder={PLACEHOLDER} width={320} disabled />
          </Row>
        </Group>
      </GallerySection>

      <GallerySection id="text-input" title="Text input" proposed note="Figma: design system Field and Field error. Used for the required comment on the Rules save bar.">
        <Group title="Live">
          <TextInput label="Comment (required)" value={comment} onChange={setComment} placeholder="Why are you making this change?" width={320} required />
        </Group>
        <Group title="Default · Focus · Filled · Error · Disabled">
          <Row>
            <TextInput label="ISRC" value="" onChange={noop} placeholder="12 characters" width={260} />
            <TextInput label="ISRC" value="" onChange={noop} placeholder="12 characters" width={260} demoState="focus" />
            <TextInput label="ISRC" value="XAK7Q2400117" onChange={noop} width={260} hint="Looks right." />
            <TextInput label="ISRC" value="ZX9876" onChange={noop} width={260} error="An ISRC has 12 characters." />
            <TextInput label="ISRC" value="" onChange={noop} placeholder="12 characters" width={260} disabled />
          </Row>
        </Group>
      </GallerySection>

      <GallerySection
        id="select"
        title="Select / dropdown button"
        note="Figma: date range, Filters and results-per-page buttons on the Data page. Built on Button v2 Secondary (the Data page still shows the older 43px gradient button). Count badge is proposed."
      >
        <Group title="Live (click to toggle open)">
          <LiveSelect />
        </Group>
        <Group title="Default · Hover · Open · Focus · Disabled">
          <Row>
            <SelectButton icon={Settings2}>Filters</SelectButton>
            <SelectButton icon={Settings2} demoState="hover">
              Filters
            </SelectButton>
            <SelectButton icon={Settings2} open>
              Filters
            </SelectButton>
            <SelectButton icon={Settings2} demoState="focus">
              Filters
            </SelectButton>
            <SelectButton icon={Settings2} disabled>
              Filters
            </SelectButton>
          </Row>
        </Group>
        <Group title="With count badge · Small (results per page)">
          <Row>
            <SelectButton icon={Settings2} count={3}>
              Filters
            </SelectButton>
            <SelectButton size="small">100</SelectButton>
          </Row>
        </Group>
      </GallerySection>
    </>
  );
}
