/**
 * Date config and week maths for the whole prototype. Change the constants here and everything follows.
 * A "week index" is a whole number: 0 is the latest published week, -1 the week before, and so on.
 */

/** 0 = Sunday ... 6 = Saturday. Weeks run Saturday to Friday. */
export const WEEK_START_DAY = 6;
/** The latest published week and its year: week 42 of 2026 is Sat 10 Oct to Fri 16 Oct 2026. */
export const LATEST_WEEK = 42;
export const LATEST_YEAR = 2026;
/** The all-time range starts at the week containing this date. */
export const ALL_TIME_START = '2024-01-05';

export type WeekIdx = number;
export interface WeekRange {
  from: WeekIdx;
  to: WeekIdx;
}

const DAY = 86_400_000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const parseISO = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};
export const toISO = (ms: number) => new Date(ms).toISOString().slice(0, 10);

function startOfWeek(ms: number) {
  const back = (new Date(ms).getUTCDay() - WEEK_START_DAY + 7) % 7;
  return ms - back * DAY;
}

/** Week 1 is the week that contains 1 January. */
const WEEK_ONE_START = startOfWeek(Date.UTC(LATEST_YEAR, 0, 1));
const LATEST_START = WEEK_ONE_START + (LATEST_WEEK - 1) * 7 * DAY;

/** The week index a date falls in. */
export const weekOf = (date: string | number | Date): WeekIdx => {
  const ms = typeof date === 'string' ? parseISO(date) : new Date(date).getTime();
  return Math.floor((startOfWeek(ms) - LATEST_START) / (7 * DAY));
};

const startMs = (week: WeekIdx) => LATEST_START + week * 7 * DAY;
export const weekStart = (week: WeekIdx) => new Date(startMs(week));
export const weekEnd = (week: WeekIdx) => new Date(startMs(week) + 6 * DAY);
export const weekStartISO = (week: WeekIdx) => toISO(startMs(week));
export const weekEndISO = (week: WeekIdx) => toISO(startMs(week) + 6 * DAY);
export const weeksBetween = (from: WeekIdx, to: WeekIdx) => to - from + 1;

export const ALL_TIME_FROM: WeekIdx = weekOf(ALL_TIME_START);
export const LATEST: WeekIdx = 0;
export const YEAR_START: WeekIdx = weekOf(Date.UTC(LATEST_YEAR, 0, 1));

/** Every week index from `from` to `to`, oldest first. */
export const weekList = (from: WeekIdx, to: WeekIdx) => Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i);

/* ---------- Labels ---------- */

/** Week number in its year: the week that ends in a year belongs to it; the week ending 1-7 Jan is week 1. */
export function weekNumber(week: WeekIdx) {
  const end = weekEnd(week);
  const dayOfYear = Math.floor((end.getTime() - Date.UTC(end.getUTCFullYear(), 0, 1)) / DAY) + 1;
  return Math.floor((dayOfYear - 1) / 7) + 1;
}
export const weekYear = (week: WeekIdx) => weekEnd(week).getUTCFullYear();
export const weekLabel = (week: WeekIdx) => `W${weekNumber(week)}`;
/** "W42" for one week, "W40 – W42" for several. */
export const weekSpanLabel = (from: WeekIdx, to: WeekIdx) => (from === to ? weekLabel(from) : `${weekLabel(from)} – ${weekLabel(to)}`);

const dm = (d: Date) => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
const md = (d: Date) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;

/** "10 Oct - 16 Oct 2026". The start gets its year too when the range crosses a year. */
export function rangeDayMonth(from: WeekIdx, to: WeekIdx) {
  const a = weekStart(from);
  const b = weekEnd(to);
  const crosses = a.getUTCFullYear() !== b.getUTCFullYear();
  return `${dm(a)}${crosses ? ` ${a.getUTCFullYear()}` : ''} - ${dm(b)} ${b.getUTCFullYear()}`;
}

