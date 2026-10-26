import { ArrowUpRight, Repeat, TriangleAlert } from 'lucide-react';
import Artwork from '../../components/Artwork';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import ConflictCard from '../../components/ConflictCard';
import SectionLabel from '../../components/SectionLabel';
import SplitSheet from '../../components/SplitSheet';
import Timeline from '../../components/Timeline';
import { canonicalDetail, marketLabel, type CanonicalRow } from '../../lib/dataPage';
import { artworkFor } from '../../lib/media';
import { useNotInPrototype } from '../../lib/notInPrototype';
import styles from './sheets.module.css';

interface Props {
  row: CanonicalRow;
  onClose: () => void;
  onOpenPage: () => void;
}

/** Canonical row sheet (Figma 496:3560): rights conflict first, then the version timeline. */
export default function CanonicalSheet({ row, onClose, onOpenPage }: Props) {
  const notInPrototype = useNotInPrototype();
  const { conflict, timeline } = canonicalDetail(row);
  return (
    <SplitSheet
      title={row.song.title}
      subtitle={`${row.artist.name} · ${marketLabel(row.market)} · Week 42`}
      media={<Artwork title={row.song.title} src={artworkFor(row.song.id, row.song.art)} size={56} />}
      chips={
        <>
          <Badge label={row.song.isrc} size="small" />
          {row.status === 'conflict' && <Badge tone="amber" label="Conflict" icon={TriangleAlert} size="small" />}
          {row.status === 'restated' && <Badge tone="orange" label="Restated" icon={Repeat} size="small" />}
        </>
      }
      onClose={onClose}
      onExpand={onOpenPage}
      footer={
        <>
          <Button onClick={() => notInPrototype('Raising an issue')}>Raise an issue</Button>
          <Button trailingIcon={ArrowUpRight} onClick={onOpenPage}>
            View full history
          </Button>
        </>
      }
    >
      <section className={styles.group}>
        <SectionLabel label="Rights conflicts" count={conflict ? 1 : 0} />
        {conflict ? (
          <ConflictCard title={conflict.title} state={conflict.state} meta={conflict.meta} onOpen={() => notInPrototype('Issues')}>
            {conflict.parts.map((part, i) => (typeof part === 'string' ? part : <strong key={i}>{part.strong}</strong>))}
          </ConflictCard>
        ) : (
          <p className={styles.note}>No open conflicts. Licensor, label and distributor agree across all reporting DSPs.</p>
        )}
      </section>
      <section className={styles.group}>
        <SectionLabel label="Timeline" />
        <Timeline items={timeline} />
      </section>
    </SplitSheet>
  );
}
