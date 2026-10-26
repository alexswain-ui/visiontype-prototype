import { CircleCheck, type LucideIcon } from 'lucide-react';
import styles from './Toast.module.css';

export interface ToastProps {
  message: string;
  icon?: LucideIcon;
}

/** Small confirmation message, e.g. "Saved" or "Added to dashboard" (proposed). */
export default function Toast({ message, icon: Icon = CircleCheck }: ToastProps) {
  return (
    <div className={styles.toast}>
      <Icon size={16} aria-hidden="true" className={styles.icon} />
      {message}
    </div>
  );
}
