import { Bell } from 'lucide-react';
import { useNotInPrototype } from '../lib/notInPrototype';
import Tooltip from './Tooltip';
import UserMenu from './UserMenu';
import styles from './TopBar.module.css';

/** Top-right group (Figma "Frame 9"): notifications bell and the avatar / Switch user menu. */
export default function TopBar() {
  const notInPrototype = useNotInPrototype();
  return (
    <div className={styles.bar}>
      <Tooltip label="Notifications" describe={false}>
        <button type="button" className={styles.bell} aria-label="Notifications" onClick={() => notInPrototype('Notifications')}>
          <Bell size={24} aria-hidden="true" />
        </button>
      </Tooltip>
      <UserMenu />
    </div>
  );
}
