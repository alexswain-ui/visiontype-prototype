import { useEffect, useState } from 'react';
import { ask, scriptById, type AskTurn } from '../lib/ask';
import { useAnswerProgress } from '../lib/useAnswerProgress';
import AskAnswer from './AskAnswer';
import AskFallback from './AskFallback';
import AskQuestion from './AskQuestion';
import AskThinking from './AskThinking';
import styles from './AskTurnView.module.css';

export interface AskTurnViewProps {
  turn: AskTurn;
  model: string;
  /** Called when the answer has fully appeared. */
  onSettled: (id: number) => void;
  /** Called when the answer starts arriving again (Regenerate). */
  onBusy: (id: number) => void;
  onFollowUp: (text: string) => void;
  onSuggestion: (text: string) => void;
}

/** One question and its answer: question bubble, then "thinking", then the answer streams in. */
export default function AskTurnView({ turn, model, onSettled, onBusy, onFollowUp, onSuggestion }: AskTurnViewProps) {
  const [replay, setReplay] = useState(0);
  // The model shown under an answer is the one picked when it was asked (or regenerated).
  const [answeredWith, setAnsweredWith] = useState(model);
  const { phase, progress, step } = useAnswerProgress(turn.animate, replay);
  const script = turn.kind === 'script' ? scriptById(turn.scriptId) : undefined;

  useEffect(() => {
    if (phase === 'done') onSettled(turn.id);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const regenerate = () => {
    onBusy(turn.id);
    setAnsweredWith(model);
    setReplay((r) => r + 1);
  };

  return (
    <section className={styles.turn} aria-label={turn.question}>
      <AskQuestion text={turn.question} />
      {phase === 'thinking' ? (
        <AskThinking step={ask.behaviour.thinkingSteps[step]} />
      ) : script ? (
        <AskAnswer script={script} progress={progress} model={answeredWith} onFollowUp={onFollowUp} onRegenerate={regenerate} />
      ) : (
        <AskFallback line={turn.kind === 'fallback' ? turn.line : undefined} progress={progress} onSuggestion={onSuggestion} />
      )}
    </section>
  );
}
