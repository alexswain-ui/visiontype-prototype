import { AudioLines, BadgeAlert, FileChartLine, GitCompare, House, ListOrdered, Settings, Sparkles, Star } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useNotInPrototype } from '../lib/notInPrototype';
import { useUser } from '../lib/user';
import Logo from './Logo';
import SidebarItem from './SidebarItem';
import styles from './Sidebar.module.css';

/**
 * App sidebar (Figma "Sidebar - Collapsed", 200px). Rules appears after Issues for the IFPI user only.
 * Reports, Saved Searches, Issues, Connections and Settings open "Not part of this prototype".
 */
export default function Sidebar() {
  const { pathname } = useLocation();
  const { user } = useUser();
  const notInPrototype = useNotInPrototype();
  const notDesigned = (label: string) => () => notInPrototype(label);

  return (
    <nav className={styles.sidebar} aria-label="Main">
      <div className={styles.top}>
        <Logo />
        <ul className={styles.items}>
          <li>
            <SidebarItem label="Dashboard" icon={House} to="/dashboard" currentPath={pathname} />
          </li>
          <li>
            <SidebarItem label="Data" icon={AudioLines} to="/data" activeFor={['/song/', '/artist/', '/country/']} currentPath={pathname} />
          </li>
          <li>
            <SidebarItem label="Reports" icon={FileChartLine} currentPath={pathname} onClick={notDesigned('Reports')} />
          </li>
          <li>
            <SidebarItem label="Saved Searches" icon={Star} currentPath={pathname} onClick={notDesigned('Saved Searches')} />
          </li>
          <li>
            <SidebarItem label="Issues" icon={BadgeAlert} currentPath={pathname} onClick={notDesigned('Issues')} />
          </li>
          {user.seesRules && (
            <li>
              <SidebarItem label="Rules" icon={ListOrdered} to="/rules" currentPath={pathname} />
            </li>
          )}
          <li>
            <SidebarItem label="Connections" icon={GitCompare} currentPath={pathname} onClick={notDesigned('Connections')} />
          </li>
          <li role="separator" className={styles.separator} />
          <li>
            <SidebarItem label="Ask" icon={Sparkles} to="/ask" tone="ai" currentPath={pathname} />
          </li>
        </ul>
      </div>
      <div className={styles.bottom}>
        <p className={styles.note}>Illustrative data · prototype only</p>
        <SidebarItem label="Settings" icon={Settings} currentPath={pathname} onClick={notDesigned('Settings')} />
      </div>
    </nav>
  );
}
