import React from 'react';
import { Instagram, Linkedin, Twitter } from 'lucide-react';

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
  navColumns: FooterNavColumn[];
}

const Footer: React.FC<FooterProps> = ({
  companyName,
  year,
  logo,
  address,
  phone,
  email,
  navColumns
}) => {
  // Create social icons map
  const socialIcons = [
    {
      icon: <Instagram className="h-5 w-5 transition-colors" />,
      href: "https://instagram.com/coldop",
      label: "Instagram"
    },
    {
      icon: <Linkedin className="h-5 w-5 transition-colors" />,
      href: "https://linkedin.com/company/coldop",
      label: "LinkedIn"
    },
    {
      icon: <Twitter className="h-5 w-5 transition-colors" />,
      href: "https://twitter.com/coldop",
      label: "Twitter"
    }
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">

          {/* Company Info - Mobile: Full width, Desktop: 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <a href="/" className="inline-block">
                <img
                  className="h-10 w-auto"
                  alt={`${companyName} logo`}
                  src={logo}
                />
              </a>

              <p className="text-gray-600 text-sm max-w-md leading-relaxed">
                The complete cold storage management platform. Mobile app, web dashboard, WhatsApp updates, and instant receipt printing — all in one system.
              </p>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialIcons.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-sm"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Contact us
            </h3>
            <div className="space-y-3 text-sm">
              <p className="text-gray-600 leading-relaxed">
                {address}
              </p>
              <div className="space-y-2">
                <p>
                  <a
                    href={`tel:${phone.split(' / ')[0]}`}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {phone.split(' / ')[0]}
                  </a>
                </p>
                <p>
                  <a
                    href={`tel:${phone.split(' / ')[1]}`}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {phone.split(' / ')[1]}
                  </a>
                </p>
                <p>
                  <a
                    href={`mailto:${email}`}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    {email}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          {navColumns.map((column, index) => (
            <div key={index} className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                {column.title}
              </h3>
              <ul className="space-y-3">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <p className="text-sm text-gray-500">
              Copyright © {year} {companyName}, Inc. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="/privacy" className="text-gray-500 hover:text-blue-600 transition-colors">
                Privacy Policy
              </a>
              <a href="/support" className="text-gray-500 hover:text-blue-600 transition-colors">
                Terms of Service
              </a>
              <a href="/cookies" className="text-gray-500 hover:text-blue-600 transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;