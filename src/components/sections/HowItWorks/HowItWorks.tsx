import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

interface HowItWorksProps {
  steps: { image: string; number: string }[];
}

const HowItWorks = ({ steps }: HowItWorksProps) => {
  const { t } = useTranslation();

  return (
    <>
      {/* DESKTOP VIEW */}
      <section className="hidden sm:block mt-16 px-24">
        <div className="mx-auto max-w-[75rem] px-8">
          <span className="lg:mb-4 block text-lg font-medium uppercase tracking-[0.075rem] text-foreground">
            {t('howItWorks.title')}
          </span>
          <h2 className="mb-8 text-4xl font-bold tracking-tighter text-[#333] lg:mb-0 lg:text-5xl">
            {t('howItWorks.subtitle')}
          </h2>
        </div>

        <div className="mx-auto grid max-w-[75rem] grid-cols-2 items-center gap-x-16 gap-y-24 px-8">
          {steps.map((step, index) => (
            <>
              {/* For even steps (0-indexed), show text first */}
              {index % 2 === 0 && (
                <motion.div
                  key={`text-${index}`}
                  className="step-text-box"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                >
                  <p className="my-3 text-8xl font-semibold text-gray-200">
                    <span className="cursor-pointer hover:text-primary/85">
                      {step.number}
                    </span>
                  </p>
                  <h3 className="mb-6 text-2xl font-semibold leading-10 tracking-[-0.5px] lg:text-3xl">
                    {t(`howItWorks.steps.${index}.heading`)}
                  </h3>
                  <p className="text-xl leading-loose">
                    {t(`howItWorks.steps.${index}.description`)}
                  </p>
                </motion.div>
              )}

              {/* Image container - for all steps */}
              <motion.div
                key={`image-${index}`}
                className="align-center relative flex justify-center before:absolute before:top-[5%] before:z-[-1] before:block before:w-[90%]
                before:rounded-full before:bg-secondary before:pb-[92%] before:content-[''] after:absolute after:top-[16%] after:z-[-1] after:block after:w-[75%]
                after:rounded-full after:bg-primary after:pb-[70%] after:content-[''] lg:before:w-[65%] lg:after:w-[50%] lg:before:pb-[65%] lg:after:pb-[50%]"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, delay: 0.25 }}
              >
                <img
                  src={step.image}
                  className="trasnlate-y-6 w-[55%] lg:w-[35%] lg:translate-y-0"
                  alt={`iPhone app showing ${t(`howItWorks.steps.${index}.heading`)}`}
                />
              </motion.div>

              {/* For odd steps (0-indexed), show text after the image */}
              {index % 2 === 1 && (
                <motion.div
                  key={`text-${index}`}
                  className="step-text-box"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                >
                  <p className="my-3 text-8xl font-semibold text-gray-200">
                    <span className="cursor-pointer hover:text-primary/85">
                      {step.number}
                    </span>
                  </p>
                  <h3 className="mb-6 text-2xl font-semibold leading-10 tracking-[-0.5px] lg:text-3xl">
                    {t(`howItWorks.steps.${index}.heading`)}
                  </h3>
                  <p className="text-xl leading-loose">
                    {t(`howItWorks.steps.${index}.description`)}
                  </p>
                </motion.div>
              )}
            </>
          ))}
        </div>
      </section>

      {/* MOBILE VIEW */}
      <section className="sm:hidden mt-10 px-2">
        <div className="mx-auto max-w-[75rem] px-8">
          <span className="mb-2 ml-0.5 block text-base font-medium uppercase tracking-[0.075rem] text-foreground">
            {t('howItWorks.title')}
          </span>
          <h2 className="mb-8 text-4xl font-bold tracking-tighter text-[#333] lg:mb-0 lg:text-5xl">
            {t('howItWorks.subtitle')}
          </h2>
        </div>

        <div className="mx-auto grid max-w-[75rem] grid-cols-1 items-center gap-y-16 px-8">
          {steps.map((step, index) => (
            <>
              <motion.div
                key={`mobile-image-${index}`}
                className="align-center relative flex justify-center before:absolute before:top-[5%] before:z-[-1] before:block before:w-[65%]
                before:rounded-full before:bg-secondary before:pb-[65%] before:content-[''] after:absolute after:top-[16%] after:z-[-1] after:block after:w-[50%]
                after:rounded-full after:bg-primary after:pb-[50%] after:content-['']"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, delay: 0.15 }}
              >
                <img
                  src={step.image}
                  className="w-[40%] translate-y-6 lg:translate-y-0"
                  alt={`iPhone app showing ${t(`howItWorks.steps.${index}.heading`)}`}
                />
              </motion.div>

              <motion.div
                key={`mobile-text-${index}`}
                className="step-text-box"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.7, delay: 0.28 }}
              >
                <p className="mb-3 text-7xl font-semibold text-gray-200">
                  {step.number}
                </p>
                <h3 className="mb-8 text-xl font-semibold leading-10 tracking-[-0.5px]">
                  {t(`howItWorks.steps.${index}.heading`)}
                </h3>
                <p className="text-base leading-loose">
                  {t(`howItWorks.steps.${index}.description`)}
                </p>
              </motion.div>
            </>
          ))}
        </div>
      </section>
    </>
  );
};

export default HowItWorks;