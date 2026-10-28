import { useEffect, useRef, type KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cx } from '../lib/cx';
import { ALL_TIME_FROM, LATEST, weekEnd, weekLabel, weekNumber, weekOf, weekStart, weekYear, type WeekIdx, type WeekRange } from '../lib/dates';
import IconButton from './IconButton';
import styles from './WeekCalendar.module.css';

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'];
const DAY = 86_400_000;

export interface CalendarMonth {
  year: number;
  month: number;
}

export interface FocusCell {
  week: WeekIdx;
  day: number;
}

export interface WeekCalendarProps {
  month: CalendarMonth;
  onMonthChange: (month: CalendarMonth) => void;
  /** The selected span (or the live preview while picking the end). */
  span: WeekRange;
  /** True while the first click is made and the end is still to pick (selected span is drawn lighter). */
  picking: boolean;
  focus: FocusCell;
  onFocusChange: (cell: FocusCell) => void;
  onPick: (week: WeekIdx) => void;
  onHover: (week: WeekIdx | null) => void;
  onEnter: () => void;
}

const selectable = (week: WeekIdx) => week <= LATEST && week >= ALL_TIME_FROM;

const monthOfDate = (date: Date): CalendarMonth => ({ year: date.getUTCFullYear(), month: date.getUTCMonth() });

/** Calendar whose rows are weeks (Saturday to Friday): click a day to pick its whole week. */
export default function WeekCalendar({ month, onMonthChange, span, picking, focus, onFocusChange, onPick, onHover, onEnter }: WeekCalendarProps) {
  const first = weekOf(Date.UTC(month.year, month.month, 1));
  const last = weekOf(Date.UTC(month.year, month.month + 1, 0));
  const weeks = Array.from({ length: last - first + 1 }, (_, i) => first + i);
  const cells = useRef(new Map<string, HTMLButtonElement>());
  const moved = useRef(false);

  const earliest = monthOfDate(weekEnd(ALL_TIME_FROM));
  const latest = monthOfDate(weekEnd(LATEST));
  const index = (m: CalendarMonth) => m.year * 12 + m.month;
  const canPrev = index(month) > index(earliest);
  const canNext = index(month) < index(latest);
  const shift = (by: number) => {
    const total = index(month) + by;
    onMonthChange({ year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 });
  };

  // After an arrow key, move real focus to the new cell.
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    cells.current.get(`${focus.week}:${focus.day}`)?.focus();
  }, [focus, month]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, week: WeekIdx, day: number) => {
    let next: FocusCell | null = null;
    if (event.key === 'ArrowLeft') next = day === 0 ? { week: week - 1, day: 6 } : { week, day: day - 1 };
    else if (event.key === 'ArrowRight') next = day === 6 ? { week: week + 1, day: 0 } : { week, day: day + 1 };
    else if (event.key === 'ArrowUp') next = { week: week - 1, day };
    else if (event.key === 'ArrowDown') next = { week: week + 1, day };
    else if (event.key === 'Enter') {
      event.preventDefault();
      onEnter();
      return;
    } else return;
    event.preventDefault();
    if (!next || !selectable(next.week)) return;
    moved.current = true;
    const date = new Date(weekStart(next.week).getTime() + next.day * DAY);
    if (date.getUTCMonth() !== month.month || date.getUTCFullYear() !== month.year) onMonthChange(monthOfDate(date));
    onFocusChange(next);
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.head}>
        <IconButton icon={ChevronLeft} label="Previous month" size="small" disabled={!canPrev} onClick={() => shift(-1)} />
        <h3 className={styles.month} aria-live="polite">
          {MONTH_NAMES[month.month]} {month.year}
        </h3>
        <IconButton icon={ChevronRight} label="Next month" size="small" disabled={!canNext} onClick={() => shift(1)} />
      </div>

      <div role="grid" aria-label={`${MONTH_NAMES[month.month]} ${month.year}, weeks`} className={styles.grid}>
        <div role="row" className={styles.row}>
          <span role="columnheader" className={styles.gutter}>
            <span className="visually-hidden">Week</span>
          </span>
          {WEEKDAYS.map((d) => (
            <span key={d} role="columnheader" className={styles.weekday}>
              {d}
            </span>
          ))}
        </div>
        {weeks.map((week) => {
          const enabled = selectable(week);
          const inSpan = week >= span.from && week <= span.to;
          const start = weekStart(week).getTime();
          return (
            <div
              key={week}
              role="row"
              className={cx(styles.row, !enabled && styles.future, inSpan && styles.selectedRow, inSpan && picking && styles.picking)}
              onMouseEnter={() => enabled && onHover(week)}
              onMouseLeave={() => onHover(null)}
            >
              <span role="rowheader" className={cx(styles.gutter, styles.weekLabel, inSpan && styles.weekLabelOn)} title={`${weekLabel(week)} ${weekYear(week)}`}>
                {weekLabel(week)}
              </span>
              {WEEKDAYS.map((_, day) => {
                const date = new Date(start + day * DAY);
                const outside = date.getUTCMonth() !== month.month;
                const isFirst = inSpan && week === span.from && day === 0;
                const isLast = inSpan && week === span.to && day === 6;
                const label = `${date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}, week ${weekNumber(week)}${enabled ? '' : ', not published yet'}`;
                const here = focus.week === week && focus.day === day;
                return (
                  <div key={day} role="gridcell" aria-selected={inSpan} className={cx(styles.cell, inSpan && styles.inSpan, (isFirst || isLast) && styles.edge, outside && styles.outside)}>
                    <button
                      type="button"
                      ref={(el) => {
                        if (el) cells.current.set(`${week}:${day}`, el);
                        else cells.current.delete(`${week}:${day}`);
                      }}
                      className={styles.day}
                      tabIndex={enabled && here ? 0 : -1}
                      disabled={!enabled}
                      aria-label={label}
                      onClick={() => {
                        onFocusChange({ week, day });
                        onPick(week);
                      }}
                      onFocus={() => enabled && !here && onFocusChange({ week, day })}
                      onKeyDown={(event) => onKeyDown(event, week, day)}
                    >
                      {date.getUTCDate()}
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
