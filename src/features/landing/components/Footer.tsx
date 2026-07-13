import { ExternalLink, Mail, Phone } from 'lucide-react';
import { NAV_LINKS } from '../data';
import { scrollToSection } from '../utils';
import { BrandMark } from './BrandMark';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          <div className="space-y-4">
            <BrandMark />
            <p className="text-muted-foreground max-w-60 text-xs leading-relaxed">
              Made in India for cold storage operators. From gate pass to chamber stock — one system
              that keeps the floor running without paper.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase">Navigation</p>
            <ul className="space-y-2 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase">Media &amp; Links</p>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://www.youtube.com/watch?v=aCQ3rb-K_m0"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                >
                  ColdOp Story Video <ExternalLink className="size-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/reel/DRrlfr1CfB5/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                >
                  Instagram Reel <ExternalLink className="size-3" />
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold tracking-wider uppercase">Contact &amp; Support</p>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="size-3.5" /> support@coldop.in
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-3.5" /> +91 9877069258
              </li>
            </ul>
            <span className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-semibold">
              <span className="bg-primary size-1.5 animate-pulse rounded-full" /> System: Active
              &amp; Online
            </span>
          </div>
        </div>

        <div className="text-muted-foreground mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-8 text-xs">
          <p>© {new Date().getFullYear()} ColdOp.in — All rights reserved. Estd. 2023.</p>
          <p className="text-muted-foreground">
            Privacy Policy and Terms of Service pages coming soon.
          </p>
        </div>
      </div>
    </footer>
  );
}
