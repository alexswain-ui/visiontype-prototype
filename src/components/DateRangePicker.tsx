import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { CalendarSearch, Check, Info } from 'lucide-react';
import { cx } from '../lib/cx';
import { useDateRange } from '../lib/dateRange';
import {
  ALL_TIME_FROM,
  buttonParts,
  LATEST,
  previousRange,
  PRESETS,
  presetFor,
  rangeMonthDay,
  weekEnd,
  weeksBetween,
  weekSpanLabel,
  type Preset,
  type WeekIdx,
  type WeekRange,
} from '../lib/dates';
import Button from './Button';
import SelectButton from './SelectButton';
import WeekCalendar, { type CalendarMonth, type FocusCell } from './WeekCalendar';
import styles from './DateRangePicker.module.css';

const monthOf = (week: WeekIdx): CalendarMonth => {
  const end = weekEnd(week);
  return { year: end.getUTCFullYear(), month: end.getUTCMonth() };
};

/**
 * Date button with its popover (Figma "Period" picker): presets on the left, a calendar of whole weeks on the
 * right, a compare switch, Cancel and Apply. The chosen range is shared by the whole page through useDateRange().
 */
export default function DateRangePicker() {
  const { range, compare, setRange } = useDateRange();
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<WeekRange>(range);
  const [anchor, setAnchor] = useState<WeekIdx | null>(null);
  const [hover, setHover] = useState<WeekIdx | null>(null);
  const [wantCompare, setWantCompare] = useState(compare);
  const [custom, setCustom] = useState(false);
  const [month, setMonth] = useState<CalendarMonth>(() => monthOf(range.to));
  const [focus, setFocus] = useState<FocusCell>({ week: range.to, day: 0 });

  const parts = buttonParts(range);

  const openPicker = () => {
    setDraft(range);
    setAnchor(null);
    setHover(null);
    setWantCompare(compare);
    setCustom(false);
    setMonth(monthOf(range.to));
    setFocus({ week: range.to, day: 0 });
    setOpen(true);
  };

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const previous = previousRange(draft);
  const compareAvailable = previous.from >= ALL_TIME_FROM;
  const apply = () => {
    setRange(draft, wantCompare && compareAvailable);
    close();
  };

  // Click outside closes without applying.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  // Move focus into the calendar when the popover opens.
  useEffect(() => {
    if (open) requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>('[role=gridcell] button[tabindex="0"]')?.focus());
  }, [open]);

  const pick = (week: WeekIdx) => {
    if (anchor === null) {
      setAnchor(week);
      setDraft({ from: week, to: week });
    } else {
      setDraft({ from: Math.min(anchor, week), to: Math.max(anchor, week) });
      setAnchor(null);
    }
    setHover(null);
    setCustom(false);
  };

  const choosePreset = (preset: Preset) => {
    if (!preset.range) {
      setCustom(true);
      requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>('[role=gridcell] button[tabindex="0"]')?.focus());
      return;
    }
    setDraft(preset.range);
    setAnchor(null);
    setHover(null);
    setCustom(false);
    setMonth(monthOf(preset.range.to));
    setFocus({ week: preset.range.to, day: 0 });
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close();
    }
  };

  // While the end of a custom range is still to pick, the hovered week previews the span.
  const span: WeekRange = anchor !== null && hover !== null ? { from: Math.min(anchor, hover), to: Math.max(anchor, hover) } : draft;
  const selectedPreset = custom ? 'custom' : presetFor(draft);
  const weeks = weeksBetween(draft.from, draft.to);

  return (
    <div ref={rootRef} className={styles.root}>
      <SelectButton ref={triggerRef} icon={CalendarSearch} open={open} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => (open ? close(false) : openPicker())}>
        <strong>{parts.strong}</strong> · {parts.rest}
      </SelectButton>

      {open && (
        <div id={id} role="dialog" aria-label="Choose dates" className={styles.popover} onKeyDown={onKeyDown}>
          <div className={styles.body}>
            <div className={styles.presets} role="group" aria-label="Period">
              <p className={styles.heading}>Period</p>
              {PRESETS.map((preset) => {
                const selected = preset.id === selectedPreset;
                return (
                  <button key={preset.id} type="button" className={cx(styles.preset, selected && styles.presetOn)} aria-pressed={selected} onClick={() => choosePreset(preset)}>
                    <span className={styles.presetText}>
                      <span className={styles.presetLabel}>{preset.label}</span>
                      <span className={styles.presetSub}>{preset.sub}</span>
                    </span>
                    {selected && <Check size={16} aria-hidden="true" className={styles.tick} />}
                  </button>
                );
              })}
            </div>

            <div className={styles.right}>
              <WeekCalendar
                month={month}
                onMonthChange={setMonth}
                span={span}
                picking={anchor !== null}
                focus={focus}
                onFocusChange={setFocus}
                onPick={pick}
                onHover={setHover}
                onEnter={apply}
              />
              <p className={styles.summary} role="status" aria-live="polite">
                <Info size={14} aria-hidden="true" className={styles.info} />
                <span>
                  {rangeMonthDay(draft.from, draft.to)} · {weeks} whole {weeks === 1 ? 'week' : 'weeks'} ({weekSpanLabel(draft.from, draft.to)}).
                  <br />
                  Weeks after {weekSpanLabel(LATEST, LATEST)} are not published yet.
                </span>
              </p>
            </div>
          </div>

          <div className={styles.footer}>
            <label className={cx(styles.compare, !compareAvailable && styles.compareOff)}>
              <input
                type="checkbox"
                role="switch"
                className={styles.switch}
                checked={wantCompare && compareAvailable}
                disabled={!compareAvailable}
                onChange={(event) => setWantCompare(event.target.checked)}
              />
              <span className={styles.compareText}>
                <span className={styles.compareLabel}>Compare with previous period</span>
                <span className={styles.compareSub}>
                  {compareAvailable ? `${rangeMonthDay(previous.from, previous.to)} (${weekSpanLabel(previous.from, previous.to)})` : 'Not enough earlier data to compare'}
                </span>
              </span>
            </label>
            <div className={styles.actions}>
              <Button onClick={() => close()}>Cancel</Button>
              <Button variant="primary" onClick={apply}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
