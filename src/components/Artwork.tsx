import { cx } from '../lib/cx';
import styles from './Artwork.module.css';

export interface ArtworkProps {
  /** Song title, for screen readers. */
  title: string;
  src?: string;
  size?: 36 | 56;
  /** Picks the placeholder gradient when there is no image. */
  seed?: number;
}

/** Square song artwork. Until real artwork is exported, shows a soft gradient made from the chart colours. */
export default function Artwork({ title, src, size = 36, seed = 0 }: ArtworkProps) {
  return src ? (
    <img src={src} alt={title} width={size} height={size} className={cx(styles.art, styles[`s${size}`])} />
  ) : (
    <span className={cx(styles.art, styles[`s${size}`], styles[`g${seed % 5}`])} role="img" aria-label={title} />
  );
}
