import { Link } from 'react-router-dom';
import Artwork from './Artwork';
import Avatar from './Avatar';
import Delta from './Delta';
import TrendBars from './TrendBars';
import styles from './TopTenList.module.css';

export interface TopTenItem {
  rank: number;
  name: string;
  /** Second line, e.g. the artist under a song title. */
  sub?: string;
  /** Opens the artist or song page. */
  to?: string;
  image?: string;
  seed: number;
  value: string;
  delta: number;
}

export interface TopTenListProps {
  items: TopTenItem[];
  /** Round photos (artists) or square artwork (songs). */
  media: 'photo' | 'artwork';
  label: string;
}

/** Numbered top-10 list (Figma "Card / Top 10 artists / songs"): rank, image, name, value, change, trend bars. */
export default function TopTenList({ items, media, label }: TopTenListProps) {
  return (
    <ol className={styles.list} aria-label={label}>
      {items.map((item) => (
        <li key={item.rank} className={styles.row}>
          <span className={styles.rank}>{item.rank}</span>
          {media === 'photo' ? (
            <Avatar name={item.name} size={32} src={item.image} />
          ) : (
            <Artwork title={item.name} src={item.image} seed={item.seed} />
          )}
          <span className={styles.text}>
            {item.to ? (
              <Link to={item.to} className={styles.name}>
                {item.name}
              </Link>
            ) : (
              <span className={styles.name}>{item.name}</span>
            )}
            {item.sub && <span className={styles.sub}>{item.sub}</span>}
          </span>
          <span className={styles.value}>{item.value}</span>
          <span className={styles.delta}>
            <Delta value={item.delta} />
          </span>
          <TrendBars direction={item.delta >= 0 ? 'up' : 'down'} magnitude={Math.min(1, 0.35 + Math.abs(item.delta) / 15)} seed={item.rank} />
        </li>
      ))}
    </ol>
  );
}
