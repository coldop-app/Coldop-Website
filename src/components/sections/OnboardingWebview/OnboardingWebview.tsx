import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import SignInModal from "@/components/auth/SignInModal";
import LanguageSelector from "@/components/common/LanguageSelector/LanguageSelector";
import { Link } from "react-router-dom";

const OnboardingWebview = () => {
  const { t } = useTranslation();
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);

  const openSignInModal = () => {
    setIsSignInModalOpen(true);
  };


  const closeSignInModal = () => {
    setIsSignInModalOpen(false);
  };

  const side = 'right';

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-8">
      {/* Main Content Container */}
      { !isSignInModalOpen && <div className="flex flex-col items-center justify-center max-w-md w-full space-y-8">
        
        {/* Welcome Text */}
        <div className="text-center">
          <h1 className="font-custom text-4xl sm:text-5xl font-bold text-gray-800 leading-tight">
            Welcome<br />Onboard
          </h1>
        </div>

        {/* Logo Section */}
        <div className="flex items-center justify-center">
            {/* Outer ring */}
              {/* Inner logo container */}
                <img 
                  src="/coldop-logo.png" 
                  alt="Coldop Logo" 
                  className="w-50 h-50 sm:w-24 sm:h-24"
                />
              
              {/* Top curved text */}
              {/* <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                <div className="text-xs font-medium text-gray-600 tracking-wider">
                  OPTIMIZING YOUR STORAGE
                </div>
              </div> */}
              
              {/* Bottom text */}
              {/* <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                <div className="text-xs font-medium text-gray-600 tracking-wider">
                  ESTD. 2023
                </div>
              </div>
              
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="text-lg font-bold text-gray-700 tracking-wide">
                  COLDOP
                </div>
              </div> */}
        </div>

        {/* Tagline */}
        <div className="text-center">
          <p className="font-custom text-xl sm:text-2xl font-semibold text-gray-700">
            Your Cold Storage, Reimagined.
          </p>
        </div>

        {/* Get Started Button */}
        <div className="w-full pt-8">
          <Sheet>
            <SheetTrigger asChild>
              <button onClick={openSignInModal} className="w-full font-custom inline-flex items-center justify-center cursor-pointer rounded-lg bg-primary px-8 py-4 text-xl font-bold text-secondary no-underline duration-100 hover:bg-primary/90 hover:text-secondary">
                Get Started Now!
              </button>
            </SheetTrigger>
            
          </Sheet>
        </div>
      </div>}

      {/* Sign In Modal */}
     {isSignInModalOpen && <SignInModal isOpen={isSignInModalOpen} isMobileApp={true} onClose={closeSignInModal} />}
    </div>
  );
};

export default OnboardingWebview; 