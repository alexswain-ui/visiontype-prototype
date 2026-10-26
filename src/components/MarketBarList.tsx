import { Link } from 'react-router-dom';
import Flag from './Flag';
import styles from './MarketBarList.module.css';

export interface MarketBar {
  code: string;
  name: string;
  /** Shown on the right, e.g. "6.92M". */
  value: string;
  /** 0-1 bar length, relative to the biggest market. */
  share: number;
}

/** Top markets list (Figma "Card / Top markets"): flag, country, value, thin orange bar. Rows open the country page. */
export default function MarketBarList({ items }: { items: MarketBar[] }) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.code} className={styles.row}>
          <div className={styles.top}>
            <Flag code={item.code} />
            <Link to={`/country/${item.code}`} className={styles.name}>
              {item.name}
            </Link>
            <span className={styles.value}>{item.value}</span>
          </div>
          <span className={styles.track} role="img" aria-label={`${Math.round(item.share * 100)}% of the top market`}>
            <span className={styles.fill} style={{ width: `${Math.round(item.share * 100)}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}
