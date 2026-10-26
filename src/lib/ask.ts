import ask from '../data/ask.json';

/** Scripted Ask (src/data/ask.json): no live model, typed text is matched to a script by keywords. */
export { ask };

export type AskScript = (typeof ask.scripts)[number];
export type ScriptId = 'odalie-vs-petra' | 'restated' | 'uk-share';

/** Table cells are text, or a number that is a percent change. */
export type AskCell = string | number;

export const scriptById = (id: string | undefined): AskScript | undefined => ask.scripts.find((s) => s.id === id);

/**
 * The script whose keywords appear most often in the text, or undefined for the fallback.
 * Text is padded with spaces so keywords such as " vs " also match at the start or end.
 */
export function matchScript(text: string): AskScript | undefined {
  const haystack = ` ${text.toLowerCase().replace(/[’']/g, "'")} `;
  let best: AskScript | undefined;
  let bestScore = 0;
  for (const script of ask.scripts) {
    const score = script.keywords.filter((keyword) => haystack.includes(keyword.toLowerCase())).length;
    if (score > bestScore) {
      best = script;
      bestScore = score;
    }
  }
  return best;
}

/** One question and its answer in a conversation. */
export type AskTurn =
  | { id: number; kind: 'script'; question: string; scriptId: string; animate: boolean }
  | { id: number; kind: 'fallback'; question: string; line?: string; animate: boolean };

let nextTurnId = 1;

/** A turn for typed or chip text: the matching script, otherwise the fallback (with an optional lead line). */
export function turnFor(question: string, options: { animate: boolean; scriptId?: string; line?: string }): AskTurn {
  const script = options.scriptId ? scriptById(options.scriptId) : matchScript(question);
  const id = nextTurnId++;
  return script
    ? { id, kind: 'script', question, scriptId: script.id, animate: options.animate }
    : { id, kind: 'fallback', question, line: options.line, animate: options.animate };
}

/** Follow-up chips have no scripts in this prototype, so they always get the fallback with a friendly line. */
export function followUpTurn(question: string): AskTurn {
  const opens = (ask.behaviour.followUpOpensScript as Record<string, string | null>)[question];
  if (opens) return turnFor(question, { animate: true, scriptId: opens });
  return { id: nextTurnId++, kind: 'fallback', question, line: ask.behaviour.followUpLine, animate: true };
}

/** "Good afternoon, Maya" */
export const greeting = (firstName: string) => ask.home.greeting.replace('{firstName}', firstName);
