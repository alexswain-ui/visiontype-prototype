import { Download, Plus, Sparkles, Star, Trash2 } from 'lucide-react';
import Button, { type ButtonSize, type ButtonVariant } from '../../components/Button';
import IconButton from '../../components/IconButton';
import type { DemoState } from '../../lib/demoState';
import GallerySection, { Group, Row, StateGrid } from './GallerySection';

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'brand', 'tertiary', 'destructive', 'ghost'];
const SIZES: { size: ButtonSize; label: string }[] = [
  { size: 'small', label: 'Small 32' },
  { size: 'medium', label: 'Medium 40' },
  { size: 'large', label: 'Large 48' },
];
const STATES = ['Default', 'Hover', 'Pressed', 'Focus', 'Disabled', 'Loading'];

const capitalise = (text: string) => text[0].toUpperCase() + text.slice(1);

function stateProps(state: string): { demoState?: DemoState; disabled?: boolean; loading?: boolean } {
  switch (state) {
    case 'Hover':
      return { demoState: 'hover' };
    case 'Pressed':
      return { demoState: 'pressed' };
    case 'Focus':
      return { demoState: 'focus' };
    case 'Disabled':
      return { disabled: true };
    case 'Loading':
      return { loading: true };
    default:
      return {};
  }
}

export default function ButtonsSection() {
  return (
    <>
      <GallerySection
        id="button"
        title="Button"
        note="Figma: design system, Components: Buttons, Button v2. Hover, Pressed and Focus columns are frozen; the Default column reacts to your mouse and keyboard."
      >
        {SIZES.map(({ size, label }) => (
          <Group key={size} title={label}>
            <StateGrid
              columns={STATES}
              rows={VARIANTS.map((variant) => ({
                label: capitalise(variant),
                cells: STATES.map((state) => (
                  <Button key={state} variant={variant} size={size} {...stateProps(state)}>
                    Button
                  </Button>
                )),
              }))}
            />
          </Group>
        ))}
        <Group title="With icons (Medium)">
          <Row>
            <Button variant="primary" leadingIcon={Download}>
              Download CSV
            </Button>
            <Button leadingIcon={Star}>Save search</Button>
            <Button variant="brand" leadingIcon={Plus}>
              Customise
            </Button>
            <Button variant="tertiary" leadingIcon={Sparkles}>
              Ask AI
            </Button>
            <Button variant="destructive" leadingIcon={Trash2}>
              Remove
            </Button>
            <Button variant="ghost" trailingIcon={Plus}>
              Add
            </Button>
          </Row>
        </Group>
      </GallerySection>

      <GallerySection id="icon-button" title="Icon button" note="Figma: Icon button v2. Square 32 / 40 / 48; icon 14 on Small, 16 otherwise.">
        {SIZES.map(({ size, label }) => (
          <Group key={size} title={label}>
            <StateGrid
              columns={STATES}
              rows={VARIANTS.map((variant) => ({
                label: capitalise(variant),
                cells: STATES.map((state) => (
                  <IconButton key={state} icon={Star} label="Save" variant={variant} size={size} {...stateProps(state)} />
                )),
              }))}
            />
          </Group>
        ))}
      </GallerySection>
    </>
  );
}
