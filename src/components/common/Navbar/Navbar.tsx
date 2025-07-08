import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import SignInModal from "@/components/auth/SignInModal";
import LanguageSelector from "@/components/common/LanguageSelector/LanguageSelector";
import { Link } from "react-router-dom";
import { Menu } from "lucide-react";

const Navbar = () => {
  const { t } = useTranslation();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isFullySticky, setIsFullySticky] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      const threshold = 50; // When to start transition
      const maxThreshold = 100; // When transition completes

      // Calculate scroll progress as a value between 0 and 1
      if (offset <= threshold) {
        setScrollProgress(0);
        setIsFullySticky(false);
      } else if (offset >= maxThreshold) {
        setScrollProgress(1);
        setIsFullySticky(true);
      } else {
        // Linear interpolation between thresholds
        const progress = (offset - threshold) / (maxThreshold - threshold);
        setScrollProgress(progress);
        setIsFullySticky(offset > maxThreshold * 0.8);
      }
    };

    // Use passive: true for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial check
    handleScroll();

    // Remove the event listener when the component is unmounted
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const openSignInModal = () => {
    setIsSignInModalOpen(true);
  };

  const closeSignInModal = () => {
    setIsSignInModalOpen(false);
  };

  const side = 'right';

  // Calculate styles based on scroll progress
  const navbarStyle = {
    backgroundColor: scrollProgress === 0 ? 'rgb(243, 244, 246)' : `rgba(255, 255, 255, ${scrollProgress})`,
    boxShadow: `0 2px 10px rgba(0, 0, 0, ${scrollProgress * 0.1})`,
    transform: isFullySticky ? 'translateY(0)' : `translateY(${-scrollProgress * 5}px)`,
  };

  const navbarClass = `
    fixed top-0 left-0 right-0 z-50
    transition-all duration-300 ease-out
    ${scrollProgress === 0 ? 'bg-gray-100' : ''}
  `;

  return (
    <>
      {/* Mobile/Tablet Navbar */}
      <header
        className={`${navbarClass} flex h-16 items-center justify-between px-6 lg:hidden`}
        style={navbarStyle}
      >
        <Link to="/" className="cursor-pointer flex items-center">
          <img src="/coldop-logo.png" alt="Coldop Logo" className="w-10" />
        </Link>
        <nav className="flex items-center">
          <Sheet>
            <SheetTrigger className="flex items-center">
              <Menu size={24} />
            </SheetTrigger>
            <SheetContent side={side}>
              <SheetHeader className="mt-20">
                <SheetDescription className="font-custom m-4 inline-block cursor-pointer text-xl font-medium no-underline duration-100 active:underline">
                  <nav>
                    <ul className="flex list-none flex-col items-center gap-8">
                      <li className="flex items-center">
                        <Link to="/" className="font-custom inline-flex items-center cursor-pointer font-medium no-underline duration-100 active:underline">
                          {t('nav.home')}
                        </Link>
                      </li>
                      <li className="flex items-center">
                        <Link to="/faq" className="font-custom inline-flex items-center cursor-pointer font-medium no-underline duration-100 active:underline">
                          {t('nav.faq')}
                        </Link>
                      </li>
                      <li className="flex items-center">
                        <Link to="/case-studies" className="font-custom inline-flex items-center cursor-pointer font-medium no-underline duration-100 active:underline">
                          {t('nav.caseStudies')}
                        </Link>
                      </li>
                      <li className="flex items-center">
                        <Link to="/support" className="font-custom inline-flex items-center cursor-pointer font-medium no-underline duration-100 active:underline">
                          {t('nav.support')}
                        </Link>
                      </li>
                      <li className="flex items-center">
                        <LanguageSelector isMobile={true} />
                      </li>
                      <li className="flex items-center">
                        <SheetClose asChild>
                          <button
                            onClick={openSignInModal}
                            className="font-custom inline-flex items-center cursor-pointer rounded-lg bg-primary px-8 py-3 text-xl font-bold text-secondary no-underline duration-100 hover:bg-primary/90 hover:text-secondary"
                          >
                            {t('nav.signIn')}
                          </button>
                        </SheetClose>
                      </li>
                    </ul>
                  </nav>
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </nav>
      </header>

      {/* Desktop Navbar */}
      <header
        className={`${navbarClass} hidden h-20 items-center justify-between px-16 lg:flex`}
        style={navbarStyle}
      >
        <Link to="/" className="cursor-pointer flex items-center">
          <img src="/coldop-logo.png" alt="Coldop Logo" className="w-16" />
        </Link>
        <nav className="flex items-center">
          <ul className="flex list-none items-center gap-12">
            <li className="flex items-center">
              <Link to="/" className="font-custom inline-flex items-center cursor-pointer text-xl font-medium no-underline duration-100 hover:text-primary active:underline">
                {t('nav.home')}
              </Link>
            </li>
            <li className="flex items-center">
              <Link to="/faq" className="font-custom inline-flex items-center cursor-pointer text-xl font-medium no-underline duration-100 hover:text-primary active:underline">
                {t('nav.faq')}
              </Link>
            </li>
            <li className="flex items-center">
              <Link to="/case-studies" className="font-custom inline-flex items-center cursor-pointer text-xl font-medium no-underline duration-100 hover:text-primary active:underline">
                {t('nav.caseStudies')}
              </Link>
            </li>
            <li className="flex items-center">
              <Link to="/support" className="font-custom inline-flex items-center cursor-pointer text-xl font-medium no-underline duration-100 hover:text-primary active:underline">
                {t('nav.support')}
              </Link>
            </li>
            <li className="flex items-center">
              <LanguageSelector isMobile={false} />
            </li>
            <li className="flex items-center">
              <button
                onClick={openSignInModal}
                className="font-custom inline-flex items-center cursor-pointer rounded-lg bg-primary px-8 py-3 text-xl font-bold text-secondary no-underline duration-100 hover:bg-primary/90 hover:text-secondary"
              >
                {t('nav.signIn')}
              </button>
            </li>
          </ul>
        </nav>
      </header>

      {/* Spacer to prevent content from jumping when navbar becomes fixed */}
      <div className="h-16 lg:h-20" />

      {/* Sign In Modal */}
      <SignInModal isOpen={isSignInModalOpen} onClose={closeSignInModal} />
    </>
  );
};

export default Navbar;