import { useMemo } from 'react';
import { GitCompare, Flag as FlagIcon, Pencil, Plus, ReceiptText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AskBar from '../../components/AskBar';
import Button from '../../components/Button';
import CardLink from '../../components/CardLink';
import ChangeLogList, { type ChangeLogEntry } from '../../components/ChangeLogList';
import ConnectionList from '../../components/ConnectionList';
import FlagMeter from '../../components/FlagMeter';
import ReleaseCard from '../../components/ReleaseCard';
import TopBar from '../../components/TopBar';
import WidgetCard from '../../components/WidgetCard';
import dashboard from '../../data/dashboard.json';
import { useDashboardLayout } from '../../lib/dashboardLayout';
import { useNotInPrototype } from '../../lib/notInPrototype';
import { useToast } from '../../lib/toast';
import { useUser } from '../../lib/user';
import ripple from '../../assets/textures/ripple-field.svg';
import { WIDGETS, type WidgetContext } from './widgets';
import styles from './Dashboard.module.css';

function Greeting({ name, dateLine }: { name: string; dateLine: string }) {
  return (
    <div className={styles.intro}>
      <p className={styles.dateLine}>{dateLine}</p>
      <h1 className={styles.greeting}>Morning, {name}</h1>
    </div>
  );
}

/** Maya (Premium): Figma 365:33581. Widgets come from the saved layout, so Customise changes show here. */
function ExplorerDashboard({ ctx, name }: { ctx: WidgetContext; name: string }) {
  const { layout } = useDashboardLayout();
  return (
    <>
      <Greeting name={name} dateLine={`${dashboard.today}  · ${dashboard.dataAsOf}`} />
      <div className={styles.askRow}>
        <div className={styles.askBar}>
          <AskBar placeholder={dashboard.askPlaceholder} onSubmit={(question) => ctx.go(`/ask?q=${encodeURIComponent(question)}`)} />
        </div>
        <Button variant="secondary" size="small" leadingIcon={Pencil} onClick={() => ctx.go('/dashboard/customise')}>
          Customise
        </Button>
      </div>
      <div className={styles.grid}>
        {layout.map((placed) => {
          const widget = WIDGETS[placed.id];
          return widget ? (
            <div key={placed.id} className={styles[placed.size]}>
              {widget.render(ctx)}
            </div>
          ) : null;
        })}
      </div>
    </>
  );
}

/** Dev (Enterprise): Figma 416:2629. Fixed layout: release, connections, flags, change log. */
function ExtractorDashboard({ ctx, name }: { ctx: WidgetContext; name: string }) {
  const toast = useToast();
  const { release, connections, flags } = dashboard;
  const maxFlag = Math.max(...flags.items.map((f) => f.count));
  return (
    <>
      <div className={styles.introRow}>
        <Greeting name={name} dateLine={dashboard.today} />
        <Button variant="secondary" size="small" leadingIcon={Pencil} onClick={() => ctx.notInPrototype('Customising the Extractor dashboard')}>
          Customise
        </Button>
      </div>
      <div className={styles.extractorGrid}>
        <div className={styles.extractorMain}>
          <ReleaseCard
            eyebrow={release.eyebrow}
            version={release.version}
            published={release.published}
            stats={[
              { value: release.rows, label: 'rows' },
              { value: release.markets, label: 'markets' },
            ]}
            dspsIncluded={release.dspsIncluded}
            dspsOutstanding={release.dspsOutstanding}
            onQuery={() => ctx.notInPrototype('Querying in Databricks')}
            onDownload={() => toast(`Preparing ${release.version}.csv (illustrative, nothing is downloaded)`)}
          />
          <div className={styles.extractorPair}>
            <WidgetCard
              title="Connections"
              icon={GitCompare}
              action={<CardLink label="Manage" ariaLabel="Manage connections" onClick={() => ctx.notInPrototype('Connections')} />}
              footer={
                <>
                  <span className={styles.moreText}>+ {connections.moreCount} More</span>
                  <Button variant="secondary" leadingIcon={Plus} onClick={() => ctx.notInPrototype('Connections')}>
                    Add Connection
                  </Button>
                </>
              }
            >
              <ConnectionList connections={connections.rows} />
            </WidgetCard>
            <WidgetCard title="Flags in This Release" icon={FlagIcon} action={<CardLink label="View in Data" to="/data" />}>
              <div className={styles.flags}>
                <p className={styles.flagTotal}>
                  <strong>{flags.total}</strong>
                  {flags.summary}
                </p>
                <div className={styles.flagList}>
                  {flags.items.map((flag) => (
                    <FlagMeter key={flag.id} label={flag.label} count={flag.count} max={maxFlag} tone={flag.tone as 'warning' | 'destructive' | 'info'} />
                  ))}
                </div>
                <p className={styles.footnote}>{flags.footnote}</p>
              </div>
            </WidgetCard>
          </div>
        </div>
        <WidgetCard title="Change Log" icon={ReceiptText} action={<CardLink label="View" ariaLabel="View the full change log" onClick={() => ctx.notInPrototype('The full change log')} />}>
          <ChangeLogList entries={dashboard.changeLog as ChangeLogEntry[]} />
        </WidgetCard>
      </div>
    </>
  );
}

/** /dashboard: Explorer for Premium, Extractor for Enterprise. Greets whoever is signed in. */
export default function DashboardPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const notInPrototype = useNotInPrototype();
  const ctx = useMemo<WidgetContext>(() => ({ go: navigate, notInPrototype }), [navigate, notInPrototype]);
  return (
    <div className={styles.page}>
      <img src={ripple} alt="" className={styles.texture} aria-hidden="true" />
      <div className={styles.topBar}>
        <TopBar />
      </div>
      {user.tier === 'Enterprise' ? <ExtractorDashboard ctx={ctx} name={user.name} /> : <ExplorerDashboard ctx={ctx} name={user.name} />}
    </div>
  );
}
