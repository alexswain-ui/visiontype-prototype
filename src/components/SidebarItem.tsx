import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cx } from '../lib/cx';
import styles from './SidebarItem.module.css';

export interface SidebarItemProps {
  label: string;
  icon: LucideIcon;
  /** Route for designed areas. Leave out and pass onClick for "Not part of this prototype". */
  to?: string;
  /** Extra route prefixes that also make this item active (e.g. entity pages under Data). */
  activeFor?: string[];
  currentPath: string;
  onClick?: () => void;
  /** Purple AI style (Ask). */
  tone?: 'default' | 'ai';
}

/** Sidebar row: default, hover, active (accent fill + accent text), focus. */
export default function SidebarItem({ label, icon: Icon, to, activeFor = [], currentPath, onClick, tone = 'default' }: SidebarItemProps) {
  const className = cx(styles.item, tone === 'ai' && styles.ai);
  const content = (
    <>
      <Icon size={16} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
    </>
  );
  if (!to) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {content}
      </button>
    );
  }
  const extraActive = activeFor.some((prefix) => currentPath.startsWith(prefix));
  return (
    <NavLink to={to} className={({ isActive }) => cx(className, (isActive || extraActive) && styles.active)}>
      {content}
    </NavLink>
  );
}
