import { useState } from 'react';
import { Repeat, TriangleAlert } from 'lucide-react';
import Badge, { type BadgeTone } from '../../components/Badge';
import Chip from '../../components/Chip';
import GallerySection, { Group, Row } from './GallerySection';

const TONES: { tone: BadgeTone; label: string }[] = [
  { tone: 'neutral', label: 'Neutral' },
  { tone: 'orange', label: 'New' },
  { tone: 'blue', label: 'Secondary' },
  { tone: 'purple', label: 'AI' },
  { tone: 'green', label: 'Current' },
  { tone: 'amber', label: 'Conflict' },
  { tone: 'red', label: 'Error' },
  { tone: 'info', label: 'Info' },
];

function RemovableDemo() {
  const [chips, setChips] = useState(['Market: UK, FR, DE +5', 'Streaming', '2026']);
  return (
    <Row>
      {chips.map((chip) => (
        <Chip key={chip} label={chip} onRemove={() => setChips(chips.filter((c) => c !== chip))} />
      ))}
      {chips.length === 0 && <Chip label="All removed. Reload to reset" tone="neutral" />}
    </Row>
  );
}

export default function ChipsSection() {
  return (
    <>
      <GallerySection
        id="chip"
        title="Chip (filter)"
        note="Figma: design system Chip, and the chips row on Data · Canonical (list). The x is a real button: try removing them."
      >
        <Group title="States: default, hover (on the x), focus (on the x), locked">
          <Row>
            <Chip label="UK" onRemove={() => {}} />
            <Chip label="UK" onRemove={() => {}} demoState="hover" />
            <Chip label="UK" onRemove={() => {}} demoState="focus" />
            <Chip label="Top 100k · your access level" locked />
          </Row>
        </Group>
        <Group title="Tones">
          <Row>
            <Chip label="Orange, static" />
            <Chip label="Neutral, static" tone="neutral" />
            <Chip label="Neutral, removable" tone="neutral" onRemove={() => {}} />
          </Row>
        </Group>
        <Group title="Live">
          <RemovableDemo />
        </Group>
      </GallerySection>

      <GallerySection id="badge" title="Chip (status / tag)" note="Figma: design system Badge, and the Conflict / Restated status cells on the Data table. Static.">
        <Group title="Tones">
          <Row>
            {TONES.map(({ tone, label }) => (
              <Badge key={tone} tone={tone} label={label} />
            ))}
          </Row>
        </Group>
        <Group title="With dot">
          <Row>
            <Badge tone="green" label="Success" dot />
            <Badge tone="amber" label="Warning" dot />
            <Badge tone="red" label="Danger" dot />
          </Row>
        </Group>
        <Group title="Table status (icon only, 8px radius)">
          <Row>
            <Badge tone="amber" label="Conflict" icon={TriangleAlert} iconOnly />
            <Badge tone="orange" label="Restated" icon={Repeat} iconOnly />
            <Badge tone="amber" label="Conflict" icon={TriangleAlert} />
            <Badge tone="orange" label="Restated" icon={Repeat} />
          </Row>
        </Group>
      </GallerySection>
    </>
  );
}
