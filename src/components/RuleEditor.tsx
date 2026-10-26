import { useState } from 'react';
import { useToast } from '../lib/toast';
import {
  ALL_DSPS,
  COMMENT_PLACEHOLDER,
  DSP_TOTAL,
  ENRICHMENT_SOURCES,
  MAX_RANKED,
  discardDraft,
  draftKey,
  ordinal,
  saveDraft,
  savedList,
  setDraft,
  useRules,
  type FieldRule,
  type RuleKind,
} from '../lib/rules';
import AddSourceModal from './AddSourceModal';
import RankList from './RankList';
import SaveBar from './SaveBar';
import panel from './RulePanel.module.css';

const SOUNDSYS_FIELDS = ['song-name', 'artist-name'];

export interface RuleEditorProps {
  field: FieldRule;
  kind: RuleKind;
}

/** Rules · DSPs and Rules · Enrichment: ranked list, Add picker and the save bar once something changes. */
export default function RuleEditor({ field, kind }: RuleEditorProps) {
  const { drafts } = useRules();
  const toast = useToast();
  const [picking, setPicking] = useState(false);

  const saved = savedList(field, kind);
  const draft = drafts[draftKey(field.id, kind)];
  const items = draft ?? saved;
  const isDsps = kind === 'dsps';
  const noun = isDsps ? 'DSP' : 'enrichment source';
  const pool = isDsps ? ALL_DSPS : ENRICHMENT_SOURCES;
  const options = pool.filter((name) => !items.includes(name));

  const intro = isDsps
    ? { title: 'DSP ranking', sub: `Drag to reorder. The top ${MAX_RANKED} DSPs can be ranked.` }
    : {
        title: 'Enrichment sources',
        sub: SOUNDSYS_FIELDS.includes(field.id)
          ? 'Song and artist names use Soundsys. RDx is used for licensor, label and distributor.'
          : 'RDx is used for licensor, label and distributor. Song and artist names use Soundsys.',
      };

  const change = (next: string[]) => setDraft(field.id, kind, next);

  return (
    <div className={panel.section}>
      <div className={panel.body}>
        <div className={panel.intro}>
          <div className={panel.introText}>
            <h3 className={panel.introTitle}>{intro.title}</h3>
            <p className={panel.introSub}>{intro.sub}</p>
          </div>
          <span className={panel.countChip}>
            {items.length} of {MAX_RANKED} ranked
          </span>
        </div>
        <RankList
          items={items}
          onChange={change}
          newItems={items.filter((name) => !saved.includes(name))}
          max={MAX_RANKED}
          addLabel={isDsps ? 'Add DSP' : 'Add enrichment source'}
          onAdd={() => setPicking(true)}
          label={intro.title}
          emptyText={`No ${noun}s ranked. Add at least one to save.`}
        />
      </div>

      {draft && (
        <SaveBar
          key={draftKey(field.id, kind)}
          placeholder={COMMENT_PLACEHOLDER}
          onDiscard={() => discardDraft(field.id, kind)}
          onSave={(comment) => {
            const version = saveDraft(field.id, kind, comment);
            if (version) toast(`${field.label} saved as ${version}`);
          }}
          canSave={items.length > 0}
        />
      )}

      <AddSourceModal
        open={picking}
        onClose={() => setPicking(false)}
        onAdd={(name) => {
          change([...items, name]);
          setPicking(false);
        }}
        title={isDsps ? 'Add a DSP' : 'Add an enrichment source'}
        description={`It will be ranked ${ordinal(items.length + 1)} of ${MAX_RANKED}. You can reorder it afterwards.`}
        options={options}
        totalCount={isDsps ? DSP_TOTAL - items.length : undefined}
        noun={noun}
        addLabel={isDsps ? 'Add DSP' : 'Add source'}
      />
    </div>
  );
}
