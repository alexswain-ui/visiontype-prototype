import {
  ChartLine,
  ChartNoAxesColumn,
  Cloud,
  Database,
  FileSpreadsheet,
  FolderInput,
  KeyRound,
  LayoutDashboard,
  ListMusic,
  Megaphone,
  Radio,
  Server,
  type LucideIcon,
} from 'lucide-react';
import { cx } from '../lib/cx';
import type { Tool } from '../lib/connections';
import AiIcon from './AiIcon';
import styles from './ToolTile.module.css';

const logos = import.meta.glob<string>('../assets/connections/*.{png,svg}', { eager: true, import: 'default' });
const LOGOS: Record<string, string> = Object.fromEntries(
  Object.entries(logos).map(([path, url]) => [path.split('/').pop()!.replace(/\.(png|svg)$/, ''), url]),
);

/** Generic icons from connections.json, for tools without a brand logo (REST API, File drop). */
const ICONS: Record<string, LucideIcon> = {
  database: Database,
  cloud: Cloud,
  server: Server,
  'chart-no-axes-column': ChartNoAxesColumn,
  'layout-dashboard': LayoutDashboard,
  'folder-input': FolderInput,
  'file-spreadsheet': FileSpreadsheet,
  'key-round': KeyRound,
  'chart-line': ChartLine,
  'list-music': ListMusic,
  radio: Radio,
  megaphone: Megaphone,
};

export interface ToolTileProps {
  tool: Pick<Tool, 'id' | 'icon' | 'tone'>;
  /** 36 in the connections list, 40 on the available cards. */
  size?: 36 | 40;
  /** Show the AI icon on a purple tile for AI tools (default). Turn off to show the brand logo instead. */
  aiStyle?: boolean;
}

/** Tool tile (Figma "Tool tile / ..."): brand logo, generic icon or the AI icon in a bordered square. */
export default function ToolTile({ tool, size = 40, aiStyle = true }: ToolTileProps) {
  const ai = aiStyle && tool.tone === 'ai';
  const logo = LOGOS[tool.id];
  const Icon = ICONS[tool.icon];
  const inner = size === 36 ? 20 : 24;
  return (
    <span className={cx(styles.tile, size === 36 ? styles.small : styles.large, ai && styles.ai)} aria-hidden="true">
      {ai ? (
        <AiIcon size={20} />
      ) : logo ? (
        <img src={logo} alt="" width={inner} height={inner} className={cx(styles.logo, tool.id === 'chatgpt' && styles.whiteLogo)} />
      ) : Icon ? (
        <Icon size={size === 36 ? 18 : 20} />
      ) : null}
    </span>
  );
}
