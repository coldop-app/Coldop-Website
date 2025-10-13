import { useState, Suspense, lazy } from "react";
import { useTranslation } from 'react-i18next';
import TopBar from "@/components/common/Topbar/Topbar";
import Loader from "@/components/common/Loader/Loader";

// Lazy load the heavy form content component
const OutgoingOrderFormContent = lazy(() => import("./forms/OutgoingOrderFormContent"));

const OutgoingOrderForm = () => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <TopBar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={toggleSidebar}
        title={t('outgoingOrder.title')}
      />

      <div className="w-full px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-5xl mx-auto">
          <Suspense fallback={<Loader />}>
            <OutgoingOrderFormContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default OutgoingOrderForm;