import ask from '../data/ask.json';
import benchmark from '../data/ask-benchmark.json';

/** Scripted Ask (src/data/ask.json): no live model, typed text is matched to a script by keywords. */
export { ask };

export type AskScript = (typeof ask.scripts)[number];
export type ScriptId = 'odalie-vs-petra' | 'restated' | 'uk-share';

/** Table cells are text, or a number that is a percent change. */
export type AskCell = string | number;

export const scriptById = (id: string | undefined): AskScript | undefined => ask.scripts.find((s) => s.id === id);

/* ---------- Benchmark scripts (src/data/ask-benchmark.json) ---------- */

export type BenchTile = { label: string; value: string; sub?: string; dir?: 'up' | 'down' };
/** A bars row: label, value, highlighted. */
export type BenchBarRow = [string, number, boolean];
export interface BenchScript {
  id: string;
  panelPrompt: string;
  keywords: string[];
  illustrative?: boolean;
  banner?: string;
  heading: string;
  answer: string;
  tiles: BenchTile[];
  bars?: { title: string; unit: string; rows: BenchBarRow[] };
  table?: { columns: string[]; rows: (string | number)[][] };
  how: string;
  actions: string[];
  followUps: string[];
  /** Apply to table: filter these markets, highlight this row (an id on the Artist tab) and sort by this column. */
  applyToTable?: { markets: string[]; highlight: string; sortBy: string };
}

export const benchScripts = benchmark.scripts as unknown as BenchScript[];
export const benchById = (id: string | undefined): BenchScript | undefined => benchScripts.find((s) => s.id === id);
/** True for an older script or a benchmark script. */
export const knownScript = (id: string | undefined) => Boolean(scriptById(id) ?? benchById(id));

/** The question a script answers, as it appears in the conversation. */
export const scriptPrompt = (id: string): string => scriptById(id)?.prompt ?? benchById(id)?.panelPrompt ?? '';
/** Header title of an open conversation. */
export const scriptTitle = (id: string | undefined): string | undefined => {
  const legacy = scriptById(id);
  if (legacy) return legacy.title;
  const bench = benchById(id);
  return bench ? (ask.home.recents.find((r) => 'script' in r && r.script === bench.id)?.title ?? bench.panelPrompt) : undefined;
};

/** Where "Open in Data" / "Apply to table" lead, per benchmark script: a Data tab plus filters. */
export const DATA_LINKS: Record<string, string> = {
  'artist-vs-uk-artists': '/data/artists?markets=GB&sort=capped',
  'markets-growing-faster': '/data/countries',
  'dip-just-me': '/data/artists?markets=GB',
  'uk-vs-france': '/data/countries?markets=GB,FR',
};

const normalise = (text: string) =>
  ` ${text
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9' ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `;

/** "all" = every script; "bench" = the benchmark scripts only (the Data side panel). */
export type AskScope = 'all' | 'bench';

const allPrompts = (scope: AskScope = 'all'): { id: string; prompt: string }[] => [
  ...(scope === 'all' ? ask.scripts.map((s) => ({ id: s.id, prompt: s.prompt })) : []),
  ...benchScripts.map((s) => ({ id: s.id, prompt: s.panelPrompt })),
];

/**
 * The script for typed text, or undefined for the fallback.
 * 1. The whole prompt of a script (any case, ignoring punctuation) wins outright.
 * 2. Otherwise the script with the most keyword matches, where a multi-word phrase counts once per word and
 *    longer words break ties, so "other artists" beats a lone "compare". Remaining ties go to the first script.
 * Text is padded with spaces so keywords such as " vs " also match at the start or end.
 */
