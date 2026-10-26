import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import styles from './CardLink.module.css';

export interface CardLinkProps {
  label: string;
  /** Route to open. Without it the link is a button that calls `onClick`. */
  to?: string;
  onClick?: () => void;
  /** Spoken name when the visible label is vague ("View", "See All"). */
  ariaLabel?: string;
}

/** Small text link with a chevron ("See All >", "View >", "Manage >") used in widget headers and rows. */
export default function CardLink({ label, to, onClick, ariaLabel }: CardLinkProps) {
  const content = (
    <>
      {label}
      <ChevronRight size={16} aria-hidden="true" />
    </>
  );
  if (to) {
    return (
      <Link to={to} className={styles.link} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" className={styles.link} onClick={onClick} aria-label={ariaLabel}>
      {content}
    </button>
  );
}
