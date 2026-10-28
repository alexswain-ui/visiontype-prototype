import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ArrowUp, Expand, Eye, X } from 'lucide-react';
import { ask, followUpTurn, PANEL_PROMPTS, PANEL_SUGGESTIONS, turnFor, type AskTurn, type BenchScript } from '../lib/ask';
import AiIcon from './AiIcon';
import AskTurnView from './AskTurnView';
import Badge from './Badge';
import IconButton from './IconButton';
import styles from './AskPanel.module.css';

/** What the panel can see in the table behind it. The context line and the "What I can see" card are built from it. */
export interface AskPanelContext {
  tab: string;
  markets: string;
  period: string;
  access: string;
}

/**
 * The conversation in the Data side panel. It lives in the page, not the panel, so it stays when the panel is
 * closed and when the user changes tabs. Scripted: only the benchmark scripts answer here.
 */
export function useAskPanelSession() {
  const [turns, setTurns] = useState<AskTurn[]>([]);
  const add = (turn: AskTurn) => setTurns((list) => [...list, turn]);
  return {
    turns,
    ask: (text: string) => add(turnFor(text, { animate: true, scope: 'bench' })),
    prompt: (text: string, scriptId?: string) => add(turnFor(text, { animate: true, scope: 'bench', scriptId: scriptId ?? 'fallback' })),
    followUp: (text: string) => add(followUpTurn(text, 'bench')),
  };
}

export type AskPanelSession = ReturnType<typeof useAskPanelSession>;

export interface AskPanelProps {
  context: AskPanelContext;
  session: AskPanelSession;
  onClose: () => void;
  /** Expand to the full Ask page. */
  onExpand: () => void;
  onApplyToTable: (script: BenchScript) => void;
}

/** What each tab lists, for the question box placeholder ("Ask about the artists in this table…"). */
const NOUN: Record<string, string> = { Artist: 'artists', Song: 'songs', Country: 'countries', 'Canonical Data': 'rows' };

const CONTEXT_ROWS: { key: keyof AskPanelContext; label: string }[] = [
  { key: 'tab', label: 'Tab' },
  { key: 'markets', label: 'Markets' },
  { key: 'period', label: 'Period' },
  { key: 'access', label: 'Access' },
];

/**
 * Ask side panel on the Data page (Figma 731:4987 empty, 731:5482 answer). Same 444px width as the sheet and it
 * takes the sheet's place. Answers reuse the Ask answer blocks in their compact variant.
 */
export default function AskPanel({ context, session, onClose, onExpand, onApplyToTable }: AskPanelProps) {
  const [text, setText] = useState('');
  const fieldId = useId();
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const { turns } = session;
  const empty = turns.length === 0;

  // On open: focus the question box, and let Esc close the panel.
  useEffect(() => {
    fieldRef.current?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') closeRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // Bring the newest question into view.
  useEffect(() => {
    const body = bodyRef.current;
    if (body && turns.length > 0) body.scrollTo({ top: body.scrollHeight, behavior: 'smooth' });
  }, [turns.length]);

  const send = (event?: FormEvent) => {
    event?.preventDefault();
    const question = text.trim();
    if (!question) {
      fieldRef.current?.focus();
      return;
    }
    session.ask(question);
    setText('');
  };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  const contextLine = [context.tab, context.markets, context.period].join(' · ');

  return (
    <aside className={styles.panel} aria-label="Ask about this data">
      <header className={styles.header}>
        <span className={styles.tile} aria-hidden="true">
          <AiIcon size={20} />
        </span>
        <div className={styles.titles}>
          <h2 className={styles.title}>Ask about this data</h2>
          <p className={styles.context}>{contextLine}</p>
        </div>
        <div className={styles.buttons}>
          <IconButton icon={Expand} label="Expand to Ask page" size="small" onClick={onExpand} />
          <IconButton icon={X} label="Close" size="small" onClick={onClose} />
        </div>
      </header>

      <div ref={bodyRef} className={styles.body}>
        {empty ? (
          <>
            <section className={styles.sees} aria-labelledby={`${fieldId}-sees`}>
              <h3 id={`${fieldId}-sees`} className={styles.seesTitle}>
                <Eye size={14} aria-hidden="true" />
                What I can see
              </h3>
              <ul className={styles.seesChips}>
                {CONTEXT_ROWS.map(({ key, label }) => (
                  <li key={key} className={styles.seesChip}>
                    <span className={styles.seesLabel}>{label}</span>
                    <span className={styles.seesValue}>{context[key]}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section aria-labelledby={`${fieldId}-try`}>
              <h3 id={`${fieldId}-try`} className={styles.overline}>
                Try asking
              </h3>
              <ul className={styles.prompts}>
                {PANEL_PROMPTS.map((p) => (
                  <li key={p.prompt}>
                    <button type="button" className={styles.prompt} onClick={() => session.prompt(p.prompt, p.scriptId)}>
                      <span>{p.prompt}</span>
                      {p.illustrative && <Badge label="Illustrative" tone="amber" size="small" />}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : (
          <div className={styles.turns}>
            {turns.map((turn) => (
              <AskTurnView
                key={turn.id}
                turn={turn}
                model={ask.home.model}
                variant="panel"
                suggestions={PANEL_SUGGESTIONS}
                onSettled={() => {}}
                onBusy={() => {}}
                onFollowUp={session.followUp}
                onSuggestion={(q) => session.ask(q)}
                onApplyToTable={onApplyToTable}
              />
            ))}
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <form className={styles.row} onSubmit={send}>
          <label htmlFor={fieldId} className="visually-hidden">
            Ask about this data
          </label>
          <div className={styles.input}>
            <textarea
              ref={fieldRef}
              id={fieldId}
              className={styles.field}
              rows={1}
              placeholder={`Ask about the ${NOUN[context.tab] ?? 'rows'} in this table…`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
          <IconButton icon={ArrowUp} label="Send" variant="tertiary" size="medium" type="submit" />
        </form>
        <p className={styles.note}>Illustrative answers · uses only data you can see</p>
      </footer>
    </aside>
  );
}
