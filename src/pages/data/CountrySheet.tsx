import { ArrowUpRight, LayoutDashboard } from 'lucide-react';
import Artwork from '../../components/Artwork';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import Flag from '../../components/Flag';
import FollowButton from '../../components/FollowButton';
import SplitSheet from '../../components/SplitSheet';
import TopList from '../../components/TopList';
import TrendCard from '../../components/TrendCard';
import { cast } from '../../lib/data';
import { countrySheet, formatCompact, formatNumber, type CountryRow } from '../../lib/dataPage';
import { useDateRange } from '../../lib/dateRange';
import { parseValue, rangeTrend, useRangeName, useRangeStats } from '../../lib/useRangeStats';
import { artworkFor, photoFor } from '../../lib/media';
import { useToast } from '../../lib/toast';

interface Props {
  row: CountryRow;
  onClose: () => void;
  onOpenPage: () => void;
}

/** Country sheet (Figma 512:5893): trend, top 10 artists, top 10 songs. */
export default function CountrySheet({ row, onClose, onOpenPage }: Props) {
  const toast = useToast();
  const { market } = row;
  const sheet = countrySheet(market);
  const key = `country:${market.iso}`;
  const stats = useRangeStats(key);
  const { range } = useDateRange();
  const rangeName = useRangeName();
  const trend = rangeTrend(key, range);
  const { reported, total } = cast.week.dspsReported;
  const streams = formatCompact(stats.scaled(market.capped), 1);
  return (
    <SplitSheet
      headerAction={<FollowButton kind="country" id={market.iso} size="small" />}
      title={market.name}
      subtitle={`Market · ${rangeName} · ${reported} of ${total} DSPs reported`}
      media={<Flag code={market.iso} size="large" />}
      chips={
        <>
          <Badge label={market.short} size="small" />
          <Badge label={`${streams} streams`} size="small" />
        </>
      }
      onClose={onClose}
      onExpand={onOpenPage}
      footer={
        <>
          <Button variant="primary" trailingIcon={ArrowUpRight} onClick={onOpenPage}>
            Open country page
          </Button>
          <Button onClick={() => toast('Added to dashboard', LayoutDashboard)}>Add to dashboard</Button>
        </>
      }
    >
      <TrendCard
        label={`Streams · ${rangeName}`}
        value={streams}
        delta={stats.delta(market.delta)}
        series={trend.values}
        labels={trend.labels}
        description={`${market.name} capped streams for ${rangeName}, ${streams} in total.`}
      />
      <TopList
        title="Top 10 artists"
        actionLabel="See all 10"
        onAction={onOpenPage}
        items={sheet.artists.map((a) => ({
          id: a.id,
          name: a.name,
          value: formatCompact(stats.scaled(parseValue(a.value))),
          media: <Avatar name={a.name} src={photoFor(a.id)} size={24} />,
        }))}
      />
      <TopList
        title="Top 10 songs"
        actionLabel="See all 10"
        onAction={onOpenPage}
        items={sheet.songs.map((s, i) => ({
          id: s.id,
          name: s.title,
          value: formatNumber(Math.round(stats.scaled(parseValue(s.value)))),
          media: <Artwork title={s.title} src={artworkFor(s.id, i)} size={24} />,
        }))}
      />
    </SplitSheet>
  );
}
