import { useSyncExternalStore } from 'react';
import type { LucideIcon } from 'lucide-react';
import { BriefcaseBusiness, DiscAlbum, MicVocal, Music, Package } from 'lucide-react';
import rules from '../data/rules.json';
import bradleyLawlor from '../assets/people/bradley-lawlor.jpg';
import danielReyes from '../assets/people/daniel-reyes.jpg';
import ellieLake from '../assets/people/ellie-lake.jpg';

/**
 * Harmonisation rules state (fictional, from src/data/rules.json).
 * Kept in memory for the whole visit, so edits survive moving between tabs and pages; a reload starts fresh.
 */

export type RuleKind = 'dsps' | 'enrichment';

export interface HistoryEntry {
  kind: RuleKind;
  version: string;
  when: string;
  who: string;
  change: string;
  comment: string;
}

export interface FieldRule {
  id: string;
  label: string;
  icon: LucideIcon;
  subtitle: string;
  updatedBy: string;
  updatedOn: string;
  ranking: string[];
  enrichment: string[];
  /** Newest first. The top row is the current version. */
  history: HistoryEntry[];
}

export interface Person {
  id: string;
  name: string;
  photo?: string;
}

const PHOTOS: Record<string, string> = {
  'daniel-reyes': danielReyes,
  'ellie-lake': ellieLake,
  'bradley-lawlor': bradleyLawlor,
};

export const personById = (id: string): Person => {
  const person = rules.people.find((p) => p.id === id);
  return { id, name: person?.name ?? id, photo: PHOTOS[id] };
};

/** Icons as drawn in the Figma field list (Label = disc-album, Distributor = package). */
const ICONS: Record<string, LucideIcon> = {
  'song-name': Music,
  'artist-name': MicVocal,
  licensor: BriefcaseBusiness,
  label: DiscAlbum,
  distributor: Package,
};

export const MAX_RANKED = rules.dspMaxRanked;
export const ALL_DSPS = [...rules.dsps, ...rules.dspsAvailableToAdd];
export const ENRICHMENT_SOURCES = rules.enrichmentSources;
export const DSP_TOTAL = rules.dspTotal;
export const SAVED_BY = rules.saveRules.savedBy;
export const COMMENT_PLACEHOLDER = rules.saveRules.commentPlaceholder;

function initialFields(): FieldRule[] {
  const versions = rules.currentVersion as Record<string, string>;
  return rules.fields.map((f) => ({
    id: f.id,
    label: f.label,
    icon: ICONS[f.id] ?? Music,
    subtitle: f.subtitle ?? `Highest rank wins when sources disagree on the ${f.label.toLowerCase()}`,
    updatedBy: f.updatedBy,
    updatedOn: f.updatedOn,
    ranking: [...f.ranking],
    enrichment: [...f.enrichment],
    history:
      f.id === 'song-name'
        ? rules.historySongName.map(({ kind, version, when, who, change, comment }) => ({
            kind: kind as RuleKind,
            version,
            when,
            who,
            change,
            comment,
          }))
        : [
            {
              kind: 'dsps',
              version: versions[f.id] ?? 'v1',
              when: f.updatedOn,
              who: f.updatedBy,
              change: 'Current ranking',
              comment: 'Earlier versions are not part of this prototype.',
            },
          ],
  }));
}

interface State {
  fields: FieldRule[];
  /** Unsaved lists, keyed "fieldId/kind". */
  drafts: Record<string, string[]>;
}

let state: State = { fields: initialFields(), drafts: {} };
const listeners = new Set<() => void>();

function set(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const draftKey = (fieldId: string, kind: RuleKind) => `${fieldId}/${kind}`;
export const savedList = (field: FieldRule, kind: RuleKind) => (kind === 'dsps' ? field.ranking : field.enrichment);
const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i]);

export function useRules(): State {
  return useSyncExternalStore(subscribe, () => state);
}

/** Stores an unsaved list. Going back to the saved order clears the draft. */
export function setDraft(fieldId: string, kind: RuleKind, list: string[]) {
  const field = state.fields.find((f) => f.id === fieldId);
  if (!field) return;
  const drafts = { ...state.drafts };
  if (sameList(list, savedList(field, kind))) delete drafts[draftKey(fieldId, kind)];
  else drafts[draftKey(fieldId, kind)] = list;
  set({ ...state, drafts });
}

export function discardDraft(fieldId: string, kind: RuleKind) {
  const drafts = { ...state.drafts };
  delete drafts[draftKey(fieldId, kind)];
  set({ ...state, drafts });
}

export const ordinal = (n: number) => {
  const tens = n % 100;
  const suffix = tens >= 11 && tens <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[n % 10] ?? 'th';
  return `${n}${suffix}`;
};

/** One line for History, e.g. "Moved Apple Music from 4th to 3rd". */
export function describeChange(before: string[], after: string[], kind: RuleKind): string {
  const parts: string[] = [];
  for (const name of after.filter((x) => !before.includes(x))) {
    parts.push(kind === 'enrichment' ? `Added ${name} as enrichment source` : `Added ${name} at rank ${after.indexOf(name) + 1}`);
  }
  for (const name of before.filter((x) => !after.includes(x))) {
    parts.push(kind === 'enrichment' ? `Removed ${name} as enrichment source` : `Removed ${name}`);
  }
  // Among the sources kept, report the ones that moved up (a swap reads as one move, as in Figma).
  const keptBefore = before.filter((x) => after.includes(x));
  const keptAfter = after.filter((x) => before.includes(x));
  for (const name of keptAfter) {
    if (keptAfter.indexOf(name) < keptBefore.indexOf(name)) {
      parts.push(`Moved ${name} from ${ordinal(before.indexOf(name) + 1)} to ${ordinal(after.indexOf(name) + 1)}`);
    }
  }
  return parts.join('; ') || 'Reordered';
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');
const formatDay = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;

const nextVersion = (version: string) => `v${(parseInt(version.replace(/\D/g, ''), 10) || 0) + 1}`;

/** Saves the draft as a new version and prepends it to History. Returns the new version. */
export function saveDraft(fieldId: string, kind: RuleKind, comment: string): string | undefined {
  const draft = state.drafts[draftKey(fieldId, kind)];
  const field = state.fields.find((f) => f.id === fieldId);
  if (!draft || !field) return undefined;
  const now = new Date();
  const version = nextVersion(field.history[0]?.version ?? 'v0');
  const entry: HistoryEntry = {
    kind,
    version,
    when: `${formatDay(now)}, ${pad(now.getHours())}:${pad(now.getMinutes())}`,
    who: SAVED_BY,
    change: describeChange(savedList(field, kind), draft, kind),
    comment: comment.trim(),
  };
  const updated: FieldRule = {
    ...field,
    ...(kind === 'dsps' ? { ranking: draft } : { enrichment: draft }),
    updatedBy: SAVED_BY,
    updatedOn: formatDay(now),
    history: [entry, ...field.history],
  };
  const drafts = { ...state.drafts };
  delete drafts[draftKey(fieldId, kind)];
  set({ fields: state.fields.map((f) => (f.id === fieldId ? updated : f)), drafts });
  return version;
}
