import { Bookmark, ChevronsUpDown, Ellipsis, FileText, Folder, GitCompareArrows, PanelLeft, Plus, Search } from 'lucide-react';
import AiIcon from './AiIcon';
import { Link } from 'react-router-dom';
import { ask } from '../lib/ask';
import { cx } from '../lib/cx';
import { useNotInPrototype } from '../lib/notInPrototype';
import IconButton from './IconButton';
import styles from './AskNav.module.css';

export interface AskNavProps {
  /** Script id of the open conversation; none on the new-chat home. */
  activeScript?: string;
  /** True on the new-chat home (highlights "New chat"). */
  home: boolean;
}

const TOOLS = [
  { label: 'Search', icon: Search },
  { label: 'Projects', icon: Folder },
  { label: 'Files', icon: FileText },
  { label: 'Saved prompts', icon: Bookmark },
];

/**
 * Ask panel (Figma "Ask nav", 260px): New chat, tools, Recents and Connected tools.
 * The three scripted Recents open their conversations; everything else is not part of this prototype.
 */
export default function AskNav({ activeScript, home }: AskNavProps) {
  const notInPrototype = useNotInPrototype();
  return (
    <nav className={styles.nav} aria-label="Ask">
      <div className={styles.top}>
        <div className={styles.header}>
          <p className={styles.title}>
            <AiIcon size={16} aria-hidden="true" />
            Ask
          </p>
          <IconButton icon={PanelLeft} label="Hide panel" variant="ghost" size="small" onClick={() => notInPrototype('Hiding the Ask panel')} />
        </div>

        <ul className={styles.list}>
          <li>
            <Link to="/ask" className={cx(styles.row, home && styles.active)} aria-current={home ? 'page' : undefined}>
              <span className={styles.plus}>
                <Plus size={16} aria-hidden="true" />
              </span>
              <span className={styles.newChat}>New chat</span>
            </Link>
          </li>
          {TOOLS.map(({ label, icon: Icon }) => (
            <li key={label}>
              <button type="button" className={styles.row} onClick={() => notInPrototype(label)}>
                <Icon size={20} aria-hidden="true" className={styles.toolIcon} />
                {label}
              </button>
            </li>
          ))}
        </ul>

        <section className={styles.recents} aria-labelledby="ask-recents">
          <h2 id="ask-recents" className={styles.recentsLabel}>
            Recents
          </h2>
          <ul className={styles.recentList}>
            {ask.home.recents.map((recent) => {
              const active = recent.script !== undefined && recent.script === activeScript;
              return (
                <li key={recent.title} className={cx(styles.chat, active && styles.active)}>
                  {recent.script ? (
                    <Link to={`/ask/${recent.script}`} className={styles.chatLink} aria-current={active ? 'page' : undefined}>
                      {recent.title}
                    </Link>
                  ) : (
                    <button type="button" className={styles.chatLink} onClick={() => notInPrototype(`The “${recent.title}” chat`)}>
                      {recent.title}
                    </button>
                  )}
                  {active && (
                    <button type="button" className={styles.more} aria-label={`More for ${recent.title}`} onClick={() => notInPrototype('Chat options')}>
                      <Ellipsis size={16} aria-hidden="true" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className={styles.bottom}>
        <button type="button" className={styles.tools} onClick={() => notInPrototype('Connected tools')}>
          <GitCompareArrows size={16} aria-hidden="true" className={styles.toolIcon} />
          <span className={styles.toolsText}>
            <span>Connected tools</span>
            <span className={styles.toolsMeta}>{ask.home.connectedTools}</span>
          </span>
          <ChevronsUpDown size={16} aria-hidden="true" className={styles.toolIcon} />
        </button>
      </div>
    </nav>
  );
}
