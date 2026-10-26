import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import Toast from '../components/Toast';
import styles from '../components/Toast.module.css';

type ShowToast = (message: string, icon?: LucideIcon) => void;

const ToastContext = createContext<ShowToast>(() => {});
const DURATION_MS = 3000;

/** Provides `useToast()`: shows a message at the bottom centre for 3 seconds. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<{ id: number; message: string; icon?: LucideIcon }[]>([]);
  const nextId = useRef(0);

  const show = useCallback<ShowToast>((message, icon) => {
    const id = nextId.current++;
    setToasts((list) => [...list, { id, message, icon }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={styles.region} role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={styles.enter}>
            <Toast message={t.message} icon={t.icon} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ShowToast {
  return useContext(ToastContext);
}
