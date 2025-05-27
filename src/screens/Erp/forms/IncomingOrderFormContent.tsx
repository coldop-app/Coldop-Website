import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { storeAdminApi } from "@/lib/api/storeAdmin";
import { RootState } from "@/store";
import { StoreAdmin } from "@/utils/types";
import Loader from "@/components/common/Loader/Loader";

interface AnimatedFormStepProps {
  isVisible: boolean;
  children: React.ReactNode;
}

const AnimatedFormStep = ({ isVisible, children }: AnimatedFormStepProps) => {
  const [opacity, setOpacity] = useState(0);
  const [transform, setTransform] = useState("translateY(15px)");

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setOpacity(1);
        setTransform("translateY(0)");
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setOpacity(0);
      setTransform("translateY(15px)");
    }
  }, [isVisible]);

  return (
    <div
      style={{
        opacity,
        transform,
        position: "relative",
        transition: "opacity 500ms cubic-bezier(0.4, 0, 0.2, 1), transform 500ms cubic-bezier(0.4, 0, 0.2, 1)"
      }}
    >
      {children}
    </div>
  );
};

interface BagQuantities {
  ration: string;
  seed: string;
  number12: string;
  goli: string;
  cutTok: string;
}

interface FormData {
  // Step 1
  farmerName: string;
  farmerId: string;
  quantities: BagQuantities;

  // Step 2
  mainLocation: string;
  remarks: string;

  // Additional fields for API
  voucherNumber: string;
  dateOfSubmission: string;
  variety: string;
}

