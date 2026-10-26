import { useState } from 'react';
import { ChevronDown, Download, Globe, LayoutDashboard, Star } from 'lucide-react';
import Avatar from '../../components/Avatar';
import Button from '../../components/Button';
import IconButton from '../../components/IconButton';
import Menu, { type MenuItem } from '../../components/Menu';
import Modal from '../../components/Modal';
import NotInPrototypeDialog from '../../components/NotInPrototypeDialog';
import Toast from '../../components/Toast';
import Tooltip from '../../components/Tooltip';
import rules from '../../data/rules.json';
import { useNotInPrototype } from '../../lib/notInPrototype';
import { useToast } from '../../lib/toast';
import GallerySection, { Group, Row } from './GallerySection';
import styles from './Gallery.module.css';

const BADGES: Record<string, string> = { maya: 'PR', dev: 'EN', ifpi: 'IF' };
const ORDER = ['dev', 'maya', 'ifpi'];

function userItems(current: string, onPick: (id: string) => void): MenuItem[] {
  return ORDER.map((id) => {
    const user = rules.users.find((u) => u.id === id)!;
    return {
      id,
      label: user.id === 'ifpi' ? user.name : user.tier,
      description: user.subtitle,
      badge: BADGES[id],
      selected: id === current,
      onSelect: () => onPick(id),
    };
  });
}

function SignedIn({ id }: { id: string }) {
  const user = rules.users.find((u) => u.id === id)!;
  return (
    <span className={styles.signedIn}>
      <Avatar name={user.name} size={40} />
      <span>
        <strong>{user.name}</strong>
        <span>{user.tier}</span>
      </span>
    </span>
  );
}

function SwitchUserMenu({ demoOpen = false }: { demoOpen?: boolean }) {
  const [current, setCurrent] = useState('maya');
  const user = rules.users.find((u) => u.id === current)!;
  return (
    <Menu
      label="Switch user"
      demoOpen={demoOpen}
      header={<SignedIn id={current} />}
      sectionLabel="Switch user (prototype)"
      items={userItems(current, setCurrent)}
      trigger={(props) => (
        <button {...props} type="button" className={styles.avatarTrigger} aria-label={`Account: ${user.name}`}>
          <Avatar name={user.name} size={32} />
        </button>
      )}
    />
  );
}

function MarketMenu({ demoOpen = false }: { demoOpen?: boolean }) {
  const [market, setMarket] = useState('global');
  const options = [
    { id: 'global', label: 'Global' },
    { id: 'gb', label: 'United Kingdom' },
    { id: 'fr', label: 'France' },
  ];
  const current = options.find((o) => o.id === market)!;
  return (
    <Menu
      label="Market"
      align="start"
      width={232}
      demoOpen={demoOpen}
      items={options.map((o) => ({ ...o, icon: Globe, selected: o.id === market, onSelect: () => setMarket(o.id) }))}
      trigger={(props) => (
        <Button {...props} leadingIcon={Globe} trailingIcon={ChevronDown}>
          {current.label}
        </Button>
      )}
    />
  );
}

function LiveModal() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Delete saved search…
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Delete this saved search?"
        description="You'll lose the filters and the weekly digest attached to it. This can't be undone."
        actions={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setOpen(false)}>
              Delete search
            </Button>
          </>
        }
      />
    </>
  );
}

function LiveTriggers() {
  const notInPrototype = useNotInPrototype();
  const toast = useToast();
  return (
    <Row>
      <Button onClick={() => notInPrototype('Reports')}>Open Reports</Button>
      <Button leadingIcon={Star} onClick={() => toast('Saved')}>
        Save search
      </Button>
      <Button variant="brand" leadingIcon={LayoutDashboard} onClick={() => toast('Added to dashboard')}>
        Add to dashboard
      </Button>
    </Row>
  );
}

export default function OverlaysSection() {
  return (
    <>
      <GallerySection
        id="menu"
        title="Menu / popover"
        note="Figma: Menu / Switch user (prototype file) and the design system Menu. Live: click, or focus and press Enter or ↓; arrows move, Enter picks, Esc closes, click outside closes."
      >
        <Group title="Live">
          <Row>
            <SwitchUserMenu />
            <MarketMenu />
          </Row>
        </Group>
        <Group title="Open (two-line options, tick on the current one)">
          <SwitchUserMenu demoOpen />
        </Group>
        <Group title="Open (single-line options with icons)">
          <MarketMenu demoOpen />
        </Group>
      </GallerySection>

      <GallerySection id="modal" title="Modal" note="Figma: design system Modal on a Scrim. Live: Esc closes, Tab stays inside, focus returns to the button.">
        <Group title="Live">
          <LiveModal />
        </Group>
        <Group title="Preview">
          <Modal
            open
            preview
            onClose={() => {}}
            title="Delete this saved search?"
            description="You'll lose the filters and the weekly digest attached to it. This can't be undone."
            actions={
              <>
                <Button variant="ghost">Cancel</Button>
                <Button variant="destructive">Delete search</Button>
              </>
            }
          />
        </Group>
      </GallerySection>

      <GallerySection id="not-in-prototype" title="“Not part of this prototype” dialog" note="Shown for anything not designed. Small, centred, secondary OK button.">
        <Group title="Live (also shows the toasts)">
          <LiveTriggers />
        </Group>
        <Group title="Preview">
          <NotInPrototypeDialog open preview feature="Reports" onClose={() => {}} />
        </Group>
      </GallerySection>

      <GallerySection id="toast" title="Toast" proposed note="Bottom-centre, 3 seconds. Use the live buttons above to see it appear.">
        <Row>
          <Toast message="Saved" />
          <Toast message="Added to dashboard" />
        </Row>
      </GallerySection>

      <GallerySection id="tooltip" title="Tooltip" proposed note="Figma: design system Tooltip. On icon-only buttons after 120ms, on hover or keyboard focus. Live: hover or Tab to the buttons.">
        <Group title="Live">
          <Row>
            <IconButton icon={Star} label="Save search" />
            <IconButton icon={Download} label="Export" />
          </Row>
        </Group>
        <Group title="Shown">
          <Tooltip label="Weighted by market size" demoOpen>
            <IconButton icon={Globe} label="Market weighting" />
          </Tooltip>
        </Group>
      </GallerySection>
    </>
  );
}
