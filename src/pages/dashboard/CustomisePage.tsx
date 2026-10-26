import { useMemo, useState } from 'react';
import { BadgeAlert, Check, ChartLine, ChartNoAxesColumnIncreasing, FileChartLine, Info, LayoutGrid, RotateCcw } from 'lucide-react';
import { Navigate, useMatch, useNavigate } from 'react-router-dom';
import Button from '../../components/Button';
import EditFrame from '../../components/EditFrame';
import WidgetDrawer, { type GalleryWidget } from '../../components/WidgetDrawer';
import dashboard from '../../data/dashboard.json';
import { DEFAULT_LAYOUT, NEXT_SIZE, useDashboardLayout, type PlacedWidget } from '../../lib/dashboardLayout';
import { useNotInPrototype } from '../../lib/notInPrototype';
import { useToast } from '../../lib/toast';
import { useUser } from '../../lib/user';
import ripple from '../../assets/textures/ripple-field.svg';
import WidgetBuilder, { saveCustomWidget, type CustomWidgetConfig } from './WidgetBuilder';
import { GALLERY_ICONS, WIDGETS, type WidgetContext } from './widgets';
import styles from './Dashboard.module.css';

const { customise } = dashboard;

/** The default widgets, so they can be added back from the drawer after being removed. */
const DEFAULT_GALLERY: GalleryWidget[] = [
  { id: 'overall', title: dashboard.overall.title, description: 'Capped streams this week vs last week', icon: ChartLine, category: 'Charts', status: 'add' },
  { id: 'roster', title: dashboard.roster.title, description: 'Your top artists, week on week', icon: ChartNoAxesColumnIncreasing, category: 'Tables', status: 'add' },
  { id: 'reports', title: 'Reports', description: 'Your latest and scheduled reports', icon: FileChartLine, category: 'Reports', status: 'add' },
  { id: 'attention', title: 'Requires Attention', description: 'Restatements, conflicts and fraud flags', icon: BadgeAlert, category: 'Alerts', status: 'add' },
];

const SUGGESTED: GalleryWidget[] = customise.gallery.map((g) => ({
  id: g.id,
  title: g.title,
  description: g.description,
  icon: GALLERY_ICONS[g.icon] ?? LayoutGrid,
  category: g.category,
  status: g.locked ? 'locked' : 'add',
}));

