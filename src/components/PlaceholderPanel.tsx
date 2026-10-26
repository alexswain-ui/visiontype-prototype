import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Construction } from 'lucide-react';
import styles from './PlaceholderPanel.module.css';

export interface PlaceholderPanelProps {
  /** What this page will become. */
  children: ReactNode;
  /** Figma frame the page will be built from. */
  figmaNode?: string;
  /** Related routes, so reviewers can click around before the page exists. */
  links?: { to: string; label: string }[];
}

/** Temporary body for pages that are routed but not built yet. */
export default function PlaceholderPanel({ children, figmaNode, links }: PlaceholderPanelProps) {
  return (
    <section className={styles.panel}>
      <Construction size={24} className={styles.icon} aria-hidden="true" />
      <div className={styles.text}>
        <p className={styles.lead}>Placeholder: this page is coming next.</p>
        <div className={styles.what}>{children}</div>
        {figmaNode && <p className={styles.meta}>Figma frame {figmaNode}</p>}
        {links && links.length > 0 && (
          <ul className={styles.links}>
            {links.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
