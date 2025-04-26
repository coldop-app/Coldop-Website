import Navbar from "@/components/common/Navbar";
import Footer from "../../components/common/Footer";
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

const HomeScreen = () => {
  return (
    <>
      <Navbar />
      <Hero {...heroData} />
      <HowItWorks {...howItWorksData}/>
      <Testimonials {...testimonialsData} />
      <Pricing {...pricingData} />
      <About/>
      <Footer {...footerData}/>
    </> 
  );
};

export default HomeScreen;