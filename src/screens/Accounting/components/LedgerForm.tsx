import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { storeAdminApi } from "@/lib/api/storeAdmin";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CHART_OF_ACCOUNTS } from "../constants";
import toast from "react-hot-toast";

const LedgerForm = () => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    mainLedgerType: "",
    subType: "",
    category: "",
    ledgerName: "",
    openingBalance: "0.00",
  });

  const createLedgerMutation = useMutation({
    mutationFn: (payload: {
      name: string;
      type: string;
      subType: string;
      category: string;
      openingBalance: number;
    }) => storeAdminApi.createLedger(payload, adminInfo?.token || ""),
    onSuccess: () => {
      toast.success("Ledger created successfully");
      setFormData({
        mainLedgerType: "",
        subType: "",
        category: "",
        ledgerName: "",
        openingBalance: "0.00",
      });
      queryClient.invalidateQueries({ queryKey: ["ledgers"] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create ledger");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.mainLedgerType ||
      !formData.subType ||
      !formData.category ||
      !formData.ledgerName
    ) {
      toast.error("Please complete all required fields");
      return;
    }

    createLedgerMutation.mutate({
      name: formData.ledgerName,
      type: formData.mainLedgerType,
      subType: formData.subType,
      category: formData.category,
      openingBalance: parseFloat(formData.openingBalance) || 0,
    });
  };

  const getSubTypes = () =>
    formData.mainLedgerType
      ? Object.keys(
          CHART_OF_ACCOUNTS[
            formData.mainLedgerType as keyof typeof CHART_OF_ACCOUNTS
          ] || {}
        )
      : [];

  const getCategories = () =>
    formData.mainLedgerType && formData.subType
      ? CHART_OF_ACCOUNTS[
          formData.mainLedgerType as keyof typeof CHART_OF_ACCOUNTS
        ]?.[formData.subType] || []
      : [];

  return (
    <Card className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Header */}
        <h2 className="text-xl font-semibold text-gray-900">
          Create New Ledger
        </h2>

        {/* Single Row Form */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Main Ledger Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Main Ledger Type
            </label>
            <Select
              value={formData.mainLedgerType}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  mainLedgerType: value,
                  subType: "",
                  category: "",
                })
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CHART_OF_ACCOUNTS).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sub-Type */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Sub-Type
            </label>
            <Select
              value={formData.subType}
              onValueChange={(value) =>
                setFormData({ ...formData, subType: value, category: "" })
              }
              disabled={!formData.mainLedgerType}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select Sub-Type" />
              </SelectTrigger>
              <SelectContent>
                {getSubTypes().map((subType) => (
                  <SelectItem key={subType} value={subType}>
                    {subType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Category
            </label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
              disabled={!formData.subType}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {getCategories().map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ledger Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Ledger Name
            </label>
            <Input
              className="h-11"
              placeholder="Ledger Name"
              value={formData.ledgerName}
              onChange={(e) =>
                setFormData({ ...formData, ledgerName: e.target.value })
              }
              required
            />
          </div>

          {/* Opening Balance */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">
              Opening Balance (₹)
            </label>
            <Input
              className="h-11"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.openingBalance}
              onChange={(e) =>
                setFormData({ ...formData, openingBalance: e.target.value })
              }
            />
          </div>
        </div>

        {/* Action Row */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={createLedgerMutation.isPending}
            className="h-11 px-6"
          >
            {createLedgerMutation.isPending ? "Adding..." : "+ Add Ledger"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default LedgerForm;
