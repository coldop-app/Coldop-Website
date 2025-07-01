import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
//import { useWebViewAuth } from "./hooks/use-mobile";
import './i18n';

const App = () => {
  //useWebViewAuth();

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Outlet />
    </>
  );
};

export default App;