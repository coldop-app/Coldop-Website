import { motion } from "motion/react";
import Navbar from "@/components/common/Navbar/Navbar";
import Footer from "../../components/common/Footer/Footer";
import Hero from "@/components/sections/Hero/Hero";
import HowItWorks from "@/components/sections/HowItWorks/HowItWorks";
// import Testimonials from "@/components/sections/Testimonials/Testimonials";
// import Pricing from "@/components/sections/Pricing/Pricing";
import DemoVideo from "@/components/sections/DemoVideo/DemoVideo";
// import About from "@/components/sections/About/About";
import SEO from "@/components/common/SEO/SEO";
import OnboardingWebview from "@/components/sections/OnboardingWebview/OnboardingWebview";
import { useEffect, useState } from "react";
import {
  heroData,
  howItWorksData,
  // testimonialsData,
  // pricingData,
  footerData
} from "../homeScreenData";
import { SEO_PAGES, getOrganizationStructuredData, getSoftwareApplicationStructuredData } from "@/utils/seo";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6, ease: "easeOut" }
};

const HomeScreen = () => {
  const [isWebview, setIsWebview] = useState(false);

  useEffect(() => {
    const checkWebview = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isWebView = 
        userAgent.includes('webview') ||
        userAgent.includes('wv') ||
        userAgent.includes('android') && userAgent.includes('version/') ||
        userAgent.includes('iphone') && !userAgent.includes('safari') ||
        userAgent.includes('ipad') && !userAgent.includes('safari') ||
        (window.navigator as any).standalone === true ||
        window.location.search.includes('webview=true') ||
        window.location.search.includes('app=true');
      
      setIsWebview(isWebView);
    };

    checkWebview();
  }, []);

  useEffect(() => {
    // Check if viewport meta tag exists
    let viewportMeta = document.querySelector('meta[name="viewport"]');

    // If it doesn't exist, create it
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      document.head.appendChild(viewportMeta);
    }

    // Set the content attribute to ensure proper mobile scaling
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');

    return () => {
      // Reset to default when component unmounts
      if (viewportMeta) {
        viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    };
  }, []);

 
  const combinedStructuredData = [
    SEO_PAGES.HOME.structuredData,
    getOrganizationStructuredData(),
    getSoftwareApplicationStructuredData(),
  ];

  
  if (isWebview) {
    return (
      <div>
        <SEO
          title={SEO_PAGES.HOME.title}
          description={SEO_PAGES.HOME.description}
          keywords={SEO_PAGES.HOME.keywords}
          url="https://coldop.com"
          type="website"
          structuredData={combinedStructuredData}
        />
        <OnboardingWebview />
      </div>
    );
  }

 
  return (
    <div>
      <SEO
        title={SEO_PAGES.HOME.title}
        description={SEO_PAGES.HOME.description}
        keywords={SEO_PAGES.HOME.keywords}
        url="https://coldop.com"
        type="website"
        structuredData={combinedStructuredData}
      />
      <Navbar />
      <motion.div
        id="hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        //className="w-full"
      >
        <Hero
          customerImages={heroData.customerImages}
          heroImage={heroData.heroImage}
        />
      </motion.div>
      <motion.div
        id="how-it-works"
        {...fadeInUp}
        //className="w-full"
      >
        <HowItWorks steps={howItWorksData.steps} />
      </motion.div>
      {/* <motion.div
        id="testimonials"
        {...fadeInUp}
        //className="w-full"
      >
        <Testimonials
          testimonials={testimonialsData.testimonials}
          galleryImages={testimonialsData.galleryImages}
        />
      </motion.div> */}
      <motion.div
        id="demo"
        {...fadeInUp}
        //className="w-full"
      >
        <DemoVideo />
      </motion.div>
{/*
      <motion.div
        id="pricing"
        {...fadeInUp}
        //className="w-full"
      >
        <Pricing plans={pricingData.plans} />
      </motion.div> */}

      {/* <motion.div
        id="about"
        {...fadeInUp}
        //className="w-full"
      >
        <About />
      </motion.div> */}

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        //className="w-full"
      >
        <Footer {...footerData} />
      </motion.div>
    </div>
  );
};

export default HomeScreen;