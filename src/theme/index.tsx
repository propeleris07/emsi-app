import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { palettes, radius, spacing, typography, type Theme } from '@/config/theme';
import { useSettings } from '@/store';

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const mode = useSettings((s) => s.themeMode);
  const isDark = mode === 'system' ? system === 'dark' : mode === 'dark';
  const theme = useMemo<Theme>(
    () => ({ colors: isDark ? palettes.dark : palettes.light, isDark, spacing, radius, typography }),
    [isDark],
  );
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const t = useContext(ThemeContext);
  if (!t) throw new Error('useTheme must be used inside ThemeProvider');
  return t;
}
