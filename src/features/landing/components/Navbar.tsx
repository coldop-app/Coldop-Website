import { Link } from '@tanstack/react-router';
import { useTheme } from 'next-themes';
import { ArrowRight, ArrowUpRight, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth/store/use-auth-store';
import { DEFAULT_DAYBOOK_SEARCH } from '@/features/daybook/search';
import { NAV_LINKS } from '../data';
import { scrollToSection } from '../utils';
import { BrandMark } from './BrandMark';

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();
  const accessToken = useAuthStore((s) => s.accessToken);
  const isLoggedIn = !!accessToken;

  return (
    <header
      data-anim="nav"
      className="bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandMark />

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle theme"
            className="relative"
            onClick={() => setTheme?.(resolvedTheme === 'dark' ? 'light' : 'dark')}
          >
            <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </Button>

          {isLoggedIn ? (
            <Button asChild>
              <Link to="/daybook" search={DEFAULT_DAYBOOK_SEARCH}>
                Dashboard <ArrowUpRight data-icon="inline-end" />
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link to="/login">
                Sign In <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