const IncomingOrderFormContent = () => {
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state: RootState) => state.auth) as { adminInfo: StoreAdmin | null };
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    farmerName: "",
    farmerId: "",
    quantities: {
      ration: "",
      seed: "",
      number12: "",
      goli: "",
      cutTok: ""
    },
    mainLocation: "",
    remarks: "",
    voucherNumber: "",
    dateOfSubmission: new Date().toISOString().split('T')[0],
    variety: "K Pukhraj" // Default variety
  });

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateQuantity = (bagType: keyof BagQuantities, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, '');
    setFormData(prev => ({
      ...prev,
      quantities: {
        ...prev.quantities,
        [bagType]: numericValue
      }
    }));
  };

  const calculateTotal = () => {
    const { ration, seed, number12, goli, cutTok } = formData.quantities;
    return (
      (parseInt(ration) || 0) +
      (parseInt(seed) || 0) +
      (parseInt(number12) || 0) +
      (parseInt(goli) || 0) +
      (parseInt(cutTok) || 0)
    );
  };

  const nextStep = () => {
    // Validate step 1
    if (!formData.farmerName.trim()) {
      toast.error("Please enter farmer name");
      return;
    }
    if (calculateTotal() === 0) {
      toast.error("Please enter at least one quantity");
      return;
    }
    setCurrentStep(2);
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  // Create incoming order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      if (!adminInfo?.token) {
        throw new Error("No authentication token found");
      }
      return storeAdminApi.createIncomingOrder(orderData, adminInfo.token);
    },
    onSuccess: () => {
      toast.success("Incoming order created successfully!");
      // Reset form
      setFormData({
        farmerName: "",
        farmerId: "",
        quantities: {
          ration: "",
          seed: "",
          number12: "",
          goli: "",
          cutTok: ""
        },
        mainLocation: "",
        remarks: "",
        voucherNumber: "",
        dateOfSubmission: new Date().toISOString().split('T')[0],
        variety: "K Pukhraj"
      });
      setCurrentStep(1);
      // Navigate back or to orders list
      navigate('/erp/daybook');
    },
    onError: (error: any) => {
      console.error("Error creating order:", error);
      toast.error(error.response?.data?.message || "Failed to create order");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate step 2
    if (!formData.mainLocation.trim()) {
      toast.error("Please enter main location");
      return;
    }

    // Generate voucher number (you might want to get this from API or generate differently)
    const voucherNumber = Math.floor(Math.random() * 100000);

    // Prepare order data according to API structure
    const orderData = {
      coldStorageId: adminInfo?.coldStorageId || "", // You might need to get this from admin info
      farmerId: formData.farmerId || "temp-farmer-id", // You might need to handle farmer creation
      voucherNumber: voucherNumber,
      dateOfSubmission: formData.dateOfSubmission,
      remarks: formData.remarks,
      orderDetails: [
        {
          variety: formData.variety,
          bagSizes: [
            ...(formData.quantities.ration ? [{
              size: "Ration",
              quantity: {
                initialQuantity: parseInt(formData.quantities.ration),
                currentQuantity: parseInt(formData.quantities.ration)
              }
            }] : []),
            ...(formData.quantities.seed ? [{
              size: "Seed",
              quantity: {
                initialQuantity: parseInt(formData.quantities.seed),
                currentQuantity: parseInt(formData.quantities.seed)
              }
            }] : []),
            ...(formData.quantities.number12 ? [{
              size: "Number-12",
              quantity: {
                initialQuantity: parseInt(formData.quantities.number12),
                currentQuantity: parseInt(formData.quantities.number12)
              }
            }] : []),
            ...(formData.quantities.goli ? [{
              size: "Goli",
              quantity: {
                initialQuantity: parseInt(formData.quantities.goli),
                currentQuantity: parseInt(formData.quantities.goli)
              }
            }] : []),
            ...(formData.quantities.cutTok ? [{
              size: "Cut-tok",
              quantity: {
                initialQuantity: parseInt(formData.quantities.cutTok),
                currentQuantity: parseInt(formData.quantities.cutTok)
              }
            }] : [])
          ].filter(bagSize => bagSize.quantity.initialQuantity > 0),
          location: formData.mainLocation
        }
      ]
    };

    createOrderMutation.mutate(orderData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-background rounded-lg shadow-lg border border-border">
      <h1 className="text-2xl font-bold text-center mb-6">Create Incoming Order</h1>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="w-[90%] max-w-md">
            <div className="relative flex justify-between">
              {/* Line background */}
              <div className="absolute h-0.5 bg-muted top-5 left-10 w-[calc(100%-80px)]"></div>

              {/* Line active */}
              <div
                className={`absolute h-0.5 top-5 left-10 w-[calc(100%-80px)] transition-colors duration-500 ease-in-out ${
                  currentStep >= 2 ? 'bg-primary' : 'bg-muted'
                }`}
              ></div>

              {/* Step 1 */}
              <div className="relative flex flex-col items-center">
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? 'bg-primary text-secondary' : 'bg-muted text-muted-foreground'
                }`}>
                  1
                </div>
                <span className="text-xs mt-2 text-center">Quantities</span>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col items-center">
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= 2 ? 'bg-primary text-secondary' : 'bg-muted text-muted-foreground'
                }`}>
                  2
                </div>
                <span className="text-xs mt-2 text-center">Details</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Farmer and Quantities */}
        <AnimatedFormStep isVisible={currentStep === 1}>
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Farmer Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Enter Account Name (search and select)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={formData.farmerName}
                    onChange={(e) => updateFormData('farmerName', e.target.value)}
                    placeholder="Search or Create Farmer"
                    className="flex-1 p-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition"
                    required
                  />
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-3 bg-primary text-secondary rounded-md hover:bg-primary/85 transition font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <Plus size={18} />
                    <span className="text-sm">New Farmer</span>
                  </button>
                </div>
              </div>

              {/* Quantities Section */}
              <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                <h3 className="text-lg font-medium mb-2">Enter Quantities</h3>
                <p className="text-sm text-muted-foreground mb-4">Set the quantities for each size</p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Ration/Table Bags</label>
                    <input
                      type="text"
                      value={formData.quantities.ration}
                      onChange={(e) => updateQuantity('ration', e.target.value)}
                      placeholder="-"
                      className="w-32 p-2 border border-border rounded-md bg-background text-center focus:ring-2 focus:ring-primary focus:border-primary transition"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Seed Bags</label>
                    <input
                      type="text"
                      value={formData.quantities.seed}
                      onChange={(e) => updateQuantity('seed', e.target.value)}
                      placeholder="300"
                      className="w-32 p-2 border border-border rounded-md bg-background text-center focus:ring-2 focus:ring-primary focus:border-primary transition"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">No. 12 Seed Bags</label>
                    <input
                      type="text"
                      value={formData.quantities.number12}
                      onChange={(e) => updateQuantity('number12', e.target.value)}
                      placeholder="200"
                      className="w-32 p-2 border border-border rounded-md bg-background text-center focus:ring-2 focus:ring-primary focus:border-primary transition"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Goli Bags</label>
                    <input
                      type="text"
                      value={formData.quantities.goli}
                      onChange={(e) => updateQuantity('goli', e.target.value)}
                      placeholder="700"
                      className="w-32 p-2 border border-border rounded-md bg-background text-center focus:ring-2 focus:ring-primary focus:border-primary transition"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Cut & Tok Bags</label>
                    <input
                      type="text"
                      value={formData.quantities.cutTok}
                      onChange={(e) => updateQuantity('cutTok', e.target.value)}
                      placeholder="-"
                      className="w-32 p-2 border border-border rounded-md bg-background text-center focus:ring-2 focus:ring-primary focus:border-primary transition"
                    />
                  </div>

                  <hr className="border-gray-300" />

                  <div className="flex items-center justify-between font-semibold">
                    <label className="text-sm">Total / Lot No.</label>
                    <span className="text-lg">{calculateTotal()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={nextStep}
                  className="font-custom inline-block cursor-pointer rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-secondary no-underline duration-100 hover:bg-primary/85 hover:text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </AnimatedFormStep>

        {/* Step 2: Location and Remarks */}
        <AnimatedFormStep isVisible={currentStep === 2}>
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                <h3 className="text-lg font-medium mb-2">Enter Address (CH R FL)</h3>
                <p className="text-sm text-muted-foreground mb-4">This will be used as a reference in outgoing.</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Main Location</label>
                    <input
                      type="text"
                      value={formData.mainLocation}
                      onChange={(e) => updateFormData('mainLocation', e.target.value)}
                      placeholder="C3 5 22"
                      className="w-full p-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Remarks</label>
                    <textarea
                      value={formData.remarks}
                      onChange={(e) => updateFormData('remarks', e.target.value)}
                      placeholder="Describe any sort of exception to be handelled in the order , eg : handed over to shamu; payment pending.&#10;Pickup done, pending, scheduled."
                      className="w-full p-3 border border-border rounded-md bg-background h-32 resize-none focus:ring-2 focus:ring-primary focus:border-primary transition"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={prevStep}
                  className="font-custom flex-1 cursor-pointer rounded-lg border border-primary px-0 py-3 text-base font-medium text-primary bg-secondary hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                  style={{ minWidth: 0 }}
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={createOrderMutation.isPending}
                  className="font-custom flex-1 cursor-pointer rounded-lg bg-primary px-0 py-3 text-base font-semibold text-secondary hover:bg-primary/85 focus:outline-none focus:ring-2 focus:ring-primary/50 transition relative"
                  style={{ minWidth: 0 }}
                >
                  {createOrderMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <Loader size="sm" className="mr-2" />
                      <span>Creating Order...</span>
                    </div>
                  ) : (
                    "Create Order"
                  )}
                </button>
              </div>
            </div>
          )}
        </AnimatedFormStep>
      </form>
    </div>
  );
};

export default IncomingOrderFormContent;