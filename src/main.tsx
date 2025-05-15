import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import store from "./store.ts";
import "./index.css";
import App from "./App.tsx";
import HomeScreen from "./screens/HomeScreen/HomeScreen.tsx";
import StoreAdminSignup from "./screens/Signup/StoreAdminSignup.tsx";
import StoreAdminLogin from "./screens/Login/StoreAdminLogin.tsx";
import FarmerLogin from "./screens/Login/FarmerLogin.tsx";

// Initialize the Query Client
const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route index element={<HomeScreen />} />
      <Route path="signup" element={<StoreAdminSignup />} />
      <Route path="signup/store-admin" element={<StoreAdminSignup />} />
      <Route path="login/store-admin" element={<StoreAdminLogin />} />
      <Route path="login/farmer" element={<FarmerLogin />} />
    </Route>
  )
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);