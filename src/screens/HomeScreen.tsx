import Navbar from "@/components/common/Navbar";
import Footer from "../components/common/Footer";
import Hero from "@/components/sections/Hero/Hero";
import HowItWorks from "@/components/sections/HowItWorks/HowItWorks";
import Testimonials from "@/components/sections/Testimonials/Testimonials";
import Pricing from "@/components/sections/Pricing/Pricing";
import About from "@/components/sections/About/About";

const HomeScreen = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <About/>
      <Footer/>
    </> 
  );
};

export default HomeScreen