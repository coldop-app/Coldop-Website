import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { accountingApi } from "@/lib/api/accounting";
import { Plus, Check, X } from "lucide-react";
import { CHART_OF_ACCOUNTS } from "../constants";
import toast from "react-hot-toast";

const ledgerTypes = Object.keys(CHART_OF_ACCOUNTS);

interface LedgerFormProps {
  ledgerId?: string;
  onSuccess?: () => void;
  hideCard?: boolean;
}

const LedgerForm = ({ ledgerId, onSuccess, hideCard = false }: LedgerFormProps) => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);
  const queryClient = useQueryClient();
  const editingLedgerId = ledgerId || null;

  const [newLedger, setNewLedger] = useState({
    type: "",
    subType: "",
    category: "",
    name: "",
    openingBalance: "",
    closingBalance: "",
  });

  const { data: ledgerData } = useQuery({
    queryKey: ['ledger', ledgerId],
    queryFn: () => accountingApi.getLedgerById(ledgerId!, adminInfo?.token || ''),
    enabled: !!editingLedgerId && !!ledgerId && !!adminInfo?.token
  });

  // Populate form when ledger data is loaded
  useEffect(() => {
    if (ledgerData?.data && editingLedgerId) {
      const ledger = ledgerData.data;
      setNewLedger({
        type: ledger.type || "",
        subType: ledger.subType || "",
        category: ledger.category || "",
        name: ledger.name || "",
        openingBalance: (ledger.openingBalance || 0).toString(),
        closingBalance: (ledger.closingBalance || 0).toString(),
      });
    }
  }, [ledgerData, editingLedgerId]);

  const createLedgerMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      type: string;
      subType: string;
      category: string;
      openingBalance: number;
      closingBalance?: number;
    }) => accountingApi.createLedger(payload, adminInfo?.token || ""),
    onSuccess: () => {
      toast.success("Ledger created successfully");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["ledgers"] });
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(errorMessage || "Failed to create ledger");
    },
  });

  const updateLedgerMutation = useMutation({
    mutationFn: (payload: {
      name?: string;
      type?: string;
      subType?: string;
      category?: string;
      openingBalance?: number;
      closingBalance?: number;
    }) => accountingApi.updateLedger(ledgerId!, payload, adminInfo?.token || ""),
    onSuccess: () => {
      toast.success("Ledger updated successfully");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["ledgers"] });
      onSuccess?.();
    },
    onError: (error: unknown) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(errorMessage || "Failed to update ledger");
    },
  });

  const resetForm = () => {
    setNewLedger({
      type: "",
      subType: "",
      category: "",
      name: "",
      openingBalance: "",
      closingBalance: "",
    });
  };

  const onAddLedger = () => {
    if (!newLedger.type || !newLedger.subType || !newLedger.category || !newLedger.name) {
      toast.error("Please complete all required fields");
      return;
    }

    const payload: {
      name: string;
      type: string;
      subType: string;
      category: string;
      openingBalance: number;
      closingBalance?: number;
    } = {
      name: newLedger.name,
      type: newLedger.type,
      subType: newLedger.subType,
      category: newLedger.category,
      openingBalance: parseFloat(newLedger.openingBalance) || 0,
    };

    if (editingLedgerId) {
      const updatePayload: {
        name?: string;
        type?: string;
        subType?: string;
        category?: string;
        openingBalance?: number;
        closingBalance?: number;
      } = {
        name: payload.name,
        openingBalance: payload.openingBalance,
      };

      // Include type, subType, and category if they have changed
      if (newLedger.type) {
        updatePayload.type = newLedger.type;
      }
      if (newLedger.subType) {
        updatePayload.subType = newLedger.subType;
      }
      if (newLedger.category) {
        updatePayload.category = newLedger.category;
      }

      // Only include closingBalance if category is "Stock in Hand"
      if (ledgerData?.data?.category === "Stock in Hand" && newLedger.closingBalance) {
        updatePayload.closingBalance = parseFloat(newLedger.closingBalance) || 0;
      }

      updateLedgerMutation.mutate(updatePayload);
    } else {
      createLedgerMutation.mutate(payload);
    }
  };

  const onCancelEdit = () => {
    resetForm();
    onSuccess?.();
  };

  const isPending = createLedgerMutation.isPending || updateLedgerMutation.isPending;
  const isLoading = !!editingLedgerId && !ledgerData;

  const formContent = (
    <div className={hideCard ? "" : "bg-white p-4 sm:p-6 rounded-lg shadow"}>
      {!hideCard && (
        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          {editingLedgerId ? "Edit Ledger" : "Create New Ledger"}
        </h2>
      )}
      <div className={`grid grid-cols-1 gap-3 sm:gap-4 ${
        editingLedgerId
          ? "md:grid-cols-2"
          : (newLedger.name === "Stock in Hand" || ledgerData?.data?.category === "Stock in Hand")
            ? "md:grid-cols-6"
            : "md:grid-cols-5"
      }`}>
        <div>
          <label className="block text-sm font-medium mb-1">
            Main Ledger Type
          </label>
          <select
            value={newLedger.type}
            onChange={(e) =>
              setNewLedger({
                ...newLedger,
                type: e.target.value,
                subType: "",
                category: "",
              })
            }
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select type</option>
            {ledgerTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sub-Type</label>
          <select
            value={newLedger.subType}
            onChange={(e) =>
              setNewLedger({
                ...newLedger,
                subType: e.target.value,
                category: "",
              })
            }
            className="w-full border rounded px-3 py-2"
            disabled={!newLedger.type}
          >
            <option value="">Select Sub-Type</option>
            {newLedger.type &&
              Object.keys(
                (CHART_OF_ACCOUNTS as Record<string, Record<string, string[]>>)[newLedger.type] || {}
              ).map((subType) => (
                <option key={subType} value={subType}>
                  {subType}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={newLedger.category}
            onChange={(e) =>
              setNewLedger({ ...newLedger, category: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
            disabled={!newLedger.subType}
          >
            <option value="">Select Category</option>
            {newLedger.subType &&
              newLedger.type &&
              (
                (CHART_OF_ACCOUNTS as Record<string, Record<string, string[]>>)[newLedger.type]?.[newLedger.subType] ||
                []
              ).map((category: string) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ledger Name</label>
          <input
            type="text"
            placeholder="Ledger Name"
            value={newLedger.name}
            onChange={(e) =>
              setNewLedger({ ...newLedger, name: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Opening Balance (₹)
          </label>
          <input
            type="number"
            placeholder="0.00"
            value={newLedger.openingBalance}
            onChange={(e) =>
              setNewLedger({
                ...newLedger,
                openingBalance: e.target.value,
              })
            }
            className="w-full border rounded px-3 py-2"
            step="0.01"
          />
        </div>
        {(newLedger.name === "Stock in Hand" || ledgerData?.data?.category === "Stock in Hand") && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Closing Balance (₹)
            </label>
            <input
              type="number"
              placeholder="0.00"
              value={newLedger.closingBalance || ""}
              onChange={(e) =>
                setNewLedger({
                  ...newLedger,
                  closingBalance: e.target.value,
                })
              }
              className="w-full border rounded px-3 py-2"
              step="0.01"
            />
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-2">
        <button
          onClick={onAddLedger}
          disabled={isPending || isLoading}
          className="w-full sm:w-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-xs sm:text-sm lg:text-base font-medium inline-flex items-center justify-center gap-1 sm:gap-2 shadow-sm hover:shadow relative disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            "Loading..."
          ) : isPending ? (
            editingLedgerId ? "Updating..." : "Adding..."
          ) : editingLedgerId ? (
            <>
              <Check className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
              Update Ledger
            </>
          ) : (
            <>
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
              Add Ledger
            </>
          )}
        </button>
        {editingLedgerId && (
          <button
            onClick={onCancelEdit}
            className="w-full sm:w-auto px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-xs sm:text-sm lg:text-base font-medium inline-flex items-center justify-center gap-1 sm:gap-2 shadow-sm hover:shadow relative"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            Cancel
          </button>
        )}
      </div>
    </div>
  );

  if (hideCard) {
    return formContent;
  }

  return formContent;
};

export default LedgerForm;
