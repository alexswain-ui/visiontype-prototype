import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import {
  ALL_TIME_FROM,
  clampRange,
  LATEST,
  modeOf,
  presetFor,
  PRESETS,
  previousRange,
  toISO,
  weekEndISO,
  weekOf,
  weekStartISO,
  weeksBetween,
  type Preset,
  type RangeMode,
  type WeekIdx,
  type WeekRange,
} from './dates';

/** The selected weeks and the compare switch. */
interface Value extends WeekRange {
  compare: boolean;
}

/** Pages that show date-range numbers. The URL only carries the range on these. */
const USES_RANGE = /^\/(data|song|artist|country)(\/|$)/;

const DEFAULT: Value = { from: LATEST, to: LATEST, compare: false };

export interface DateRangeContextValue {
  mode: RangeMode;
  /** First and last day of the range as ISO dates (the `from` and `to` in the URL). */
  from: string;
  to: string;
  /** The same range as whole-week indexes (0 = latest week). */
  fromWeek: WeekIdx;
  toWeek: WeekIdx;
  range: WeekRange;
  weeks: number;
  compare: boolean;
  /** The equal-length range immediately before. */
  previous: WeekRange;
  /** Which preset the range matches ("custom" when none). */
  preset: Preset['id'];
  presets: Preset[];
  setRange: (range: WeekRange, compare?: boolean) => void;
}

const DateRangeContext = createContext<DateRangeContextValue | null>(null);

/** Reads `from`, `to` and `compare` from a query string. Null when there is no range in it. */
function readParams(search: string): Value | null {
  const params = new URLSearchParams(search);
  const from = params.get('from');
  const to = params.get('to');
  if (!from || !to || Number.isNaN(Date.parse(from)) || Number.isNaN(Date.parse(to))) return null;
  const range = clampRange({ from: weekOf(from), to: weekOf(to) });
  return { ...range, compare: params.get('compare') === '1' };
}

const same = (a: Value, b: Value) => a.from === b.from && a.to === b.to && a.compare === b.compare;
const isDefault = (value: Value) => same(value, DEFAULT);

/** The query string with the range written in (and removed again for the default week). */
function withRange(search: string, value: Value) {
  const params = new URLSearchParams(search);
  params.delete('from');
  params.delete('to');
  params.delete('compare');
  if (!isDefault(value)) {
    params.set('from', weekStartISO(value.from));
    params.set('to', weekEndISO(value.to));
    if (value.compare) params.set('compare', '1');
  }
  const text = params.toString();
  return text ? `?${text}` : '';
}

/**
 * Holds the selected date range for the whole app and keeps it in the URL (?from=2026-09-26&to=2026-10-16&compare=1).
 * Links do not need to carry it: when a page opens without a range, the current one is added to the URL.
 * Browser back and forward restore the range that page had.
 */
export function DateRangeProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [value, setValue] = useState<Value>(() => readParams(location.search) ?? DEFAULT);
  const latest = useRef(value);
  latest.current = value;

  useEffect(() => {
    const fromUrl = readParams(location.search);
    if (navigationType === 'POP') {
      const next = fromUrl ?? DEFAULT;
      if (!same(next, latest.current)) setValue(next);
      return;
    }
    // A page opened by a link or a redirect: carry the current range over to it (only Data and the entity pages use it).
    if (!USES_RANGE.test(location.pathname)) return;
    const current = latest.current;
    const urlValue = fromUrl ?? DEFAULT;
    if (!same(urlValue, current)) navigate({ pathname: location.pathname, search: withRange(location.search, current), hash: location.hash }, { replace: true });
  }, [location.key, location.search, location.pathname, location.hash, navigationType, navigate]);

  const setRange = useCallback(
    (range: WeekRange, compare = false) => {
      const next: Value = { ...clampRange(range), compare };
      setValue(next);
      navigate({ pathname: location.pathname, search: withRange(location.search, next), hash: location.hash });
    },
    [navigate, location.pathname, location.search, location.hash],
  );

  const context = useMemo<DateRangeContextValue>(() => {
    const range = { from: value.from, to: value.to };
    return {
      mode: modeOf(range),
      from: weekStartISO(value.from),
      to: weekEndISO(value.to),
      fromWeek: value.from,
      toWeek: value.to,
      range,
      weeks: weeksBetween(value.from, value.to),
      compare: value.compare,
      previous: previousRange(range),
      preset: presetFor(range),
      presets: PRESETS,
      setRange,
    };
  }, [value, setRange]);

  return <DateRangeContext.Provider value={context}>{children}</DateRangeContext.Provider>;
}

/** The selected date range: `{ mode: 'week' | 'range' | 'all', from, to, compare, setRange, presets, ... }`. */
export function useDateRange(): DateRangeContextValue {
  const context = useContext(DateRangeContext);
  if (!context) throw new Error('useDateRange must be used inside DateRangeProvider');
  return context;
}

export { ALL_TIME_FROM, toISO };
