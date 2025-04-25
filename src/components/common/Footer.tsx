const Footer = () => {
  return (
    <>
      <footer
        id="footer"
        className="border-t border-solid border-gray-300 py-[8rem] sm:hidden"
      >
        <div
          className="mx-auto grid max-w-[75rem] gap-x-8 gap-y-24   px-8   "
          style={{
            gridTemplateColumns: "  1fr 1fr 1fr",
            gridTemplateRows: "1fr 1fr ",
          }}
        >
          <nav>
            <p className=" mb-8 text-base font-medium">Account</p>
            <ul className=" flex list-none flex-col gap-6">
              <li>
                <a
                  className=" text-sm text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]
"
                  href="#"
                >
                  Create account
                </a>
              </li>
              <li>
                <a
                  className=" text-sm text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]
"
                  href="#"
                >
                  Sign In
                </a>
              </li>
              <li>
                <a
                  className=" text-sm text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]
"
                  href="#"
                >
                  iOS app
                </a>
              </li>
              <li>
                <a
                  className=" text-sm text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]
"
                  href="#"
                >
                  Android app
                </a>
              </li>
            </ul>
          </nav>

          <nav>
            <p className=" mb-8 text-base font-medium">Company</p>
            <ul className=" flex list-none flex-col gap-6">
              <li>
                <a
                  className=" text-sm text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]
"
                  href="#"
                >
                  About Cold Storage
                </a>
              </li>
              <li>
                <a
                  className=" text-sm text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]
"
                  href="#"
                >
                  For Business
                </a>
              </li>
              <li>
                <a
                  className=" text-sm text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]
"
                  href="#"
                >
                  Our partners
                </a>
              </li>
              <li>
                <a
                  className=" text-sm text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]
"
                  href="#"
                >
                  Careers
                </a>
              </li>
            </ul>
          </nav>

          <nav>
            <p className=" mb-8 text-base font-medium"> Resources</p>
            <ul className=" flex list-none flex-col gap-6">
              <li>
                <a
                  className=" text-sm text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]
"
                  href="#"
                >
                  Recipe directory
                </a>
              </li>
              <li>
                <a
                  className=" text-sm text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]
"
                  href="#"
                >
                  Help center
                </a>
              </li>
              <li>
                <a
                  className=" text-sm text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]
"
                  href="#"
                >
                  Privacy & terms
                </a>
              </li>
            </ul>
          </nav>

          <div className=" flex flex-col ">
            <div>
              <a href="#" className="footer-logo">
                <img
                  className="mt-[4.5px]"
                  alt="Coldstorage logo"
                  src="omnifood-logo.png"
                />
              </a>

              <ul className="social-links mt-4 flex list-none gap-6">
                <li>
                  <a
                    className="footer-link text-sm text-foreground no-underline transition-all hover:text-[primary] active:text-[primary] "
                    href="#"
                    // ><ion-icon className="social-icon" name="logo-instagram"></ion-icon
                  >
                    I1
                  </a>
                </li>
                <li>
                  <a
                    className="footer-link text-sm text-foreground no-underline transition-all hover:text-[primary] active:text-[primary] "
                    href="#"
                    // ><ion-icon className="social-icon" name="logo-instagram"></ion-icon
                  >
                    I1
                  </a>
                </li>
                <li>
                  <a
                    className="footer-link text-sm text-foreground no-underline transition-all hover:text-[primary] active:text-[primary] "
                    href="#"
                    // ><ion-icon className="social-icon" name="logo-instagram"></ion-icon
                  >
                    I1
                  </a>
                </li>
              </ul>
            </div>

            <p className="copyright mt-14 text-xs leading-[1.6] text-[#767676]">
              Copyright &copy; <span className="year">2027</span> by
              Coldstorage, Inc. All rights reserved.
            </p>
          </div>

          <div>
            <p className="mx-auto mb-10 text-base font-medium">Contact us</p>
            <address className="font-serif text-sm leading-[1.6] ">
              <p className=" mb-6">
                623 Harrison St., 2nd Floor, San Francisco, CA 94107
              </p>
              <p>
                <a
                  className="footer-link text-sm text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]"
                  href="tel:415-201-6370"
                >
                  415-201-6370
                </a>
                <br />
                <a
                  className="footer-link text-sm text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]"
                  href="mailto:hello@omnifood.com"
                >
                  hello@omnifood.com
                </a>
              </p>
            </address>
          </div>
        </div>
      </footer>

      <footer
        id="footer"
        className="hidden border-t  border-solid border-gray-300 py-[8rem] sm:block "
      >
        <div
          className="mx-auto grid max-w-[75rem]  gap-x-16 gap-y-24  px-8  md:grid-cols-5 "
          style={{
            gridTemplateColumns:
              "grid-template-columns: 1.5fr 1.5fr 1fr 1fr 1fr",
          }}
        >
          <div className="flex flex-col">
            <a href="#">
              <img
                className="logo mt-[6px] h-4 w-32"
                alt="Coldstorage logo"
                src="omnifood-logo.png"
              />
            </a>

            <ul className="social-links mt-6 flex list-none gap-6">
              <li>
                <a
                  className="footer-link text-base text-foreground no-underline transition-all hover:text-[primary] active:text-[primary] "
                  href="#"
                  // ><ion-icon className="social-icon" name="logo-instagram"></ion-icon
                >
                  I1
                </a>
              </li>
              <li>
                <a
                  className="footer-link text-base text-foreground no-underline transition-all hover:text-[primary] active:text-[primary] "
                  href="#"
                  // ><ion-icon className="social-icon" name="logo-instagram"></ion-icon
                >
                  I1
                </a>
              </li>
              <li>
                <a
                  className="footer-link text-base text-foreground no-underline transition-all hover:text-[primary] active:text-[primary] "
                  href="#"
                  // ><ion-icon className="social-icon" name="logo-instagram"></ion-icon
                >
                  I1
                </a>
              </li>
            </ul>
            <p className="copyright mt-20 text-sm leading-[1.6] text-[#767676]">
              Copyright &copy; <span className="year">2027</span> by
              Coldstorage, Inc. All rights reserved.
            </p>
          </div>

          <div>
            <p className="mb-10 text-lg font-medium">Contact us</p>
            <address className="contacts font-serif text-base leading-[1.6] ">
              <p className="address mb-6">
                623 Harrison St., 2nd Floor, San Francisco, CA 94107
              </p>
              <p>
                <a
                  className="footer-link text-base text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]"
                  href="tel:415-201-6370"
                >
                  415-201-6370
                </a>
                <br />
                <a
                  className="footer-link text-base text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]"
                  href="mailto:hello@omnifood.com"
                >
                  hello@omnifood.com
                </a>
              </p>
            </address>
          </div>

          <nav className="nav-col">
            <p className="footer-heading mb-10 text-lg font-medium">Account</p>
            <ul className="footer-nav flex list-none flex-col gap-6">
              <li>
                <a
                  className="footer-link text-base text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]
"
                  href="#"
                >
                  Create account
                </a>
              </li>
              <li>
                <a
                  className="footer-link text-base text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]
"
                  href="#"
                >
                  Sign in
                </a>
              </li>
              <li>
                <a
                  className="footer-link text-base text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]
"
                  href="#"
                >
                  iOS app
                </a>
              </li>
              <li>
                <a
                  className="footer-link text-base text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]
"
                  href="#"
                >
                  Android app
                </a>
              </li>
            </ul>
          </nav>

          <nav className="nav-col">
            <p className="footer-heading mb-10 text-lg font-medium">Company</p>
            <ul className="footer-nav flex list-none flex-col gap-6">
              <li>
                <a
                  className="footer-link text-base text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]
"
                  href="#"
                >
                  About Cold Storage
                </a>
              </li>
              <li>
                <a
                  className="footer-link text-base text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]
"
                  href="#"
                >
                  For Business
                </a>
              </li>
              <li>
                <a
                  className="footer-link text-base text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]
"
                  href="#"
                >
                  Our partners
                </a>
              </li>
              <li>
                <a
                  className="footer-link text-base text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]
"
                  href="#"
                >
                  Careers
                </a>
              </li>
            </ul>
          </nav>

          <nav className="nav-col">
            <p className="footer-heading mb-10 text-lg font-medium">Resources</p>
            <ul className="footer-nav flex list-none flex-col gap-6">
              <li>
                <a
                  className="footer-link text-base text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]
"
                  href="#"
                >
                Recipe directory{" "}
                </a>
              </li>
              <li>
                <a
                  className="footer-link text-base text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]
"
                  href="#"
                >
                    Help center
                </a>
              </li>
              <li>
                <a
                  className="footer-link text-base text-[#767676] no-underline transition-all hover:text-[#555] active:text-[#555]
"
                  href="#"
                >
                  Privacy & terms
                </a>
              </li>
             
            </ul>
          </nav>
        </div>
      </footer>
    </>
  );
};

export default Footer;
