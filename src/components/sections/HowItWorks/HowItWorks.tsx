

const HowItWorks = () => {
  return (
      <>
          <section className="hidden sm:block  mt-16 px-24">
              <div className="mx-auto max-w-[75rem] px-8 ">
                <span className="lg:mb-4 block text-lg font-medium uppercase tracking-[0.075rem] text-foreground ">
            How it works
                  </span> 
        <h2 className="mb-8 text-4xl font-bold tracking-tighter text-[#333] lg:mb-0 lg:text-5xl  ">
            Your daily dose of 3 simple steps
            </h2>   
              </div>
              
              <div className="mx-auto grid max-w-[75rem] grid-cols-2 items-center gap-x-16 gap-y-24 px-8 ">
              <div className="step-text-box">
              <p className="my-3 text-8xl font-semibold text-gray-200 ">
              <span className="cursor-pointer hover:text-primary/85">
                    01
                  </span>
              </p>
              <h3 className="mb-6 text-2xl font-semibold leading-10 tracking-[-0.5px] lg:text-3xl ">
                  Register with your store-Admin
                </h3>
                <p className="text-xl leading-loose ">
                  Start your farming journey by swiftly registering with a
                  dedicated store admin. This personalized connection unlocks
                  tailored features, ensuring efficient communication and
                  setting the stage for a productive farming experience.
                </p>
                </div>

                <div
                className=" align-center relative flex justify-center before:absolute before:top-[5%] before:z-[-1] before:block  before:w-[90%]
              before:rounded-full before:bg-secondary before:pb-[92%] before:content-[''] after:absolute after:top-[16%] after:z-[-1] after:block after:w-[75%]
              after:rounded-full after:bg-primary after:pb-[70%] after:content-[''] lg:before:w-[65%] lg:after:w-[50%] lg:before:pb-[65%] lg:after:pb-[50%]"
              >
                <img
                  src="./app-screen-1.png"
                  className="trasnlate-y-6 w-[55%] lg:w-[35%] lg:translate-y-0"
                  alt="iPhone app
            preferences selection screen"
                />
              </div>
             

              <div
                className=" align-center relative flex justify-center before:absolute before:top-[5%] before:z-[-1] before:block  before:w-[90%]
              before:rounded-full before:bg-secondary before:pb-[92%] before:content-[''] after:absolute after:top-[16%] after:z-[-1] after:block after:w-[75%]
              after:rounded-full after:bg-primary after:pb-[70%] after:content-[''] lg:before:w-[65%] lg:after:w-[50%] lg:before:pb-[65%] lg:after:pb-[50%]"
              >
                <img
                  src="./app-screen-2.png"
                  className="trasnlate-y-6 w-[55%] lg:w-[35%] lg:translate-y-0"
                  alt="iPhone app
            preferences selection screen"
                />
              </div>

              <div className="step-text-box">
              <p className="my-3 text-8xl font-semibold text-gray-200 ">
              <span className="cursor-pointer hover:text-primary/85">
                    02
                  </span>
              </p>
              <h3 className="mb-6 text-2xl font-semibold leading-10 tracking-[-0.5px] lg:text-3xl ">
              Fill in details about the crop
                </h3>
                <p className="text-xl leading-loose ">
                Next, farmers input crucial details about themselves and the
                  stored crop. This ensures accurate records and personalized
                  assistance, contributing to efficient crop management tailored
                  to individual needs.
                </p>
              </div>
                 
              <div className="step-text-box">
              <p className="my-3 text-8xl font-semibold text-gray-200 ">
              <span className="cursor-pointer hover:text-primary/85">
                    03
                  </span>
              </p>
              <h3 className="mb-6 text-2xl font-semibold leading-10 tracking-[-0.5px] lg:text-3xl ">
              Receive confirmation on WhatsApp
                </h3>
                <p className="text-xl leading-loose ">
                Upon successful storage of your crops, you'll instantly
                  receive a confirmation on WhatsApp. This ensures swift
                  acknowledgment and provides peace of mind, allowing you to
                  proceed confidently with the knowledge that your harvest is
                  securely stored and ready for future use.
                </p>
              </div>

              <div
                className=" align-center relative flex justify-center before:absolute before:top-[5%] before:z-[-1] before:block  before:w-[90%]
              before:rounded-full before:bg-secondary before:pb-[92%] before:content-[''] after:absolute after:top-[16%] after:z-[-1] after:block after:w-[75%]
              after:rounded-full after:bg-primary after:pb-[70%] after:content-[''] lg:before:w-[65%] lg:after:w-[50%] lg:before:pb-[65%] lg:after:pb-[50%]"
              >
                <img
                  src="./app-screen-3.png"
                  className="trasnlate-y-6 w-[55%] lg:w-[35%] lg:translate-y-0"
                  alt="iPhone app
            preferences selection screen"
                />
              </div>
                 

                </div>
          </section>

{/* MOBILE VIEW SECTION */}
          <section className="sm:hidden mt-10 px-2">
            <div className="mx-auto max-w-[75rem] px-8">
            <span className="mb-2 ml-0.5 block text-base font-medium uppercase tracking-[0.075rem] text-foreground ">
            How it works
                  </span>
             <h2 className="mb-8 text-4xl font-bold tracking-tighter text-[#333] lg:mb-0 lg:text-5xl  ">
            Your daily dose of 3 simple steps
            </h2>  
            </div>

            <div className="mx-auto grid max-w-[75rem] grid-cols-1 items-center gap-y-16 px-8">
            <div
                className=" align-center relative flex justify-center before:absolute before:top-[5%] before:z-[-1] before:block  before:w-[65%]
    before:rounded-full before:bg-secondary before:pb-[65%] before:content-[''] after:absolute after:top-[16%] after:z-[-1] after:block after:w-[50%]
    after:rounded-full after:bg-primary after:pb-[50%] after:content-[''] "
              > 
               <img
                  src="./app-screen-1.png"
                  className="w-[40%] translate-y-6 lg:translate-y-0"
                  alt="iPhone app preferences selection screen"
                />
              </div>  
              {/*STEP 1 */}
              <div className="step-text-box">
                <p className="mb-3 text-7xl font-semibold text-gray-200">
                  01
                </p>
                <h3 className="mb-8 text-xl font-semibold leading-10 tracking-[-0.5px]">
                  Register with your store-Admin
                </h3>
                <p className="text-base leading-loose">
                  Start your farming journey by swiftly registering with a
                  dedicated store admin. This personalized connection unlocks
                  tailored features, ensuring efficient communication and
                  setting the stage for a productive farming experience.
                </p>
              </div>

   {/*STEP 2 */}
              <div
                className=" align-center relative flex justify-center before:absolute before:top-[5%] before:z-[-1] before:block  before:w-[65%]
    before:rounded-full before:bg-secondary before:pb-[65%] before:content-[''] after:absolute after:top-[16%] after:z-[-1] after:block after:w-[50%]
    after:rounded-full after:bg-primary after:pb-[50%] after:content-[''] "
              >
                <img
                  src="./app-screen-2.png"
                  className="w-[40%] translate-y-6 lg:translate-y-0"
                  alt="iPhone app preferences selection screen"
                />
            </div>

            <div className="step-text-box">
                <p className="mb-3 text-7xl font-semibold text-gray-200">
                  02
                </p>
                <h3 className="mb-8 text-xl font-semibold leading-10 tracking-[-0.5px]">
                  Fill in details about the crop
                </h3>
                <p className="text-base leading-loose">
                  Next, farmers input crucial details about themselves and the
                  stored crop. This ensures accurate records and personalized
                  assistance, contributing to efficient crop management tailored
                  to individual needs.
                </p>
              </div>

   {/*STEP 3 */}
              <div
                className=" align-center relative flex justify-center before:absolute before:top-[5%] before:z-[-1] before:block  before:w-[65%]
    before:rounded-full before:bg-secondary before:pb-[65%] before:content-[''] after:absolute after:top-[16%] after:z-[-1] after:block after:w-[50%]
    after:rounded-full after:bg-primary after:pb-[50%] after:content-[''] "
              >
<img
                  src="./app-screen-3.png"
                  className="w-[40%] translate-y-6 lg:translate-y-0"
                  alt="iPhone app preferences selection screen"
                />
              </div>

                <div className="step-text-box">
                <p className="mb-3 text-7xl font-semibold text-gray-200">
                  03
                </p>
                <h3 className="mb-8 text-xl font-semibold leading-10 tracking-[-0.5px]">
                      Receive confirmation on WhatsApp
                </h3>
                <p className="text-base leading-loose">
                  Upon successful storage of your crops, you'll instantly
                  receive a confirmation on WhatsApp. This ensures swift
                  acknowledgment and provides peace of mind, allowing you to
                  proceed confidently with the knowledge that your harvest is
                  securely stored and ready for future use.
                </p>
              </div>
            </div>

          </section>
      </>
  )
}

export default HowItWorks