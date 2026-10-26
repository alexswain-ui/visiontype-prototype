import { useState } from 'react';
import { ChartColumn, ChartLine, List, Search, TableProperties, TrendingUp, type LucideIcon } from 'lucide-react';
import Button from '../../components/Button';
import PanelDialog from '../../components/PanelDialog';
import SegmentedControl from '../../components/SegmentedControl';
import SelectButton from '../../components/SelectButton';
import TextInput from '../../components/TextInput';
import RankedList from '../../components/RankedList';
import dashboard from '../../data/dashboard.json';
import { artistById, songById } from '../../lib/data';
import type { WidgetSize } from '../../lib/dashboardLayout';
import { useNotInPrototype } from '../../lib/notInPrototype';
import styles from './WidgetBuilder.module.css';

const { builder } = dashboard;

export type WidgetType = 'top-list' | 'table' | 'bar' | 'line' | 'stat';

export interface CustomWidgetConfig {
  type: WidgetType;
  title: string;
  count: '5' | '10' | '20';
  compare: 'previous' | 'none';
  range: 'latest' | 'fixed';
  size: WidgetSize;
}

export const DEFAULT_CUSTOM_WIDGET: CustomWidgetConfig = {
  type: 'top-list',
  title: builder.defaultTitle,
  count: '5',
  compare: 'previous',
  range: 'latest',
  size: 'half',
};

const TYPES: { value: WidgetType; label: string; icon: LucideIcon }[] = [
  { value: 'top-list', label: 'Top list', icon: List },
  { value: 'table', label: 'Table', icon: TableProperties },
  { value: 'bar', label: 'Bar chart', icon: ChartColumn },
  { value: 'line', label: 'Line chart', icon: ChartLine },
  { value: 'stat', label: 'Stat', icon: TrendingUp },
];

/** Only the list types were designed; the chart types show a note instead of a preview. */
const LIST_TYPES: WidgetType[] = ['top-list', 'table'];

const STORAGE_KEY = 'vt-custom-widget';

/** The custom widget's settings, remembered so the dashboard can draw it. */
export function readCustomWidget(): CustomWidgetConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_CUSTOM_WIDGET, ...(JSON.parse(stored) as Partial<CustomWidgetConfig>) };
  } catch {
    // Storage blocked or bad JSON: use the default.
  }
  return DEFAULT_CUSTOM_WIDGET;
}

export function saveCustomWidget(config: CustomWidgetConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore: the widget falls back to its default settings.
  }
}

export const rangeText = (range: CustomWidgetConfig['range']) => (range === 'latest' ? 'Last 7 days' : 'Fixed: 7 days');

/** The builder's sample rows, cut to the chosen count, with or without the change column. */
export function customWidgetRows(config: CustomWidgetConfig) {
  return builder.sample.slice(0, Number(config.count)).map((s) => {
    const song = songById(s.songId);
    return {
      id: s.songId,
      title: song?.title ?? s.songId,
      subtitle: (song && artistById(song.artist)?.name) ?? '',
      value: s.value,
      delta: config.compare === 'previous' ? s.delta : undefined,
    };
  });
}

export interface WidgetBuilderProps {
  open: boolean;
  onCancel: () => void;
  onAdd: (config: CustomWidgetConfig) => void;
}

