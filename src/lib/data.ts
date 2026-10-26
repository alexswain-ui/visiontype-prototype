import cast from '../data/cast.json';

/** Fictional, illustrative data shared by every screen (src/data/cast.json). */
export { cast };

export type Song = (typeof cast.songs)[number];
export type Artist = (typeof cast.artists)[number];
export type Market = (typeof cast.markets)[number];
export type CanonicalRow = (typeof cast.canonicalRows)[number];

export const songById = (id: string) => cast.songs.find((s) => s.id === id);
export const artistById = (id: string) => cast.artists.find((a) => a.id === id);
export const marketByCode = (code: string) => cast.markets.find((m) => m.iso === code || m.code === code);

/** "6,012,440" */
export const formatNumber = (value: number) => value.toLocaleString('en-GB');
