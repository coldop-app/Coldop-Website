import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import TopBar from "@/components/common/Topbar/Topbar";
import OutgoingOrderFormContent from "./forms/OutgoingOrderFormContent";

const OutgoingOrderForm = () => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "";
  const [shedCost, setShedCost] = useState<number>(0);
  const [isShedCostDialogOpen, setIsShedCostDialogOpen] = useState(false);
  const [shedCostInput, setShedCostInput] = useState<string>("");

  // Open dialog when type is "shed"
  useEffect(() => {
    if (type === "shed") {
      setIsShedCostDialogOpen(true);
    }
  }, [type]);

  const handleShedCostSubmit = () => {
    const cost = parseFloat(shedCostInput);
    if (isNaN(cost) || cost < 0) {
      return;
    }
    setShedCost(cost);
    setIsShedCostDialogOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <TopBar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={toggleSidebar}
        title={t("outgoingOrder.title")}
      />

      <div className="w-full px-2 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="w-full max-w-[95%] sm:max-w-[90%] md:max-w-5xl mx-auto">
          <OutgoingOrderFormContent shedCost={shedCost} />
        </div>
      </div>

      {/* Shed Cost Dialog */}
      {isShedCostDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => {
                // Don't allow closing without entering cost if type is shed
                if (type === "shed" && shedCost === 0) {
                  return;
                }
                setIsShedCostDialogOpen(false);
              }}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              disabled={type === "shed" && shedCost === 0}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <h2 className="text-xl font-bold mb-4">Enter Shed Cost</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Shed Cost per Bag <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={shedCostInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow empty string, numbers, and decimals
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      setShedCostInput(value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleShedCostSubmit();
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter shed cost"
                  min="0"
                  step="0.01"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleShedCostSubmit}
                  disabled={!shedCostInput || parseFloat(shedCostInput) < 0}
                  className="flex-1 py-2.5 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutgoingOrderForm;
