import { memo } from 'react';
import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';

interface FooterNavLink {
  text: string;
  href: string;
}

interface FooterNavColumn {
  title: string;
  links: FooterNavLink[];
}

interface FooterSocialLink {
  icon: ReactNode;
  href: string;
  label: string;
}

interface FooterContact {
  address: string;
  phones: string[];
  email: string;
}

interface FooterProps {
  companyName: string;
  year: string;
  logoSrc: string;
  logoAlt: string;
  description: string;
  contact: FooterContact;
  navColumns: FooterNavColumn[];
  socialLinks: FooterSocialLink[];
}

const Footer = ({
  companyName,
  year,
  logoSrc,
  logoAlt,
  description,
  contact,
  navColumns,
  socialLinks,
}: FooterProps) => {
  return (
    <footer className="border-border bg-background border-t">
      {/* Main footer */}
      <div className="mx-auto max-w-[75rem] px-8 py-16 sm:px-8 lg:px-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
          {/* Company info */}
          <div className="space-y-6 lg:col-span-2">
            <Link
              to="/"
              className="focus-visible:ring-primary inline-block rounded transition-transform duration-200 ease-in-out hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            >
              <img src={logoSrc} alt={logoAlt} className="h-10 w-auto" />
            </Link>

            <p className="font-custom text-muted-foreground max-w-md text-sm leading-relaxed">
              {description}
            </p>

            {/* Social links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="group text-muted-foreground hover:text-primary focus-visible:ring-primary rounded p-2 transition-all duration-200 ease-in-out hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-custom text-foreground text-sm font-semibold tracking-wider uppercase">
              Contact us
            </h3>

            <div className="space-y-3 text-sm">
              <p className="font-custom text-muted-foreground leading-relaxed">
                {contact.address}
              </p>

              <div className="space-y-2">
                {contact.phones.map((phone) => (
                  <p key={phone}>
                    <a
                      href={`tel:${phone}`}
                      className="text-muted-foreground hover:text-primary group focus-visible:ring-primary relative rounded px-1 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    >
                      {phone}
                      <span className="bg-primary absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-200 ease-in-out group-hover:w-full group-focus-visible:w-full" />
                    </a>
                  </p>
                ))}

                <p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-muted-foreground hover:text-primary group focus-visible:ring-primary relative rounded px-1 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                  >
                    {contact.email}
                    <span className="bg-primary absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-200 ease-in-out group-hover:w-full group-focus-visible:w-full" />
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          {navColumns.map((column) => (
            <div key={column.title} className="space-y-4">
              <h3 className="font-custom text-foreground text-sm font-semibold tracking-wider uppercase">
                {column.title}
              </h3>

              <ul className="space-y-3">
                {column.links.map((link) => {
                  const isHashLink = link.href.startsWith('#');
                  const [path, hash] = isHashLink
                    ? ['/', link.href.substring(1)]
                    : [link.href, undefined];

                  return (
                    <li key={link.href}>
                      <Link
                        to={path as '/'}
                        hash={hash}
                        className="font-custom text-muted-foreground hover:text-primary group focus-visible:ring-primary relative rounded px-1 text-sm transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      >
                        {link.text}
                        <span className="bg-primary absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-200 ease-in-out group-hover:w-full group-focus-visible:w-full" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-border bg-card border-t">
        <div className="mx-auto max-w-[75rem] px-8 py-6 sm:px-8 lg:px-16">
          <div className="flex flex-col items-center justify-between space-y-3 sm:flex-row sm:space-y-0">
            <p className="font-custom text-muted-foreground text-sm">
              © {year} {companyName}. All rights reserved.
            </p>

            <div className="flex space-x-6 text-sm">
              <Link
                to={'/privacy' as '/'}
                className="font-custom text-muted-foreground hover:text-primary group focus-visible:ring-primary relative rounded px-1 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                Privacy Policy
                <span className="bg-primary absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-200 ease-in-out group-hover:w-full group-focus-visible:w-full" />
              </Link>
              <Link
                to={'/support' as '/'}
                className="font-custom text-muted-foreground hover:text-primary group focus-visible:ring-primary relative rounded px-1 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                Terms of Service
                <span className="bg-primary absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-200 ease-in-out group-hover:w-full group-focus-visible:w-full" />
              </Link>
              <Link
                to={'/cookies' as '/'}
                className="font-custom text-muted-foreground hover:text-primary group focus-visible:ring-primary relative rounded px-1 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              >
                Cookie Policy
                <span className="bg-primary absolute -bottom-1 left-0 h-0.5 w-0 transition-all duration-200 ease-in-out group-hover:w-full group-focus-visible:w-full" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);
