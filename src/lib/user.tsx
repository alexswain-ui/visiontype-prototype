import { createContext, useContext, useState, type ReactNode } from 'react';
import rules from '../data/rules.json';

export type User = (typeof rules.users)[number];
export type UserId = 'maya' | 'dev' | 'ifpi';

const STORAGE_KEY = 'vt-user';
const DEFAULT_USER: UserId = 'maya';

export const USERS = rules.users as User[];
export const userById = (id: string) => USERS.find((u) => u.id === id) ?? USERS[0];

function readStoredUser(): UserId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && USERS.some((u) => u.id === stored)) return stored as UserId;
  } catch {
    // Storage blocked: use the default.
  }
  return DEFAULT_USER;
}

interface UserContextValue {
  user: User;
  /** Changes who is signed in. The caller navigates to `user.landing`. Data is never reloaded. */
  switchUser: (id: UserId) => User;
}

const UserContext = createContext<UserContextValue | null>(null);

/** Who is signed in (Maya · Premium, Dev · Enterprise, IFPI user). Remembered across reloads. */
export function UserProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<UserId>(readStoredUser);
  const switchUser = (next: UserId) => {
    setId(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore: still switches for this visit.
    }
    return userById(next);
  };
  return <UserContext.Provider value={{ user: userById(id), switchUser }}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const value = useContext(UserContext);
  if (!value) throw new Error('useUser must be used inside <UserProvider>');
  return value;
}
