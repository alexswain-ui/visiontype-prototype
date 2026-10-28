import { useState } from 'react';
import { Check, UserPlus } from 'lucide-react';
import { cx } from '../lib/cx';
import { DEFAULT_PREFS, entityName, FOLLOW_LIMIT, followKey, useFollow, type FollowKind, type FollowPrefs } from '../lib/follow';
import { useToast } from '../lib/toast';
import Badge from './Badge';
import Button, { type ButtonSize } from './Button';
import Checkbox from './Checkbox';
import Modal from './Modal';
import styles from './FollowButton.module.css';

export interface FollowButtonProps {
  kind: FollowKind;
  /** Song id, artist id or market code. */
  id: string;
  /** Medium in the page header card (Figma "Button / Follow"), small in the split sheet header. */
  size?: ButtonSize;
}

/**
 * "Follow" secondary button (Figma 745:8546: user-plus icon, Medium). The first click opens the Follow dialog;
 * once followed it reads "Following" (orange tint, tick) and a click unfollows.
 */
export default function FollowButton({ kind, id: rawId, size = 'medium' }: FollowButtonProps) {
  const id = kind === 'country' ? rawId.toUpperCase() : rawId;
  const { isFollowing, unfollow } = useFollow();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const following = isFollowing(kind, id);
  const name = entityName(kind, id);

  return (
    <>
      <Button
        size={size}
        leadingIcon={following ? Check : UserPlus}
        className={cx(following && styles.following)}
        aria-pressed={following}
        onClick={() => {
          if (following) {
            unfollow(followKey(kind, id));
            toast(`Unfollowed ${name}`);
          } else setOpen(true);
        }}
      >
        {following ? 'Following' : 'Follow'}
      </Button>
      {open && <FollowDialog kind={kind} id={id} name={name} onClose={() => setOpen(false)} />}
    </>
  );
}

const SEND_ME: { key: keyof FollowPrefs; label: string }[] = [
  { key: 'weeklySummary', label: 'Weekly summary' },
  { key: 'bigMoves', label: 'Big moves of 20% or more' },
  { key: 'newMarkets', label: 'New markets' },
  { key: 'restatements', label: 'Restatements' },
];

/** Follow {name}: what to send and what to compare with. A small dialog on the shared Modal. */
function FollowDialog({ kind, id, name, onClose }: { kind: FollowKind; id: string; name: string; onClose: () => void }) {
  const { follow, count } = useFollow();
  const toast = useToast();
  const [prefs, setPrefs] = useState<FollowPrefs>({ ...DEFAULT_PREFS });
  const full = count >= FOLLOW_LIMIT;
  const set = (key: keyof FollowPrefs) => (value: boolean) => setPrefs((p) => ({ ...p, [key]: value }));

  const confirm = () => {
    if (follow(kind, id, prefs)) {
      toast(`Following ${name}`, Check);
      onClose();
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={`Follow ${name}`}
      width={440}
      actions={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={full} onClick={confirm}>
            Follow
          </Button>
        </>
      }
    >
      <div className={styles.body}>
        <fieldset className={styles.group}>
          <legend className={styles.legend}>Send me</legend>
          {SEND_ME.map(({ key, label }) => (
            <Checkbox key={key} label={label} checked={prefs[key]} onChange={set(key)} />
          ))}
        </fieldset>
        <fieldset className={styles.group}>
          <legend className={styles.legend}>Compare with</legend>
          <Checkbox label="Market average" checked={prefs.vsMarket} onChange={set('vsMarket')} />
          <Checkbox label="Peers in my roster" checked={prefs.vsPeers} onChange={set('vsPeers')} />
          <Checkbox
            label={
              <span className={styles.genre}>
                Same genre
                <Badge label="Illustrative" tone="amber" size="small" />
              </span>
            }
            checked={prefs.vsGenre}
            onChange={set('vsGenre')}
          />
        </fieldset>
        <p className={cx(styles.counter, full && styles.full)} role={full ? 'alert' : undefined}>
          {full ? `You have reached ${FOLLOW_LIMIT}` : `You follow ${count} of ${FOLLOW_LIMIT}`}
        </p>
      </div>
    </Modal>
  );
}
