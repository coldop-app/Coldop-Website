import { useTranslation } from "react-i18next";

interface TestimonialsProps {
  testimonials: { image: string; alt: string }[];
  galleryImages: { src: string; alt: string }[];
}

const Testimonials = ({
  testimonials,
  galleryImages
}: TestimonialsProps) => {
  const { t } = useTranslation();

  return (
    <>
      <section
        className="mt-24 grid grid-cols-1 items-center gap-x-16 gap-y-24 bg-secondary lg:grid-cols-2"
        id="testimonials"
      >
        <div className="testimonials-container  px-8  py-24 lg:px-28 lg:py-44">
          <span className="subheading mb-4 block text-base font-medium uppercase tracking-[0.075rem] text-foreground lg:text-lg">
            {t('testimonials.title')}
          </span>
          <h2 className="heading-secondary mb-8 text-3xl font-bold tracking-tighter text-[#333] md:text-5xl">
            {t('testimonials.heading')}
          </h2>

          <div className="testimonials grid grid-cols-1 gap-x-20 gap-y-12 md:grid-cols-2 ">
            {testimonials.map((testimonial, index) => (
              <figure key={`testimonial-${index}`} className="testimonial">
                <img
                  className="testimonial-img mb-3 w-16 rounded-full "
                  alt={testimonial.alt}
                  src={testimonial.image}
                />
                <blockquote className="testimonial-text mb-4 text-base leading-[1.8] ">
                  {t(`testimonials.testimonials.${index}.quote`)}
                </blockquote>
                <p className="testimonial-name text-base text-[#6f6f6f]">
                  &mdash; {t(`testimonials.testimonials.${index}.name`)}
                </p>
              </figure>
            ))}
          </div>
        </div>

        <div className="gallery grid grid-cols-4 gap-8 p-4 sm:grid-rows-2 md:grid-cols-6  md:grid-rows-2 md:gap-[1.2rem] lg:grid-cols-2 xl:grid-cols-3">
          {galleryImages.map((image, index) => (
            <figure key={`gallery-${index}`} className="gallery-item duration-400 block w-full overflow-hidden transition-all hover:scale-110">
              <img
                src={image.src}
                alt={image.alt}
              />
            </figure>
          ))}
        </div>
      </section>
    </>
  );
};

export default Testimonials;
