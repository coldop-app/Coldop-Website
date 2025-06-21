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
import ERPLayout from "./components/layouts/ERPLayout.tsx";
import NotFound from "./screens/NotFound/NotFound";
import Error from "./screens/Error/Error";
import IncomingOrderForm from "./screens/Erp/IncomingOrderForm.tsx";
import OutgoingOrderForm from "./screens/Erp/OutgoingOrderForm.tsx";
import EditIncomingOrderForm from "./screens/Erp/EditIncomingOrderForm.tsx";

// Lazy load components
const HomeScreen = lazy(() => import("./screens/HomeScreen/HomeScreen.tsx"));
const StoreAdminSignup = lazy(() => import("./screens/Signup/StoreAdminSignup.tsx"));
const StoreAdminLogin = lazy(() => import("./screens/Login/StoreAdminLogin.tsx"));
const FarmerLogin = lazy(() => import("./screens/Login/FarmerLogin.tsx"));
const DaybookScreen = lazy(() => import("./screens/Erp/DaybookScreen.tsx"));
const PeopleScreen = lazy(() => import("./screens/Erp/PeopleScreen.tsx"));
const FarmerProfileScreen = lazy(() => import("./screens/Erp/FarmerProfileScreen.tsx"));
const ColdStorageSummaryScreen = lazy(() => import("./screens/Erp/ColdStorageSummaryScreen.tsx"));
const SettingsScreen = lazy(() => import("./screens/Erp/SettingsScreen.tsx"));
const ProfileSettingsScreen = lazy(() => import("./screens/Erp/ProfileSettingsScreen.tsx"));
const BillingSettingsScreen = lazy(() => import("./screens/Erp/BillingSettingsScreen.tsx"));
const ContactSupportScreen = lazy(() => import("./screens/Erp/ContactSupportScreen.tsx"));

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
    <Route path="/" element={<App />} errorElement={<Error />}>
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
      <Route path="" element={<PrivateRoute />}>
        <Route path="erp" element={<ERPLayout />}>
          <Route path="daybook" element={
            <Suspense fallback={<LoadingFallback />}>
              <DaybookScreen />
            </Suspense>
          } />
          <Route path="people" element={
            <Suspense fallback={<LoadingFallback />}>
              <PeopleScreen />
            </Suspense>
          } />
          <Route path="people/:id" element={
            <Suspense fallback={<LoadingFallback />}>
              <FarmerProfileScreen />
            </Suspense>
          } />
          <Route path="analytics" element={
            <Suspense fallback={<LoadingFallback />}>
              <ColdStorageSummaryScreen />
            </Suspense>
          } />
          <Route path="incoming-order" element={
            <Suspense fallback={<LoadingFallback />}>
              <IncomingOrderForm />
            </Suspense>
          } />
          <Route path="incoming-order/edit" element={
            <Suspense fallback={<LoadingFallback />}>
              <EditIncomingOrderForm />
            </Suspense>
          } />
          <Route path="outgoing-order" element={
            <Suspense fallback={<LoadingFallback />}>
              <OutgoingOrderForm />
            </Suspense>
          } />
          <Route path="settings" element={
            <Suspense fallback={<LoadingFallback />}>
              <SettingsScreen />
            </Suspense>
          } />
          <Route path="settings/profile" element={
            <Suspense fallback={<LoadingFallback />}>
              <ProfileSettingsScreen />
            </Suspense>
          } />
          <Route path="settings/billing" element={
            <Suspense fallback={<LoadingFallback />}>
              <BillingSettingsScreen />
            </Suspense>
          } />
          <Route path="settings/support" element={
            <Suspense fallback={<LoadingFallback />}>
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
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);