import { Brightness4, Brightness7, SettingsBrightness } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';

import { usePokemonStore, ThemeMode } from '@/store';

export const ThemeToggle = () => {
  const { themeMode, setThemeMode } = usePokemonStore();

  const cycleTheme = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system'];
    const currentIndex = modes.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setThemeMode(modes[nextIndex]);
  };

  const getIcon = () => {
    switch (themeMode) {
      case 'light':
        return <Brightness7 />;
      case 'dark':
        return <Brightness4 />;
      case 'system':
        return <SettingsBrightness />;
      default:
        return <SettingsBrightness />;
    }
  };

  const getTooltip = () => {
    switch (themeMode) {
      case 'light':
        return 'Switch to dark mode';
      case 'dark':
        return 'Switch to system preference';
      case 'system':
        return 'Switch to light mode';
      default:
        return 'Toggle theme';
    }
  };

  return (
    <Tooltip title={getTooltip()}>
      <IconButton onClick={cycleTheme} color='inherit' aria-label='toggle theme'>
        {getIcon()}
      </IconButton>
    </Tooltip>
  );
};
