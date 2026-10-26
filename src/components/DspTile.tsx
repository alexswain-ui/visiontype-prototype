import { cx } from '../lib/cx';
import appleMusic from '../assets/dsp/apple-music.png';
import deezer from '../assets/dsp/deezer.png';
import itunes from '../assets/dsp/itunes.png';
import spotify from '../assets/dsp/spotify.png';
import youtube from '../assets/dsp/youtube.png';
import styles from './DspTile.module.css';

/** Logo artwork exported from the Figma prototype (Rules · DSPs). */
const LOGOS: Record<string, { src: string; wide?: boolean }> = {
  spotify: { src: spotify },
  youtube: { src: youtube, wide: true },
  'apple music': { src: appleMusic },
  deezer: { src: deezer },
  itunes: { src: itunes },
};

export interface DspTileProps {
  name: string;
  size?: 24 | 32 | 40;
}

/** Square DSP logo tile. Unknown DSPs get a two-letter fallback tile. */
export default function DspTile({ name, size = 32 }: DspTileProps) {
  const logo = LOGOS[name.toLowerCase()];
  const words = name.trim().split(/\s+/);
  const letters = (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
  return (
    <span className={cx(styles.tile, styles[`s${size}`])} role="img" aria-label={name} title={name}>
      {logo ? (
        <img src={logo.src} alt="" className={cx(styles.logo, logo.wide && styles.wide)} />
      ) : (
        <span className={styles.letters}>{letters}</span>
      )}
    </span>
  );
}
