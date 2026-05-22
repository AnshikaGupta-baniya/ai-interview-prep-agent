import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create((set, get) => ({
  theme: 'dark',

  toggleTheme: async () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme: next });
    await AsyncStorage.setItem('theme', next);
  },

  loadTheme: async () => {
    const saved = await AsyncStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') {
      set({ theme: saved });
    }
  },
}));

