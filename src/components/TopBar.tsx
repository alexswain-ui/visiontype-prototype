import NotificationsBell from './NotificationsBell';
import UserMenu from './UserMenu';
import styles from './TopBar.module.css';

/** Top-right group (Figma "Frame 9"): notifications bell and the avatar / Switch user menu. */
export default function TopBar() {
  return (
    <div className={styles.bar}>
      <NotificationsBell />
      <UserMenu />
    </div>
  );
}
