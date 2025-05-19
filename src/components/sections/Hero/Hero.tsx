import { Link } from "react-router-dom";

interface CustomerImage {
  src: string;
  alt: string;
}

interface CTAButton {
  text: string;
  link: string;
}

interface HeroProps {
  heading: string;
  description: string;
  ctaButtons: CTAButton[];
  customerImages: CustomerImage[];
  customerStats: {
    count: string;
    text: string;
  };
  heroImage: {
    webp: string;
    png: string;
    alt: string;
  };
}

const Hero = ({
  heading,
  description,
  ctaButtons,
  customerImages,
  customerStats,
  heroImage
}: HeroProps) => {
  return (
    <>
      <section className="bg-secondary px-8 pb-16  pt-6 sm:py-24">
        <div className="mx-auto grid max-w-[75rem] grid-cols-1 items-center py-8 sm:gap-12 md:gap-16 md:py-2 lg:grid-cols-2 lg:gap-24 xl:max-w-[81.25rem] ">
          <div className="text-center lg:text-left">
          <h1 className="mb-[2rem] pt-2 md:pt-0 font-custom text-[2.1rem] font-bold leading-[1.05] tracking-[-0.5px] text-[#333] xl:text-[3rem] ">
              {heading}
            </h1>
            <p className="font-custom mb-12 text-base md:text-xl font-normal leading-[1.6]   ">
              {description}
            </p>

            <div className="align-center flex justify-center gap-4 md:gap-2 lg:justify-start whitespace-nowrap ">
              {ctaButtons.map((button, index) => (
                <Link
                  key={index}
                  to={button.link}
                  className={`font-custom inline-block cursor-pointer rounded-lg bg-primary px-4 py-2 text-lg font-bold text-secondary hover:bg-primary/85 sm:text-xl sm:px-8 sm:py-4 ${index > 0 ? 'sm:ml-2.5' : 'sm:mr-4'}`}
                >
                  {button.text}
                </Link>
              ))}
            </div>

            <div className=" mt-10 flex items-center justify-center   lg:mt-20  ">
              <div className="flex ">
                {customerImages.map((image, index) => (
                  <img
                    key={index}
                    className={`h-10 w-10 rounded-full border-[3px] border-solid border-[#fdf2e9] sm:h-12 sm:w-12 ${index < customerImages.length - 1 ? 'mr-[-14px]' : ''}`}
                    src={image.src}
                    alt={image.alt}
                  />
                ))}
              </div>
              <p className=" delivered-text ml-20 text-base font-semibold leading-[1.05] tracking-[-0.5px] sm:ml-4 sm:text-xl sm:leading-normal sm:tracking-normal md:ml-10 lg:ml-20 xl:ml-4">
                <span className="font-bold text-primary">{customerStats.count}</span> {customerStats.text}
              </p>
            </div>
          </div>

          <div>
            <picture className="align-center  mt-8 flex justify-center lg:mt-0 ">
              <source src={heroImage.webp} type="image/webp" />
              <source src={heroImage.png} type="image/png" />

              <img
                src={heroImage.png}
                className="w-[64%]  lg:w-[100%]"
                alt={heroImage.alt}
              />
            </picture>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero;
