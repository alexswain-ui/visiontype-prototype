import { Plus } from 'lucide-react';
import type { Tool } from '../lib/connections';
import Badge from './Badge';
import Button from './Button';
import ToolTile from './ToolTile';
import styles from './ToolCard.module.css';

export interface ToolCardProps {
  tool: Tool;
  onConnect: (tool: Tool) => void;
}

/** Available connection card (Figma "Available connections"): tile, name, category, description, Connect button. AI tools keep their brand logo, get an AI chip and a purple button. */
export default function ToolCard({ tool, onConnect }: ToolCardProps) {
  const ai = tool.tone === 'ai';
  return (
    <li className={styles.card}>
      <div className={styles.head}>
        <ToolTile tool={tool} aiStyle={false} />
        <div className={styles.text}>
          <h3 className={styles.name}>{tool.name}</h3>
          <p className={styles.category}>{tool.category}</p>
        </div>
        {ai && <Badge label="AI" tone="purple" size="small" />}
      </div>
      <p className={styles.description}>{tool.description}</p>
      <div className={styles.footer}>
        <Button size="small" variant={ai ? 'tertiary' : 'secondary'} leadingIcon={Plus} aria-label={`Connect ${tool.name}`} onClick={() => onConnect(tool)}>
          Connect
        </Button>
      </div>
    </li>
  );
}