/** Create Custom Widget (Figma 491:6047): settings on the left, live sample preview on the right. */
export default function WidgetBuilder({ open, onCancel, onAdd }: WidgetBuilderProps) {
  const notInPrototype = useNotInPrototype();
  const [config, setConfig] = useState<CustomWidgetConfig>(DEFAULT_CUSTOM_WIDGET);
  const set = <K extends keyof CustomWidgetConfig>(key: K, value: CustomWidgetConfig[K]) => setConfig((c) => ({ ...c, [key]: value }));

  const isList = LIST_TYPES.includes(config.type);
  const rows = customWidgetRows(config);
  const add = () => (isList ? onAdd({ ...config, title: config.title.trim() || builder.defaultTitle }) : notInPrototype('Chart and stat widgets'));

  return (
    <PanelDialog
      open={open}
      onClose={onCancel}
      title={builder.title}
      description={builder.description}
      footnote={builder.footnote}
      actions={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="brand" onClick={add}>
            Add to dashboard
          </Button>
        </>
      }
    >
      <div className={styles.config}>
        <div className={styles.field}>
          <p className={styles.label}>Source</p>
          <div className={styles.source}>
            <span className={styles.sourceIcon} aria-hidden="true">
              <Search size={16} />
            </span>
            <span className={styles.sourceText}>
              <span className={styles.sourceName}>{builder.source.name}</span>
              <span className={styles.sourceDetail}>{builder.source.detail}</span>
            </span>
            <SelectButton size="small" onClick={() => notInPrototype('Choosing another search or dataset')}>
              Change
            </SelectButton>
          </div>
        </div>

        <div className={styles.field}>
          <p className={styles.label}>Widget type</p>
          <SegmentedControl
            label="Widget type"
            look="tile"
            value={config.type}
            onChange={(v) => set('type', v)}
            options={TYPES.map(({ value, label, icon: Icon }) => ({
              value,
              ariaLabel: label,
              label: (
                <>
                  <Icon size={20} aria-hidden="true" />
                  {label}
                </>
              ),
            }))}
          />
        </div>

        <TextInput label="Title" value={config.title} onChange={(v) => set('title', v)} placeholder={builder.defaultTitle} />

        <div className={styles.pair}>
          <div className={styles.field}>
            <p className={styles.label}>Show top</p>
            <SegmentedControl
              label="Show top"
              value={config.count}
              onChange={(v) => set('count', v)}
              options={[
                { value: '5', label: '5' },
                { value: '10', label: '10' },
                { value: '20', label: '20' },
              ]}
            />
          </div>
          <div className={styles.field}>
            <p className={styles.label}>Compare with</p>
            <SegmentedControl
              label="Compare with"
              value={config.compare}
              onChange={(v) => set('compare', v)}
              options={[
                { value: 'previous', label: 'Previous period' },
                { value: 'none', label: 'None' },
              ]}
            />
          </div>
        </div>

        <div className={styles.pair}>
          <div className={styles.field}>
            <p className={styles.label}>Date range</p>
            <SegmentedControl
              label="Date range"
              value={config.range}
              onChange={(v) => set('range', v)}
              options={[
                { value: 'latest', label: 'Latest week' },
                { value: 'fixed', label: 'Fixed: 7 days' },
              ]}
            />
          </div>
          <div className={styles.field}>
            <p className={styles.label}>Size</p>
            <SegmentedControl
              label="Size"
              value={config.size}
              onChange={(v) => set('size', v)}
              options={[
                { value: 'third', label: 'S', ariaLabel: 'Small' },
                { value: 'half', label: 'M', ariaLabel: 'Medium' },
                { value: 'full', label: 'L', ariaLabel: 'Large' },
              ]}
            />
          </div>
        </div>
      </div>

      <div className={styles.preview}>
        <p className={styles.label}>Preview</p>
        <section className={styles.previewCard} aria-label="Widget preview">
          <header className={styles.previewHeader}>
            <h3 className={styles.previewTitle}>{config.title.trim() || builder.defaultTitle}</h3>
            <span className={styles.previewRange}>{rangeText(config.range)}</span>
          </header>
          {isList ? (
            <RankedList rows={rows} label="Sample rows" />
          ) : (
            <p className={styles.previewEmpty}>Previews for chart and stat widgets are not part of this prototype.</p>
          )}
        </section>
        <p className={styles.previewNote}>
          {builder.previewNote}
          {config.count === '20' && isList && ` This sample has ${rows.length} songs.`}
        </p>
      </div>
    </PanelDialog>
  );
}
