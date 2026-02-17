import { memo } from 'react';

interface Step {
  image: string;
  number: string;
  heading: string;
  description: string;
}

interface HowItWorksProps {
  title: string;
  subtitle: string;
  steps: Step[];
}

const HowItWorks = ({ title, subtitle, steps }: HowItWorksProps) => {
  return (
    <>
      {/* DESKTOP */}
      <section
        id="how-it-works"
        className="bg-background mt-16 hidden px-8 sm:block sm:px-16 lg:px-24"
      >
        <div className="mx-auto max-w-[75rem]">
          <span className="font-custom text-foreground mb-4 block text-lg font-medium tracking-[0.075rem] uppercase">
            {title}
          </span>
          <h2 className="font-custom text-foreground mb-8 text-4xl font-bold tracking-tighter lg:text-5xl">
            {subtitle}
          </h2>
        </div>

        <div className="mx-auto mt-8 grid max-w-[75rem] grid-cols-2 items-center gap-x-16 gap-y-24">
          {steps.map((step, index) => (
            <div key={index} className="contents">
              {/* TEXT (EVEN) */}
              {index % 2 === 0 && (
                <div className="step-text-box">
                  <p className="font-custom text-primary my-3 text-8xl font-semibold">
                    {step.number}
                  </p>
                  <h3 className="font-custom text-foreground mb-6 text-2xl font-semibold lg:text-3xl">
                    {step.heading}
                  </h3>
                  <p className="font-custom text-muted-foreground text-xl leading-loose">
                    {step.description}
                  </p>
                </div>
              )}

              {/* IMAGE */}
              <div className="before:bg-secondary after:bg-primary relative flex justify-center before:absolute before:top-[5%] before:z-[-1] before:w-[90%] before:rounded-full before:pb-[92%] after:absolute after:top-[16%] after:z-[-1] after:w-[75%] after:rounded-full after:pb-[70%] lg:before:w-[65%] lg:before:pb-[65%] lg:after:w-[50%] lg:after:pb-[50%]">
                <img
                  src={step.image}
                  alt={step.heading}
                  className="w-[55%] translate-y-6 lg:w-[35%] lg:translate-y-0"
                />
              </div>

              {/* TEXT (ODD) */}
              {index % 2 === 1 && (
                <div className="step-text-box">
                  <p className="font-custom text-primary my-3 text-8xl font-semibold">
                    {step.number}
                  </p>
                  <h3 className="font-custom text-foreground mb-6 text-2xl font-semibold lg:text-3xl">
                    {step.heading}
                  </h3>
                  <p className="font-custom text-muted-foreground text-xl leading-loose">
                    {step.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* MOBILE */}
      <section className="bg-background mt-10 px-8 sm:hidden">
        <div className="mx-auto max-w-[75rem]">
          <span className="font-custom text-foreground mb-2 block text-base font-medium tracking-[0.075rem] uppercase">
            {title}
          </span>
          <h2 className="font-custom text-foreground mb-8 text-4xl font-bold tracking-tighter">
            {subtitle}
          </h2>
        </div>

        <div className="mx-auto mt-8 grid max-w-[75rem] grid-cols-1 gap-y-16">
          {steps.map((step, index) => (
            <div key={index}>
              <div className="before:bg-secondary after:bg-primary relative flex justify-center before:absolute before:top-[5%] before:z-[-1] before:w-[65%] before:rounded-full before:pb-[65%] after:absolute after:top-[16%] after:z-[-1] after:w-[50%] after:rounded-full after:pb-[50%]">
                <img
                  src={step.image}
                  alt={step.heading}
                  className="w-[40%] translate-y-6"
                />
              </div>

              <div className="step-text-box mt-6">
                <p className="font-custom text-primary mb-3 text-7xl font-semibold">
                  {step.number}
                </p>
                <h3 className="font-custom text-foreground mb-6 text-xl font-semibold">
                  {step.heading}
                </h3>
                <p className="font-custom text-muted-foreground text-base leading-loose">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default memo(HowItWorks);
