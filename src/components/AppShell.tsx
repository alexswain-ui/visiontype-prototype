import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import styles from './AppShell.module.css';

/** Sidebar (200px) + content area (max 1160px at a 1440 window). Pages render in the outlet. */
export default function AppShell() {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
