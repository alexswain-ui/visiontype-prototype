import { BR, CA, DE, ES, FR, GB, IT, JP, MX, SE, US } from 'country-flag-icons/react/3x2';
import { cx } from '../lib/cx';
import styles from './Flag.module.css';

type FlagSvg = typeof GB;

/** Markets used in the prototype data. Add a code here if a new market appears in data/cast.json. */
const FLAGS: Record<string, FlagSvg> = { BR, CA, DE, ES, FR, GB, IT, JP, MX, SE, US };

export interface FlagProps {
  /** ISO 3166 alpha-2 code, e.g. "GB". */
  code: string;
  /** small 20x14 (tables), medium 26x19, large 56x40 (page headers). */
  size?: 'small' | 'medium' | 'large';
  /** Country name for screen readers. Leave empty when the name is printed next to the flag. */
  label?: string;
}

/** Rectangular country flag with a hairline outline (country-flag-icons). */
export default function Flag({ code, size = 'small', label }: FlagProps) {
  const Svg = FLAGS[code.toUpperCase()];
  return (
    <span
      className={cx(styles.flag, styles[size])}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {Svg ? <Svg className={styles.svg} preserveAspectRatio="xMidYMid slice" /> : <span className={styles.fallback}>{code}</span>}
    </span>
  );
}
