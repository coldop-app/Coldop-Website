const Pricing = () => {
  return (
    <>
      {/*-----------------------MOBILE VIEW STARTS HERE----------------- */}
      <section className="section-pricing py-24 sm:hidden" id="pricing">
        <div className="container mx-auto max-w-[75rem] px-8 ">
          <span className="subheading mb-4 block text-base font-medium uppercase tracking-[0.075rem] text-foreground">
            Pricing
          </span>
          <h2 className="heading-secondary mb-8  text-4xl font-bold tracking-tighter text-[#333] md:text-5xl">
            Smart crop storage that's easy on the wallet
          </h2>
        </div>
        <div className="container mx-auto mb-12 grid max-w-[75rem] items-center gap-y-24 px-8">
          <div className="w-[100%] justify-center rounded-[11px] border-4 border-solid border-secondary p-12">
            <header className="plan-header mb-12 text-center">
              <p className="plan-name mb-8 text-base font-semibold uppercase tracking-[0.75] text-primary">
                Starter
              </p>
              <p className="plan-price mb-4 text-6xl font-semibold text-foreground">
                <span className="mr-2 text-3xl font-medium">$</span>
                399
              </p>
              <p className="plan-text text-base leading-[1.6] text-[#6f6f6f] ">
                per month.
              </p>
            </header>
            <ul className="list flex list-none flex-col gap-4">
              <li className="flex items-center gap-4 text-base leading-[1.2]">
                {/* <ion-icon
                  className="w-[3rem] h-[3rem] text-[#e67e22]"
                  name="checkmark-outline"
                ></ion-icon> */}
                <span>1 crop per day</span>
              </li>
              <li className="flex items-center gap-4 text-base leading-[1.2]">
                {/* <ion-icon
                  className="w-[3rem] h-[3rem] text-[#e67e22]"
                  name="checkmark-outline"
                ></ion-icon> */}
                <span>Order from 11am to 9pm</span>
              </li>
              <li className="flex items-center gap-4 text-base leading-[1.2]">
                {/* <ion-icon
                  className="w-[3rem] h-[3rem] text-[#e67e22]"
                  name="checkmark-outline"
                ></ion-icon> */}
                <span>Recovery is free</span>
              </li>
              <li className="flex items-center gap-4 text-base leading-[1.2]">
                {/* <ion-icon className="w-[3rem] h-[3rem] text-[#e67e22]" name="close-outline"></ion-icon> */}
              </li>
            </ul>
            <div className=" mt-12 text-center">
              <a
                href="#"
                className="font-custom mr-2.5 inline-block rounded-[9px] bg-primary px-8 py-3 text-xl font-semibold text-secondary shadow duration-100 hover:bg-primary/85 "
              >
                Start storing
              </a>
            </div>
          </div>

          <div className="w-[100%] justify-center rounded-[11px] border-4 border-solid border-secondary p-12">
            <header className="plan-header mb-12 text-center">
              <p className="plan-name mb-8 text-base font-semibold uppercase tracking-[0.75] text-primary">
                Complete
              </p>
              <p className="plan-price mb-4 text-6xl font-semibold text-foreground">
                <span className="mr-2 text-3xl font-medium">$</span>
                649
              </p>
              <p className="plan-text text-base leading-[1.6] text-[#6f6f6f] ">
                per month.
              </p>
            </header>
            <ul className="list flex list-none flex-col gap-4">
              <li className="flex items-center gap-4 text-base leading-[1.2]">
                {/* <ion-icon
                  className="w-[3rem] h-[3rem] text-[#e67e22]"
                  name="checkmark-outline"
                ></ion-icon> */}
                <span>2 crops per day</span>
              </li>
              <li className="flex items-center gap-4 text-base leading-[1.2]">
                {/* <ion-icon
                  className="w-[3rem] h-[3rem] text-[#e67e22]"
                  name="checkmark-outline"
                ></ion-icon> */}
                <span>
                  Order <strong>24/7</strong>
                </span>
              </li>
              <li className="flex items-center gap-4 text-base leading-[1.2]">
                {/* <ion-icon
                  className="w-[3rem] h-[3rem] text-[#e67e22]"
                  name="checkmark-outline"
                ></ion-icon> */}
                <span>Recovery is free</span>
              </li>
              <li className="flex items-center gap-4 text-base leading-[1.2]">
                {/* <ion-icon className="w-[3rem] h-[3rem] text-[#e67e22]" name="close-outline"></ion-icon> */}
                <span>Get access to all storages</span>
              </li>
            </ul>
            <div className=" mt-12 text-center">
              <a
                href="#"
                className="font-custom mr-2.5 inline-block rounded-[9px] bg-primary px-8 py-3 text-xl font-semibold text-secondary shadow duration-100 hover:bg-primary/85 "
              >
                Start storing
              </a>
            </div>
          </div>
        </div>

        <div className="gapy-y-24 container       mx-auto mb-12  grid  max-w-[75rem] items-center gap-x-16  px-8">
          <aside className="plan-details  text-center  text-base leading-[1.6]">
            Prices include all applicable taxes. You can cancel at any time.
            Both plans include the following:
          </aside>
        </div>

        <div className=" gapy-y-24   mx-auto  grid max-w-[75rem] grid-cols-1 items-center gap-x-16  px-8">
          <div className="feature">
            {/* <ion-icon
              className="text-[#e67e22] h-[3.2rem] w-[3.2rem] bg-[#fdf2e9] mb-[3.2rem] p-[1.6rem] rounded-full"
              name="infinite-outline"
            ></ion-icon> */}
            <p className=" mb-4 text-xl font-bold text-foreground">
              Purity Pact
            </p>
            <p className=" mb-6 text-base leading-[1.8]">
              The crop cold-storage app, a steadfast commitment to crop
              freshness, minimizing waste, and ensuring unparalleled quality.
            </p>
          </div>
          <div className="feature">
            {/* <ion-icon
              className="feature-icon"
              name="nutrition-outline"
            ></ion-icon> */}
            <p className=" mb-4 text-xl font-bold text-foreground">
              Extended Shelf Life
            </p>
            <p className="mb-6 text-base leading-[1.8]">
              Optimal temperature control in the app helps extend the shelf life
              of stored crops, reducing economic losses to farmers.
            </p>
          </div>

          <div className="feature">
            {/* <ion-icon
              className="feature-icon"
              name="nutrition-outline"
            ></ion-icon> */}
            <p className="mb-4 text-xl font-bold text-foreground">
              Loss Prevention:
            </p>
            <p className="mb-6 text-base leading-[1.8]">
              By maintaining ideal storage conditions, the app prevents
              deterioration, contributing to reduced economic loss for farmers.
            </p>
          </div>

          <div className="feature">
            {/* <ion-icon
              className="feature-icon"
              name="nutrition-outline"
            ></ion-icon> */}
            <p className="mb-4 text-xl font-bold text-foreground">
              Efficient Inventory
            </p>
            <p className="mb-6 text-base leading-[1.8]">
              The app facilitates smart inventory management, aiding farmers in
              tracking, planning, and optimizing supply chain logistics.
            </p>
          </div>
        </div>
      </section>

      {/*------------------ DESKTOP VIEW STARTS HERE--------------- */}
      <section className="hidden sm:block section-pricing py-24 ">
        <div className="container mx-auto max-w-[75rem] px-8 ">
          <span className="subheading mb-4 block text-base font-medium uppercase tracking-[0.075rem] text-foreground">
            Pricing
          </span>{" "}
          <h2 className="heading-secondary mb-8  text-4xl font-bold tracking-tighter text-[#333] md:text-5xl">
            Smart crop storage that's easy on the wallet
          </h2>
        </div>
    

      <div className="mx-auto mb-12 grid max-w-[75rem] grid-cols-2 items-center  justify-center gap-x-16 gap-y-24 px-8">
        <div className="w-[75%] justify-self-end rounded-[11px] border-4 border-solid border-[#fdf2e9] p-11">
          <header className="plan-header mb-12 text-center">
            <p className="plan-name mb-8 text-2xl font-semibold uppercase tracking-[0.75] text-primary">
              Starter
            </p>
            <p className="plan-price mb-4 text-6xl font-semibold text-foreground">
              <span className="mr-2 text-3xl font-medium">$</span>
              399
            </p>
            <p className="plan-text text-base leading-[1.6] text-[#6f6f6f] ">
              per month.
            </p>
          </header>
          <ul className="list flex list-none flex-col gap-4">
            <li className="flex   items-center gap-4 text-lg leading-[1.2]">
              {/* <ion-icon
                  className="w-[3rem] h-[3rem] text-[#e67e22]"
                  name="checkmark-outline"
                ></ion-icon> */}
              <span>1 crop per day</span>
            </li>
            <li className="flex items-center gap-4 text-lg leading-[1.2]">
              {/* <ion-icon
                  className="w-[3rem] h-[3rem] text-[#e67e22]"
                  name="checkmark-outline"
                ></ion-icon> */}
              <span>Order from 11am to 9pm</span>
            </li>
            <li className="flex  items-center gap-4 text-lg leading-[1.2]">
              {/* <ion-icon
                  className="w-[3rem] h-[3rem] text-[#e67e22]"
                  name="checkmark-outline"
                ></ion-icon> */}
              <span>Recovery is free</span>
            </li>
            <li className="flex   items-center gap-4 text-lg leading-[1.2]">
              {/* <ion-icon className="w-[3rem] h-[3rem] text-[#e67e22]" name="close-outline"></ion-icon> */}
            </li>
          </ul>
          <div className=" mt-[4.8rem] text-center">
            <a
              href="#"
              className="font-custom mr-4 inline-block rounded-[9px] bg-primary px-12  py-1.5 text-xl font-semibold text-secondary no-underline shadow duration-100 hover:bg-primary/85 md:px-8 md:py-4 whitespace-nowrap "
            >
              Start storing
            </a>
          </div>
        </div>

        <div className="     relative w-[75%] rounded-[11px] border-2 border-solid border-[#fdf2e9] p-12">
          <header className="plan-header mb-12 text-center">
            <p className="plan-name mb-8 bg-secondary text-2xl font-semibold uppercase tracking-[0.75] text-primary">
              Complete
            </p>
            <p className="plan-price mb-4 text-6xl font-semibold text-foreground">
              <span className="mr-2 text-3xl font-medium">$</span>
              649
            </p>
            <p className="plan-text text-base leading-[1.6] text-[#6f6f6f] ">
              per month.
            </p>
          </header>
          <ul className="list  flex list-none flex-col gap-4">
            <li className="leading-1.2 flex  items-center gap-4 text-lg">
              {/* <ion-icon
                  className="w-[3rem] h-[3rem] text-[#e67e22]"
                  name="checkmark-outline"
                ></ion-icon> */}
              <span>
                <strong>2 crops</strong> per day
              </span>
            </li>
            <li className="leading-1.2 flex  items-center gap-4 text-lg">
              {/* <ion-icon
                  className="w-[3rem] h-[3rem] text-[#e67e22]"
                  name="checkmark-outline"
                ></ion-icon> */}
              <span>
                Order <strong>24/7</strong>
              </span>
            </li>
            <li className="leading-1.2 flex  items-center gap-4 text-lg">
              {/* <ion-icon
                  className="w-[3rem] h-[3rem] text-[#e67e22]"
                  name="checkmark-outline"
                ></ion-icon> */}
              <span>Recovery is free</span>
            </li>
            <li className="leading-1.2 flex  items-center gap-4 text-lg">
              {/* <ion-icon
                  className="w-[3rem] h-[3rem] text-[#e67e22]"
                  name="checkmark-outline"
                ></ion-icon> */}
              <span>Get access to all storages</span>
            </li>
          </ul>
          <div className="mt-12 text-center">
            <a
              href="#"
              className="font-custom mr-4 inline-block rounded-[9px] bg-primary px-12  py-1.5 text-xl font-semibold text-secondary no-underline shadow duration-100 hover:bg-primary/85 md:px-8 md:py-4 whitespace-nowrap"
            >
              Start storing
            </a>
          </div>
        </div>
      </div>

      <div className="gapy-y-24 container    mx-auto mb-12  grid  max-w-[75rem] items-center gap-x-16 px-8">
        <aside className="plan-details  text-center  text-base leading-[1.6]">
          Prices include all applicable taxes. You can cancel at any time. Both
          plans include the following:
        </aside>
      </div>

      <div className="grid--4-cols gapy-y-24 container        mx-auto mb-12 grid max-w-[75rem] grid-cols-4 items-center gap-x-16  px-8">
        <div className="feature">
          {/* <ion-icon
              className="text-[#e67e22] h-[3.2rem] w-[3.2rem] bg-[#fdf2e9] mb-[3.2rem] p-[1.6rem] rounded-full"
              name="infinite-outline"
            ></ion-icon> */}
          <p className="feature-title mb-4 text-2xl font-bold text-foreground">
            Purity Pact
          </p>
          <p className="feature-text text-lg leading-[1.8]">
            The crop cold-storage app, a steadfast commitment to crop freshness,
            minimizing waste, and ensuring unparalleled quality.
          </p>
        </div>
        <div className="feature">
          {/* <ion-icon
              className="feature-icon"
              name="nutrition-outline"
            ></ion-icon> */}
          <p className="feature-title mb-4 text-2xl font-bold text-foreground">
            Extended Shelf Life
          </p>
          <p className="feature-text text-lg leading-[1.8]">
            Optimal temperature control in the app helps extend the shelf life
            of stored crops, reducing economic losses to farmers.
          </p>
        </div>
        <div className="feature">
          {/* <ion-icon className="feature-icon" name="leaf-outline"></ion-icon> */}
          <p className="feature-title mb-4 text-2xl font-bold text-foreground">
            Loss Prevention:
          </p>
          <p className="feature-text text-lg leading-[1.8]">
            By maintaining ideal storage conditions, the app prevents
            deterioration, contributing to reduced economic loss for farmers.
          </p>
        </div>
        <div className="feature">
          {/* <ion-icon className="feature-icon" name="pause-outline"></ion-icon> */}
          <p className="feature-title mb-4 text-2xl font-bold text-foreground">
            Efficient Inventory
          </p>
          <p className="feature-text text-lg leading-[1.8]">
            The app facilitates smart inventory management, aiding farmers in
            tracking, planning, and optimizing supply chain logistics.
          </p>
        </div>
      </div>
      </section>
    </>
  );
};

export default Pricing;
