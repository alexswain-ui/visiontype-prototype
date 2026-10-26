import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import turbulentContours from '../assets/textures/turbulent-contours.svg';
import AskComposer from '../components/AskComposer';
import AskHome from '../components/AskHome';
import AskNav from '../components/AskNav';
import AskTurnView from '../components/AskTurnView';
import TopBar from '../components/TopBar';
import { ask, followUpTurn, matchScript, scriptById, turnFor, type AskTurn } from '../lib/ask';
import { cx } from '../lib/cx';
import { useUser } from '../lib/user';
import styles from './AskPage.module.css';

/** What the home screen passes to a conversation when it starts one. */
interface AskNavState {
  question?: string;
  animate?: boolean;
  /** A typed question with no matching script: shown on /ask with the fallback. */
  fallback?: string;
}

/**
 * Ask (Figma 478:2842 home, 467:2701 / 467:2956 / 467:3200 conversations, 468:3016 model picker).
 * Scripted: chips, saved prompts and typed questions start the matching script; anything else gets the fallback.
 * Opening a conversation from Recents (or a link) shows it complete; starting one plays "thinking" then the answer.
 */
export default function AskPage() {
  const { script } = useParams();
  const location = useLocation();
  if (script && !scriptById(script)) return <Navigate to="/ask" replace />;
  // A fresh session per navigation, so Recents and New chat always start clean.
  return <AskSession key={location.key} scriptId={script} navState={(location.state ?? {}) as AskNavState} />;
}

function AskSession({ scriptId, navState }: { scriptId?: string; navState: AskNavState }) {
  const navigate = useNavigate();
  const { user } = useUser();
  const [model, setModel] = useState(ask.home.model);
  const [turns, setTurns] = useState<AskTurn[]>(() => {
    const script = scriptById(scriptId);
    if (script) return [turnFor(navState.question ?? script.prompt, { animate: Boolean(navState.animate), scriptId: script.id })];
    // An id that matches no script forces the fallback, whatever words the question contains.
    if (navState.fallback) return [turnFor(navState.fallback, { animate: true, scriptId: 'fallback' })];
    return [];
  });
  const [busy, setBusy] = useState<Set<number>>(() => new Set(turns.filter((t) => t.animate).map((t) => t.id)));
  const [status, setStatus] = useState(busy.size ? 'Thinking' : '');
  const lastTurnRef = useRef<HTMLDivElement>(null);
  const script = scriptById(scriptId);
  const home = turns.length === 0;

  // Bring each new question into view.
  useEffect(() => {
    if (turns.length > 1) lastTurnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [turns.length]);

  const settle = useCallback((id: number) => {
    setBusy((set) => {
      if (!set.has(id)) return set;
      const next = new Set(set);
      next.delete(id);
      setStatus('Answer ready');
      return next;
    });
  }, []);

  const markBusy = useCallback((id: number) => {
    setBusy((set) => new Set(set).add(id));
    setStatus('Thinking');
  }, []);

  const add = (turn: AskTurn) => {
    setTurns((list) => [...list, turn]);
    markBusy(turn.id);
  };

  // From the home screen a script opens its own URL, so Recents highlight and the link can be shared.
  const startScript = (id: string, question?: string) => {
    const target = scriptById(id);
    if (target) navigate(`/ask/${target.id}`, { state: { question: question ?? target.prompt, animate: true } satisfies AskNavState });
  };

  const askFromHome = (question: string) => {
    const match = matchScript(question);
    if (match) startScript(match.id, question);
    else navigate('/ask', { state: { fallback: question } satisfies AskNavState });
  };

  const title = script?.title ?? (home ? undefined : 'New chat');

  return (
    <div className={styles.root}>
      <AskNav activeScript={scriptId} home={home} />

      <div className={cx(styles.main, home && styles.mainHome)}>
        {home && <span className={styles.texture} style={{ maskImage: `url(${turbulentContours})`, WebkitMaskImage: `url(${turbulentContours})` }} aria-hidden="true" />}

        <header className={styles.header}>
          {title && (
            <div className={styles.titles}>
              <h1 className={styles.title}>{title}</h1>
              {script && 'entitlementNote' in script && <p className={styles.note}>{script.entitlementNote}</p>}
            </div>
          )}
          <div className={styles.topBar}>
            <TopBar />
          </div>
        </header>

        <p className="visually-hidden" role="status" aria-live="polite">
          {status}
        </p>

        {home ? (
          <div className={styles.homeBody}>
            <AskHome firstName={user.name} model={model} onModelChange={setModel} onAsk={askFromHome} onStartScript={(id) => startScript(id)} />
          </div>
        ) : (
          <>
            <div className={styles.conversation}>
              {turns.map((turn, i) => (
                <div key={turn.id} ref={i === turns.length - 1 ? lastTurnRef : undefined} className={styles.turn}>
                  <AskTurnView
                    turn={turn}
                    model={model}
                    onSettled={settle}
                    onBusy={markBusy}
                    onFollowUp={(text) => add(followUpTurn(text))}
                    onSuggestion={(text) => add(turnFor(text, { animate: true }))}
                  />
                </div>
              ))}
            </div>
            <div className={styles.composerDock}>
              <AskComposer
                placeholder={ask.home.followUpPlaceholder}
                model={model}
                onModelChange={setModel}
                onSubmit={(question) => add(turnFor(question, { animate: true }))}
                busy={busy.size > 0}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
