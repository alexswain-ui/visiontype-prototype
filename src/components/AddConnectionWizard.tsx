import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, ChevronLeft, CircleCheck, CircleX, Lock, PlugZap, RefreshCw } from 'lucide-react';
import { cx } from '../lib/cx';
import {
  accountFor,
  ADD_FLOW,
  availableTools,
  CATEGORIES,
  credentialsFail,
  DATES,
  fieldsFilled,
  isSecret,
  toolById,
  type Connection,
  type Tool,
  type WizardResult,
} from '../lib/connections';
import Badge from './Badge';
import Button from './Button';
import FilterPills from './FilterPills';
import Modal from './Modal';
import SearchField from './SearchField';
import SegmentedControl from './SegmentedControl';
import Stepper from './Stepper';
import TextInput from './TextInput';
import ToolTile from './ToolTile';
import styles from './AddConnectionWizard.module.css';

export interface AddConnectionWizardProps {
  onClose: () => void;
  /** Current connections: tools that already have a connection never appear in step 1. */
  connections: Connection[];
  /** Tool selected when the wizard opens (the Connect button on a card, or the tool being reconnected). */
  initialToolId?: string;
  /** Reconnect: opens at step 2 with the tool preselected and the secret field empty. */
  reconnectId?: string;
  /** Called on "Finish and connect". Returns the id of the new or reconnected row. */
  onFinish: (result: WizardResult, reconnectId?: string) => string;
  /** "Add another": the page opens a fresh wizard at step 1. */
  onAddAnother: () => void;
  /** "View connection": the page closes the wizard and highlights the row. */
  onView: (connectionId: string) => void;
}

type Step = 1 | 2 | 3 | 4 | 5;
type Delivery = 'running' | 'ok' | 'fail';

const STEPS = ADD_FLOW.steps;
const TEST_MS = 700;
const DELIVERY_MS = 900;

/** Where do I find these? Illustrative help, the same shape for every tool. */
const helpFor = (tool: Tool) =>
  tool.tone === 'ai'
    ? `You will sign in with ${tool.name} in a pop-up. Nothing is stored here except that the connection exists.`
    : `In ${tool.name}, open your admin or developer settings and create a key or token for the Global Data Platform. Secrets are shown only once, so copy them when you create them.`;

/**
 * Add connection wizard (Figma 730:5024 choose tool, 730:5415 authenticate, 730:5813 data; review and done follow the same pattern).
 * A 720px modal: Esc closes, focus stays inside. Everything is in memory; the test rules are scripted (a secret containing "bad" fails).
 */