/** /dashboard/customise (Figma 484:2894) and /dashboard/customise/widget (builder open, Figma 491:5545). Premium only. */
export default function CustomisePage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const notInPrototype = useNotInPrototype();
  const toast = useToast();
  const builderOpen = useMatch('/dashboard/customise/widget') !== null;
  const { layout, save } = useDashboardLayout();
  const [draft, setDraft] = useState<PlacedWidget[]>(layout);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [dragging, setDragging] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const ctx = useMemo<WidgetContext>(() => ({ go: navigate, notInPrototype }), [navigate, notInPrototype]);

  const gallery = useMemo(() => {
    const onDashboard = new Set(draft.map((w) => w.id));
    const removedDefaults = DEFAULT_GALLERY.filter((w) => !onDashboard.has(w.id));
    return [...SUGGESTED, ...removedDefaults].map((w) => (w.status !== 'locked' && onDashboard.has(w.id) ? { ...w, status: 'added' as const } : w));
  }, [draft]);

  if (user.tier === 'Enterprise') return <Navigate to="/dashboard" replace />;

  const titleOf = (id: string) => WIDGETS[id]?.title ?? id;

  const move = (id: string, direction: -1 | 1) => {
    const from = draft.findIndex((w) => w.id === id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= draft.length) return;
    const next = [...draft];
    [next[from], next[to]] = [next[to], next[from]];
    setDraft(next);
    setAnnouncement(`${titleOf(id)} moved to position ${to + 1} of ${draft.length}`);
  };

  /** While dragging, the widget under the pointer swaps places with the one being dragged. */
  const dragOver = (overId: string) => {
    if (!dragging || dragging === overId) return;
    setDraft((current) => {
      const from = current.findIndex((w) => w.id === dragging);
      const to = current.findIndex((w) => w.id === overId);
      if (from < 0 || to < 0) return current;
      const next = [...current];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const resize = (id: string) =>
    setDraft((current) => current.map((w) => (w.id === id ? { ...w, size: NEXT_SIZE[w.size] } : w)));

  const remove = (id: string) => {
    setDraft((current) => current.filter((w) => w.id !== id));
    setAnnouncement(`${titleOf(id)} removed. You can add it back from Add widgets.`);
  };

  const add = (id: string) => {
    setDraft((current) => [...current, { id, size: 'third' }]);
    setAnnouncement(`${titleOf(id)} added at the end of your dashboard`);
  };

  const done = () => {
    save(draft);
    toast('Dashboard updated', Check);
    navigate('/dashboard');
  };

  const addCustom = (config: CustomWidgetConfig) => {
    save([...draft.filter((w) => w.id !== 'custom'), { id: 'custom', size: config.size }]);
    saveCustomWidget(config);
    toast(`“${config.title}” added to your dashboard`, Check);
    navigate('/dashboard');
  };

  return (
    <div className={styles.page}>
      <img src={ripple} alt="" className={styles.texture} aria-hidden="true" />
      <div className={styles.intro}>
        <p className={styles.eyebrow}>{customise.eyebrow}</p>
        <h1 className={styles.greeting}>{customise.title}</h1>
      </div>

      <div className={styles.editBar}>
        <Info size={16} className={styles.editHint} aria-hidden="true" />
        <p className={styles.editHintText}>{customise.hint}</p>
        {!drawerOpen && (
          <Button variant="secondary" size="small" leadingIcon={LayoutGrid} onClick={() => setDrawerOpen(true)}>
            Add widgets
          </Button>
        )}
        <Button variant="ghost" size="small" leadingIcon={RotateCcw} onClick={() => setDraft(DEFAULT_LAYOUT)}>
          Reset to default
        </Button>
        <Button variant="secondary" size="small" onClick={() => navigate('/dashboard')}>
          Cancel
        </Button>
        <Button variant="brand" size="small" leadingIcon={Check} onClick={done}>
          Done
        </Button>
      </div>

      <p className="visually-hidden" role="status">
        {announcement}
      </p>

      <div className={styles.grid}>
        {draft.map((placed) => {
          const widget = WIDGETS[placed.id];
          if (!widget) return null;
          return (
            <div key={placed.id} className={styles[placed.size]}>
              <EditFrame
                title={widget.title}
                selected={dragging === placed.id}
                onMove={(direction) => move(placed.id, direction)}
                onResize={() => resize(placed.id)}
                onRemove={() => remove(placed.id)}
                onDragStart={() => setDragging(placed.id)}
                onDragEnter={() => dragOver(placed.id)}
                onDragEnd={() => setDragging(null)}
              >
                {widget.render(ctx)}
              </EditFrame>
            </div>
          );
        })}
        {draft.length === 0 && <p className={styles.emptyGrid}>Your dashboard is empty. Add widgets from the panel on the right.</p>}
      </div>

      {drawerOpen && (
        <WidgetDrawer
          title={customise.drawerTitle}
          intro={customise.drawerIntro}
          footnote={customise.drawerFootnote}
          categories={customise.categories}
          widgets={gallery}
          onAdd={add}
          onRequest={(id) => toast(`Access request for “${gallery.find((g) => g.id === id)?.title}” sent (illustrative)`)}
          onCreateCustom={() => navigate('/dashboard/customise/widget')}
          onClose={() => setDrawerOpen(false)}
        />
      )}

      <WidgetBuilder open={builderOpen} onCancel={() => navigate('/dashboard/customise')} onAdd={addCustom} />
    </div>
  );
}
