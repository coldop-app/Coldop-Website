import { useState } from "react";
import { useTranslation } from 'react-i18next';
import TopBar from "@/components/common/Topbar/Topbar";
// import ShedVoucherFormContent from "./forms/ShedVoucherFormContent";

const ShedVoucherForm = () => {
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
        title={t('shedVoucher.title')}
      />

      <div className="w-full px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-5xl mx-auto">
          {/* <ShedVoucherFormContent /> */}
        </div>
      </div>
    </div>
  );
};

export default ShedVoucherForm;
