import { cx } from '../lib/cx';
import styles from './Avatar.module.css';

export type AvatarSize = 18 | 24 | 32 | 40 | 56;

export interface AvatarProps {
  name: string;
  size?: AvatarSize;
  /** Photo URL. Without it the avatar shows initials on a chart-colour circle. */
  src?: string;
  /** 1-4 picks the chart colour; defaults to one derived from the name. */
  tone?: 1 | 2 | 3 | 4;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

function toneFor(name: string): 1 | 2 | 3 | 4 {
  let sum = 0;
  for (const char of name) sum += char.charCodeAt(0);
  return ((sum % 4) + 1) as 1 | 2 | 3 | 4;
}

/** Round avatar (Figma "Avatar": initials in chart colours; photos in table rows). Static. */
export default function Avatar({ name, size = 32, src, tone }: AvatarProps) {
  const sizeClass = styles[`s${size}`];
  if (src) {
    return <img src={src} alt={name} width={size} height={size} className={cx(styles.avatar, styles.photo, sizeClass)} />;
  }
  return (
    <span className={cx(styles.avatar, styles[`tone${tone ?? toneFor(name)}`], sizeClass)} role="img" aria-label={name}>
      {size === 18 ? initials(name)[0] : initials(name)}
    </span>
  );
}
