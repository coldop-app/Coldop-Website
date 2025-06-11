import Navbar from "@/components/common/Navbar/Navbar";
import Footer from "@/components/common/Footer/Footer";
import FarmerLoginForm from "@/components/auth/FarmerLoginForm";
import { footerData } from "../homeScreenData";

const FarmerLogin = () => {
  return (
    <>
      <Navbar />
      <div className="py-16 px-4 bg-secondary min-h-screen">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-3">Farmer Login</h1>
            <p className="text-muted-foreground">
              Sign in to track your stored crops and inventory
            </p>
          </div>

          <FarmerLoginForm />
        </div>
      </div>
      <Footer {...footerData} />
    </>
  );
};

export default FarmerLogin;