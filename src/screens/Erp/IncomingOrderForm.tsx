import { useState } from "react";
import TopBar from "@/components/common/Topbar/Topbar";
import IncomingOrderFormContent from "@/screens/Erp/forms/IncomingOrderFormContent";

const IncomingOrderForm = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <TopBar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={toggleSidebar}
        title="Create Incoming Order"
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