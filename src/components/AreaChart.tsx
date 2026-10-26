import { useId, useState, type KeyboardEvent, type MouseEvent } from 'react';
import { formatMillions, niceTicks, smoothPath, type Point } from '../lib/chartMath';
import { useElementWidth } from '../lib/useElementWidth';
import styles from './AreaChart.module.css';

export interface AreaChartProps {
  /** Current period, oldest to newest. */
  current: number[];
  /** Previous period, same length. Drawn in blue behind the current period. */
  previous?: number[];
  /** One label per point, e.g. "W42". Shown under the chart and in the tooltip. */
  labels: string[];
  currentName?: string;
  previousName?: string;
  /** Formats values for the y axis and the tooltip. Default: millions ("12.5M"). */
  format?: (value: number) => string;
  height?: number;
  /** Spoken summary of the chart. */
  description: string;
}

const LABEL_GUTTER = 36;
const X_LABEL_SPACE = 24;
const TOP = 8;

/**
 * Trend chart: smooth 2px lines with a fading area underneath, three faint gridlines.
 * Hover (or focus and use the arrow keys) shows a guide line and a small card with the week and values (proposed).
 */
export default function AreaChart({
  current,
  previous,
  labels,
  currentName = 'This period',
  previousName = 'Previous period',
  format = formatMillions,
  height = 260,
  description,
}: AreaChartProps) {
  const id = useId().replace(/:/g, '');
  const [ref, width] = useElementWidth<HTMLDivElement>(528);
  const [active, setActive] = useState<number | null>(null);

  const ticks = niceTicks([...current, ...(previous ?? [])]);
  const plotLeft = LABEL_GUTTER;
  const plotRight = Math.max(plotLeft + 1, width);
  const plotBottom = height - X_LABEL_SPACE;
  const count = current.length;

  const x = (i: number) => plotLeft + ((plotRight - plotLeft) * i) / Math.max(1, count - 1);
  const y = (v: number) => TOP + ((ticks[2] - v) / (ticks[2] - ticks[0])) * (plotBottom - TOP);
  const toPoints = (series: number[]): Point[] => series.map((v, i) => ({ x: x(i), y: y(v) }));

  const area = (points: Point[]) =>
    `${smoothPath(points)} L${points[points.length - 1].x},${plotBottom} L${points[0].x},${plotBottom} Z`;

  const currentPoints = toPoints(current);
  const previousPoints = previous ? toPoints(previous) : null;

  const indexFromMouse = (event: MouseEvent<SVGSVGElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - box.left;
    const i = Math.round(((px - plotLeft) / (plotRight - plotLeft)) * (count - 1));
    return Math.min(count - 1, Math.max(0, i));
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') setActive((a) => Math.min(count - 1, (a ?? -1) + 1));
    else if (event.key === 'ArrowLeft') setActive((a) => Math.max(0, (a ?? count) - 1));
    else if (event.key === 'Escape') setActive(null);
    else return;
    event.preventDefault();
  };

  const tooltipLeft = active === null ? 0 : x(active);
  const flip = tooltipLeft > width * 0.6;

  return (
    <div ref={ref} className={styles.wrap} style={{ height }}>
      <svg
        width={width}
        height={height}
        className={styles.svg}
        role="img"
        aria-label={description}
        tabIndex={0}
        onMouseMove={(event) => setActive(indexFromMouse(event))}
        onMouseLeave={() => setActive(null)}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
      >
        <defs>
          <linearGradient id={`${id}-cur`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className={styles.stopCurrent} />
            <stop offset="100%" className={styles.stopCurrentEnd} />
          </linearGradient>
          <linearGradient id={`${id}-prev`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" className={styles.stopPrevious} />
            <stop offset="100%" className={styles.stopPreviousEnd} />
          </linearGradient>
        </defs>

        {ticks.map((tick) => (
          <g key={tick}>
            <line x1={plotLeft} x2={plotRight} y1={y(tick)} y2={y(tick)} className={styles.gridline} />
            <text x={0} y={y(tick)} dy="0.35em" className={styles.axisLabel}>
              {format(tick)}
            </text>
          </g>
        ))}

        {labels.map((label, i) => (
          <text key={label} x={x(i)} y={height - 6} textAnchor={i === 0 ? 'start' : i === count - 1 ? 'end' : 'middle'} className={styles.axisLabel}>
            {label}
          </text>
        ))}

        {previousPoints && (
          <>
            <path d={area(previousPoints)} fill={`url(#${id}-prev)`} />
            <path d={smoothPath(previousPoints)} className={styles.linePrevious} />
          </>
        )}
        <path d={area(currentPoints)} fill={`url(#${id}-cur)`} />
        <path d={smoothPath(currentPoints)} className={styles.lineCurrent} />

        {active !== null && (
          <g aria-hidden="true">
            <line x1={x(active)} x2={x(active)} y1={TOP} y2={plotBottom} className={styles.guide} />
            {previousPoints && <circle cx={x(active)} cy={previousPoints[active].y} r={4} className={styles.dotPrevious} />}
            <circle cx={x(active)} cy={currentPoints[active].y} r={4} className={styles.dotCurrent} />
          </g>
        )}
      </svg>

      {active !== null && (
        <div
          className={styles.tooltip}
          style={{ left: tooltipLeft, transform: flip ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)' }}
          role="status"
        >
          <p className={styles.tooltipTitle}>{labels[active]}</p>
          <p className={styles.tooltipRow}>
            <span className={styles.keyCurrent} />
            {currentName}
            <strong>{format(current[active])}</strong>
          </p>
          {previous && (
            <p className={styles.tooltipRow}>
              <span className={styles.keyPrevious} />
              {previousName}
              <strong>{format(previous[active])}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
