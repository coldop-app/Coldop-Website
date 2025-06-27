import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface CustomerImage {
  src: string;
  alt: string;
}

interface HeroProps {
  customerImages: CustomerImage[];
  heroImage: {
    webp: string;
    png: string;
    alt: string;
  };
}

const Hero = ({
  customerImages,
  heroImage
}: HeroProps) => {
  const { t } = useTranslation();
  return (
    <section className="bg-secondary px-4 sm:px-8 pb-12 pt-4 sm:py-24 w-full">
      <div className="mx-auto grid max-w-[75rem] grid-cols-1 items-center py-4 sm:gap-12 md:gap-16 md:py-2 lg:grid-cols-2 lg:gap-24 xl:max-w-[81.25rem]">
        <div className="text-center lg:text-left">
          <h1 className="mb-6 sm:mb-[2rem] pt-2 md:pt-0 font-custom text-xl sm:text-2xl md:text-[2.1rem] font-bold leading-[1.2] sm:leading-[1.05] tracking-[-0.5px] text-[#333] xl:text-[3rem]">
            {t('hero.heading')}
          </h1>
          <p className="font-custom mb-8 sm:mb-12 text-sm sm:text-base md:text-xl font-normal leading-[1.6]">
            {t('hero.description')}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 md:gap-2 lg:justify-start">
            <Link
              to="#"
              className="font-custom inline-block cursor-pointer rounded-lg bg-primary px-4 py-2 text-base sm:text-lg font-bold text-secondary hover:bg-primary/85 sm:text-xl sm:px-8 sm:py-4 sm:mr-4 mb-3 sm:mb-0"
            >
              {t('hero.startManaging')}
            </Link>
            <Link
              to="#"
              className="font-custom inline-block cursor-pointer rounded-lg bg-primary px-4 py-2 text-base sm:text-lg font-bold text-secondary hover:bg-primary/85 sm:text-xl sm:px-8 sm:py-4 sm:ml-2.5"
            >
              {t('hero.howItWorks')}
            </Link>
          </div>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center lg:mt-20">
            <div className="flex mb-4 sm:mb-0">
              {customerImages.map((image, index) => (
                <img
                  key={index}
                  className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full border-[3px] border-solid border-[#fdf2e9] sm:h-12 sm:w-12 ${index < customerImages.length - 1 ? 'mr-[-14px]' : ''}`}
                  src={image.src}
                  alt={image.alt}
                />
              ))}
            </div>
            <p className="delivered-text text-sm sm:text-base font-semibold leading-[1.2] sm:leading-[1.05] tracking-[-0.5px] sm:ml-4 sm:text-xl sm:leading-normal sm:tracking-normal md:ml-10 lg:ml-20 xl:ml-4">
              <span className="font-bold text-primary">{t('hero.customerStats.count')}</span> {t('hero.customerStats.text')}
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mt-12">
          <picture className="flex justify-center items-center lg:mt-0">
            <source srcSet={heroImage.webp} type="image/webp" />
            <source srcSet={heroImage.png} type="image/png" />

            <img
              src={heroImage.png}
              className="w-[80%] sm:w-[64%] lg:w-[100%]"
              alt={heroImage.alt}
            />
          </picture>
        </div>
      </div>
    </section>
  );
};

export default Hero;
