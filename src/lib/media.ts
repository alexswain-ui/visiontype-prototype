/** Song artwork and artist photos exported from the Figma prototype (112px JPEGs). */

const artwork = import.meta.glob<string>('../assets/artwork/*.jpg', { eager: true, import: 'default' });
const photos = import.meta.glob<string>('../assets/artist-photos/*.jpg', { eager: true, import: 'default' });

const byId = (files: Record<string, string>) =>
  Object.fromEntries(Object.entries(files).map(([path, url]) => [path.split('/').pop()!.replace('.jpg', ''), url]));

const ARTWORK = byId(artwork);
const PHOTOS = byId(photos);
const ARTWORK_LIST = Object.values(ARTWORK);

/** Artwork for a song in cast.json. Songs without their own artwork borrow one by index. */
export function artworkFor(songId: string, fallbackIndex = 0): string | undefined {
  return ARTWORK[songId] ?? ARTWORK_LIST[fallbackIndex % ARTWORK_LIST.length];
}

/** Photo for an artist in cast.json, if one was exported. */
export function photoFor(artistId: string): string | undefined {
  return PHOTOS[artistId];
}