export default function AddConnectionWizard({ onClose, connections, initialToolId, reconnectId, onFinish, onAddAnother, onView }: AddConnectionWizardProps) {
  const reconnecting = reconnectId !== undefined;
  const [step, setStep] = useState<Step>(reconnecting ? 2 : 1);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const available = availableTools(connections, 'All');
  const [toolId, setToolId] = useState(() => initialToolId ?? (available.some((t) => t.id === ADD_FLOW.defaultTool) ? ADD_FLOW.defaultTool : available[0]?.id));
  const tool = toolId ? toolById(toolId) : undefined;

  // Field values per tool. Reconnect fills the fields except the secrets.
  const [allValues, setAllValues] = useState<Record<string, Record<string, string>>>(() =>
    reconnecting && initialToolId
      ? { [initialToolId]: Object.fromEntries(toolById(initialToolId).authFields.filter((f) => !isSecret(f)).map((f) => [f[0], f[1]])) }
      : {},
  );
  const values = (toolId && allValues[toolId]) || {};
  const setValue = (label: string, value: string) => setAllValues((all) => ({ ...all, [toolId!]: { ...values, [label]: value } }));

  // A passed credentials test only counts for the values it was run on: editing a field asks for a new test.
  const signature = `${toolId}:${JSON.stringify(values)}`;
  const [auth, setAuth] = useState<{ signature: string; ok: boolean } | null>(null);
  const [testing, setTesting] = useState(false);
  const authResult = auth && auth.signature === signature ? auth : null;

  const [datasetId, setDatasetId] = useState(() => ADD_FLOW.datasets.find((d) => 'default' in d && d.default)?.id ?? ADD_FLOW.datasets[0].id);
  const [schedule, setSchedule] = useState(ADD_FLOW.schedule[0]);
  const [format, setFormat] = useState(ADD_FLOW.formats[0]);
  const dataset = ADD_FLOW.datasets.find((d) => d.id === datasetId)!;

  const [delivery, setDelivery] = useState<Delivery>('running');
  const [deliveryRun, setDeliveryRun] = useState(0);
  const [done, setDone] = useState<{ id: string; result: WizardResult } | null>(null);

  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  // Step 4 runs the test delivery when it opens and again on "Run again".
  useEffect(() => {
    if (step !== 4 || !tool) return;
    setDelivery('running');
    const timer = window.setTimeout(() => setDelivery(credentialsFail(tool, values) ? 'fail' : 'ok'), DELIVERY_MS);
    return () => window.clearTimeout(timer);
  }, [step, deliveryRun]); // eslint-disable-line react-hooks/exhaustive-deps

  // Move focus to the step heading after the step changes, so keyboard and screen reader users start at the top.
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) firstRender.current = false;
    else headingRef.current?.focus();
  }, [step]);

  const runTest = () => {
    if (!tool) return;
    setTesting(true);
    const at = signature;
    later(() => {
      setTesting(false);
      setAuth({ signature: at, ok: !credentialsFail(tool, values) });
    }, TEST_MS);
  };

  const result = (): WizardResult => ({ tool: tool!, account: accountFor(tool!, values), dataset: dataset as WizardResult['dataset'], schedule, format });

  const canContinue =
    step === 1 ? Boolean(tool) : step === 2 ? Boolean(tool && fieldsFilled(tool, values) && authResult?.ok) : step === 3 ? true : step === 4 ? delivery === 'ok' : true;

  const next = () => {
    if (step === 4) {
      const r = result();
      setDone({ id: onFinish(r, reconnectId), result: r });
      setStep(5);
    } else if (step < 4) setStep((step + 1) as Step);
  };
  const back = () => setStep((step - 1) as Step);
  const canGoBack = step > 1 && step < 5 && !(reconnecting && step === 2);

  const continueLabel = step === 3 ? 'Review' : step === 4 ? 'Finish and connect' : 'Continue';
  const stepTitle = ['Choose a tool', tool ? `Connect ${tool.name}` : 'Authenticate', 'Choose data', 'Review', tool ? `${tool.name} is connected` : 'Connected'][step - 1];

  const summary = (r: { tool: Tool; account: string; dataset: { title: string }; schedule: string; format: string }, extra?: ReactNode) => (
    <dl className={styles.summary}>
      <div>
        <dt>Tool</dt>
        <dd>{r.tool.name}</dd>
      </div>
      <div>
        <dt>Account</dt>
        <dd>{r.account}</dd>
      </div>
      <div>
        <dt>Delivers</dt>
        <dd>
          {r.dataset.title} · {r.format}
        </dd>
      </div>
      <div>
        <dt>Schedule</dt>
        <dd>{r.schedule}</dd>
      </div>
      <div>
        <dt>First delivery</dt>
        <dd>{DATES.newConnectionFirstDelivery}</dd>
      </div>
      {extra}
    </dl>
  );

  return (
    <Modal
      open
      onClose={onClose}
      title="Add connection"
      width={720}
      headerAside={step < 5 ? <span className={styles.stepCount}>Step {step} of {STEPS.length}</span> : undefined}
      actions={
        step < 5 ? (
          <>
            {canGoBack && (
              <Button variant="ghost" leadingIcon={ChevronLeft} className={styles.back} onClick={back}>
                Back
              </Button>
            )}
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="primary" disabled={!canContinue} onClick={next}>
              {continueLabel}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={onAddAnother}>{ADD_FLOW.done.secondary}</Button>
            <Button variant="primary" onClick={() => done && onView(done.id)}>
              {ADD_FLOW.done.primary}
            </Button>
          </>
        )
      }
    >
      <div className={styles.wizard}>
        <Stepper steps={STEPS} current={step === 5 ? STEPS.length : step - 1} />

        <div className={styles.step}>
          {step === 5 ? (
            <div className={styles.doneIcon} aria-hidden="true">
              <Check size={28} strokeWidth={3} />
            </div>
          ) : null}
          <h3 ref={headingRef} tabIndex={-1} className={cx(styles.heading, step === 5 && styles.centred)}>
            {stepTitle}
          </h3>

          {step === 1 && (
            <ChooseTool
              connections={connections}
              query={query}
              onQuery={setQuery}
              category={category}
              onCategory={setCategory}
              toolId={toolId}
              onTool={setToolId}
            />
          )}

          {step === 2 && tool && (
            <div className={styles.auth}>
              <div className={styles.toolHead}>
                <ToolTile tool={tool} />
                <p className={styles.toolText}>{tool.description}</p>
                {tool.tone === 'ai' && <Badge label="AI" tone="purple" size="small" />}
              </div>

              {tool.authFields.length > 0 ? (
                <div className={styles.fields}>
                  {tool.authFields.map((field) => (
                    <TextInput
                      key={field[0]}
                      label={field[0]}
                      value={values[field[0]] ?? ''}
                      placeholder={isSecret(field) ? undefined : field[1]}
                      type={isSecret(field) ? 'password' : 'text'}
                      onChange={(v) => setValue(field[0], v)}
                    />
                  ))}
                </div>
              ) : (
                <p className={styles.help}>No details are needed for {tool.name}. Test to continue.</p>
              )}

              <div className={styles.helpBox}>
                <p className={styles.helpTitle}>Where do I find these?</p>
                <p className={styles.help}>{helpFor(tool)}</p>
              </div>

              <div className={styles.testRow}>
                <Button leadingIcon={PlugZap} loading={testing} disabled={!fieldsFilled(tool, values)} onClick={runTest}>
                  Test credentials
                </Button>
                {testing && <span className={styles.testing}>Testing…</span>}
              </div>
              {authResult?.ok && !testing && <Notice tone="success" title="Credentials accepted" />}
              {authResult && !authResult.ok && !testing && <Notice tone="error" title="Authentication failed (401). Check the token secret." />}
            </div>
          )}

          {step === 3 && (
            <div className={styles.data}>
              <fieldset className={styles.radios}>
                <legend className="visually-hidden">What to deliver</legend>
                {ADD_FLOW.datasets.map((d) => (
                  <label key={d.id} className={cx(styles.radioCard, d.id === datasetId && styles.selected)}>
                    <input type="radio" name="dataset" className="visually-hidden" checked={d.id === datasetId} onChange={() => setDatasetId(d.id)} />
                    <span className={styles.radioDot} aria-hidden="true" />
                    <span className={styles.radioText}>
                      <span className={styles.radioTitle}>{d.title}</span>
                      <span className={styles.radioDescription}>{d.description}</span>
                    </span>
                    {'badge' in d && d.badge && <Badge label={d.badge} tone="neutral" size="small" />}
                  </label>
                ))}
              </fieldset>

              <p className={styles.scope}>
                <Lock size={14} aria-hidden="true" />
                {ADD_FLOW.scopeNote}
              </p>

              <div className={styles.options}>
                <div className={styles.option}>
                  <span className={styles.optionLabel}>Schedule</span>
                  <SegmentedControl label="Schedule" options={ADD_FLOW.schedule.map((v) => ({ value: v, label: v }))} value={schedule} onChange={setSchedule} />
                </div>
                <div className={styles.option}>
                  <span className={styles.optionLabel}>Format</span>
                  <SegmentedControl label="Format" options={ADD_FLOW.formats.map((v) => ({ value: v, label: v }))} value={format} onChange={setFormat} />
                </div>
              </div>

              <p className={styles.first}>First delivery: {DATES.newConnectionFirstDelivery}</p>
            </div>
          )}

          {step === 4 && tool && (
            <div className={styles.review}>
              {summary({ tool, account: accountFor(tool, values), dataset, schedule, format })}
              {delivery === 'running' && <Notice tone="info" title="Running test delivery…" />}
              {delivery === 'ok' && (
                <Notice
                  tone="success"
                  title={ADD_FLOW.testSuccess.title}
                  text={ADD_FLOW.testSuccess.text}
                  action={
                    <Button size="small" leadingIcon={RefreshCw} onClick={() => setDeliveryRun((n) => n + 1)}>
                      Run again
                    </Button>
                  }
                />
              )}
              {delivery === 'fail' && (
                <Notice
                  tone="error"
                  title={ADD_FLOW.testFail.title}
                  text={ADD_FLOW.testFail.text}
                  action={
                    <Button size="small" onClick={() => setStep(2)}>
                      Edit credentials
                    </Button>
                  }
                />
              )}
            </div>
          )}

          {step === 5 && done && (
            <div className={styles.doneBody}>
              <p className={styles.doneText}>{ADD_FLOW.done.text.replace('{firstDelivery}', DATES.newConnectionFirstDelivery)}</p>
              {summary(
                done.result,
                <div>
                  <dt>Status</dt>
                  <dd>
                    <Badge label="Active" tone="green" dot />
                  </dd>
                </div>,
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

interface NoticeProps {
  tone: 'success' | 'error' | 'info';
  title: string;
  text?: string;
  action?: ReactNode;
}

/** Green, red or neutral result box. Errors are announced at once; the others politely. */
function Notice({ tone, title, text, action }: NoticeProps) {
  const Icon = tone === 'error' ? CircleX : CircleCheck;
  return (
    <div className={cx(styles.notice, styles[tone])} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon size={20} aria-hidden="true" className={styles.noticeIcon} />
      <div className={styles.noticeText}>
        <p className={styles.noticeTitle}>{title}</p>
        {text && <p className={styles.noticeBody}>{text}</p>}
      </div>
      {action}
    </div>
  );
}

interface ChooseToolProps {
  connections: Connection[];
  query: string;
  onQuery: (value: string) => void;
  category: string;
  onCategory: (value: string) => void;
  toolId?: string;
  onTool: (id: string) => void;
}

/** Step 1: search, category chips and a scrollable 3-column grid of tools that are not connected yet. */
function ChooseTool({ connections, query, onQuery, category, onCategory, toolId, onTool }: ChooseToolProps) {
  const q = query.trim().toLowerCase();
  const tools = availableTools(connections, category).filter((t) => !q || `${t.name} ${t.category} ${t.description}`.toLowerCase().includes(q));
  return (
    <div className={styles.choose}>
      <SearchField value={query} onChange={onQuery} placeholder="Search tools" label="Search tools" />
      <FilterPills label="Filter tools by category" options={CATEGORIES.map((c) => ({ id: c, label: c }))} value={category} onChange={onCategory} />
      <fieldset className={styles.gridWrap}>
        <legend className="visually-hidden">Tool</legend>
        {tools.length > 0 ? (
          <ul className={styles.grid}>
            {tools.map((t) => {
              const selected = t.id === toolId;
              return (
                <li key={t.id}>
                  <label className={cx(styles.toolCard, selected && styles.selected)}>
                    <input type="radio" name="tool" className="visually-hidden" checked={selected} onChange={() => onTool(t.id)} />
                    <span className={styles.toolTop}>
                      <ToolTile tool={t} />
                      {t.tone === 'ai' && <Badge label="AI" tone="purple" size="small" />}
                      {selected && (
                        <span className={styles.tick} aria-hidden="true">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                    </span>
                    <span className={styles.toolName}>{t.name}</span>
                    <span className={styles.toolCategory}>{t.category}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={styles.none}>No tools match.</p>
        )}
      </fieldset>
      <p className={styles.note}>Databricks, Snowflake, Power BI and the REST API are already connected.</p>
      <p className="visually-hidden" role="status" aria-live="polite">
        {tools.length} {tools.length === 1 ? 'tool' : 'tools'} shown
      </p>
    </div>
  );
}
