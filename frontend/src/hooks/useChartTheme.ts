import { useMemo } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { chartPalette } from '../constants/chartColors';

export function useChartTheme() {
  const mode = useThemeStore((state) => state.mode);

  return useMemo(
    () => ({
      mode,
      palette: chartPalette,
      textColor: mode === 'dark' ? '#d7dee8' : '#2f3b4d',
      mutedTextColor: mode === 'dark' ? '#93a4b8' : '#6b778a',
      gridColor: mode === 'dark' ? 'rgba(148, 163, 184, 0.22)' : 'rgba(71, 85, 105, 0.16)',
      panelColor: mode === 'dark' ? '#142033' : '#ffffff',
      tooltipBg: mode === 'dark' ? '#0e1726' : '#ffffff',
      tooltipBorder: mode === 'dark' ? '#29384f' : '#d5dce8',
    }),
    [mode],
  );
}
