import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { useEffect, useMemo } from 'react';

import { usePokemonStore, getEffectiveTheme } from '@/store';
import { createAppTheme } from '@/theme';

interface IThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider = ({ children }: IThemeProviderProps) => {
  const { themeMode } = usePokemonStore();
  const effectiveTheme = useMemo(() => getEffectiveTheme(themeMode), [themeMode]);
  const theme = useMemo(() => createAppTheme(effectiveTheme), [effectiveTheme]);

  useEffect(() => {
    if (themeMode !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      window.dispatchEvent(new Event('theme-change'));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
