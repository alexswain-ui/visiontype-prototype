import { useEffect, useRef, useState } from 'react';
import { GitCompare, Lock, Plus } from 'lucide-react';
import AddConnectionWizard from '../components/AddConnectionWizard';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import ConnectionsTable from '../components/ConnectionsTable';
import FilterPills from '../components/FilterPills';
import Modal from '../components/Modal';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatTile from '../components/StatTile';
import ToolCard from '../components/ToolCard';
import {
  availableTools,
  CATEGORIES,
  connectionStats,
  INITIAL_CONNECTIONS,
  newConnection,
  reconnected,
  PREMIUM_LOCK,
  toolById,
  type Connection,
  type WizardResult,
} from '../lib/connections';
import { useNotInPrototype } from '../lib/notInPrototype';
import { useUser } from '../lib/user';
import styles from './ConnectionsPage.module.css';

const SUBTITLE = "Send each week's data to the tools your team already uses";

/** Connections (/connections): Enterprise and IFPI see the full page; Premium sees the locked state. Figma 729:4542. */
export default function ConnectionsPage() {
  const { user } = useUser();
  const notInPrototype = useNotInPrototype();
  const [connections, setConnections] = useState<Connection[]>(INITIAL_CONNECTIONS);
  const [category, setCategory] = useState('All');
  const [removing, setRemoving] = useState<Connection | null>(null);
  // The add / reconnect wizard. A new key starts a fresh one ("Add another").
  const [wizard, setWizard] = useState<{ key: number; toolId?: string; reconnectId?: string } | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const nextId = useRef(1);

  // Scroll the highlighted row into view and let the highlight fade after a few seconds.
  useEffect(() => {
    if (!highlightId) return;
    document.querySelector(`[data-connection="${highlightId}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const timer = window.setTimeout(() => setHighlightId(null), 3000);
    return () => window.clearTimeout(timer);
  }, [highlightId]);

  if (user.tier === 'Premium') {
    return (
      <>
        <PageHeader title="Connections" icon={GitCompare} subtitle={SUBTITLE} />
        <section className={styles.locked} aria-label="Connections are locked">
          <EmptyState title={PREMIUM_LOCK.title} icon={Lock}>
            <p className={styles.lockedText}>{PREMIUM_LOCK.text}</p>
            <Button onClick={() => notInPrototype(PREMIUM_LOCK.action)}>{PREMIUM_LOCK.action}</Button>
          </EmptyState>
        </section>
      </>
    );
  }

  const stats = connectionStats(connections);
  const tools = availableTools(connections, category);

  const openWizard = (toolId?: string, reconnectId?: string) => setWizard({ key: Date.now(), toolId, reconnectId });

  /** Finish: a new connection is added first in the list; a reconnect makes the existing row Active. In memory only. */
  const finishWizard = (result: WizardResult, reconnectId?: string) => {
    if (reconnectId) {
      setConnections((list) => list.map((c) => (c.id === reconnectId ? reconnected(c) : c)));
      return reconnectId;
    }
    const id = `new-${nextId.current++}`;
    setConnections((list) => [newConnection(result, id), ...list]);
    return id;
  };

  const togglePause = (id: string) =>
    setConnections((list) => list.map((c) => (c.id === id ? { ...c, status: c.status === 'Paused' ? 'Active' : 'Paused' } : c)));

  return (
    <div className={styles.page}>
      <PageHeader title="Connections" icon={GitCompare} subtitle={SUBTITLE} />

      <div className={styles.stats}>
        <StatTile compact label="Active connections" value={stats.activeCount} sub={stats.activeSub} />
        <StatTile
          compact
          label="Needs attention"
          value={<span className={stats.attentionCount > 0 ? styles.amber : undefined}>{stats.attentionCount}</span>}
          sub={stats.attentionSub}
        />
        <StatTile compact label="Last delivery" value={stats.lastDelivery} sub={stats.lastSub} />
        <StatTile compact label="Next delivery" value={stats.nextDelivery} sub="After weekly publication" />
      </div>

      <SectionCard
        title="Your connections"
        meta={`${connections.length} connected`}
        aside={
          <Button variant="primary" leadingIcon={Plus} onClick={() => openWizard()}>
            Add connection
          </Button>
        }
      >
        <ConnectionsTable
          connections={connections}
          highlightId={highlightId}
          onPause={togglePause}
          onRemove={setRemoving}
          onOther={(item, c) => (item === 'Reconnect' ? openWizard(c.tool, c.id) : notInPrototype(`${item} for ${toolById(c.tool).name}`))}
        />
      </SectionCard>

      <section className={styles.available} aria-labelledby="available-title">
        <div className={styles.availableHead}>
          <div>
            <h2 id="available-title" className={styles.availableTitle}>
              Available connections
            </h2>
            <p className={styles.note}>Connected tools are managed in the list above. Tool list is illustrative.</p>
          </div>
          <FilterPills
            label="Filter available connections by category"
            options={CATEGORIES.map((c) => ({ id: c, label: c }))}
            value={category}
            onChange={setCategory}
          />
        </div>
        {tools.length > 0 ? (
          <ul className={styles.grid}>
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onConnect={(t) => openWizard(t.id)} />
            ))}
          </ul>
        ) : (
          <p className={styles.none}>No more tools in this category.</p>
        )}
        <p className="visually-hidden" role="status" aria-live="polite">
          {tools.length} available {tools.length === 1 ? 'connection' : 'connections'}
        </p>
      </section>

      {wizard && (
        <AddConnectionWizard
          key={wizard.key}
          connections={connections}
          initialToolId={wizard.toolId}
          reconnectId={wizard.reconnectId}
          onClose={() => setWizard(null)}
          onFinish={finishWizard}
          onAddAnother={() => openWizard()}
          onView={(id) => {
            setWizard(null);
            setHighlightId(id);
          }}
        />
      )}

      <Modal
        open={removing !== null}
        onClose={() => setRemoving(null)}
        title="Remove this connection?"
        description={removing && `${toolById(removing.tool).name} will stop receiving data. You can connect it again from Available connections.`}
        actions={
          <>
            <Button onClick={() => setRemoving(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (removing) setConnections((list) => list.filter((c) => c.id !== removing.id));
                setRemoving(null);
              }}
            >
              Remove
            </Button>
          </>
        }
      />
    </div>
  );
}
