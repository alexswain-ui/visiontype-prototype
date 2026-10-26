import { useState, type ReactNode } from 'react';
import { Copy, Info, RefreshCw, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AskCell, AskScript } from '../lib/ask';
import { cx } from '../lib/cx';
import { useNotInPrototype } from '../lib/notInPrototype';
import { useToast } from '../lib/toast';
import { revealed, streamedText } from '../lib/useAnswerProgress';
import AskChip from './AskChip';
import AskGroupedBars from './AskGroupedBars';
import AskShareBars from './AskShareBars';
import AskTable from './AskTable';
import Button from './Button';
import IconButton from './IconButton';
import styles from './AskAnswer.module.css';

export interface AskAnswerProps {
  script: AskScript;
  /** 0 to 1 while the answer streams in; 1 when complete. */
  progress: number;
  model: string;
  onFollowUp: (text: string) => void;
  onRegenerate: () => void;
}

type StatTile = { label: string; value: string };
type CompareTile = { label: string; values: { name: string; delta: number }[] };

/**
 * A scripted answer (Figma "Card / Answer"). No bubble: heading, summary, then only charts, tables and
 * stat tiles sit in cards. Then "How this was answered", actions, message actions and follow-up chips.
 */
export default function AskAnswer({ script, progress, model, onFollowUp, onRegenerate }: AskAnswerProps) {
  const navigate = useNavigate();
  const notInPrototype = useNotInPrototype();
  const toast = useToast();
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const done = progress >= 1;

  const tiles = ('tiles' in script ? script.tiles : undefined) as (StatTile | CompareTile)[] | undefined;
  const statTiles = tiles?.filter((t): t is StatTile => 'value' in t);
  const compareTiles = tiles?.filter((t): t is CompareTile => 'values' in t);
  const shareChart = 'chart' in script && script.chart?.type === 'bars' ? (script.chart as { groups: string[]; series: { name: string; values: number[] }[] }) : undefined;

  const blocks: ReactNode[] = [];
  if (statTiles?.length) {
    blocks.push(
      <div className={styles.stats}>
        {statTiles.map((tile) => (
          <div key={tile.label} className={styles.stat}>
            <p className={cx(styles.statValue, /^[−-]/.test(tile.value) && styles.negative)}>{tile.value}</p>
            <p className={styles.statLabel}>{tile.label}</p>
          </div>
        ))}
      </div>,
    );
  }
  // Figma draws the comparison as grouped bars of the week / month / year changes (not the weekly line in the JSON).
  if (compareTiles?.length) {
    blocks.push(
      <div className={styles.card}>
        <AskGroupedBars groups={compareTiles} />
      </div>,
    );
  }
  if (shareChart) {
    blocks.push(
      <div className={styles.card}>
        <AskShareBars groups={shareChart.groups} series={shareChart.series} />
      </div>,
    );
  }
  blocks.push(
    <div className={cx(styles.card, styles.tableCard)}>
      <AskTable columns={script.table.columns} rows={script.table.rows as AskCell[][]} caption={script.title} />
    </div>,
  );
  blocks.push(
    <div className={styles.explainer}>
      <p className={styles.explainerTitle}>
        <Info size={14} aria-hidden="true" />
        {script.explainer.title}
      </p>
      <p className={styles.explainerText}>{script.explainer.text}</p>
    </div>,
  );
  blocks.push(
    <div className={styles.actions}>
      {script.actions.map((action) =>
        'to' in action && action.to ? (
          <Button key={action.label} variant="primary" size="small" onClick={() => navigate(action.to)}>
            {action.label}
          </Button>
        ) : (
          <Button key={action.label} size="small" onClick={() => notInPrototype(action.label)}>
            {action.label}
          </Button>
        ),
      )}
    </div>,
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${script.context}\n\n${script.answer}\n\n${script.explainer.text}`);
      toast('Answer copied', Copy);
    } catch {
      toast('Copying is blocked in this browser');
    }
  };

  const rate = (value: 'up' | 'down') => {
    const next = feedback === value ? null : value;
    setFeedback(next);
    if (next) toast('Thanks for the feedback');
  };

  return (
    <article className={styles.answer} aria-busy={!done}>
      <div className={styles.body}>
        <h2 className={styles.heading}>
          <Sparkles size={20} aria-hidden="true" className={styles.sparkle} />
          {script.context}
        </h2>
        <p className={styles.summary}>{streamedText(script.answer, progress)}</p>

        {blocks.map(
          (block, i) =>
            revealed(progress, i, blocks.length) && (
              <div key={i} className={styles.reveal}>
                {block}
              </div>
            ),
        )}

        {done && (
          <div className={cx(styles.messageActions, styles.reveal)}>
            <IconButton icon={Copy} label="Copy" variant="ghost" size="small" onClick={copy} />
            <IconButton icon={ThumbsUp} label="Good answer" variant="ghost" size="small" aria-pressed={feedback === 'up'} className={cx(feedback === 'up' && styles.rated)} onClick={() => rate('up')} />
            <IconButton icon={ThumbsDown} label="Poor answer" variant="ghost" size="small" aria-pressed={feedback === 'down'} className={cx(feedback === 'down' && styles.rated)} onClick={() => rate('down')} />
            <IconButton icon={RefreshCw} label="Regenerate" variant="ghost" size="small" onClick={onRegenerate} />
            <span className={styles.spacer} />
            <span className={styles.model}>{model}</span>
          </div>
        )}
      </div>

      {done && (
        <div className={cx(styles.followUps, styles.reveal)}>
          <span className={styles.followUpLabel}>Follow up</span>
          {script.followUps.map((text) => (
            <AskChip key={text} label={text} variant="followUp" onClick={() => onFollowUp(text)} />
          ))}
        </div>
      )}
    </article>
  );
}
