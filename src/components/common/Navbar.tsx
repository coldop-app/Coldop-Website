import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

const Navbar = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isFullySticky, setIsFullySticky] = useState(false);

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
        <Link to="/">
          <h1 className="text-2xl">Logo</h1>
        </Link>
        <nav>
          <Sheet>
            <SheetTrigger>
              <p className="text-2xl">E</p>
            </SheetTrigger>
            <SheetContent side={side}>
              <SheetHeader className="mt-20">
                <SheetDescription className="font-custom m-4 inline-block cursor-pointer text-xl font-medium no-underline duration-100 active:underline">
                  <nav>
                    <ul className="flex list-none flex-col items-center gap-8">
                      <li>
                        <Link
                          to="/how-it-works"
                          className="font-custom inline-block cursor-pointer font-medium no-underline duration-100 active:underline"
                        >
                          How it works
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/testimonials"
                          className="font-custom inline-block cursor-pointer font-medium no-underline duration-100 active:underline"
                        >
                          Testimonials
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/pricing"
                          className="font-custom inline-block cursor-pointer font-medium no-underline duration-100 active:underline"
                        >
                          Pricing
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/about"
                          className="font-custom inline-block cursor-pointer font-medium no-underline duration-100 active:underline"
                        >
                          About
                        </Link>
                      </li>
                      <li>
                        <SheetClose asChild>
                          <Link
                            to="/login"
                            className="font-custom inline-block cursor-pointer rounded-lg bg-primary px-8 py-3 text-xl font-bold text-secondary no-underline duration-100 hover:bg-primary/90 hover:text-secondary"
                          >
                            Sign in
                          </Link>
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
        className={`${navbarClass} hidden h-20 items-center justify-between px-12 lg:flex`}
        style={navbarStyle}
      >
        <Link to="/">
          <h1 className="text-2xl">Logo</h1>
        </Link>
        <nav>
          <ul className="flex list-none items-center gap-12">
            <li>
              <Link
                to="/how-it-works"
                className="font-custom inline-block cursor-pointer text-xl font-medium no-underline duration-100 hover:text-primary active:underline"
              >
                How it works
              </Link>
            </li>
            <li>
              <Link
                to="/testimonials"
                className="font-custom inline-block cursor-pointer text-xl font-medium no-underline duration-100 hover:text-primary active:underline"
              >
                Testimonials
              </Link>
            </li>
            <li>
              <Link
                to="/pricing"
                className="font-custom inline-block cursor-pointer text-xl font-medium no-underline duration-100 hover:text-primary active:underline"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="font-custom inline-block cursor-pointer text-xl font-medium no-underline duration-100 hover:text-primary active:underline"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="font-custom inline-block cursor-pointer rounded-lg bg-primary px-8 py-3 text-xl font-bold text-secondary no-underline duration-100 hover:bg-primary/90 hover:text-secondary"
              >
                Sign in
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      
      {/* Spacer to prevent content from jumping when navbar becomes fixed */}
      <div className="h-20" />
    </>
  );
};

export default Navbar;