import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { useEffect, useRef } from 'react';
import {
  hydrateThemeStorageFromCookie,
  readThemeCookie,
  writeThemeCookie,
} from '@/lib/theme-persistence';

function ThemeCookieSync({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const didSeed = useRef(false);

  // Seed exactly once. next-themes recreates setTheme when theme changes; without
  // the ref, re-applying a stale cookie fights the user toggle and flickers forever.
  useEffect(() => {
    if (didSeed.current) return;
    didSeed.current = true;
    const cookieTheme = hydrateThemeStorageFromCookie() ?? readThemeCookie();
    if (cookieTheme) {
      setTheme(cookieTheme);
    }
  }, [setTheme]);

  useEffect(() => {
    if (!didSeed.current || !theme) return;
    writeThemeCookie(theme);
  }, [theme]);

  return children;
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemeCookieSync>{children}</ThemeCookieSync>
    </NextThemesProvider>
  );
}
