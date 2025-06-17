import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { storeAdminApi } from "@/lib/api/storeAdmin";
import { RootState } from "@/store";
import { StoreAdmin, Order } from "@/utils/types";
import Loader from "@/components/common/Loader/Loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  [key: string]: string;
}

// Helper function to format bag size label
const formatBagSizeLabel = (bagSize: string): string => {
  if (bagSize.toLowerCase() === 'number-12') return 'Number-12';
  if (bagSize.toLowerCase() === 'cut-tok') return 'Cut & Tok';
  return bagSize
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper function to convert bag size to field name
const getBagSizeFieldName = (bagSize: string): string => {
  // Convert from API format (e.g., "Cut-tok") to camelCase field name (e.g., "cutTok")
  const normalized = bagSize.toLowerCase().replace(/-/g, '');
  return normalized.charAt(0).toLowerCase() +
         normalized.slice(1).replace(/\b\w/g, c => c.toUpperCase());
};

interface FormData {
  farmerName: string;
  farmerId: string;
  quantities: BagQuantities;
  mainLocation: string;
  remarks: string;
  variety: string;
}

interface UpdateIncomingOrderPayload {
  remarks: string;
  dateOfSubmission: string;
  fulfilled: boolean;
  orderDetails: {
    variety: string;
    bagSizes: {
      size: string;
      quantity: {
        initialQuantity: number;
        currentQuantity: number;
      };
    }[];
    location: string;
  }[];
}

interface EditIncomingOrderFormContentProps {
  order: Order;
}

const EditIncomingOrderFormContent = ({ order }: EditIncomingOrderFormContentProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { adminInfo } = useSelector((state: RootState) => state.auth) as { adminInfo: StoreAdmin | null };
  const [currentStep, setCurrentStep] = useState(1);

  // Initialize form data from order
  const [formData, setFormData] = useState<FormData>(() => {
    const orderDetail = order.orderDetails[0]; // Assuming single order detail for now
    const quantities: BagQuantities = {};

    console.log('Order details:', orderDetail);
    console.log('Bag sizes from order:', orderDetail.bagSizes);

    // Convert bag sizes to the format we need
    orderDetail.bagSizes.forEach(bag => {
      console.log('Processing bag:', bag);
      if (bag.quantity) {
        // Convert size to the correct format (e.g., 'cut-tok' to 'cutTok')
        const normalizedSize = bag.size.toLowerCase().replace(/-/g, '');
        const fieldName = normalizedSize.charAt(0).toLowerCase() +
                         normalizedSize.slice(1).replace(/\b\w/g, c => c.toUpperCase());
        console.log('Field name:', fieldName, 'Current quantity:', bag.quantity.currentQuantity);
        quantities[fieldName] = bag.quantity.currentQuantity.toString();
      }
    });

    console.log('Final quantities object:', quantities);

    return {
      farmerName: order.farmerId.name,
      farmerId: order.farmerId._id,
      quantities,
      mainLocation: orderDetail.location || "",
      remarks: order.remarks || "",
      variety: orderDetail.variety
    };
  });

  // Fetch varieties
  const { data: varietiesData, isLoading: isLoadingVarieties } = useQuery({
    queryKey: ['varieties'],
    queryFn: () => storeAdminApi.getVarieties(adminInfo?.token || ''),
    enabled: !!adminInfo?.token,
  });

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateQuantity = (bagType: string, value: string) => {
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
    return Object.values(formData.quantities)
      .reduce((sum, quantity) => sum + (parseInt(quantity) || 0), 0);
  };

  const nextStep = () => {
    if (!formData.variety) {
      toast.error(t('editIncomingOrder.errors.selectVariety'));
      return;
    }
    if (calculateTotal() === 0) {
      toast.error(t('editIncomingOrder.errors.enterQuantity'));
      return;
    }
    setCurrentStep(2);
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async () => {
      if (!adminInfo?.token) {
        throw new Error("No authentication token found");
      }

      const payload: UpdateIncomingOrderPayload = {
        remarks: formData.remarks,
        dateOfSubmission: order.dateOfSubmission || new Date().toISOString(),  // Provide default value
        fulfilled: order.fulfilled || false,
        orderDetails: [{
          variety: formData.variety,
          bagSizes: adminInfo.preferences?.bagSizes?.map(bagSize => {
            // Find the original bag size entry to get the initialQuantity
            const originalBagSize = order.orderDetails[0].bagSizes.find(
              b => b.size.toLowerCase() === bagSize.toLowerCase()
            );
            const fieldName = getBagSizeFieldName(bagSize);
            return {
              size: bagSize,
              quantity: {
                initialQuantity: originalBagSize?.quantity?.initialQuantity || 0,
                currentQuantity: parseInt(formData.quantities[fieldName] || "0")
              }
            };
          }).filter(bagSize => bagSize.quantity.currentQuantity > 0) || [],
          location: formData.mainLocation
        }]
      };

      return storeAdminApi.updateIncomingOrder(order._id, payload, adminInfo.token);
    },
    onSuccess: () => {
      toast.success(t('editIncomingOrder.success.orderUpdated'));
      navigate('/erp/daybook');
    },
    onError: (error: unknown) => {
      console.error("Error updating order:", error);
      if (error instanceof Error) {
        toast.error(error.message || t('editIncomingOrder.errors.failedToUpdate'));
      } else {
        toast.error(t('editIncomingOrder.errors.failedToUpdate'));
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.mainLocation.trim()) {
      toast.error(t('editIncomingOrder.errors.enterLocation'));
      return;
    }

    updateOrderMutation.mutate();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-background rounded-lg shadow-lg border border-border">
      <h1 className="text-2xl font-bold text-center mb-6">{t('editIncomingOrder.title')}</h1>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="w-[90%] max-w-md">
            <div className="relative flex justify-between">
              <div className="absolute h-0.5 bg-muted top-5 left-10 w-[calc(100%-80px)]"></div>
              <div
                className={`absolute h-0.5 top-5 left-10 w-[calc(100%-80px)] transition-colors duration-500 ease-in-out ${
                  currentStep >= 2 ? 'bg-primary' : 'bg-muted'
                }`}
              ></div>

              <div className="relative flex flex-col items-center">
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= 1 ? 'bg-primary text-secondary' : 'bg-muted text-muted-foreground'
                }`}>
                  1
                </div>
                <span className="text-xs mt-2 text-center">{t('incomingOrder.steps.quantities')}</span>
              </div>

              <div className="relative flex flex-col items-center">
                <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= 2 ? 'bg-primary text-secondary' : 'bg-muted text-muted-foreground'
                }`}>
                  2
                </div>
                <span className="text-xs mt-2 text-center">{t('incomingOrder.steps.details')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Farmer, Variety and Quantities */}
        <AnimatedFormStep isVisible={currentStep === 1}>
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Farmer Details (Read-only) */}
              <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                <h3 className="text-lg font-medium mb-2">{t('editIncomingOrder.farmerDetails')}</h3>
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{formData.farmerName}</p>
                </div>
              </div>

              {/* Variety Selection */}
              <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                <h3 className="text-lg font-medium mb-2">{t('incomingOrder.variety.title')}</h3>
                <div className="relative">
                  <Select
                    value={formData.variety}
                    onValueChange={(value) => updateFormData('variety', value)}
                    disabled={isLoadingVarieties}
                  >
                    <SelectTrigger className="w-full bg-background">
                      {isLoadingVarieties ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>{t('incomingOrder.variety.loading')}</span>
                        </div>
                      ) : (
                        <SelectValue placeholder={t('incomingOrder.variety.selectPlaceholder')} />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {varietiesData?.varieties?.map((variety: string) => (
                        <SelectItem key={variety} value={variety}>
                          {variety}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quantities Section */}
              <div className="border border-green-200 rounded-lg p-4 bg-green-50/50">
                <h3 className="text-lg font-medium mb-2">{t('incomingOrder.quantities.title')}</h3>
                <div className="space-y-4">
                  {adminInfo?.preferences?.bagSizes?.map((bagSize) => {
                    const fieldName = getBagSizeFieldName(bagSize);
                    return (
                      <div key={bagSize} className="flex items-center justify-between">
                        <label className="text-sm font-medium">{formatBagSizeLabel(bagSize)}</label>
                        <input
                          type="text"
                          value={formData.quantities[fieldName] || ""}
                          onChange={(e) => updateQuantity(fieldName, e.target.value)}
                          placeholder="-"
                          className="w-32 p-2 border rounded-md bg-background text-center focus:ring-2 focus:ring-primary focus:border-primary transition"
                        />
                      </div>
                    );
                  })}

                  <hr className="border-gray-300" />

                  <div className="flex items-center justify-between font-semibold">
                    <label className="text-sm">{t('incomingOrder.quantities.total')}</label>
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
                  {t('editIncomingOrder.continue')}
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
                <h3 className="text-lg font-medium mb-2">{t('incomingOrder.location.title')}</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t('incomingOrder.location.mainLabel')}</label>
                    <input
                      type="text"
                      value={formData.mainLocation}
                      onChange={(e) => updateFormData('mainLocation', e.target.value)}
                      placeholder={t('incomingOrder.location.placeholder')}
                      className="w-full p-3 border border-border rounded-md bg-background focus:ring-2 focus:ring-primary focus:border-primary transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t('incomingOrder.remarks.label')}</label>
                    <textarea
                      value={formData.remarks}
                      onChange={(e) => updateFormData('remarks', e.target.value)}
                      placeholder={t('incomingOrder.remarks.placeholder')}
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
                >
                  {t('editIncomingOrder.back')}
                </button>
                <button
                  type="submit"
                  disabled={updateOrderMutation.isPending}
                  className="font-custom flex-1 cursor-pointer rounded-lg bg-primary px-0 py-3 text-base font-semibold text-secondary hover:bg-primary/85 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                >
                  {updateOrderMutation.isPending ? (
                    <div className="flex items-center justify-center">
                      <Loader size="sm" className="mr-2" />
                      <span>{t('editIncomingOrder.updating')}</span>
                    </div>
                  ) : (
                    t('editIncomingOrder.update')
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

export default EditIncomingOrderFormContent;