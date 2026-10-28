import type { ReactNode } from 'react';
import { EllipsisVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import contourFlow from '../assets/textures/contour-flow.svg';
import { useNotInPrototype } from '../lib/notInPrototype';
import Badge from './Badge';
import Button from './Button';
import Delta from './Delta';
import Flag from './Flag';
import FollowButton from './FollowButton';
import type { FollowKind } from '../lib/follow';
import IconButton from './IconButton';
import styles from './EntityHeader.module.css';

export interface EntityHeaderStat {
  label: string;
  value: string;
  /** Percent change vs last week. */
  delta?: number;
  /** Text after the change; "vs last week" when left out. */
  deltaSuffix?: string;
  sub?: string;
  /** Flag before the value (Top market). */
  flag?: string;
}

export interface EntityHeaderProps {
  title: string;
  /** Artwork (song), round photo (artist) or flag (country). */
  media: ReactNode;
  /** Dot-separated line under the title. Items with `to` are links. */
  meta?: { label: string; to?: string }[];
  /** Small grey tags, e.g. "24 songs", "51 of 51 DSPs reported". */
  chips?: string[];
  stats: EntityHeaderStat[];
  /** Shows the Follow button for this song, artist or market. */
  follow?: { kind: FollowKind; id: string };
}

/** Entity page header card (Figma "Header card"): media, title, meta line, tags, actions, four stats. */
export default function EntityHeader({ title, media, meta = [], chips = [], stats, follow }: EntityHeaderProps) {
  const notInPrototype = useNotInPrototype();
  return (
    <section className={styles.card} aria-label={`${title} summary`}>
      <img src={contourFlow} alt="" className={styles.texture} width={618} height={444} />
      <div className={styles.top}>
        {media}
        <div className={styles.titles}>
          <h1 className={styles.title}>{title}</h1>
          {meta.length > 0 && (
            <p className={styles.meta}>
              {meta.map((item, i) => (
                <span key={`${item.label}-${i}`}>
                  {i > 0 && ' · '}
                  {item.to ? (
                    <Link to={item.to} className={styles.metaLink}>
                      {item.label}
                    </Link>
                  ) : (
                    item.label
                  )}
                </span>
              ))}
            </p>
          )}
          {chips.length > 0 && (
            <div className={styles.chips}>
              {chips.map((chip) => (
                <Badge key={chip} label={chip} size="small" />
              ))}
            </div>
          )}
        </div>
        <div className={styles.actions}>
          {follow && <FollowButton kind={follow.kind} id={follow.id} />}
          <Button onClick={() => notInPrototype('Compare with')}>Compare with</Button>
          <Button onClick={() => notInPrototype('Add to dashboard')}>Add to dashboard</Button>
          <IconButton icon={EllipsisVertical} label="More actions" onClick={() => notInPrototype('More actions')} />
        </div>
      </div>
      {stats.length > 0 && (
        <dl className={styles.stats}>
          {stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <dt className={styles.statLabel}>{stat.label}</dt>
              <dd className={styles.statValue}>
                {stat.flag && <Flag code={stat.flag} size="medium" />}
                {stat.value}
              </dd>
              {stat.delta !== undefined ? (
                <dd className={styles.statChange}>
                  <Delta value={stat.delta} suffix={stat.deltaSuffix ?? 'vs last week'} />
                </dd>
              ) : (
                stat.sub && <dd className={styles.statSub}>{stat.sub}</dd>
              )}
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

/** 96px square song artwork for the header. Falls back to the placeholder gradient. */
export function HeaderArtwork({ src, seed = 0 }: { src?: string; seed?: number }) {
  return src ? (
    <img src={src} alt="" className={styles.artwork} width={96} height={96} />
  ) : (
    <span className={`${styles.artwork} ${styles[`g${seed % 5}`]}`} aria-hidden="true" />
  );
}

/** 96px round artist photo for the header. Falls back to initials. */
export function HeaderPhoto({ src, name }: { src?: string; name: string }) {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return src ? (
    <img src={src} alt="" className={styles.photo} width={96} height={96} />
  ) : (
    <span className={`${styles.photo} ${styles.initials}`} aria-hidden="true">
      {initials}
    </span>
  );
}

/** 96x69 country flag for the header. */
export function HeaderFlag({ code }: { code: string }) {
  return (
    <span className={styles.flag}>
      <Flag code={code} size="large" />
    </span>
  );
}
