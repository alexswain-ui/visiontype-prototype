import ThemeSwitch from '../components/ThemeSwitch';
import { semanticTokenGroups } from '../lib/semanticTokens';
import { useTheme } from '../lib/theme';
import styles from './Gallery.module.css';

const THEMES = ['dark', 'light'] as const;

/** Temporary design check page: every semantic colour token in Dark and Light side by side. */
export default function Gallery() {
  const { choice, resolved } = useTheme();

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Gallery</h1>
          <p className={styles.supporting}>
            Temporary page. Semantic colour tokens from tokens.css. The two panels are pinned to Dark and Light; the
            page around them follows the switch (now {choice === 'system' ? `System, showing ${resolved}` : choice}).
          </p>
        </div>
        <ThemeSwitch />
      </header>

      <div className={styles.columns}>
        {THEMES.map((theme) => (
          <section key={theme} data-theme={theme} className={styles.panel} aria-label={`${theme} theme`}>
            <h2 className={styles.panelTitle}>{theme === 'dark' ? 'Dark' : 'Light'}</h2>
            {semanticTokenGroups.map(({ group, tokens }) => (
              <div key={group} className={styles.group}>
                <h3 className={styles.groupTitle}>{group}</h3>
                <ul className={styles.list}>
                  {tokens.map((token) => (
                    <li key={token.name} className={styles.row}>
                      <span className={styles.swatch} style={{ background: `var(${token.name})` }} />
                      <span className={styles.name}>{token.name}</span>
                      <span className={styles.value}>{token[theme]}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ))}
      </div>

      <p className={styles.footnote}>Illustrative data. Prototype only.</p>
    </main>
  );
}