/** "Sep 26 – Oct 16 2026" (month first, used in the picker). */
export function rangeMonthDay(from: WeekIdx, to: WeekIdx) {
  const a = weekStart(from);
  const b = weekEnd(to);
  const crosses = a.getUTCFullYear() !== b.getUTCFullYear();
  return `${md(a)}${crosses ? ` ${a.getUTCFullYear()}` : ''} – ${md(b)} ${b.getUTCFullYear()}`;
}

/** "Fri 16 Oct" for the published day of a week. */
export const publishedLabel = (week: WeekIdx) => {
  const d = weekEnd(week);
  return `${DAYS[d.getUTCDay()]} ${dm(d)}`;
};

export const ALL_TIME_SINCE = (() => {
  const d = new Date(parseISO(ALL_TIME_START));
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
})();

export type RangeMode = 'week' | 'range' | 'all';
export const modeOf = ({ from, to }: WeekRange): RangeMode => (from === ALL_TIME_FROM && to === LATEST ? 'all' : from === to ? 'week' : 'range');

/** Label for the date button: "Week 42 · 10 Oct - 16 Oct 2026", "3 weeks · 26 Sep - 16 Oct 2026", "All time · since 5 Jan 2024". */
export function buttonParts(range: WeekRange): { strong: string; rest: string } {
  const mode = modeOf(range);
  if (mode === 'all') return { strong: 'All time', rest: `since ${ALL_TIME_SINCE}` };
  if (mode === 'week') return { strong: `Week ${weekNumber(range.from)}`, rest: rangeDayMonth(range.from, range.to) };
  return { strong: `${weeksBetween(range.from, range.to)} weeks`, rest: rangeDayMonth(range.from, range.to) };
}

/** The same number of weeks immediately before the range. */
export const previousRange = ({ from, to }: WeekRange): WeekRange => {
  const length = weeksBetween(from, to);
  return { from: from - length, to: from - 1 };
};

export const clampRange = ({ from, to }: WeekRange): WeekRange => {
  const a = Math.min(LATEST, Math.max(ALL_TIME_FROM, Math.min(from, to)));
  const b = Math.min(LATEST, Math.max(ALL_TIME_FROM, Math.max(from, to)));
  return { from: a, to: b };
};

/** "Oct 10 – 16" for one week (month repeated only when it changes). */
const shortWeek = (week: WeekIdx) => {
  const a = weekStart(week);
  const b = weekEnd(week);
  return a.getUTCMonth() === b.getUTCMonth() ? `${md(a)} – ${b.getUTCDate()}` : `${md(a)} – ${md(b)}`;
};

export interface Preset {
  id: 'this-week' | 'last-week' | 'last-4' | 'last-13' | 'ytd' | 'all' | 'custom';
  label: string;
  sub: string;
  /** Custom has no fixed range: it keeps whatever is picked in the calendar. */
  range?: WeekRange;
}

export const PRESETS: Preset[] = [
  { id: 'this-week', label: 'This week', sub: `${weekLabel(0)} · ${shortWeek(0)}`, range: { from: 0, to: 0 } },
  { id: 'last-week', label: 'Last week', sub: `${weekLabel(-1)} · ${shortWeek(-1)}`, range: { from: -1, to: -1 } },
  { id: 'last-4', label: 'Last 4 weeks', sub: weekSpanLabel(-3, 0), range: { from: -3, to: 0 } },
  { id: 'last-13', label: 'Last 13 weeks', sub: weekSpanLabel(-12, 0), range: { from: -12, to: 0 } },
  { id: 'ytd', label: 'Year to date', sub: `From 1 Jan ${LATEST_YEAR}`, range: { from: YEAR_START, to: 0 } },
  { id: 'all', label: 'All time', sub: `Since ${ALL_TIME_SINCE}`, range: { from: ALL_TIME_FROM, to: 0 } },
  { id: 'custom', label: 'Custom range', sub: 'Pick whole weeks' },
];

/** Which preset a range matches (Custom when none does). */
export const presetFor = (range: WeekRange): Preset['id'] =>
  PRESETS.find((p) => p.range && p.range.from === range.from && p.range.to === range.to)?.id ?? 'custom';
