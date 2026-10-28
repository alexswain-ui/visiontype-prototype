import { GitCompareArrows, UserCheck, UserMinus, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Artwork from '../components/Artwork';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Delta from '../components/Delta';
import EmptyState from '../components/EmptyState';
import Flag from '../components/Flag';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import TrendBars from '../components/TrendBars';
import { artistById, songById } from '../lib/data';
import { entityName, entityPath, FOLLOW_LIMIT, kindLabel, latestChange, useFollow, weeklyValues, type Followed } from '../lib/follow';
import { artworkFor, photoFor } from '../lib/media';
import { useToast } from '../lib/toast';
import styles from './FollowingPage.module.css';

/** Picture for a followed item: song artwork, artist photo or country flag. */
function Media({ item, name }: { item: Followed; name: string }) {
  if (item.kind === 'song') return <Artwork title={name} src={artworkFor(item.id, songById(item.id)?.art)} />;
  if (item.kind === 'artist') return <Avatar name={name} src={photoFor(artistById(item.id)?.id ?? '')} size={32} />;
  return <Flag code={item.id} size="medium" />;
}

/**
 * Following (/following): the songs, artists and markets you follow, with the latest change, a small trend
 * and Compare / Unfollow. No Figma design: built from the existing list, Delta and TrendBars pieces.
 */
export default function FollowingPage() {
  const { items, count, unfollow } = useFollow();
  const navigate = useNavigate();
  const toast = useToast();

  return (
    <div className={styles.page}>
      <PageHeader title="Following" icon={UserCheck} subtitle={`You follow ${count} of ${FOLLOW_LIMIT}`} />

      <SectionCard title="Followed items" meta={`${count} of ${FOLLOW_LIMIT}`}>
        {items.length === 0 ? (
          <EmptyState title="Nothing followed yet" icon={UserPlus}>
            <p>Use Follow on a song, artist or market page to see it here with its weekly change.</p>
          </EmptyState>
        ) : (
          <ul className={styles.list} aria-label="Followed items">
            {items.map((item) => {
              const name = entityName(item.kind, item.id);
              const values = weeklyValues(item.kind, item.id) ?? [];
              const change = values.length > 1 ? latestChange(values) : 0;
              return (
                <li key={item.key} className={styles.row}>
                  <Link to={entityPath(item.kind, item.id)} className={styles.who}>
                    <Media item={item} name={name} />
                    <span className={styles.text}>
                      <span className={styles.name}>{name}</span>
                      <Badge label={kindLabel(item.kind)} size="small" />
                    </span>
                  </Link>
                  <span className={styles.change}>
                    <Delta value={change} suffix="vs last week" />
                  </span>
                  <span className={styles.trend}>
                    <TrendBars values={values.slice(-7)} direction={change >= 0 ? 'up' : 'down'} />
                  </span>
                  <span className={styles.actions}>
                    <Button size="small" leadingIcon={GitCompareArrows} aria-label={`Compare ${name}`} onClick={() => navigate(`/following/compare/${item.key}`)}>
                      Compare
                    </Button>
                    <Button
                      size="small"
                      variant="ghost"
                      leadingIcon={UserMinus}
                      aria-label={`Unfollow ${name}`}
                      onClick={() => {
                        unfollow(item.key);
                        toast(`Unfollowed ${name}`);
                      }}
                    >
                      Unfollow
                    </Button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </SectionCard>
    </div>
  );
}