export function matchScript(text: string, scope: AskScope = 'all'): { id: string } | undefined {
  const haystack = normalise(text);
  const exact = allPrompts(scope).find((p) => normalise(p.prompt) === haystack);
  if (exact) return exact;
  let best: { id: string } | undefined;
  let bestScore = 0;
  const candidates = [...(scope === 'all' ? ask.scripts.map((s) => ({ id: s.id, keywords: s.keywords })) : []), ...benchScripts.map((s) => ({ id: s.id, keywords: s.keywords }))];
  for (const script of candidates) {
    // Keywords match as written (so "restat" matches "restated" and " vs " needs spaces); the longer the phrase, the more it counts.
    const score = script.keywords.reduce((sum, keyword) => {
      const key = keyword.toLowerCase().replace(/[’']/g, "'");
      return haystack.includes(key) ? sum + key.trim().split(' ').length + key.trim().length / 100 : sum;
    }, 0);
    if (score > bestScore) {
      best = script;
      bestScore = score;
    }
  }
  return best;
}

/** True when the text is one of the benchmark follow-up chips (which have no script of their own). */
export const isBenchFollowUp = (text: string) => benchScripts.some((s) => s.followUps.some((f) => normalise(f) === normalise(text)));

/** Shown for benchmark follow-ups that have no script. Never gives a reason. */
export const FOLLOW_UP_LINE = 'I can show what changed, not why. Try: which songs drove it?';

/** One question and its answer in a conversation. */
export type AskTurn =
  | { id: number; kind: 'script'; question: string; scriptId: string; animate: boolean }
  | { id: number; kind: 'fallback'; question: string; line?: string; lineOnly?: boolean; animate: boolean };

let nextTurnId = 1;

/**
 * A turn for typed or chip text: the matching script, otherwise the fallback (with an optional lead line).
 * A benchmark follow-up chip with no script of its own gets the one-line "what changed, not why" reply.
 */
export function turnFor(question: string, options: { animate: boolean; scriptId?: string; line?: string; scope?: AskScope }): AskTurn {
  const id = nextTurnId++;
  if (!options.scriptId && isBenchFollowUp(question)) {
    return { id, kind: 'fallback', question, line: FOLLOW_UP_LINE, lineOnly: true, animate: options.animate };
  }
  const match = options.scriptId ? (knownScript(options.scriptId) ? { id: options.scriptId } : undefined) : matchScript(question, options.scope);
  return match
    ? { id, kind: 'script', question, scriptId: match.id, animate: options.animate }
    : { id, kind: 'fallback', question, line: options.line, animate: options.animate };
}

/**
 * Follow-up chips: if the text equals another script's prompt (or a defined follow-up) that script runs;
 * otherwise the benchmark line, or for the older scripts their friendly line.
 */
export function followUpTurn(question: string, scope: AskScope = 'all'): AskTurn {
  const opens = (ask.behaviour.followUpOpensScript as Record<string, string | null>)[question];
  if (opens) return turnFor(question, { animate: true, scriptId: opens });
  const prompt = allPrompts(scope).find((p) => normalise(p.prompt) === normalise(question));
  if (prompt) return turnFor(question, { animate: true, scriptId: prompt.id, scope });
  if (isBenchFollowUp(question)) return turnFor(question, { animate: true, scope });
  return { id: nextTurnId++, kind: 'fallback', question, line: ask.behaviour.followUpLine, animate: true };
}

/** "Good afternoon, Maya" */
export const greeting = (firstName: string) => ask.home.greeting.replace('{firstName}', firstName);

/* ---------- Data side panel ---------- */

/** The prompt that is not scripted: the panel answers it with the fallback line. */
export const PANEL_FALLBACK_PROMPT = 'What changed in this table since last week?';

/** The five prompts under "Try asking": the benchmark panelSuggestionOrder, then the unscripted one. */
export const PANEL_PROMPTS: { prompt: string; scriptId?: string; illustrative?: boolean }[] = [
  ...(benchmark.panelSuggestionOrder as string[]).map((id) => {
    const script = benchById(id)!;
    return { prompt: script.panelPrompt, scriptId: id, illustrative: Boolean(script.illustrative) };
  }),
  { prompt: PANEL_FALLBACK_PROMPT },
];

/** Sample questions offered when the panel has no answer: the first three scripted prompts. */
export const PANEL_SUGGESTIONS = PANEL_PROMPTS.filter((p) => p.scriptId).slice(0, 3).map((p) => p.prompt);
