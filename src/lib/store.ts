import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppRole =
  | 'owner'
  | 'super_admin'
  | 'admin'
  | 'finance'
  | 'operations'
  | 'risk'
  | 'merchant'
  | 'processor'
  | 'local_depositor'
  | 'viewer';

export interface UserProfile {
  [key: string]: unknown;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  companyId?: string | null;
  profile?: UserProfile | null;
}

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  theme: 'light' | 'dark';
  language: 'ar' | 'en';
  shellMenuOpen: boolean;
  setAuth: (user: User | null) => void;
  setInitialized: (value: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setLanguage: (language: 'ar' | 'en') => void;
  setShellMenuOpen: (open: boolean) => void;
  logout: () => void;
}

const syncDocument = (theme: 'light' | 'dark', language: 'ar' | 'en') => {
  if (typeof document === 'undefined') return;

  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isInitialized: false,
      theme: 'dark',
      language: 'ar',
      shellMenuOpen: false,
      setAuth: (user) =>
        set({
          user,
          isAuthenticated: Boolean(user),
          isInitialized: true,
        }),
      setInitialized: (value) => set({ isInitialized: value }),
      setTheme: (theme) => {
        syncDocument(theme, get().language);
        set({ theme });
      },
      toggleTheme: () => {
        const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
        syncDocument(nextTheme, get().language);
        set({ theme: nextTheme });
      },
      setLanguage: (language) => {
        syncDocument(get().theme, language);
        set({ language });
      },
      setShellMenuOpen: (open) => set({ shellMenuOpen: open }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          shellMenuOpen: false,
        }),
    }),
    {
      name: 'p2p-storage',
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        syncDocument(state.theme, state.language);
      },
    }
  )
);
