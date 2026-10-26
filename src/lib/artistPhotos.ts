import ellaVibe from '../assets/artists/ella-vibe.jpg';
import jaxonBeat from '../assets/artists/jaxon-beat.jpg';
import lunaSky from '../assets/artists/luna-sky.jpg';
import maxineHarmon from '../assets/artists/maxine-harmon.jpg';
import more1 from '../assets/artists/more-1.jpg';
import more2 from '../assets/artists/more-2.jpg';
import more3 from '../assets/artists/more-3.jpg';
import novaRay from '../assets/artists/nova-ray.jpg';

/** Artist photos from the Figma dashboard (96px). Artists without one fall back to initials in <Avatar>. */
const PHOTOS: Record<string, string> = {
  'luna-sky': lunaSky,
  'maxine-harmon': maxineHarmon,
  'ella-vibe': ellaVibe,
  'jaxon-beat': jaxonBeat,
  'nova-ray': novaRay,
};

export const artistPhoto = (id: string): string | undefined => PHOTOS[id];

/** The stacked faces in "+160 more" (unnamed roster artists). */
export const MORE_PHOTOS = [more1, more2, more3];
