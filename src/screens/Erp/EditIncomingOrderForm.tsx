import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TopBar from "@/components/common/Topbar/Topbar";
import EditIncomingOrderFormContent from "./forms/EditIncomingOrderFormContent";

const EditIncomingOrderForm = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
    const order = location.state?.order;

    console.log(order);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // If no order data is provided, redirect to daybook
  const navigate = useNavigate();
  if (!order) {
    navigate('/erp/daybook');
    return null;
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <TopBar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={toggleSidebar}
        title="Edit Incoming Order"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <EditIncomingOrderFormContent order={order} />
        </div>
      </div>
    </div>
  );
};

export default EditIncomingOrderForm;