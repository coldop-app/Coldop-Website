import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import {
  hydrateThemeStorageFromCookie,
  readThemeCookie,
  writeThemeCookie,
} from '@/lib/theme-persistence';

function ThemeCookieSync({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const [canPersist, setCanPersist] = useState(false);

  // Seed from shared cookie after mount (wins over stale per-origin localStorage).
  // Defer cookie writes until the next task so we don't clobber the cookie with
  // defaultTheme before setTheme(cookie) has applied.
  useEffect(() => {
    const cookieTheme = hydrateThemeStorageFromCookie() ?? readThemeCookie();
    if (cookieTheme) {
      setTheme(cookieTheme);
    }
    const id = window.setTimeout(() => setCanPersist(true), 0);
    return () => window.clearTimeout(id);
  }, [setTheme]);

  useEffect(() => {
    if (!canPersist || !theme) return;
    writeThemeCookie(theme);
  }, [theme, canPersist]);

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
