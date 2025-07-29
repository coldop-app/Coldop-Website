import { motion } from "motion/react";
import { useState } from "react";
import SignInModal from "@/components/auth/SignInModal";

const DemoVideo = () => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  const handlePlayVideo = () => {
    setIsVideoLoaded(true);
  };

  return (
    <section
      className="py-20 sm:py-32 w-full bg-gradient-to-b from-white via-secondary/30 to-white relative overflow-hidden"
      id="demo"
    >
      {/* Subtle background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-50"></div>

      <div className="container relative mx-auto max-w-[75rem] px-8 sm:px-24">
        {/* Header */}
        <motion.div
          className="text-center mb-16 sm:mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.span
            className="mb-6 block text-base font-medium uppercase tracking-[0.075rem] text-foreground"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            See It In Action
          </motion.span>
          <motion.h2
            className="mb-8 text-4xl font-bold tracking-tighter text-[#333] md:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            Watch Our Demo
          </motion.h2>
          <motion.p
            className="mx-auto max-w-[50rem] text-lg text-[#6f6f6f] leading-[1.8]"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            Discover how Coldop simplifies cold storage management. Watch our
            comprehensive demo to see all features in action.
          </motion.p>
        </motion.div>

        {/* Video Container */}
        <motion.div
          className="relative mx-auto max-w-4xl"
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        >
          <div className="relative overflow-hidden rounded-[11px] shadow-2xl bg-gray-900 hover:shadow-3xl transition-shadow duration-500">
            {/* Video Thumbnail/Iframe */}
            {!isVideoLoaded ? (
              <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-primary/5">
                {/* Thumbnail Image (placeholder) */}
                <div className="absolute inset-0 bg-gray-900/20 flex items-center justify-center">
                  <img
                    src="https://img.youtube.com/vi/VGvGvVX_LBY/maxresdefault.jpg"
                    alt="Demo Video Thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.button
                    onClick={handlePlayVideo}
                    className="group relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-white/90 hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 text-primary ml-1 group-hover:text-primary/80 transition-colors"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </motion.button>
                </div>

                {/* Video Duration Badge */}
                <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded-md">
                  Demo Video
                </div>
              </div>
            ) : (
              <div className="aspect-video">
                <iframe
                  src="https://www.youtube.com/embed/VGvGvVX_LBY?autoplay=1&rel=0&modestbranding=1"
                  title="Coldop Demo Video"
                  className="w-full h-full rounded-[11px]"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          {/* Video Details */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <motion.h3
              className="text-2xl font-semibold mb-4 text-[#333]"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Complete Platform Overview
            </motion.h3>
            <motion.p
              className="text-[#6f6f6f] leading-relaxed max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              This comprehensive demo showcases how farmers and cold storage
              managers can streamline their operations, track inventory, and
              manage transactions efficiently with Coldop.
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16 sm:mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <motion.p
            className="text-lg text-[#6f6f6f] mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            Ready to transform your cold storage management?
          </motion.p>
          <motion.a
            href="#pricing"
            className="font-custom inline-block cursor-pointer rounded-lg bg-primary px-8 py-4 text-xl font-semibold text-secondary hover:bg-primary/85 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            onClick={(e) => {
              e.preventDefault();
              setIsSignInModalOpen(true);
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 1.2 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started Today
          </motion.a>
        </motion.div>
      </div>
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        isMobileApp={false}
      />
    </section>
  );
};

export default DemoVideo;