/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo, KeyboardEvent } from "react";
import { X, Loader2, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { storeAdminApi } from "@/lib/api/storeAdmin";
import debounce from "lodash/debounce";
import toast from "react-hot-toast";

interface Farmer {
  _id: string;
  name: string;
  address?: string;
  mobileNumber?: string;
}

type PaymentType = "CREDIT" | "DEBIT";

interface FinancesFormData {
  farmerId: string;
  farmerName: string;
  amount: number;
  remarks: string;
  date: string;
  paymentType: PaymentType;
}

interface FinancesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FinancesFormData) => void;
  isLoading: boolean;
  token: string;
  coldStorageId: string;
}

const FinancesModal: React.FC<FinancesModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  token,
  coldStorageId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPaymentTypeDropdown, setShowPaymentTypeDropdown] = useState(false);
  const [paymentTypeHighlightedIndex, setPaymentTypeHighlightedIndex] =
    useState(-1);
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const paymentTypeOptions: { label: string; value: PaymentType }[] = [
    { label: "Receive Payment", value: "CREDIT" },
    { label: "Add Payment", value: "DEBIT" },
  ];
  const [formData, setFormData] = useState<FinancesFormData>({
    farmerId: "",
    farmerName: "",
    amount: 0,
    remarks: "",
    paymentType: "CREDIT",
    date: new Date().toISOString().split("T")[0],
  });

  // Farmer search query
  const {
    data: searchResults,
    isLoading: isSearching,
    refetch,
  } = useQuery({
    queryKey: ["searchFarmers", searchQuery],
    queryFn: () =>
      storeAdminApi.searchFarmers(coldStorageId, searchQuery, token),
    enabled: false, // We'll manually trigger this with the debounced function
  });

  // Create a debounced search function
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        if (query.length >= 2) {
          refetch();
        }
      }, 300),
    [refetch]
  );

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        farmerId: "",
        farmerName: "",
        amount: 0,
        remarks: "",
        paymentType: "CREDIT",
        date: new Date().toISOString().split("T")[0],
      });
      setSearchQuery("");
      setSelectedFarmer(null);
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  // Auto-highlight first result when search results change
  useEffect(() => {
    if (searchResults && searchResults.length > 0) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [searchResults]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setFormData((prev) => ({ ...prev, farmerName: value, farmerId: "" }));
    setShowDropdown(true);
    setHighlightedIndex(-1);
    setSelectedFarmer(null);
    debouncedSearch(value);
  };

  const handleSelectFarmer = (farmer: Farmer) => {
    setSelectedFarmer(farmer);
    setFormData((prev) => ({
      ...prev,
      farmerId: farmer._id,
      farmerName: farmer.name,
    }));
    setSearchQuery(farmer.name);
    setShowDropdown(false);
    setHighlightedIndex(-1);
  };

  const clearSelectedFarmer = () => {
    setSelectedFarmer(null);
    setSearchQuery("");
    setHighlightedIndex(-1);
    setFormData((prev) => ({
      ...prev,
      farmerName: "",
      farmerId: "",
    }));
  };

  // Handle keyboard navigation for farmer search dropdown
  const handleFarmerSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const results = searchResults || [];

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setShowDropdown(true);
      setHighlightedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setShowDropdown(true);
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results.length > 0) {
        const selectedIndex = highlightedIndex >= 0 ? highlightedIndex : 0;
        handleSelectFarmer(results[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowDropdown(false);
      setHighlightedIndex(-1);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById(
        "finances-farmer-search-dropdown"
      );
      const input = document.getElementById("finances-farmer-search-input");
      const paymentTypeDropdown = document.getElementById(
        "finances-payment-type-dropdown"
      );
      const paymentTypeButton = document.getElementById(
        "finances-payment-type-button"
      );
      if (
        dropdown &&
        input &&
        !dropdown.contains(event.target as Node) &&
        !input.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
      if (
        paymentTypeDropdown &&
        paymentTypeButton &&
        !paymentTypeDropdown.contains(event.target as Node) &&
        !paymentTypeButton.contains(event.target as Node)
      ) {
        setShowPaymentTypeDropdown(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setFormData((prev) => ({ ...prev, amount: value as any }));
  };

  const handleRemarksChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, remarks: e.target.value }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, date: e.target.value }));
  };

  const handlePaymentTypeChange = (value: PaymentType) => {
    setFormData((prev) => ({
      ...prev,
      paymentType: value,
    }));
    setShowPaymentTypeDropdown(false);
    setPaymentTypeHighlightedIndex(-1);
  };

  const handlePaymentTypeKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setShowPaymentTypeDropdown(true);
      setPaymentTypeHighlightedIndex((prev) =>
        prev < paymentTypeOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setShowPaymentTypeDropdown(true);
      setPaymentTypeHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : paymentTypeOptions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (paymentTypeHighlightedIndex >= 0) {
        handlePaymentTypeChange(
          paymentTypeOptions[paymentTypeHighlightedIndex].value
        );
      } else {
        setShowPaymentTypeDropdown(!showPaymentTypeDropdown);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setShowPaymentTypeDropdown(false);
      setPaymentTypeHighlightedIndex(-1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.farmerId || !formData.farmerName.trim()) {
      toast.error("Please select a farmer");
      return;
    }

    const amountNumber = Number(formData.amount);

    if (!amountNumber || amountNumber <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!formData.date) {
      toast.error("Please select a date");
      return;
    }

    const payload = {
      farmerId: formData.farmerId,
      farmerName: formData.farmerName,
      amount: amountNumber,
      remarks: formData.remarks,
      date: formData.date,
      paymentType: formData.paymentType,
    };

    console.log("form data is:", payload);

    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold mb-6">Add Finance Entry</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Type */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2">
              Payment Type <span className="text-red-500">*</span>
            </label>
            <button
              id="finances-payment-type-button"
              type="button"
              onClick={() =>
                setShowPaymentTypeDropdown(!showPaymentTypeDropdown)
              }
              onKeyDown={handlePaymentTypeKeyDown}
              onFocus={() => setPaymentTypeHighlightedIndex(-1)}
              disabled={isLoading}
              className="w-full p-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition disabled:opacity-50 text-left flex items-center justify-between"
            >
              <span>
                {
                  paymentTypeOptions.find(
                    (opt) => opt.value === formData.paymentType
                  )?.label
                }
              </span>
            </button>

            {/* Payment Type Dropdown */}
            {showPaymentTypeDropdown && (
              <div
                id="finances-payment-type-dropdown"
                className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200"
              >
                <div className="py-1">
                  {paymentTypeOptions.map((option, index) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`w-full text-left px-4 py-2 focus:outline-none transition-colors ${
                        index === paymentTypeHighlightedIndex
                          ? "bg-gray-100 text-gray-800 border-l-2 border-gray-400"
                          : "hover:bg-gray-50 focus:bg-gray-50"
                      }`}
                      onClick={() => handlePaymentTypeChange(option.value)}
                    >
                      <div className="font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Farmer Search */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2">
              Farmer <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="finances-farmer-search-input"
                type="text"
                autoComplete="off"
                value={selectedFarmer ? selectedFarmer.name : searchQuery}
                onChange={handleSearchChange}
                onKeyDown={handleFarmerSearchKeyDown}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search for farmer..."
                className="w-full p-3 pl-10 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition disabled:opacity-50"
                required
                disabled={isLoading}
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              {selectedFarmer && (
                <button
                  type="button"
                  onClick={clearSelectedFarmer}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  title="Clear selection"
                >
                  <X size={16} className="text-gray-500" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showDropdown && (searchResults?.length > 0 || isSearching) && (
              <div
                id="finances-farmer-search-dropdown"
                className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-auto bg-white rounded-md shadow-lg border border-gray-200"
              >
                {isSearching ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="py-1">
                    {searchResults?.map((result: Farmer, index: number) => (
                      <button
                        key={result._id}
                        type="button"
                        className={`w-full text-left px-4 py-2 focus:outline-none transition-colors ${
                          index === highlightedIndex
                            ? "bg-gray-100 text-gray-800 border-l-2 border-gray-400"
                            : "hover:bg-gray-50 focus:bg-gray-50"
                        }`}
                        onClick={() => handleSelectFarmer(result)}
                      >
                        <div className="font-medium">{result.name}</div>
                        {(result.mobileNumber || result.address) && (
                          <div
                            className={`text-sm ${
                              index === highlightedIndex
                                ? "text-gray-600"
                                : "text-gray-500"
                            }`}
                          >
                            {result.mobileNumber && (
                              <span>📱 {result.mobileNumber}</span>
                            )}
                            {result.address && (
                              <span className="ml-2">📍 {result.address}</span>
                            )}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.amount}
              onChange={handleAmountChange}
              className="w-full p-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition disabled:opacity-50"
              placeholder="Enter amount"
              required
              disabled={isLoading}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={handleDateChange}
              className="w-full p-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition disabled:opacity-50"
              required
              disabled={isLoading}
            />
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium mb-2">Remarks</label>
            <textarea
              value={formData.remarks}
              onChange={handleRemarksChange}
              className="w-full p-3 border border-border rounded-md bg-background h-32 resize-none focus:ring-2 focus:ring-primary focus:border-primary transition disabled:opacity-50"
              placeholder="Enter remarks (optional)"
              disabled={isLoading}
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 px-4 border border-primary text-primary rounded-lg hover:bg-secondary/90 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-primary text-secondary rounded-lg hover:bg-primary/85 transition disabled:opacity-50 relative"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Submitting...</span>
                </div>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinancesModal;
