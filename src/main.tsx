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
import ScrollToTop from "./components/common/ScrollToTop/ScrollToTop.tsx";
import ErrorBoundary from "./components/common/ErrorBoundary/ErrorBoundary.tsx";
import RouteLoadingFallback from "./components/common/Loading/RouteLoadingFallback.tsx";
import ERPLoadingFallback from "./components/common/Loading/ERPLoadingFallback.tsx";

// Lazy load components with optimized imports
const HomeScreen = lazy(() => import(/* @vitePreload */ "./screens/HomeScreen/HomeScreen.tsx"));
const StoreAdminSignup = lazy(() => import("./screens/Signup/StoreAdminSignup.tsx"));
const StoreAdminLogin = lazy(() => import("./screens/Login/StoreAdminLogin.tsx"));
const FarmerLogin = lazy(() => import("./screens/Login/FarmerLogin.tsx"));

// ERP screens with preloading
const DaybookScreen = lazy(() => import(/* @vitePreload */ "./screens/Erp/DaybookScreen.tsx"));
const PeopleScreen = lazy(() => import(/* @vitePreload */ "./screens/Erp/PeopleScreen.tsx"));
const FarmerProfileScreen = lazy(() => import("./screens/Erp/FarmerProfileScreen.tsx"));
const ColdStorageSummaryScreen = lazy(() => import(/* @vitePreload */ "./screens/Erp/ColdStorageSummaryScreen.tsx"));
const CustomAnalyticsScreen = lazy(() => import("./screens/Erp/CustomAnalyticsScreen.tsx"));
const VarietyBreakdownScreen = lazy(() => import("./screens/Erp/VarietyBreakdownScreen.tsx"));
const SettingsScreen = lazy(() => import("./screens/Erp/SettingsScreen.tsx"));
const ProfileSettingsScreen = lazy(() => import("./screens/Erp/ProfileSettingsScreen.tsx"));
const BillingSettingsScreen = lazy(() => import("./screens/Erp/BillingSettingsScreen.tsx"));
const ContactSupportScreen = lazy(() => import("./screens/Erp/ContactSupportScreen.tsx"));

// Form components - split into separate chunks
const IncomingOrderForm = lazy(() => import("./screens/Erp/IncomingOrderForm.tsx"));
const OutgoingOrderForm = lazy(() => import("./screens/Erp/OutgoingOrderForm.tsx"));
const EditIncomingOrderForm = lazy(() => import("./screens/Erp/EditIncomingOrderForm.tsx"));

// Public pages
const FAQ = lazy(() => import("./screens/FAQ/FAQ.tsx"));
const Support = lazy(() => import("./screens/Support/Support.tsx"));
const Privacy = lazy(() => import("./screens/Privacy/Privacy.tsx"));
const CaseStudies = lazy(() => import("./screens/CaseStudies/CaseStudies.tsx"));

// Optimized Query Client with better caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime in v5)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />} errorElement={<Error />}>
        <Route element={<PublicRoute />}>
          <Route index element={
            <ErrorBoundary>
              <Suspense fallback={<RouteLoadingFallback message="Loading Home..." />}>
                <HomeScreen />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="signup" element={
            <ErrorBoundary>
              <Suspense fallback={<RouteLoadingFallback message="Loading Signup..." />}>
                <StoreAdminSignup />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="signup/store-admin" element={
            <ErrorBoundary>
              <Suspense fallback={<RouteLoadingFallback message="Loading Signup..." />}>
                <StoreAdminSignup />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="login/store-admin" element={
            <ErrorBoundary>
              <Suspense fallback={<RouteLoadingFallback message="Loading Login..." />}>
                <StoreAdminLogin />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="login/farmer" element={
            <ErrorBoundary>
              <Suspense fallback={<RouteLoadingFallback message="Loading Farmer Login..." />}>
                <FarmerLogin />
              </Suspense>
            </ErrorBoundary>
          } />
        </Route>

        {/* Public pages */}
        <Route path="faq" element={
          <ErrorBoundary>
            <Suspense fallback={<RouteLoadingFallback message="Loading FAQ..." />}>
              <FAQ />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="support" element={
          <ErrorBoundary>
            <Suspense fallback={<RouteLoadingFallback message="Loading Support..." />}>
              <Support />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="privacy" element={
          <ErrorBoundary>
            <Suspense fallback={<RouteLoadingFallback message="Loading Privacy Policy..." />}>
              <Privacy />
            </Suspense>
          </ErrorBoundary>
        } />
        <Route path="case-studies" element={
          <ErrorBoundary>
            <Suspense fallback={<RouteLoadingFallback message="Loading Case Studies..." />}>
              <CaseStudies />
            </Suspense>
          </ErrorBoundary>
        } />

      <Route path="" element={<PrivateRoute />}>
        <Route path="erp" element={<ERPLayout />}>
          <Route path="daybook" element={
            <ErrorBoundary>
              <Suspense fallback={<ERPLoadingFallback section="Daybook" />}>
                <ScrollToTop />
                <DaybookScreen />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="people" element={
            <ErrorBoundary>
              <Suspense fallback={<ERPLoadingFallback section="People Management" />}>
                <PeopleScreen />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="people/:id" element={
            <ErrorBoundary>
              <Suspense fallback={<ERPLoadingFallback section="Farmer Profile" />}>
                <FarmerProfileScreen />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="analytics" element={
            <ErrorBoundary>
              <Suspense fallback={<ERPLoadingFallback section="Analytics Dashboard" />}>
                <ColdStorageSummaryScreen />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="custom-analytics" element={
            <ErrorBoundary>
              <Suspense fallback={<ERPLoadingFallback section="Custom Analytics" />}>
                <CustomAnalyticsScreen />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="variety-breakdown" element={
            <ErrorBoundary>
              <Suspense fallback={<ERPLoadingFallback section="Variety Breakdown" />}>
                <VarietyBreakdownScreen />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="incoming-order" element={
            <ErrorBoundary>
              <Suspense fallback={<ERPLoadingFallback section="Incoming Order Form" />}>
                <IncomingOrderForm />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="incoming-order/edit" element={
            <ErrorBoundary>
              <Suspense fallback={<ERPLoadingFallback section="Edit Incoming Order" />}>
                <EditIncomingOrderForm />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="outgoing-order" element={
            <ErrorBoundary>
              <Suspense fallback={<ERPLoadingFallback section="Outgoing Order Form" />}>
                <OutgoingOrderForm />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="settings" element={
            <ErrorBoundary>
              <Suspense fallback={<ERPLoadingFallback section="Settings" />}>
                <SettingsScreen />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="settings/profile" element={
            <ErrorBoundary>
              <Suspense fallback={<ERPLoadingFallback section="Profile Settings" />}>
                <ProfileSettingsScreen />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="settings/billing" element={
            <ErrorBoundary>
              <Suspense fallback={<ERPLoadingFallback section="Billing Settings" />}>
                <BillingSettingsScreen />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="settings/support" element={
            <ErrorBoundary>
              <Suspense fallback={<ERPLoadingFallback section="Contact Support" />}>
                <ContactSupportScreen />
              </Suspense>
            </ErrorBoundary>
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