import data from '../data/connections.json';

/**
 * Connections page (/connections). ALL DATA IS FICTIONAL.
 * Tools, rows and rules come from src/data/connections.json. State lives in memory only (it resets on reload).
 */

export type Status = 'Active' | 'Needs attention' | 'Paused';

export interface Tool {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  connected: boolean;
  tone?: string;
  authFields: string[][];
}

export interface Connection {
  id: string;
  tool: string;
  type: string;
  delivers: string;
  schedule: string;
  last: string;
  detail: string;
  status: Status;
}

export const TOOLS = data.tools as Tool[];
export const INITIAL_CONNECTIONS = data.connections as Connection[];
export const CATEGORIES = data.categories;
export const ROW_MENU = data.rowMenu;
export const DATES = data.dates;
export const PREMIUM_LOCK = data.access.premium;
export const toolById = (id: string) => TOOLS.find((t) => t.id === id)!;

/**
 * Tools that can still be connected: every tool without a connection row. Tools that start unconnected come
 * first, in availableGridOrder; a tool whose connection was removed returns after them.
 */
export function availableTools(connections: Connection[], category: string): Tool[] {
  const taken = new Set(connections.map((c) => c.tool));
  const order = data.availableGridOrder;
  const rank = (id: string) => (order.includes(id) ? order.indexOf(id) : order.length);
  return TOOLS.filter((t) => !taken.has(t.id) && (category === 'All' || t.category === category)).sort((a, b) => rank(a.id) - rank(b.id));
}

const PLURALS: Record<string, [string, string]> = {
  Warehouses: ['warehouse', 'warehouses'],
  BI: ['BI tool', 'BI tools'],
  API: ['API', 'APIs'],
  'Files & sheets': ['file or sheet', 'files or sheets'],
  'Music analytics': ['analytics tool', 'analytics tools'],
  AI: ['AI assistant', 'AI assistants'],
};

export function connectionStats(connections: Connection[]) {
  const active = connections.filter((c) => c.status === 'Active');
  const attention = connections.filter((c) => c.status === 'Needs attention');

  const byCategory = new Map<string, number>();
  for (const c of active) byCategory.set(toolById(c.tool).category, (byCategory.get(toolById(c.tool).category) ?? 0) + 1);
  const activeSub = [...byCategory.entries()].map(([category, n]) => `${n} ${PLURALS[category]?.[n === 1 ? 0 : 1] ?? category.toLowerCase()}`).join(' · ');

  const attentionSub =
    attention.length === 0
      ? 'All connections healthy'
      : attention.length === 1
        ? `${toolById(attention[0].tool).name} · ${attention[0].detail.toLowerCase()}`
        : attention.map((c) => toolById(c.tool).name).join(', ');

  // The most recent delivery on the "last delivery" date: its time and row count.
  const latest = connections
    .filter((c) => c.last.startsWith(DATES.lastDelivery))
    .sort((a, b) => b.last.localeCompare(a.last))[0];
  const lastSub = latest ? `${latest.last.split('· ')[1]} · ${latest.detail}` : '';

  return {
    activeCount: active.length,
    activeSub,
    attentionCount: attention.length,
    attentionSub,
    lastDelivery: DATES.lastDelivery,
    lastSub,
    nextDelivery: DATES.nextDelivery,
  };
}

/* ---------- Add connection wizard ---------- */

export const ADD_FLOW = data.addFlow;
export type Dataset = (typeof ADD_FLOW.datasets)[number];

/** An auth field is [label, example]. An example of "secret" means the field is masked and has no example. */
export const isSecret = (field: string[]) => field[1] === 'secret';

/** Test rule for the presenter: any secret containing "bad" (case-insensitive) fails, anything else passes. */
export function credentialsFail(tool: Tool, values: Record<string, string>): boolean {
  return tool.authFields.some((field) => isSecret(field) && /bad/i.test(values[field[0]] ?? ''));
}

/** Every field has text. */
export const fieldsFilled = (tool: Tool, values: Record<string, string>) => tool.authFields.every((field) => (values[field[0]] ?? '').trim() !== '');

/** Account shown in the review: the first field that is not a secret. */
export function accountFor(tool: Tool, values: Record<string, string>): string {
  const field = tool.authFields.find((f) => !isSecret(f));
  return (field && values[field[0]]?.trim()) || '\u2014';
}

/** The "Delivers" text in the list, from the chosen dataset (same wording as the existing rows). */
export const deliversFor = (dataset: Dataset) =>
  dataset.id === 'weekly' ? 'Weekly aggregate · all markets' : dataset.id === 'entities' ? 'Entity summaries (songs, artists, countries)' : dataset.title;

export interface WizardResult {
  tool: Tool;
  account: string;
  dataset: Dataset;
  schedule: string;
  format: string;
}

/** The row added when the wizard finishes: Active, not yet delivered. In memory only. */
export function newConnection(result: WizardResult, id: string): Connection {
  return {
    id,
    tool: result.tool.id,
    type: result.format === 'CSV' ? 'CSV delivery' : 'Data source',
    delivers: deliversFor(result.dataset),
    schedule: result.schedule,
    last: 'Not yet delivered',
    detail: `First delivery ${DATES.nextDelivery}`,
    status: 'Active',
  };
}

/** Reconnecting: the row is Active again. A row that needed attention also loses its warning text. */
export function reconnected(connection: Connection): Connection {
  return connection.status === 'Needs attention' ? { ...connection, status: 'Active', detail: 'Credentials renewed' } : { ...connection, status: 'Active' };
}
