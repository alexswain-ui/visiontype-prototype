import { createContext, useContext, useState, type ReactNode } from 'react';
import { artistById, cast, songById } from './data';
import { entityBaseSeries, marketName, type EntityKind } from './entities';

/**
 * Following (in memory only: it resets on reload). ALL DATA IS FICTIONAL.
 * Six items are followed to start with, taken from cast.json. The bell updates are scripted.
 */

export const FOLLOW_LIMIT = 25;

export type FollowKind = EntityKind;

export interface FollowPrefs {
  weeklySummary: boolean;
  bigMoves: boolean;
  newMarkets: boolean;
  restatements: boolean;
  vsMarket: boolean;
  vsPeers: boolean;
  vsGenre: boolean;
}

export const DEFAULT_PREFS: FollowPrefs = {
  weeklySummary: true,
  bigMoves: true,
  newMarkets: false,
  restatements: true,
  vsMarket: true,
  vsPeers: false,
  vsGenre: false,
};

export interface Followed {
  key: string;
  kind: FollowKind;
  id: string;
  prefs: FollowPrefs;
}

export const followKey = (kind: FollowKind, id: string) => `${kind}:${kind === 'country' ? id.toUpperCase() : id}`;
export const parseFollowKey = (key: string): { kind: FollowKind; id: string } => {
  const [kind, ...rest] = key.split(':');
  return { kind: kind as FollowKind, id: rest.join(':') };
};

const SEED: [FollowKind, string][] = [
  ['song', 'saffron-ferry'],
  ['song', 'midnight-static'],
  ['artist', 'luna-sky'],
  ['artist', 'odalie-brask'],
  ['country', 'GB'],
  ['country', 'DE'],
];

/* ---------- What a followed item looks like ---------- */

/** Ids of everything of one kind in cast.json (songs, artists, markets). */
export const entityIds = (kind: FollowKind): string[] =>
  kind === 'song' ? cast.songs.map((s) => s.id) : kind === 'artist' ? cast.artists.map((a) => a.id) : cast.markets.map((m) => m.iso);

export const kindLabel = (kind: FollowKind) => (kind === 'song' ? 'Song' : kind === 'artist' ? 'Artist' : 'Market');

export const entityName = (kind: FollowKind, id: string) =>
  kind === 'song' ? (songById(id)?.title ?? id) : kind === 'artist' ? (artistById(id)?.name ?? id) : marketName(id);

export const entityPath = (kind: FollowKind, id: string) => `/${kind}/${id}`;

/** Eight weekly values in millions, oldest first (W35 to W42), or null when the entity is unknown. */
export const weeklyValues = (kind: FollowKind, id: string): number[] | null => entityBaseSeries(kind, id)?.current ?? null;

/** The week labels that go with weeklyValues, oldest first. */
export const WEEK_LABELS = [...cast.weeks].reverse().map((w) => w.w);

const round1 = (value: number) => Math.round(value * 10) / 10;

/** Latest week against the week before, in percent. */
export function latestChange(values: number[]): number {
  const n = values.length;
  return round1(((values[n - 1] - values[n - 2]) / values[n - 2]) * 100);
}

/** The average of everything else of the same kind, week by week. */
export function marketAverage(kind: FollowKind): number[] {
  const all = entityIds(kind).map((id) => weeklyValues(kind, id)).filter((v): v is number[] => v !== null);
  return WEEK_LABELS.map((_, i) => +(all.reduce((sum, v) => sum + v[i], 0) / all.length).toFixed(2));
}

/** 1 = biggest by the latest week. */
export function rankOf(kind: FollowKind, id: string): { rank: number; of: number } {
  const latest = (i: string) => weeklyValues(kind, i)?.at(-1) ?? 0;
  const ids = entityIds(kind);
  return { rank: ids.filter((i) => latest(i) > latest(id)).length + 1, of: ids.length };
}

/* ---------- Bell updates ---------- */

export interface Update {
  id: number;
  text: string;
  to: string;
  when: string;
}

const SEED_UPDATES: Omit<Update, 'id'>[] = [
  { text: 'Saffron Ferry is up 12% in the UK', to: '/song/saffron-ferry', when: 'Fri 16 Oct' },
  { text: 'Luna Sky entered the top 5 in Germany', to: '/artist/luna-sky', when: 'Fri 16 Oct' },
  { text: 'Midnight Static was restated by 3,114 streams', to: '/song/midnight-static', when: 'Fri 9 Oct' },
];

/** What "Simulate next Friday's update" adds, one at a time. */
const NEXT_UPDATES: Omit<Update, 'id'>[] = [
  { text: 'Odalie Brask is up 9% in France', to: '/artist/odalie-brask', when: 'Fri 23 Oct' },
  { text: 'Saffron Ferry entered the top 3 in France', to: '/song/saffron-ferry', when: 'Fri 23 Oct' },
  { text: 'The United Kingdom grew 6% week on week', to: '/country/GB', when: 'Fri 23 Oct' },
];

/* ---------- Context ---------- */

interface FollowContextValue {
  items: Followed[];
  count: number;
  isFollowing: (kind: FollowKind, id: string) => boolean;
  /** Returns false when the limit has been reached. */
  follow: (kind: FollowKind, id: string, prefs: FollowPrefs) => boolean;
  unfollow: (key: string) => void;
  updates: Update[];
  unread: boolean;
  markRead: () => void;
  simulateNext: () => void;
}

const FollowContext = createContext<FollowContextValue | null>(null);

export function FollowProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Followed[]>(() => SEED.map(([kind, id]) => ({ key: followKey(kind, id), kind, id, prefs: { ...DEFAULT_PREFS } })));
  const [updates, setUpdates] = useState<Update[]>(() => SEED_UPDATES.map((u, i) => ({ ...u, id: i + 1 })));
  const [unread, setUnread] = useState(true);
  const [simulated, setSimulated] = useState(0);

  const value: FollowContextValue = {
    items,
    count: items.length,
    isFollowing: (kind, id) => items.some((i) => i.key === followKey(kind, id)),
    follow: (kind, id, prefs) => {
      if (items.length >= FOLLOW_LIMIT) return false;
      const key = followKey(kind, id);
      if (!items.some((i) => i.key === key)) setItems((list) => [{ key, kind, id: kind === 'country' ? id.toUpperCase() : id, prefs }, ...list]);
      return true;
    },
    unfollow: (key) => setItems((list) => list.filter((i) => i.key !== key)),
    updates,
    unread,
    markRead: () => setUnread(false),
    simulateNext: () => {
      const next = NEXT_UPDATES[simulated % NEXT_UPDATES.length];
      setUpdates((list) => [{ ...next, id: Date.now() }, ...list]);
      setUnread(true);
      setSimulated((n) => n + 1);
    },
  };
  return <FollowContext.Provider value={value}>{children}</FollowContext.Provider>;
}

export function useFollow(): FollowContextValue {
  const value = useContext(FollowContext);
  if (!value) throw new Error('useFollow must be used inside <FollowProvider>');
  return value;
}
