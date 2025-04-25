import { Link } from "react-router-dom";
const Hero = () => {
  return (
    <>
      <section className="bg-secondary px-8 pb-16  pt-6 sm:py-24">
        <div className="mx-auto grid max-w-[75rem] grid-cols-1 items-center py-8 sm:gap-12 md:gap-16 md:py-2 lg:grid-cols-2 lg:gap-24 xl:max-w-[81.25rem] ">
          <div className="text-center lg:text-left">
          <h1 className="mb-[2rem] font-custom text-[2.1rem] font-bold leading-[1.05] tracking-[-0.5px] text-[#333] xl:text-[3rem] ">
              Farmers' yields, cold-stored for freshness and swift distribution.
            </h1>
            <p className="font-custom mb-12 text-base md:text-xl font-normal leading-[1.6]   ">
              Elevate farmers' well-being with a personalized cold storage
              subscription, offering flexibility to access crops at their
              convenience for a continuous supply of healthful harvests, 365
              days a year.
            </p>

            <div className="align-center flex justify-center gap-4 md:gap-2 lg:justify-start whitespace-nowrap ">
              <Link
                to="#"
                className=" font-custom inline-block cursor-pointer rounded-lg  bg-primary px-4 py-2 text-lg font-bold text-secondary hover:bg-primary/85 sm:text-xl sm:mr-4 sm:px-8 sm:py-4"
              >
                Start storing
              </Link>

              <Link
                to="#"
                className="font-custom inline-block rounded-lg bg-primary px-4 py-2 text-lg font-bold text-secondary hover:bg-primary/85 sm:ml-2.5 sm:text-xl sm:mr-4 sm:px-8 sm:py-4 "
              >
                Learn more &darr;
              </Link>
            </div> 

            <div className=" mt-10 flex items-center justify-center   lg:mt-20  ">
              <div className="flex ">
                <img
                  className="mr-[-14px] h-10 w-10 rounded-full border-[3px] border-solid border-[#fdf2e9] sm:h-12 sm:w-12 "
                  src="./customers/customer-1.jpg"
                  alt="Customer photo"
                />
                <img
                  className="mr-[-14px]  h-10 w-10 rounded-full border-[3px]  border-solid border-[#fdf2e9] sm:h-12 sm:w-12 "
                  src="./customers/customer-2.jpg"
                  alt="Customer photo"
                />
                <img
                  className="mr-[-14px]  h-10 w-10 rounded-full border-[3px]  border-solid border-[#fdf2e9] sm:h-12 sm:w-12 "
                  src="./customers/customer-3.jpg"
                  alt="Customer photo"
                />
                <img
                  className="mr-[-14px]  h-10 w-10 rounded-full border-[3px]  border-solid border-[#fdf2e9] sm:h-12 sm:w-12 "
                  src="./customers/customer-4.jpg"
                  alt="Customer photo"
                />
                <img
                  className="mr-[-14px]  h-10 w-10 rounded-full border-[3px]  border-solid border-[#fdf2e9] sm:h-12 sm:w-12 "
                  src="./customers/customer-5.jpg"
                  alt="Customer photo"
                />
                <img
                  className=" h-10 w-10 rounded-full border-[3px]  border-solid border-[#fdf2e9] sm:h-12 sm:w-12 "
                  src="./customers/customer-6.jpg"
                  alt="Customer photo"
                />
              </div>
              <p className=" delivered-text ml-20 text-base font-semibold leading-[1.05] tracking-[-0.5px] sm:ml-4 sm:text-xl sm:leading-normal sm:tracking-normal md:ml-10 lg:ml-20 xl:ml-4">
                <span className="font-bold text-primary">250,000+</span> farmers
                joined last year!
              </p>
            </div>
          </div>

          <div>
            <picture className="align-center  mt-8 flex justify-center lg:mt-0 ">
              <source src="./hero.webp" type="image/webp" />
              <source src="./hero-min.png" type="image/png" />

              <img
                src="./hero-min.png"
                className="w-[64%]  lg:w-[100%]"
                alt="Woman enjoying food, meals in storage container, and food bowls on a table"
              />
            </picture>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
