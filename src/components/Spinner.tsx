import { LoaderCircle } from 'lucide-react';
import styles from './Spinner.module.css';

/** Small rotating loader used by buttons and loading states. */
export default function Spinner({ size = 16 }: { size?: number }) {
  return <LoaderCircle size={size} className={styles.spinner} aria-hidden="true" />;
}
