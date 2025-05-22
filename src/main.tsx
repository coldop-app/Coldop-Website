import { StrictMode, Suspense, lazy } from "react";
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
import PrivateRoute from "./components/auth/PrivateRoute.tsx";
import PublicRoute from "./components/auth/PublicRoute.tsx";
import ERPLayout from "./components/layouts/ERPLayout.tsx";

// Lazy load components
const HomeScreen = lazy(() => import("./screens/HomeScreen/HomeScreen.tsx"));
const StoreAdminSignup = lazy(() => import("./screens/Signup/StoreAdminSignup.tsx"));
const StoreAdminLogin = lazy(() => import("./screens/Login/StoreAdminLogin.tsx"));
const FarmerLogin = lazy(() => import("./screens/Login/FarmerLogin.tsx"));
const DaybookScreen = lazy(() => import("./screens/Erp/DaybookScreen.tsx"));

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Initialize the Query Client
const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="" element={<PublicRoute />}>
        <Route index element={
          <Suspense fallback={<LoadingFallback />}>
            <HomeScreen />
          </Suspense>
        } />
        <Route path="signup" element={
          <Suspense fallback={<LoadingFallback />}>
            <StoreAdminSignup />
          </Suspense>
        } />
        <Route path="signup/store-admin" element={
          <Suspense fallback={<LoadingFallback />}>
            <StoreAdminSignup />
          </Suspense>
        } />
        <Route path="login/store-admin" element={
          <Suspense fallback={<LoadingFallback />}>
            <StoreAdminLogin />
          </Suspense>
        } />
        <Route path="login/farmer" element={
          <Suspense fallback={<LoadingFallback />}>
            <FarmerLogin />
          </Suspense>
        } />
      </Route>
      <Route path="" element={<PrivateRoute />}>
        <Route path="erp" element={<ERPLayout />}>
          <Route path="daybook" element={
            <Suspense fallback={<LoadingFallback />}>
              <DaybookScreen />
            </Suspense>
          } />
          {/* Add more ERP routes here */}
        </Route>
      </Route>
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