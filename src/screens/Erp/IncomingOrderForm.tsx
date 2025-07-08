import { useState } from "react";
import { useTranslation } from 'react-i18next';
import TopBar from "@/components/common/Topbar/Topbar";
import IncomingOrderFormContent from "@/screens/Erp/forms/IncomingOrderFormContent";

const IncomingOrderForm = () => {
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
        title={t('incomingOrder.title')}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <IncomingOrderFormContent />
        </div>
      </div>
    </div>
  );
};

export default IncomingOrderForm;