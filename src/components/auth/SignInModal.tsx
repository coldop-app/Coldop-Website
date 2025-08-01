import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/modal";

interface SignInModalProps {
  isOpen: boolean;
  isMobileApp: boolean;
  onClose: () => void;
}

const SignInModal = ({ isOpen, onClose, isMobileApp=false }: SignInModalProps) => {
  const { t } = useTranslation();
  const [selectedRole, setSelectedRole] = useState<"farmer" | "store-admin" | null>(null);

  return isMobileApp ? (
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */} 
        
        
        {/* Main Content */}
        <div className="flex-1  mx-2  p-8 flex flex-col items-center">
                     <h1 className="text-2xl font-medium text-gray-800 mb-12 text-center">
             Pick your role
           </h1>
          
                     {/* Store Manager Option */}
           <Link
             to="/login/store-admin"
             className="w-full max-w-sm mb-1 p-6 transition-all cursor-pointer block rounded-xl"
             onClick={onClose}
           >
                         {/* Store manager image */}
             <div className="w-full h-48 rounded-lg mb-6 overflow-hidden">
               <img 
                 src="/store-owner.png" 
                 alt="Store Manager" 
                 className="w-full h-full object-cover"
               />
             </div>
                         <h3 className="text-base font-medium text-gray-800 text-center">
               I'm a Store Manager
             </h3>
                         {/* {selectedRole === "store-admin" && (
               <div className="absolute top-4 right-4">
                 <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                     <polyline points="20,6 9,17 4,12"></polyline>
                   </svg>
                 </div>
               </div>
             )} */}
           </Link>
          
          {/* OR Divider */}
          <div className="flex items-center w-full max-w-sm mb-4">
            <div className="flex-1 h-px bg-gray-300"></div>
                         <span className="px-4 text-gray-500 text-xs font-normal">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          
                     {/* Farmer Option */}
           <Link
             to="/login/farmer"
             className="w-full max-w-sm mb-8 p-6 transition-all cursor-pointer block rounded-xl relative"
             onClick={onClose}
           >
            {/* "Currently in progress" label */}
           
            
                         {/* Farmer image */}
             <div className="w-full h-48 rounded-lg mb-6 overflow-hidden">
               <img 
                 src="/farmer.png" 
                 alt="Farmer" 
                 className="w-full h-full object-cover"
               />
             </div>
                         <h3 className="text-base font-medium text-gray-800 text-center">
               I'm a Farmer
             </h3>
                         {/* {selectedRole === "farmer" && (
               <div className="absolute top-4 right-4">
                 <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                     <polyline points="20,6 9,17 4,12"></polyline>
                   </svg>
                 </div>
               </div>
             )} */}
           </Link>
          
          
        </div>
      </div>
    ) : (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-center text-2xl font-bold">{t('signInModal.title')}</DialogTitle>
          <DialogDescription className="text-center pt-2">
            {t('signInModal.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <button
            onClick={() => setSelectedRole("farmer")}
            className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
              selectedRole === "farmer"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M20 22v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="8" r="4"></circle>
              </svg>
            </div>
            <span className="font-medium text-lg">{t('signInModal.farmer')}</span>
          </button>

          <button
            onClick={() => setSelectedRole("store-admin")}
            className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all ${
              selectedRole === "store-admin"
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
          >
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <span className="font-medium text-lg">{t('signInModal.storeAdmin')}</span>
          </button>
        </div>

        <div className="mt-4 flex justify-center">
          {selectedRole && (
            <Link
              to={`/login/${selectedRole}`}
              className="font-custom inline-block cursor-pointer rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-secondary no-underline duration-100 hover:bg-primary/85 hover:text-secondary w-full text-center"
              onClick={onClose}
            >
              {t('signInModal.continue')}
            </Link>
          )}
        </div>

        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">{t('signInModal.noAccount')}</span>{" "}
          <Link
            to="/signup"
            className="text-primary hover:underline font-medium"
            onClick={onClose}
          >
            {t('signInModal.signUp')}
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignInModal;