import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import './i18n';

const App = () => {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Outlet />
    </>
  );
};

export default App;