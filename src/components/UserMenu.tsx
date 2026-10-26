import { useNavigate } from 'react-router-dom';
import { USERS, useUser, type UserId } from '../lib/user';
import Avatar from './Avatar';
import Menu from './Menu';
import ThemeSwitch from './ThemeSwitch';
import styles from './UserMenu.module.css';

const BADGES: Record<string, string> = { dev: 'EN', maya: 'PR', ifpi: 'IF' };
/** Order in the Figma menu: Enterprise, Premium, IFPI user. */
const ORDER: UserId[] = ['dev', 'maya', 'ifpi'];

/**
 * Avatar button with the Switch user menu (Figma "Menu / Switch user").
 * Picking a user changes the sidebar and goes to that user's landing page. Appearance sits at the bottom.
 */
export default function UserMenu() {
  const { user, switchUser } = useUser();
  const navigate = useNavigate();

  const items = ORDER.map((id) => {
    const option = USERS.find((u) => u.id === id)!;
    return {
      id,
      label: id === 'ifpi' ? option.name : option.tier,
      description: option.subtitle,
      badge: BADGES[id],
      badgeTone: id === 'ifpi' ? ('accent' as const) : ('neutral' as const),
      selected: id === user.id,
      onSelect: () => {
        if (id === user.id) return;
        navigate(switchUser(id).landing);
      },
    };
  });

  return (
    <Menu
      label="Switch user"
      width={320}
      header={
        <span className={styles.signedIn}>
          <Avatar name={user.name} size={40} />
          <span className={styles.who}>
            <strong>{user.name}</strong>
            <span>{user.tier}</span>
          </span>
        </span>
      }
      sectionLabel="Switch user (prototype)"
      items={items}
      footer={
        <div className={styles.appearance}>
          <span>Appearance</span>
          <ThemeSwitch />
        </div>
      }
      trigger={(props) => (
        <button {...props} type="button" className={styles.trigger} aria-label={`Account and appearance: ${user.name}, ${user.tier}`}>
          <Avatar name={user.name} size={32} />
        </button>
      )}
    />
  );
}
