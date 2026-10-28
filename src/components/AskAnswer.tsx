import { useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Copy, FileCheck, Info, RefreshCw, ThumbsDown, ThumbsUp } from 'lucide-react';
import AiIcon from './AiIcon';
import { useNavigate } from 'react-router-dom';
import { DATA_LINKS, type AskCell, type AskScript, type BenchScript } from '../lib/ask';
import { cx } from '../lib/cx';
import { useNotInPrototype } from '../lib/notInPrototype';
import { useToast } from '../lib/toast';
import { revealed, streamedText } from '../lib/useAnswerProgress';
import AskBanner from './AskBanner';
import AskBars from './AskBars';
import AskChip from './AskChip';
import AskGroupedBars from './AskGroupedBars';
import AskShareBars from './AskShareBars';
import AskTable from './AskTable';
import Button from './Button';
import IconButton from './IconButton';
import styles from './AskAnswer.module.css';

export interface AskAnswerProps {
  script: AskScript | BenchScript;
  /** 0 to 1 while the answer streams in; 1 when complete. */
  progress: number;
  model: string;
  onFollowUp: (text: string) => void;
  onRegenerate: () => void;
  /** page = the Ask page; panel = compact, inside the Data side panel (no message actions, all of the script's actions). */
  variant?: 'page' | 'panel';
  /** Panel only: "Apply to table" and "Open in Data". */
  onApplyToTable?: (script: BenchScript) => void;
}

type StatTile = { label: string; value: string };
type CompareTile = { label: string; values: { name: string; delta: number }[] };

/**
 * A scripted answer (Figma "Card / Answer"). No bubble: heading, summary, then only charts, tables and
 * stat tiles sit in cards. Then "How this was answered", actions, message actions and follow-up chips.
 */
export default function AskAnswer({ script, progress, model, onFollowUp, onRegenerate, variant = 'page', onApplyToTable }: AskAnswerProps) {
  const panel = variant === 'panel';
  const navigate = useNavigate();
  const notInPrototype = useNotInPrototype();
  const toast = useToast();
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const done = progress >= 1;

  const bench = 'panelPrompt' in script ? script : undefined;
  const legacy = bench ? undefined : (script as AskScript);

  const tiles = (legacy && 'tiles' in legacy ? legacy.tiles : undefined) as (StatTile | CompareTile)[] | undefined;
  const statTiles = tiles?.filter((t): t is StatTile => 'value' in t);
  const compareTiles = tiles?.filter((t): t is CompareTile => 'values' in t);
  const shareChart = legacy && 'chart' in legacy && legacy.chart?.type === 'bars' ? (legacy.chart as { groups: string[]; series: { name: string; values: number[] }[] }) : undefined;

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
  if (bench) {
    if (bench.banner) blocks.push(<AskBanner text={bench.banner} />);
    blocks.push(
      <div className={styles.stats}>
        {bench.tiles.map((tile) => {
          const Arrow = tile.dir === 'up' ? ArrowUp : tile.dir === 'down' ? ArrowDown : undefined;
          return (
            <div key={tile.label} className={styles.stat}>
              <p className={cx(styles.statValue, /^[−-]/.test(tile.value) && styles.negative)}>
                {tile.value}
                {Arrow && <Arrow size={16} aria-label={tile.dir === 'up' ? 'Up' : 'Down'} className={tile.dir === 'up' ? styles.up : styles.down} />}
                {tile.sub && <span className={styles.statSub}>{tile.sub}</span>}
              </p>
              <p className={styles.statLabel}>{tile.label}</p>
            </div>
          );
        })}
      </div>,
    );
    if (bench.bars) {
      blocks.push(
        <div className={styles.card}>
          <AskBars title={bench.bars.title} unit={bench.bars.unit} rows={bench.bars.rows} />
        </div>,
      );
    }
    if (bench.table) {
      blocks.push(
        <div className={cx(styles.card, styles.tableCard)}>
          <AskTable
            columns={bench.table.columns}
            rows={bench.table.rows.map((row) => row.map((cell, i) => (typeof cell === 'number' && /\(pts\)/.test(bench.table!.columns[i]) ? `${cell} pts` : cell)))}
            caption={bench.heading}
            deltaColumns={bench.table.columns.map((_, i) => i).slice(1)}
          />
        </div>,
      );
    }
    blocks.push(
      <div className={styles.explainer}>
        <p className={styles.explainerTitle}>
          <Info size={14} aria-hidden="true" />
          How this was answered
        </p>
        <p className={styles.explainerText}>{bench.how}</p>
      </div>,
    );
    // "Open in Ask" is for Ask used inline on the Data pages; on the Ask page itself it is left out.
    const actions = panel ? bench.actions : bench.actions.filter((label) => label !== 'Open in Ask').map((label) => (label === 'Apply to table' ? 'Open in Data' : label));
    if (actions.length) blocks.push(
      <div className={styles.actions}>
        {actions.map((label, i) => (
          <Button key={label} variant={!panel && i === 0 ? 'primary' : undefined} size="small" onClick={() => runAction(bench, label)}>
            {label}
          </Button>
        ))}
      </div>,
    );
  }
  if (legacy) {
  blocks.push(
    <div className={cx(styles.card, styles.tableCard)}>
      <AskTable columns={legacy.table.columns} rows={legacy.table.rows as AskCell[][]} caption={legacy.title} />
    </div>,
  );
  blocks.push(
    <div className={styles.explainer}>
      <p className={styles.explainerTitle}>
        <Info size={14} aria-hidden="true" />
        {legacy.explainer.title}
      </p>
      <p className={styles.explainerText}>{legacy.explainer.text}</p>
    </div>,
  );
  blocks.push(
    <div className={styles.actions}>
      {legacy.actions.map((action) =>
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

  }

  const runAction = (target: BenchScript, label: string) => {
    if (label === 'Add to report') toast('Added to your report (illustrative)', FileCheck);
    else if (panel && label === 'Open in Ask') navigate(`/ask/${target.id}`);
    else if (panel && onApplyToTable && (label === 'Apply to table' || label === 'Open in Data')) onApplyToTable(target);
    else if (DATA_LINKS[target.id] && label === 'Open in Data') navigate(DATA_LINKS[target.id]);
    else notInPrototype(label);
  };

  const copy = async () => {
    try {
      const text = bench ? `${bench.heading}\n\n${bench.answer}\n\n${bench.how}` : `${legacy!.context}\n\n${legacy!.answer}\n\n${legacy!.explainer.text}`;
      await navigator.clipboard.writeText(text);
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
    <article className={cx(styles.answer, panel && styles.compact)} aria-busy={!done}>
      <div className={styles.body}>
        <h2 className={styles.heading}>
          <AiIcon size={panel ? 16 : 20} aria-hidden="true" className={styles.sparkle} />
          {bench ? bench.heading : legacy!.context}
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

        {done && !panel && (
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
