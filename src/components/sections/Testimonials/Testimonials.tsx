const Testimonials = () => {
  return (
    <>
      <section
        className="mt-24 grid grid-cols-1 items-center gap-x-16 gap-y-24 bg-secondary lg:grid-cols-2"
        id="testimonials"
      >
        <div className="testimonials-container  px-8  py-24 lg:px-28 lg:py-44">
          <span className="subheading mb-4 block text-base font-medium uppercase tracking-[0.075rem] text-foreground lg:text-lg">
            Testimonials
          </span>
          <h2 className="heading-secondary mb-8 text-3xl font-bold tracking-tighter text-[#333] md:text-5xl">
            Once you try it, you won't go back to the old ways.
          </h2>

          <div className="testimonials grid grid-cols-1 gap-x-20 gap-y-12 md:grid-cols-2 ">
            <figure className="testimonial">
              <img
                className="testimonial-img mb-3 w-16 rounded-full "
                alt="Photo of customer Dave Bryson"
                src="./customers/dave.jpg"
              />
              <blockquote className="testimonial-text mb-4 text-base leading-[1.8] ">
                Affordable, nutritious, and deliciously preserved crops, without
                the need for manual handling! It's like experiencing a frosty
                enchantment for your harvest.
              </blockquote>
              <p className="testimonial-name text-base text-[#6f6f6f]">
                &mdash; Dave Bryson
              </p>
            </figure>

            <figure className="testimonial">
              <img
                className="testimonial-img mb-3 w-16 rounded-full "
                alt="Photo of customer Ben Hadley"
                src="./customers/ben.jpg"
              />
              <blockquote className="testimonial-text mb-4 text-base leading-[1.8] ">
                The cold storage app is remarkably efficient, selecting the
                optimal crops every time. It's incredible to be free from
                concerns about crop preservation!
              </blockquote>
              <p className="testimonial-name text-base text-[#6f6f6f]">
                &mdash; Ben Hadley
              </p>
            </figure>

            <figure className="testimonial">
              <img
                className="testimonial-img mb-3 w-16 rounded-full "
                alt="Photo of customer Steve Miller"
                src="./customers/steve.jpg"
              />
              <blockquote className="testimonial-text mb-4 text-base leading-[1.8] ">
                ChillHarbor, the cold storage app, is a game-changer! It
                streamlines my crop storage, making it effortless and ensuring
                my produce stays fresh. Truly a lifesaver!"
              </blockquote>
              <p className="testimonial-name text-base text-[#6f6f6f]">
                &mdash; Steve Miller
              </p>
            </figure>

            <figure className="testimonial">
              <img
                className="testimonial-img mb-3 w-16 rounded-full "
                alt="Photo of customer Hannah Smith"
                src="./customers/hannah.jpg"
              />
              <blockquote className="testimonial-text mb-4 text-base leading-[1.8] ">
                ChillHarbor is a crop storage gem! Stress-free and efficient,
                it's the perfect companion for modern farmers, allowing focus on
                other farm aspects.
              </blockquote>
              <p className="testimonial-name text-base text-[#6f6f6f]">
                &mdash; Hannah Smith
              </p>
            </figure>
          </div>
        </div>

        <div className="gallery grid grid-cols-4 gap-8 p-4 sm:grid-rows-2 md:grid-cols-6  md:grid-rows-2 md:gap-[1.2rem] lg:grid-cols-2 xl:grid-cols-3">
          <figure className="gallery-item duration-400 block w-full overflow-hidden transition-all hover:scale-110 ">
            <img
              src="./gallery/gallery-1.jpg"
              alt="Photo of beautifully
            arranged food"
            />
            {/* <!-- <figcaption>Caption</figcaption> --> */}
          </figure>
          <figure className="gallery-item duration-400 block w-full overflow-hidden transition-all hover:scale-110 ">
            <img
              src="./gallery/gallery-2.jpg"
              alt="Photo of beautifully
            arranged food"
            />
          </figure>
          <figure className="gallery-item duration-400 block w-full overflow-hidden transition-all hover:scale-110">
            <img
              src="./gallery/gallery-3.jpg"
              alt="Photo of beautifully
            arranged food"
            />
          </figure>
          <figure className="gallery-item duration-400 block w-full overflow-hidden transition-all hover:scale-110">
            <img
              src="./gallery/gallery-4.jpg"
              alt="Photo of beautifully
            arranged food"
            />
          </figure>
          <figure className="gallery-item duration-400 block w-full overflow-hidden transition-all hover:scale-110">
            <img
              src="./gallery/gallery-5.jpg"
              alt="Photo of beautifully
            arranged food"
            />
          </figure>
          <figure className="gallery-item duration-400 block w-full overflow-hidden transition-all hover:scale-110">
            <img
              src="./gallery/gallery-6.jpg"
              alt="Photo of beautifully
            arranged food"
            />
          </figure>
          <figure className="gallery-item duration-400 block w-full overflow-hidden transition-all hover:scale-110">
            <img
              src="./gallery/gallery-7.jpg"
              alt="Photo of beautifully
            arranged food"
            />
          </figure>
          <figure className="gallery-item duration-400 block w-full overflow-hidden transition-all hover:scale-110">
            <img
              src="./gallery/gallery-8.jpg"
              alt="Photo of beautifully
            arranged food"
            />
          </figure>
          <figure className="gallery-item duration-400 block w-full overflow-hidden transition-all hover:scale-110">
            <img
              src="./gallery/gallery-9.jpg"
              alt="Photo of beautifully
            arranged food"
            />
          </figure>
          <figure className="gallery-item duration-400 block w-full overflow-hidden transition-all hover:scale-110">
            <img
              src="./gallery/gallery-10.jpg"
              alt="Photo of beautifully
            arranged food"
            />
          </figure>
          <figure className="gallery-item duration-400 block w-full overflow-hidden transition-all hover:scale-110">
            <img
              src="./gallery/gallery-11.jpg"
              alt="Photo of beautifully
            arranged food"
            />
          </figure>
          <figure className="gallery-item duration-400 block w-full overflow-hidden transition-all hover:scale-110">
            <img
              src="./gallery/gallery-12.jpg"
              alt="Photo of beautifully
            arranged food"
            />
          </figure>
        </div>
      </section>
    </>
  );
};

export default Testimonials;
