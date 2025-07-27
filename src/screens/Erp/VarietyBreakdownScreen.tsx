import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { RootState } from "@/store";
import { storeAdminApi } from "@/lib/api/storeAdmin";
import TopBar from "@/components/common/Topbar/Topbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StoreAdmin } from "@/utils/types";
import { ArrowLeft, User, TrendingDown, TrendingUp } from "lucide-react";

interface OrderDetail {
  variety: string;
  bagSizes: {
    quantity: {
      initialQuantity: number;
      currentQuantity: number;
    };
    size: string;
  }[];
  location: string;
}

interface Order {
  voucher: {
    type: string;
    voucherNumber: number;
  };
  _id: string;
  coldStorageId: string;
  farmerId: {
    _id: string;
    name: string;
    address: string;
    mobileNumber: string;
  };
  dateOfSubmission: string;
  fulfilled: boolean;
  remarks: string;
  currentStockAtThatTime: number;
  orderDetails: OrderDetail[];
  createdAt: string;
  updatedAt: string;
}

interface SearchByVarietyResponse {
  status: string;
  message: string;
  data: Order[];
}

interface BagData {
  current: number;
  initial: number;
}

interface FarmerData {
  name: string;
  bags: Map<string, BagData>;
  totalCurrent: number;
  totalInitial: number;
}

const VarietyBreakdownScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const adminInfo = useSelector(
    (state: RootState) => state.auth.adminInfo
  ) as StoreAdmin | null;

  // Get variety from location state
  const { variety, bagSize } = location.state || {};

  const [selectedBagSizeFilter, setSelectedBagSizeFilter] = useState<string>(
    bagSize === "All Sizes" ? "all" : bagSize || "all"
  );

  // Get all bag sizes from admin preferences
  const allBagSizes = useMemo(() => {
    return adminInfo?.preferences?.bagSizes || [];
  }, [adminInfo?.preferences?.bagSizes]);

  // Fetch orders by variety
  const {
    data: ordersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["searchByVariety", variety, adminInfo?.token],
    queryFn: () =>
      storeAdminApi.searchByVariety(
        {
          variety: variety || "",
          storeAdminId: adminInfo?._id || "",
        },
        adminInfo?.token || ""
      ),
    enabled: !!variety && !!adminInfo?.token && !!adminInfo?._id,
  });

  const response = ordersData as SearchByVarietyResponse;
  const orders = response?.data || [];

  // Process data to show farmer-wise bag distribution
  const farmerData = useMemo(() => {
    const farmerMap = new Map<string, FarmerData>();

    orders.forEach((order) => {
      const farmerId = order.farmerId._id;
      const farmerName = order.farmerId.name;

      if (!farmerMap.has(farmerId)) {
        farmerMap.set(farmerId, {
          name: farmerName,
          bags: new Map<string, BagData>(),
          totalCurrent: 0,
          totalInitial: 0,
        });
      }

      const farmer = farmerMap.get(farmerId)!;

      order.orderDetails.forEach((detail) => {
        if (detail.variety === variety) {
          detail.bagSizes.forEach((bag) => {
            const bagKey = bag.size;
            if (!farmer.bags.has(bagKey)) {
              farmer.bags.set(bagKey, { current: 0, initial: 0 });
            }

            const bagData = farmer.bags.get(bagKey)!;
            bagData.current += bag.quantity.currentQuantity;
            bagData.initial += bag.quantity.initialQuantity;

            farmer.totalCurrent += bag.quantity.currentQuantity;
            farmer.totalInitial += bag.quantity.initialQuantity;
          });
        }
      });
    });

    return Array.from(farmerMap.values());
  }, [orders, variety]);

  // Filter farmers based on selected bag size
  const filteredFarmerData = useMemo(() => {
    if (selectedBagSizeFilter === "all") {
      return farmerData;
    }

    return farmerData.filter((farmer) =>
      farmer.bags.has(selectedBagSizeFilter)
    );
  }, [farmerData, selectedBagSizeFilter]);

  // Calculate totals for the header
  const totals = useMemo(() => {
    return filteredFarmerData.reduce(
      (acc, farmer) => {
        acc.current += farmer.totalCurrent;
        acc.initial += farmer.totalInitial;
        return acc;
      },
      { current: 0, initial: 0 }
    );
  }, [filteredFarmerData]);

  // Calculate totals by bag size for table footer
  const bagSizeTotals = useMemo(() => {
    const totals = new Map<string, BagData>();

    allBagSizes.forEach((size) => {
      totals.set(size, { current: 0, initial: 0 });
    });

    filteredFarmerData.forEach((farmer) => {
      farmer.bags.forEach((bagData: BagData, size: string) => {
        if (totals.has(size)) {
          const total = totals.get(size)!;
          total.current += bagData.current;
          total.initial += bagData.initial;
        }
      });
    });

    return totals;
  }, [filteredFarmerData, allBagSizes]);

  if (!variety) {
    return (
      <>
        <TopBar
          title="Variety Breakdown"
          isSidebarOpen={false}
          setIsSidebarOpen={() => {}}
        />
        <div className="p-4 max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">
                No variety selected. Please go back and select a variety.
              </p>
              <Button
                onClick={() => navigate(-1)}
                className="mt-4"
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <TopBar
          title={`${variety} Stock`}
          isSidebarOpen={false}
          setIsSidebarOpen={() => {}}
        />
        <div className="p-4 max-w-6xl mx-auto space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <TopBar
          title={`${variety} Stock`}
          isSidebarOpen={false}
          setIsSidebarOpen={() => {}}
        />
        <div className="p-4 max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-600">
                Error loading data. Please try again.
              </p>
              <Button
                onClick={() => navigate(-1)}
                className="mt-4"
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <TopBar
        title={`${variety} Stock`}
        isSidebarOpen={false}
        setIsSidebarOpen={() => {}}
      />
      <div className="p-4 max-w-6xl mx-auto space-y-4 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button onClick={() => navigate(-1)} variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{variety}</h1>
              <p className="text-sm text-gray-600">
                {totals.current} bags available • {filteredFarmerData.length}{" "}
                farmers
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Current Stock
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {totals.current}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Initial Stock
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totals.initial}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Farmers
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {filteredFarmerData.length}
                  </p>
                </div>
                <User className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bag Size Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={
                  selectedBagSizeFilter === "all" ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedBagSizeFilter("all")}
                className="h-9"
              >
                All Sizes ({totals.current})
              </Button>
              {allBagSizes.map((size) => {
                const sizeTotal = bagSizeTotals.get(size)?.current || 0;

                return (
                  <Button
                    key={size}
                    variant={
                      selectedBagSizeFilter === size ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedBagSizeFilter(size)}
                    className="h-9"
                  >
                    {size} ({sizeTotal})
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card>
          <CardContent className="p-0">
            {filteredFarmerData.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-lg">No farmers found</p>
                <p className="text-sm">
                  No farmers found with stock for the selected bag size.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Farmer
                      </th>
                      {selectedBagSizeFilter === "all" ? (
                        allBagSizes.map((size) => (
                          <th
                            key={size}
                            className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider"
                          >
                            {size}
                          </th>
                        ))
                      ) : (
                        <th className="px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          {selectedBagSizeFilter}
                        </th>
                      )}
                      {selectedBagSizeFilter === "all" && (
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Total
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFarmerData
                      .sort((a, b) => b.totalCurrent - a.totalCurrent)
                      .map((farmer, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-white shadow-sm">
                                  <span className="text-sm font-bold text-primary">
                                    {farmer.name
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('')
                                      .toUpperCase()
                                      .slice(0, 2)}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {farmer.name}
                                </div>
                              </div>
                            </div>
                          </td>

                          {selectedBagSizeFilter === "all" ? (
                            allBagSizes.map((size) => {
                              const bagData = farmer.bags.get(size) || {
                                current: 0,
                                initial: 0,
                              };
                              return (
                                <td
                                  key={size}
                                  className="px-4 py-4 whitespace-nowrap text-center"
                                >
                                  <div className="text-sm font-semibold text-gray-900">
                                    {bagData.current}
                                  </div>
                                </td>
                              );
                            })
                          ) : (
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <div className="text-sm font-semibold text-gray-900">
                                {(() => {
                                  const bagData = farmer.bags.get(
                                    selectedBagSizeFilter
                                  ) || { current: 0, initial: 0 };
                                  return bagData.current;
                                })()}
                              </div>
                            </td>
                          )}

                          {selectedBagSizeFilter === "all" && (
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="text-sm font-bold text-green-600">
                                {farmer.totalCurrent}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                  </tbody>

                  {/* Table Footer with Totals */}
                  <tfoot className="bg-gray-100 border-t-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">
                        TOTAL
                      </th>
                      {selectedBagSizeFilter === "all" ? (
                        allBagSizes.map((size) => {
                          const total = bagSizeTotals.get(size) || {
                            current: 0,
                            initial: 0,
                          };
                          return (
                            <th
                              key={size}
                              className="px-4 py-4 text-center text-sm font-bold text-gray-900"
                            >
                              {total.current}
                            </th>
                          );
                        })
                      ) : (
                        <th className="px-4 py-4 text-center text-sm font-bold text-gray-900">
                          {bagSizeTotals.get(selectedBagSizeFilter)?.current || 0}
                        </th>
                      )}
                      {selectedBagSizeFilter === "all" && (
                        <th className="px-6 py-4 text-center text-sm font-bold text-green-600">
                          {totals.current}
                        </th>
                      )}
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default VarietyBreakdownScreen;
