import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/modal";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SignInModal = ({ isOpen, onClose }: SignInModalProps) => {
  const [selectedRole, setSelectedRole] = useState<"farmer" | "store-admin" | null>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-center text-2xl font-bold">Sign in as</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Choose your account type to sign in
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
            <span className="font-medium text-lg">Farmer</span>
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
            <span className="font-medium text-lg">Store Admin</span>
          </button>
        </div>

        <div className="mt-4 flex justify-center">
          {selectedRole && (
            <Link
              to={`/login/${selectedRole}`}
              className="font-custom inline-block cursor-pointer rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-secondary no-underline duration-100 hover:bg-primary/85 hover:text-secondary w-full text-center"
              onClick={onClose}
            >
              Continue
            </Link>
          )}
        </div>

        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">Don't have an account?</span>{" "}
          <Link
            to="/signup"
            className="text-primary hover:underline font-medium"
            onClick={onClose}
          >
            Sign up
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignInModal;