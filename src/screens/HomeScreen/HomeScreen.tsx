import { motion } from "motion/react";
import Navbar from "@/components/common/Navbar/Navbar";
import Footer from "../../components/common/Footer/Footer";
import Hero from "@/components/sections/Hero/Hero";
import HowItWorks from "@/components/sections/HowItWorks/HowItWorks";
import Testimonials from "@/components/sections/Testimonials/Testimonials";
import Pricing from "@/components/sections/Pricing/Pricing";
import About from "@/components/sections/About/About";
import {
  heroData,
  howItWorksData,
  testimonialsData,
  pricingData,
  footerData
} from "../homeScreenData";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: "easeOut" }
};

const HomeScreen = () => {
  return (
    <>
      <Navbar />
      <motion.div
        id="hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <Hero 
          customerImages={heroData.customerImages}
          heroImage={heroData.heroImage}
        />
      </motion.div>
      <motion.div
        id="how-it-works"
        {...fadeInUp}
      >
        <HowItWorks steps={howItWorksData.steps} />
      </motion.div>
      <motion.div
        id="testimonials"
        {...fadeInUp}
      >
        <Testimonials 
          testimonials={testimonialsData.testimonials}
          galleryImages={testimonialsData.galleryImages}
        />
      </motion.div>
      <motion.div
        id="pricing"
        {...fadeInUp}
      >
        <Pricing plans={pricingData.plans} />
      </motion.div>
      <motion.div
        id="about"
        {...fadeInUp}
      >
        <About/>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Footer {...footerData}/>
      </motion.div>
    </>
  );
};

export default HomeScreen;