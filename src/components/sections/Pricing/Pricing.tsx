import { useTranslation } from "react-i18next";

export interface PricingPlan {
  name: string;
  price: string;
  currency: string;
  period: string;
  features: string[];
  cta: {
    text: string;
    link: string;
  };
  highlighted?: boolean;
}

export interface PricingFeature {
  title: string;
  description: string;
}

export interface PricingData {
  title: string;
  heading: string;
  plans: PricingPlan[];
  disclaimer: string;
  features: PricingFeature[];
}

interface PricingProps {
  plans: { price: string; currency: string }[];
}

const Pricing = ({ plans }: PricingProps) => {
  const { t } = useTranslation();

  return (
       <>
      {/*-----------------------MOBILE VIEW STARTS HERE----------------- */}
      <section className="section-pricing py-24 sm:hidden" id="pricing">
        <div className="container mx-auto max-w-[75rem] px-8 ">
          <span className="subheading mb-4 block text-base font-medium uppercase tracking-[0.075rem] text-foreground">
            {t('pricing.title')}
          </span>
          <h2 className="heading-secondary mb-8  text-4xl font-bold tracking-tighter text-[#333] md:text-5xl">
            {t('pricing.heading')}
          </h2>
        </div>
        <div className="container mx-auto mb-12 grid max-w-[75rem] items-center gap-y-24 px-8">
          {plans.map((plan, index) => (
            <div
              key={`mobile-plan-${index}`}
              className={`w-[100%] justify-center rounded-[11px] ${
                index === 1
                  ? 'border border-solid border-primary bg-white p-14 shadow-lg'
                  : 'border border-solid border-gray-200 p-12'
              }`}
            >
              <header className="plan-header mb-12 text-center">
                <p className={`plan-name mb-8 text-base font-semibold uppercase tracking-[0.75] ${
                  index === 1 ? 'text-primary' : 'text-gray-600'
                }`}>
                  {t(`pricing.plans.${index}.name`)}
                </p>
                <p className="plan-price mb-4 text-6xl font-semibold text-foreground">
                  <span className="mr-2 text-3xl font-medium">{plan.currency}</span>
                  {plan.price}
                </p>
                <p className="plan-text text-base leading-[1.6] text-[#6f6f6f] ">
                  {t(`pricing.plans.${index}.period`)}
                </p>
              </header>
              <ul className="list flex list-none flex-col gap-6">
                {Array.from({ length: 5 }, (_, featureIndex) => (
                  <li key={`mobile-feature-${index}-${featureIndex}`} className="flex items-start gap-4">
                    <span className="text-primary">✓</span>
                    <span
                      dangerouslySetInnerHTML={{ __html: t(`pricing.plans.${index}.features.${featureIndex}`) }}
                      className="flex-1 [&_.text-muted]:text-gray-500 [&_.text-sm]:text-sm [&_.text-sm]:mt-1"
                    />
                  </li>
                ))}
              </ul>
              <div className="mt-12 text-center">
                <a
                  href="#"
                  className="font-custom mr-2.5 inline-block rounded-[9px] bg-primary px-8 py-3 text-xl font-semibold text-secondary shadow duration-100 hover:bg-primary/85"
                >
                  {t(`pricing.plans.${index}.cta`)}
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="gapy-y-24 container mx-auto mb-12 grid max-w-[75rem] items-center gap-x-16 px-8">
          <aside className="plan-details text-center text-base leading-[1.6]">
            {t('pricing.disclaimer')}
          </aside>
        </div>

        <div className="gapy-y-24 mx-auto grid max-w-[75rem] grid-cols-1 items-center gap-x-16 px-8">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={`mobile-feature-${index}`} className="feature">
              <p className="mb-4 text-xl font-bold text-foreground">
                {t(`pricing.features.${index}.title`)}
              </p>
              <p className="mb-6 text-base leading-[1.8]">
                {t(`pricing.features.${index}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/*------------------ DESKTOP VIEW STARTS HERE--------------- */}
      <section className="hidden sm:block section-pricing py-24">
        <div className="container mx-auto max-w-[75rem] px-8">
          <span className="subheading mb-4 block text-base font-medium uppercase tracking-[0.075rem] text-foreground">
            {t('pricing.title')}
          </span>{" "}
          <h2 className="heading-secondary mb-8 text-4xl font-bold tracking-tighter text-[#333] md:text-5xl">
            {t('pricing.heading')}
          </h2>
        </div>

        <div className="mx-auto mb-12 grid max-w-[75rem] grid-cols-2 items-center justify-center gap-x-16 gap-y-24 px-8">
          <div className="w-[75%] justify-self-end rounded-[11px] border border-solid border-gray-200 p-11">
            <header className="plan-header mb-12 text-center">
              <p className="plan-name mb-8 text-2xl font-semibold uppercase tracking-[0.75] text-primary">
                {t('pricing.plans.0.name')}
              </p>
              <p className="plan-price mb-4 text-6xl font-semibold text-foreground">
                <span className="mr-2 text-3xl font-medium">{plans[0].currency}</span>
                {plans[0].price}
              </p>
              <p className="plan-text text-base leading-[1.6] text-[#6f6f6f]">
                {t('pricing.plans.0.period')}
              </p>
            </header>
            <ul className="list flex list-none flex-col gap-6">
              {Array.from({ length: 5 }, (_, featureIndex) => (
                <li key={`desktop-feature-0-${featureIndex}`} className="flex items-start gap-4">
                  <span className="text-primary">✓</span>
                  <span
                    dangerouslySetInnerHTML={{ __html: t(`pricing.plans.0.features.${featureIndex}`) }}
                    className="flex-1 [&_.text-muted]:text-gray-500 [&_.text-sm]:text-sm [&_.text-sm]:mt-1"
                  />
                </li>
              ))}
            </ul>
            <div className="mt-[4.8rem] text-center">
              <a
                href="#"
                className="font-custom mr-4 inline-block rounded-[9px] bg-primary px-12 py-1.5 text-xl font-semibold text-secondary no-underline shadow duration-100 hover:bg-primary/85 md:px-8 md:py-4 whitespace-nowrap"
              >
                {t('pricing.plans.0.cta')}
              </a>
            </div>
          </div>

          <div className="relative w-[85%] scale-105 rounded-[11px] border border-solid border-primary bg-white p-14 shadow-lg">
            <header className="plan-header mb-12 text-center">
              <p className="plan-name mb-8 text-2xl font-semibold uppercase tracking-[0.75] text-primary">
                {t('pricing.plans.1.name')}
              </p>
              <p className="plan-price mb-4 text-6xl font-semibold text-foreground">
                <span className="mr-2 text-3xl font-medium">{plans[1].currency}</span>
                {plans[1].price}
              </p>
              <p className="plan-text text-base leading-[1.6] text-[#6f6f6f]">
                {t('pricing.plans.1.period')}
              </p>
            </header>
            <ul className="list flex list-none flex-col gap-6">
              {Array.from({ length: 5 }, (_, featureIndex) => (
                <li key={`desktop-feature-1-${featureIndex}`} className="flex items-start gap-4">
                  <span className="text-primary">✓</span>
                  <span
                    dangerouslySetInnerHTML={{ __html: t(`pricing.plans.1.features.${featureIndex}`) }}
                    className="flex-1 [&_.text-muted]:text-gray-500 [&_.text-sm]:text-sm [&_.text-sm]:mt-1"
                  />
                </li>
              ))}
            </ul>
            <div className="mt-12 text-center">
              <a
                href="#"
                className="font-custom mr-4 inline-block rounded-[9px] bg-primary px-12 py-1.5 text-xl font-semibold text-secondary no-underline shadow duration-100 hover:bg-primary/85 md:px-8 md:py-4 whitespace-nowrap"
              >
                {t('pricing.plans.1.cta')}
              </a>
            </div>
          </div>
        </div>

        <div className="gapy-y-24 container mx-auto mb-12 grid max-w-[75rem] items-center gap-x-16 px-8">
          <aside className="plan-details text-center text-base leading-[1.6]">
            {t('pricing.disclaimer')}
          </aside>
        </div>

        <div className="grid--4-cols gapy-y-24 container mx-auto mb-12 grid max-w-[75rem] grid-cols-4 items-center gap-x-16 px-8">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={`desktop-feature-${index}`} className="feature">
              <p className="feature-title mb-4 text-2xl font-bold text-foreground">
                {t(`pricing.features.${index}.title`)}
              </p>
              <p className="feature-text text-lg leading-[1.8]">
                {t(`pricing.features.${index}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Pricing;