import { ArrowRight, Bookmark, ChartColumn, Clock, FileText, GitCompareArrows, Play, RefreshCw, Sparkles, TrendingUp, TriangleAlert, type LucideIcon } from 'lucide-react';
import contourFlow from '../assets/textures/contour-flow-tile.svg';
import { ask, greeting } from '../lib/ask';
import { useNotInPrototype } from '../lib/notInPrototype';
import AskChip from './AskChip';
import AskComposer from './AskComposer';
import styles from './AskHome.module.css';

/** Icons from Figma 478:2842, in the order of the chips and saved prompts in ask.json. */
const CHIP_ICONS: LucideIcon[] = [FileText, GitCompareArrows, TrendingUp, ChartColumn, TriangleAlert];
const SAVED_ICONS: LucideIcon[] = [FileText, RefreshCw, ChartColumn];

export interface AskHomeProps {
  firstName: string;
  model: string;
  onModelChange: (model: string) => void;
  /** Typed question. */
  onAsk: (question: string) => void;
  /** A chip or saved prompt: starts that script. */
  onStartScript: (scriptId: string) => void;
}

/** Ask · new chat (Figma 478:2842): greeting, composer, suggestion chips and saved prompts. */
export default function AskHome({ firstName, model, onModelChange, onAsk, onStartScript }: AskHomeProps) {
  const notInPrototype = useNotInPrototype();
  return (
    <div className={styles.home}>
      <div className={styles.greeting}>
        <Sparkles size={32} aria-hidden="true" className={styles.sparkle} />
        <h1 className={styles.title}>{greeting(firstName)}</h1>
        <p className={styles.headline}>{ask.home.headline}</p>
      </div>

      <AskComposer placeholder={ask.home.placeholder} model={model} onModelChange={onModelChange} onSubmit={onAsk} autoFocus />

      <ul className={styles.chips} aria-label="Suggestions">
        {ask.home.chips.map((chip, i) => (
          <li key={chip.label}>
            <AskChip label={chip.label} icon={CHIP_ICONS[i]} onClick={() => onStartScript(chip.script)} />
          </li>
        ))}
      </ul>

      <section className={styles.saved} aria-labelledby="saved-prompts">
        <div className={styles.savedHeader}>
          <Bookmark size={16} aria-hidden="true" className={styles.muted} />
          <h2 id="saved-prompts" className={styles.savedTitle}>
            Saved prompts
          </h2>
          <button type="button" className={styles.viewAll} onClick={() => notInPrototype('All saved prompts')}>
            View all
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>
        <ul className={styles.tiles}>
          {ask.home.savedPrompts.map((prompt, i) => {
            const Icon = SAVED_ICONS[i] ?? FileText;
            return (
              <li key={prompt.title}>
                <button type="button" className={styles.tile} onClick={() => onStartScript(prompt.script)}>
                  <span className={styles.texture} style={{ maskImage: `url(${contourFlow})`, WebkitMaskImage: `url(${contourFlow})` }} aria-hidden="true" />
                  <span className={styles.tileTop}>
                    <span className={styles.tileIcon}>
                      <Icon size={16} aria-hidden="true" />
                    </span>
                    <Play size={14} aria-hidden="true" className={styles.muted} />
                  </span>
                  <span className={styles.tileTitle}>{prompt.title}</span>
                  <span className={styles.tileText}>{prompt.text}</span>
                  <span className={styles.tileMeta}>
                    <Clock size={12} aria-hidden="true" />
                    {prompt.meta}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
