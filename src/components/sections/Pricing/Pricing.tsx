
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

const Pricing = ({
  title,
  heading,
  plans,
  disclaimer,
  features
}: PricingData) => {
  return (
    <>
      {/*-----------------------MOBILE VIEW STARTS HERE----------------- */}
      <section className="section-pricing py-24 sm:hidden" id="pricing">
        <div className="container mx-auto max-w-[75rem] px-8 ">
          <span className="subheading mb-4 block text-base font-medium uppercase tracking-[0.075rem] text-foreground">
            {title}
          </span>
          <h2 className="heading-secondary mb-8  text-4xl font-bold tracking-tighter text-[#333] md:text-5xl">
            {heading}
          </h2>
        </div>
        <div className="container mx-auto mb-12 grid max-w-[75rem] items-center gap-y-24 px-8">
          {plans.map((plan, index) => (
            <div 
              key={`mobile-plan-${index}`} 
              className={`w-[100%] justify-center rounded-[11px] border-4 border-solid ${plan.highlighted ? 'border-secondary' : 'border-secondary'} p-12`}
            >
              <header className="plan-header mb-12 text-center">
                <p className="plan-name mb-8 text-base font-semibold uppercase tracking-[0.75] text-primary">
                  {plan.name}
                </p>
                <p className="plan-price mb-4 text-6xl font-semibold text-foreground">
                  <span className="mr-2 text-3xl font-medium">{plan.currency}</span>
                  {plan.price}
                </p>
                <p className="plan-text text-base leading-[1.6] text-[#6f6f6f] ">
                  {plan.period}
                </p>
              </header>
              <ul className="list flex list-none flex-col gap-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={`mobile-feature-${index}-${featureIndex}`} className="flex items-center gap-4 text-base leading-[1.2]">
                    {/* <ion-icon
                      className="w-[3rem] h-[3rem] text-[#e67e22]"
                      name="checkmark-outline"
                    ></ion-icon> */}
                    <span dangerouslySetInnerHTML={{ __html: feature }}></span>
                  </li>
                ))}
              </ul>
              <div className="mt-12 text-center">
                <a
                  href={plan.cta.link}
                  className="font-custom mr-2.5 inline-block rounded-[9px] bg-primary px-8 py-3 text-xl font-semibold text-secondary shadow duration-100 hover:bg-primary/85"
                >
                  {plan.cta.text}
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="gapy-y-24 container mx-auto mb-12 grid max-w-[75rem] items-center gap-x-16 px-8">
          <aside className="plan-details text-center text-base leading-[1.6]">
            {disclaimer}
          </aside>
        </div>

        <div className="gapy-y-24 mx-auto grid max-w-[75rem] grid-cols-1 items-center gap-x-16 px-8">
          {features.map((feature, index) => (
            <div key={`mobile-feature-${index}`} className="feature">
              {/* <ion-icon
                className="text-[#e67e22] h-[3.2rem] w-[3.2rem] bg-[#fdf2e9] mb-[3.2rem] p-[1.6rem] rounded-full"
                name="infinite-outline"
              ></ion-icon> */}
              <p className="mb-4 text-xl font-bold text-foreground">
                {feature.title}
              </p>
              <p className="mb-6 text-base leading-[1.8]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/*------------------ DESKTOP VIEW STARTS HERE--------------- */}
      <section className="hidden sm:block section-pricing py-24">
        <div className="container mx-auto max-w-[75rem] px-8">
          <span className="subheading mb-4 block text-base font-medium uppercase tracking-[0.075rem] text-foreground">
            {title}
          </span>{" "}
          <h2 className="heading-secondary mb-8 text-4xl font-bold tracking-tighter text-[#333] md:text-5xl">
            {heading}
          </h2>
        </div>
    
        <div className="mx-auto mb-12 grid max-w-[75rem] grid-cols-2 items-center justify-center gap-x-16 gap-y-24 px-8">
          {plans.map((plan, index) => (
            <div 
              key={`desktop-plan-${index}`} 
              className={`w-[75%] ${index === 0 ? 'justify-self-end' : ''} rounded-[11px] border-${plan.highlighted ? '2' : '4'} border-solid border-[#fdf2e9] p-${index === 0 ? '11' : '12'} ${plan.highlighted ? 'relative' : ''}`}
            >
              <header className="plan-header mb-12 text-center">
                <p className={`plan-name mb-8 ${plan.highlighted ? 'bg-secondary' : ''} text-2xl font-semibold uppercase tracking-[0.75] text-primary`}>
                  {plan.name}
                </p>
                <p className="plan-price mb-4 text-6xl font-semibold text-foreground">
                  <span className="mr-2 text-3xl font-medium">{plan.currency}</span>
                  {plan.price}
                </p>
                <p className="plan-text text-base leading-[1.6] text-[#6f6f6f]">
                  {plan.period}
                </p>
              </header>
              <ul className="list flex list-none flex-col gap-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={`desktop-feature-${index}-${featureIndex}`} className="flex items-center gap-4 text-lg leading-[1.2]">
                    {/* <ion-icon
                      className="w-[3rem] h-[3rem] text-[#e67e22]"
                      name="checkmark-outline"
                    ></ion-icon> */}
                    <span dangerouslySetInnerHTML={{ __html: feature }}></span>
                  </li>
                ))}
              </ul>
              <div className={`mt-${index === 0 ? '[4.8rem]' : '12'} text-center`}>
                <a
                  href={plan.cta.link}
                  className="font-custom mr-4 inline-block rounded-[9px] bg-primary px-12 py-1.5 text-xl font-semibold text-secondary no-underline shadow duration-100 hover:bg-primary/85 md:px-8 md:py-4 whitespace-nowrap"
                >
                  {plan.cta.text}
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="gapy-y-24 container mx-auto mb-12 grid max-w-[75rem] items-center gap-x-16 px-8">
          <aside className="plan-details text-center text-base leading-[1.6]">
            {disclaimer}
          </aside>
        </div>

        <div className="grid--4-cols gapy-y-24 container mx-auto mb-12 grid max-w-[75rem] grid-cols-4 items-center gap-x-16 px-8">
          {features.map((feature, index) => (
            <div key={`desktop-feature-${index}`} className="feature">
              {/* <ion-icon
                className="text-[#e67e22] h-[3.2rem] w-[3.2rem] bg-[#fdf2e9] mb-[3.2rem] p-[1.6rem] rounded-full"
                name="infinite-outline"
              ></ion-icon> */}
              <p className="feature-title mb-4 text-2xl font-bold text-foreground">
                {feature.title}
              </p>
              <p className="feature-text text-lg leading-[1.8]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Pricing;