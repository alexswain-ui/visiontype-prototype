import ThemeSwitch from '../components/ThemeSwitch';
import ButtonsSection from './gallery/ButtonsSection';
import ChipsSection from './gallery/ChipsSection';
import ColourTokensSection from './gallery/ColourTokensSection';
import InputsSection from './gallery/InputsSection';
import TabsSection from './gallery/TabsSection';
import styles from './gallery/Gallery.module.css';

const SECTIONS = [
  ['button', 'Button'],
  ['icon-button', 'Icon button'],
  ['chip', 'Chip'],
  ['badge', 'Status chip'],
  ['tabs', 'Tabs'],
  ['search', 'Search'],
  ['text-input', 'Text input'],
  ['select', 'Select'],
  ['colours', 'Colours'],
];

/** Hidden review page: every shared component in every state, Dark and Light side by side. */
export default function Gallery() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Gallery</h1>
          <p className={styles.supporting}>
            Every shared component in every state. Each section shows a Dark and a Light panel; the page around them
            follows the switch. Items marked Proposed were not designed in Figma.
          </p>
        </div>
        <ThemeSwitch />
      </header>
      <nav className={styles.nav} aria-label="Gallery sections">
        {SECTIONS.map(([id, label]) => (
          <a key={id} href={`#${id}`} className={styles.navLink}>
            {label}
          </a>
        ))}
      </nav>
      <ButtonsSection />
      <ChipsSection />
      <TabsSection />
      <InputsSection />
      <ColourTokensSection />
      <p className={styles.footnote}>Illustrative data. Prototype only.</p>
    </main>
  );
}
