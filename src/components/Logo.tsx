import logo from '../assets/brand/logo-newco.svg';
import styles from './Logo.module.css';

/** "NewCo." wordmark from the Figma sidebar. Drawn as a mask so it takes the theme's text colour. */
export default function Logo() {
  return <span className={styles.logo} role="img" aria-label="NewCo." style={{ maskImage: `url(${logo})`, WebkitMaskImage: `url(${logo})` }} />;
}
