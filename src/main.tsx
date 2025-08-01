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
import { HelmetProvider } from "react-helmet-async";
import store from "./store.ts";
import "./index.css";
import App from "./App.tsx";
import PrivateRoute from "./components/auth/PrivateRoute.tsx";
import PublicRoute from "./components/auth/PublicRoute.tsx";
import ERPLayout from "./components/layouts/ERPLayout.tsx";
import NotFound from "./screens/NotFound/NotFound";
import Error from "./screens/Error/Error";
import IncomingOrderForm from "./screens/Erp/IncomingOrderForm.tsx";
import OutgoingOrderForm from "./screens/Erp/OutgoingOrderForm.tsx";
import EditIncomingOrderForm from "./screens/Erp/EditIncomingOrderForm.tsx";
import EnhancedLoadingFallback from "./components/common/Shimmer/EnhancedLoadingFallback.tsx";

// Lazy load components
const HomeScreen = lazy(() => import("./screens/HomeScreen/HomeScreen.tsx"));
const StoreAdminSignup = lazy(() => import("./screens/Signup/StoreAdminSignup.tsx"));
const StoreAdminLogin = lazy(() => import("./screens/Login/StoreAdminLogin.tsx"));
const FarmerLogin = lazy(() => import("./screens/Login/FarmerLogin.tsx"));
const DaybookScreen = lazy(() => import("./screens/Erp/DaybookScreen.tsx"));
const PeopleScreen = lazy(() => import("./screens/Erp/PeopleScreen.tsx"));
const FarmerProfileScreen = lazy(() => import("./screens/Erp/FarmerProfileScreen.tsx"));
const ColdStorageSummaryScreen = lazy(() => import("./screens/Erp/ColdStorageSummaryScreen.tsx"));
const VarietyBreakdownScreen = lazy(() => import("./screens/Erp/VarietyBreakdownScreen.tsx"));
const SettingsScreen = lazy(() => import("./screens/Erp/SettingsScreen.tsx"));
const ProfileSettingsScreen = lazy(() => import("./screens/Erp/ProfileSettingsScreen.tsx"));
const BillingSettingsScreen = lazy(() => import("./screens/Erp/BillingSettingsScreen.tsx"));
const ContactSupportScreen = lazy(() => import("./screens/Erp/ContactSupportScreen.tsx"));

// New pages
const FAQ = lazy(() => import("./screens/FAQ/FAQ.tsx"));
const Support = lazy(() => import("./screens/Support/Support.tsx"));
const Privacy = lazy(() => import("./screens/Privacy/Privacy.tsx"));
const CaseStudies = lazy(() => import("./screens/CaseStudies/CaseStudies.tsx"));

// Loading component for non-ERP routes
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Initialize the Query Client
const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />} errorElement={<Error />}>
        <Route element={<PublicRoute />}>
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

        {/* Public pages */}
        <Route path="faq" element={
          <Suspense fallback={<LoadingFallback />}>
            <FAQ />
          </Suspense>
        } />
        <Route path="support" element={
          <Suspense fallback={<LoadingFallback />}>
            <Support />
          </Suspense>
        } />
        <Route path="privacy" element={
          <Suspense fallback={<LoadingFallback />}>
            <Privacy />
          </Suspense>
        } />
        <Route path="case-studies" element={
          <Suspense fallback={<LoadingFallback />}>
            <CaseStudies />
          </Suspense>
        } />

      <Route path="" element={<PrivateRoute />}>
        <Route path="erp" element={<ERPLayout />}>
          <Route path="daybook" element={
            <Suspense fallback={<EnhancedLoadingFallback />}>
              <DaybookScreen />
            </Suspense>
          } />
          <Route path="people" element={
            <Suspense fallback={<EnhancedLoadingFallback />}>
              <PeopleScreen />
            </Suspense>
          } />
          <Route path="people/:id" element={
            <Suspense fallback={<EnhancedLoadingFallback />}>
              <FarmerProfileScreen />
            </Suspense>
          } />
          <Route path="analytics" element={
            <Suspense fallback={<EnhancedLoadingFallback />}>
              <ColdStorageSummaryScreen />
            </Suspense>
          } />
          <Route path="variety-breakdown" element={
            <Suspense fallback={<EnhancedLoadingFallback />}>
              <VarietyBreakdownScreen />
            </Suspense>
          } />
          <Route path="incoming-order" element={
            <Suspense fallback={<EnhancedLoadingFallback />}>
              <IncomingOrderForm />
            </Suspense>
          } />
          <Route path="incoming-order/edit" element={
            <Suspense fallback={<EnhancedLoadingFallback />}>
              <EditIncomingOrderForm />
            </Suspense>
          } />
          <Route path="outgoing-order" element={
            <Suspense fallback={<EnhancedLoadingFallback />}>
              <OutgoingOrderForm />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<EnhancedLoadingFallback />}>
              <SettingsScreen />
            </Suspense>
          } />
          <Route path="settings/profile" element={
            <Suspense fallback={<EnhancedLoadingFallback />}>
              <ProfileSettingsScreen />
            </Suspense>
          } />
          <Route path="settings/billing" element={
            <Suspense fallback={<EnhancedLoadingFallback />}>
              <BillingSettingsScreen />
            </Suspense>
          } />
          <Route path="settings/support" element={
            <Suspense fallback={<EnhancedLoadingFallback />}>
              <ContactSupportScreen />
            </Suspense>
          } />
          {/* Add more ERP routes here */}
        </Route>

      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </Provider>
    </HelmetProvider>
  </StrictMode>
);