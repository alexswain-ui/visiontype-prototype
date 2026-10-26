import type { ReactNode } from 'react';
import styles from './EntityCell.module.css';

export interface EntityCellProps {
  /** Artwork, artist photo or flag. */
  media?: ReactNode;
  /** Song title, artist or country name. */
  primary: string;
  /** Muted second line, e.g. the ISRC. */
  secondary?: string;
}

/** Table cell with a picture, a name and an optional muted second line (Figma "Cell / Song", "Cell / Artist"). */
export default function EntityCell({ media, primary, secondary }: EntityCellProps) {
  return (
    <span className={styles.cell}>
      {media}
      <span className={styles.text}>
        <span className={styles.primary}>{primary}</span>
        {secondary && <span className={styles.secondary}>{secondary}</span>}
      </span>
    </span>
  );
}
