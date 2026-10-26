import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import NotInPrototypeDialog from '../components/NotInPrototypeDialog';

type Show = (feature?: string) => void;

const NotInPrototypeContext = createContext<Show>(() => {});

/** Provides `useNotInPrototype()`: call it with a feature name to show the dialog from anywhere. */
export function NotInPrototypeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ open: boolean; feature?: string }>({ open: false });
  const show = useCallback<Show>((feature) => setState({ open: true, feature }), []);
  return (
    <NotInPrototypeContext.Provider value={show}>
      {children}
      <NotInPrototypeDialog open={state.open} feature={state.feature} onClose={() => setState({ open: false })} />
    </NotInPrototypeContext.Provider>
  );
}

export function useNotInPrototype(): Show {
  return useContext(NotInPrototypeContext);
}
