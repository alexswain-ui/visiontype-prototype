import { useEffect, useState } from 'react';
import { ask } from './ask';

export type AnswerPhase = 'thinking' | 'streaming' | 'done';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Timing for a scripted answer: a short "thinking" row, then the answer appears over about 1.5 seconds.
 * `progress` runs 0 to 1 while streaming. With `animate` off (or reduced motion) the answer is shown at once.
 * Changing `replay` runs the animation again (the Regenerate button).
 */
export function useAnswerProgress(animate: boolean, replay = 0) {
  const instant = !animate || reducedMotion();
  const [state, setState] = useState<{ phase: AnswerPhase; progress: number; step: number }>(() =>
    instant ? { phase: 'done', progress: 1, step: 0 } : { phase: 'thinking', progress: 0, step: 0 },
  );

  useEffect(() => {
    if (reducedMotion() || (!animate && replay === 0)) {
      setState({ phase: 'done', progress: 1, step: 0 });
      return;
    }
    const { thinkingMs, streamMs, thinkingSteps } = ask.behaviour;
    const stepMs = thinkingMs / thinkingSteps.length;
    let frame = 0;
    const start = performance.now();
    setState({ phase: 'thinking', progress: 0, step: 0 });

    const tick = (now: number) => {
      const elapsed = now - start;
      if (elapsed < thinkingMs) {
        setState({ phase: 'thinking', progress: 0, step: Math.min(thinkingSteps.length - 1, Math.floor(elapsed / stepMs)) });
      } else if (elapsed < thinkingMs + streamMs) {
        setState({ phase: 'streaming', progress: (elapsed - thinkingMs) / streamMs, step: 0 });
      } else {
        setState({ phase: 'done', progress: 1, step: 0 });
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // Runs once per turn, and again when replay changes.
  }, [replay]); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}

/**
 * How much of a streamed answer is visible: the summary text writes out over the first 40%,
 * then each block (stats, chart, table, explainer, actions) fades in in turn.
 */
export function revealed(progress: number, blockIndex: number, blockCount: number) {
  if (progress >= 1) return true;
  const start = 0.4 + (0.55 * blockIndex) / Math.max(1, blockCount);
  return progress >= start;
}

/** The first part of `text` to show at this progress, cut at a word boundary. */
export function streamedText(text: string, progress: number) {
  if (progress >= 0.4) return text;
  const words = text.split(' ');
  return words.slice(0, Math.ceil((words.length * progress) / 0.4)).join(' ');
}
