import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SignInModal from "@/components/auth/SignInModal";
import { storeAdminApi } from "@/lib/api/storeAdmin";

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
  // customerImages,
  heroImage
}: HeroProps) => {
  const { t } = useTranslation();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Mutation to increment count
  const { mutate: incrementCount } = useMutation({
    mutationFn: () => storeAdminApi.incrementCount(),
    onSuccess: () => {
      // Invalidate and refetch the count query after successful increment
      queryClient.invalidateQueries({ queryKey: ['visitorCount'] });
    },
    onError: (error) => {
      console.error("Error incrementing count:", error);
    }
  });

  // Query to get the current count
  const { data: countData, isLoading, isError } = useQuery({
    queryKey: ['visitorCount'],
    queryFn: () => storeAdminApi.getCount(),
    initialData: {
      success: true,
      currentCount: 0,
    }
  });

  // Increment count on component mount
  useEffect(() => {
    incrementCount();
  }, []); // Empty dependency array means this runs once on mount

  const handleHowItWorksClick = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <section className="bg-secondary px-8 pb-16 pt-6 sm:py-24">
        <div className="mx-auto grid max-w-[75rem] grid-cols-1 items-center py-8 sm:gap-12 md:gap-16 md:py-2 lg:grid-cols-2 lg:gap-24 xl:max-w-[81.25rem]">
          <div className="text-center lg:text-left">
            <h1 className="mb-[2rem] pt-2 md:pt-0 font-custom text-[2.1rem] font-bold leading-[1.05] tracking-[-0.5px] text-[#333] xl:text-[3rem]">
              {t('hero.heading')}
            </h1>
            <p className="font-custom mb-12 text-base md:text-xl font-normal leading-[1.6]">
              {t('hero.description')}
            </p>

            <div className="align-center flex justify-center gap-4 md:gap-2 lg:justify-start whitespace-nowrap ">
              <button
                onClick={() => setIsSignInModalOpen(true)}
                className="font-custom inline-block cursor-pointer rounded-lg bg-primary px-4 py-2 text-lg font-bold text-secondary hover:bg-primary/85 sm:text-xl sm:px-8 sm:py-4 sm:mr-4"
              >
                {t('hero.startManaging')}
              </button>
              <button
                onClick={handleHowItWorksClick}
                className="font-custom inline-block cursor-pointer rounded-lg bg-primary px-4 py-2 text-lg font-bold text-secondary hover:bg-primary/85 sm:text-xl sm:px-8 sm:py-4 sm:ml-2.5"
              >
                {t('hero.howItWorks')}
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center lg:justify-start lg:mt-16">
              <div className="flex">
                {/* {customerImages.map((image, index) => (
                  <img
                    key={index}
                    className={`h-10 w-10 rounded-full border-[3px] border-solid border-[#fdf2e9] sm:h-12 sm:w-12 ${index < customerImages.length - 1 ? 'mr-[-14px]' : ''}`}
                    src={image.src}
                    alt={image.alt}
                  />
                ))} */}
              </div>
              <div className="flex items-center justify-center lg:justify-start">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-primary/10 mr-3 sm:mr-4">
                  <svg className="h-5 w-5 sm:h-6 sm:w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary mb-0 sm:mb-1 leading-none">
                    {isLoading ? (
                      "..."
                    ) : isError ? (
                      "300+"
                    ) : (
                      `${countData.currentCount.toLocaleString()}+`
                    )}
                  </p>
                  <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-600 leading-tight">
                    customers visited our website.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <picture className="align-center mt-8 flex justify-center lg:mt-0">
              {heroImage.webp && <source srcSet={heroImage.webp} type="image/webp" />}
              {heroImage.png && <source srcSet={heroImage.png} type="image/png" />}

              <img
                src={heroImage.png}
                className="w-[64%] lg:w-[100%]"
                alt={heroImage.alt}
              />
            </picture>
          </div>
        </div>
      </section>

      <SignInModal isOpen={isSignInModalOpen} onClose={() => setIsSignInModalOpen(false)} isMobileApp={false} />
    </>
  );
};

export default Hero;
