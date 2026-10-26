import { useTheme, type ThemeChoice } from '../lib/theme';
import styles from './ThemeSwitch.module.css';

const OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

/** Light / Dark / System segmented switch. Uses native radio buttons, so arrow keys move between options. */
export default function ThemeSwitch() {
  const { choice, setChoice } = useTheme();

  return (
    <fieldset className={styles.root}>
      <legend className="visually-hidden">Appearance</legend>
      {OPTIONS.map((option) => (
        <label key={option.value} className={styles.option}>
          <input
            type="radio"
            name="theme"
            value={option.value}
            checked={choice === option.value}
            onChange={() => setChoice(option.value)}
            className={`visually-hidden ${styles.input}`}
          />
          <span className={styles.segment}>{option.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
