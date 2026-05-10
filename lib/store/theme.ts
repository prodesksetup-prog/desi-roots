import { create } from 'zustand';

type ThemeMode = 'light';

type ThemeStore = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
};

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'light',
  setTheme: (theme) => set({ theme }),
}));
