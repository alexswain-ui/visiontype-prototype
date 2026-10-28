import { EllipsisVertical, TriangleAlert } from 'lucide-react';
import { cx } from '../lib/cx';
import { ROW_MENU, toolById, type Connection, type Status } from '../lib/connections';
import Badge, { type BadgeTone } from './Badge';
import IconButton from './IconButton';
import Menu from './Menu';
import ToolTile from './ToolTile';
import styles from './ConnectionsTable.module.css';

const TONES: Record<Status, BadgeTone> = { Active: 'green', 'Needs attention': 'amber', Paused: 'neutral' };

export interface ConnectionsTableProps {
  connections: Connection[];
  /** A row to draw attention to for a moment (a new or reconnected connection). */
  highlightId?: string | null;
  onPause: (id: string) => void;
  onRemove: (connection: Connection) => void;
  /** Any other menu item: View details, Edit schedule, Reconnect. */
  onOther: (item: string, connection: Connection) => void;
}

/** Table of connected tools (Figma "Your connections"): 68px rows, status chip, row menu. A Needs attention row has a faint amber tint. */
export default function ConnectionsTable({ connections, highlightId, onPause, onRemove, onOther }: ConnectionsTableProps) {
  return (
    <div className={styles.scroll} tabIndex={0} aria-label="Your connections, scrolls sideways">
      <table className={styles.table} aria-label="Your connections">
        <thead>
          <tr>
            <th scope="col" style={{ width: '24%' }}>Connection</th>
            <th scope="col" style={{ width: '23%' }}>Delivers</th>
            <th scope="col" style={{ width: '16%' }}>Schedule</th>
            <th scope="col" style={{ width: '16%' }}>Last delivery</th>
            <th scope="col" style={{ width: '16%' }}>Status</th>
            <th scope="col" className={styles.menuCell}>
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {connections.map((c) => {
            const tool = toolById(c.tool);
            const attention = c.status === 'Needs attention';
            return (
              <tr key={c.id} data-connection={c.id} className={cx(styles.row, attention && styles.attention, highlightId === c.id && styles.highlight)}>
                <td>
                  <div className={styles.tool}>
                    <ToolTile tool={tool} size={36} aiStyle={false} />
                    <div className={styles.text}>
                      <p className={styles.name}>{tool.name}</p>
                      <p className={styles.sub}>{c.type}</p>
                    </div>
                  </div>
                </td>
                <td className={styles.body}>{c.delivers}</td>
                <td className={styles.body}>{c.schedule}</td>
                <td>
                  <p className={styles.last}>{c.last}</p>
                  <p className={cx(styles.sub, attention && styles.warn)}>{c.detail}</p>
                </td>
                <td className={styles.status}>
                  <Badge label={c.status} tone={TONES[c.status]} dot={c.status === 'Active'} icon={attention ? TriangleAlert : undefined} />
                </td>
                <td className={styles.menuCell}>
                  <Menu
                    label={`Actions for ${tool.name}`}
                    align="end"
                    width={200}
                    items={ROW_MENU.map((item) => {
                      const label = item === 'Pause' && c.status === 'Paused' ? 'Resume' : item;
                      return {
                        id: item,
                        label,
                        onSelect: () => (item === 'Pause' ? onPause(c.id) : item === 'Remove' ? onRemove(c) : onOther(item, c)),
                      };
                    })}
                    trigger={(props) => <IconButton {...props} icon={EllipsisVertical} label={`Actions for ${tool.name}`} variant="ghost" size="small" />}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {connections.length === 0 && <p className={styles.empty}>No connections yet. Choose a tool below to connect your first one.</p>}
    </div>
  );
}
