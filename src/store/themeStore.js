import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'light', // 'light' | 'dark'
      
      // Cambiar tema
      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light'
        }));
      },
      
      // Establecer tema específico
      setTheme: (theme) => {
        set({ theme });
      },
      
      // Obtener tema actual
      getTheme: () => get().theme,
      
      // Verificar si es tema oscuro
      isDark: () => get().theme === 'dark',
    }),
    {
      name: 'finance-dashboard-theme', // nombre para localStorage
      getStorage: () => localStorage, // especifica localStorage
    }
  )
);

export default useThemeStore;