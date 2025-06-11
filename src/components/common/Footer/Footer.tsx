import React from 'react';

interface SocialLink {
  icon: string;
  href: string;
}

interface FooterNavLink {
  text: string;
  href: string;
}

interface FooterNavColumn {
  title: string;
  links: FooterNavLink[];
}

interface FooterProps {
  companyName: string;
  year: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  socialLinks: SocialLink[];
  navColumns: FooterNavColumn[];
}

const Footer: React.FC<FooterProps> = ({
  companyName,
  year,
  logo,
  address,
  phone,
  email,
  socialLinks,
  navColumns
}) => {
  return (
    <>
      {/* Mobile Footer */}
      <footer
        id="footer"
        className="border-t border-solid border-gray-300 py-[8rem] sm:hidden"
      >
        <div
          className="mx-auto grid max-w-[75rem] gap-x-8 gap-y-24 px-8"
          style={{
            gridTemplateColumns: "1fr 1fr 1fr",
            gridTemplateRows: "1fr 1fr",
          }}
        >
          {navColumns.map((column, index) => (
            <nav key={`mobile-nav-${index}`}>
              <p className="mb-8 text-base font-medium">{column.title}</p>
              <ul className="flex list-none flex-col gap-6">
                {column.links.map((link, linkIndex) => (
                  <li key={`mobile-nav-${index}-link-${linkIndex}`}>
                    <a
                      className="text-sm text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]"
                      href={link.href}
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="flex flex-col">
            <div>
              <a href="#" className="footer-logo">
                <img
                  className="mt-[4.5px]"
                  alt={`${companyName} logo`}
                  src={logo}
                />
              </a>

              <ul className="social-links mt-4 flex list-none gap-6">
                {socialLinks.map((link, index) => (
                  <li key={`mobile-social-${index}`}>
                    <a
                      className="footer-link text-sm text-foreground no-underline transition-all hover:text-[primary] active:text-[primary]"
                      href={link.href}
                    >
                      {link.icon}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <p className="copyright mt-14 text-xs leading-[1.6] text-[#767676]">
              Copyright &copy; <span className="year">{year}</span> by{" "}
              {companyName}, Inc. All rights reserved.
            </p>
          </div>

          <div>
            <p className="mx-auto mb-10 text-base font-medium">Contact us</p>
            <address className="font-serif text-sm leading-[1.6]">
              <p className="mb-6">{address}</p>
              <p>
                <a
                  className="footer-link text-sm text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]"
                  href={`tel:${phone}`}
                >
                  {phone}
                </a>
                <br />
                <a
                  className="footer-link text-sm text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]"
                  href={`mailto:${email}`}
                >
                  {email}
                </a>
              </p>
            </address>
          </div>
        </div>
      </footer>

      {/* Desktop Footer */}
      <footer
        id="footer"
        className="hidden border-t border-solid border-gray-300 py-[8rem] sm:block"
      >
        <div
          className="mx-auto grid max-w-[75rem] gap-x-16 gap-y-24 px-8 md:grid-cols-5"
          style={{
            gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr",
          }}
        >
          <div className="flex flex-col">
            <a href="#">
              <img
                className="logo mt-[6px] h-4 w-32"
                alt={`${companyName} logo`}
                src={logo}
              />
            </a>

            <ul className="social-links mt-6 flex list-none gap-6">
              {socialLinks.map((link, index) => (
                <li key={`desktop-social-${index}`}>
                  <a
                    className="footer-link text-base text-foreground no-underline transition-all hover:text-[primary] active:text-[primary]"
                    href={link.href}
                  >
                    {link.icon}
                  </a>
                </li>
              ))}
            </ul>
            <p className="copyright mt-20 text-sm leading-[1.6] text-[#767676]">
              Copyright &copy; <span className="year">{year}</span> by{" "}
              {companyName}, Inc. All rights reserved.
            </p>
          </div>

          <div>
            <p className="mb-10 text-lg font-medium">Contact us</p>
            <address className="contacts font-serif text-base leading-[1.6]">
              <p className="address mb-6">{address}</p>
              <p>
                <a
                  className="footer-link text-base text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]"
                  href={`tel:${phone}`}
                >
                  {phone}
                </a>
                <br />
                <a
                  className="footer-link text-base text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]"
                  href={`mailto:${email}`}
                >
                  {email}
                </a>
              </p>
            </address>
          </div>

          {navColumns.map((column, index) => (
            <nav className="nav-col" key={`desktop-nav-${index}`}>
              <p className="footer-heading mb-10 text-lg font-medium">{column.title}</p>
              <ul className="footer-nav flex list-none flex-col gap-6">
                {column.links.map((link, linkIndex) => (
                  <li key={`desktop-nav-${index}-link-${linkIndex}`}>
                    <a
                      className="footer-link text-base text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]"
                      href={link.href}
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </footer>
    </>
  );
};

export default Footer;