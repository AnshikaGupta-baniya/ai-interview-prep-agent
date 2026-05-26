import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isFirstLaunch: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  setLoading: (val: boolean) => void;
  checkFirstLaunch: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  isFirstLaunch: true,

  setUser: async (user) => {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    set({ user, isFirstLaunch: false });
  },

  logout: async () => {
    await AsyncStorage.removeItem('user');
    set({ user: null });
  },

  setLoading: (val) => set({ isLoading: val }),

  checkFirstLaunch: async () => {
    try {
      const saved = await AsyncStorage.getItem('user');
      if (saved) {
        set({ user: JSON.parse(saved), isFirstLaunch: false });
      }
    } catch (e) {
      console.log('Auth check error:', e);
    } finally {
      set({ isLoading: false });
    }
  },
}));