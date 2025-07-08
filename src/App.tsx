import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import CookieBanner from "./components/common/CookieBanner/CookieBanner";
//import { useWebViewAuth } from "./hooks/use-mobile";
import './i18n';

const App = () => {
  //useWebViewAuth();

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Outlet />
      <CookieBanner />
    </>
  );
};

export default App;