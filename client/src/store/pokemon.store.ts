import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'system';

interface IPokemonState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  capturedPokemon: Set<string>;
  setCapturedPokemon: (captured: string[]) => void;
  isCaptured: (pokemonName: string) => boolean;
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const getEffectiveTheme = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') {
    return getSystemTheme();
  }
  return mode;
};

export const usePokemonStore = create<IPokemonState>()(
  persist(
    (set, get) => ({
      themeMode: 'system',
      setThemeMode: (mode) => set({ themeMode: mode }),
      capturedPokemon: new Set<string>(),
      setCapturedPokemon: (captured) => set({ capturedPokemon: new Set(captured) }),
      isCaptured: (pokemonName) => get().capturedPokemon.has(pokemonName),
    }),
    {
      name: 'pokemon-storage',
      partialize: (state) => ({
        themeMode: state.themeMode,
      }),
    },
  ),
);
