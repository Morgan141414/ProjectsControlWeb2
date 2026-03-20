import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UiState {
  theme: 'dark'
  sidebarCollapsed: boolean
  toggleTheme: () => void
  setTheme: (theme: 'dark') => void
  toggleSidebar: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: 'dark' as const,
      sidebarCollapsed: false,

      toggleTheme: () => set({ theme: 'dark' }),
      setTheme: () => set({ theme: 'dark' }),

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    { name: 'ui-storage' },
  ),
)
