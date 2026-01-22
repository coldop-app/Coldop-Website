import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { storeAdminApi } from '@/lib/api/storeAdmin';
import { Order, BagSize } from '@/utils/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StoreAdmin } from '@/utils/types';
import { formatNumber } from '@/lib/utils';
import { MapPin, ChevronRight } from 'lucide-react';

interface LocationData {
  chamber: string;
  floor: string;
  row: string;
  quantity: number;
  variety: string;
  bagSize: string;
}

interface ChamberSummary {
  chamber: string;
  totalBags: number;
  locations: LocationData[];
}

interface FloorSummary {
  floor: string;
  totalBags: number;
  locations: LocationData[];
}

interface RowGroup {
  row: string;
  totalBags: number;
  details: {
    variety: string;
    bagSize: string;
    quantity: number;
  }[];
}

// Helper function to parse location string
const parseLocation = (location: string | undefined): { chamber: string; floor: string; row: string } => {
  if (!location) return { chamber: '', floor: '', row: '' };
  const parts = location.trim().split('-');
  return {
    chamber: parts[0] || '',
    floor: parts[1] || '',
    row: parts[2] || '',
  };
};


const LocationAnallytics = () => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo) as StoreAdmin | null;
  const [selectedChamber, setSelectedChamber] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);

  // Fetch incoming orders
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['daybookOrders', 'incoming', adminInfo?.token],
    queryFn: () => storeAdminApi.getDaybookOrders(
      { type: 'incoming', sortBy: 'latest', page: 1, limit: 1000 },
      adminInfo?.token || ''
    ),
    enabled: !!adminInfo?.token,
  });

  // Process orders to extract location data
  const chamberData = useMemo(() => {
    // Extract orders from API response
    const apiResponse = ordersData as { data?: Order[]; status?: string } | undefined;
    const orders = apiResponse?.data || [];

    if (!orders || orders.length === 0) return new Map<string, ChamberSummary>();

    const chamberMap = new Map<string, ChamberSummary>();

    (orders as Order[]).forEach((order) => {
      order.orderDetails?.forEach((orderDetail) => {
        // Process bag sizes with their locations
        orderDetail.bagSizes?.forEach((bagSize: BagSize) => {
          const quantity = bagSize.quantity?.currentQuantity || 0;
          if (quantity > 0) {
            // Get location from bag size, order detail, or incoming order
            const locationString = bagSize.location || orderDetail.location || orderDetail.incomingOrder?.location;
            if (locationString) {
              const parsed = parseLocation(locationString);
              const chamber = parsed.chamber;

              if (chamber) {
                if (!chamberMap.has(chamber)) {
                  chamberMap.set(chamber, {
                    chamber,
                    totalBags: 0,
                    locations: [],
                  });
                }

                const chamberSummary = chamberMap.get(chamber)!;
                chamberSummary.totalBags += quantity;
                chamberSummary.locations.push({
                  chamber: parsed.chamber,
                  floor: parsed.floor,
                  row: parsed.row,
                  quantity,
                  variety: orderDetail.variety,
                  bagSize: bagSize.size,
                });
              }
            }
          }
        });
      });
    });

    return chamberMap;
  }, [ordersData]);

  // Convert map to sorted array
  const chambers = useMemo(() => {
    return Array.from(chamberData.values()).sort((a, b) => a.chamber.localeCompare(b.chamber));
  }, [chamberData]);

  // Get floor summary for selected chamber
  const floors = useMemo(() => {
    if (!selectedChamber) return [];

    const chamberSummary = chamberData.get(selectedChamber);
    if (!chamberSummary) return [];

    // Group by floor
    const floorMap = new Map<string, FloorSummary>();

    chamberSummary.locations.forEach((location) => {
      const floor = location.floor || 'Unknown';
      if (!floorMap.has(floor)) {
        floorMap.set(floor, {
          floor,
          totalBags: 0,
          locations: [],
        });
      }

      const floorSummary = floorMap.get(floor)!;
      floorSummary.totalBags += location.quantity;
      floorSummary.locations.push(location);
    });

    // Sort by floor (numeric if possible, otherwise alphabetical)
    return Array.from(floorMap.values()).sort((a, b) => {
      const floorA = parseInt(a.floor) || 0;
      const floorB = parseInt(b.floor) || 0;
      if (floorA !== 0 || floorB !== 0) {
        return floorA - floorB;
      }
      return a.floor.localeCompare(b.floor);
    });
  }, [selectedChamber, chamberData]);

  // Get row breakdown for selected floor
  const rowBreakdown = useMemo(() => {
    if (!selectedChamber || !selectedFloor) return [];

    const floorSummary = floors.find((f) => f.floor === selectedFloor);
    if (!floorSummary) return [];

    // Group by row
    const rowMap = new Map<string, RowGroup>();

    floorSummary.locations.forEach((location) => {
      const row = location.row || 'Unknown';
      if (!rowMap.has(row)) {
        rowMap.set(row, {
          row,
          totalBags: 0,
          details: [],
        });
      }

      const group = rowMap.get(row)!;
      group.totalBags += location.quantity;

      // Check if this variety-bagSize combination already exists
      const existingDetail = group.details.find(
        (d) => d.variety === location.variety && d.bagSize === location.bagSize
      );

      if (existingDetail) {
        existingDetail.quantity += location.quantity;
      } else {
        group.details.push({
          variety: location.variety,
          bagSize: location.bagSize,
          quantity: location.quantity,
        });
      }
    });

    // Sort by row (numeric if possible, otherwise alphabetical)
    return Array.from(rowMap.values()).sort((a, b) => {
      const rowA = parseInt(a.row) || 0;
      const rowB = parseInt(b.row) || 0;
      if (rowA !== 0 || rowB !== 0) {
        return rowA - rowB;
      }
      return a.row.localeCompare(b.row);
    });
  }, [selectedChamber, selectedFloor, floors]);

  if (isLoading) {
    return (
      <Card className="bg-white shadow-sm">
        <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Location Analytics</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Location Analytics</CardTitle>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          View storage distribution by chamber, floor, and row. Click on a chamber to see floors, then click on a floor to see rows.
        </p>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {chambers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No location data available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Chamber Overview */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Chambers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {chambers.map((chamber) => (
                  <button
                    key={chamber.chamber}
                    onClick={() => {
                      setSelectedChamber(selectedChamber === chamber.chamber ? null : chamber.chamber);
                      setSelectedFloor(null); // Reset floor selection when chamber changes
                    }}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedChamber === chamber.chamber
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-bold text-gray-900">Chamber {chamber.chamber}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          {formatNumber(chamber.totalBags)} bags
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-gray-400 transition-transform ${
                          selectedChamber === chamber.chamber ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Floor Overview - Show when chamber is selected */}
            {selectedChamber && floors.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Floors - Chamber {selectedChamber}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {floors.map((floor) => (
                    <button
                      key={floor.floor}
                      onClick={() => setSelectedFloor(selectedFloor === floor.floor ? null : floor.floor)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedFloor === floor.floor
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-bold text-gray-900">Floor {floor.floor}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {formatNumber(floor.totalBags)} bags
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            selectedFloor === floor.floor ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Row Breakdown Table - Show when floor is selected */}
            {selectedChamber && selectedFloor && rowBreakdown.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Row Breakdown - Chamber {selectedChamber}, Floor {selectedFloor}
                </h3>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Row
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Variety
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Bag Size
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rowBreakdown.map((group) => (
                        <React.Fragment key={group.row}>
                          {group.details.map((detail, detailIndex) => (
                            <tr
                              key={`${group.row}-${detail.variety}-${detail.bagSize}`}
                              className="hover:bg-gray-50"
                            >
                              {detailIndex === 0 && (
                                <td
                                  rowSpan={group.details.length}
                                  className="px-4 py-3 text-sm font-medium text-gray-900 align-top border-r"
                                >
                                  {group.row || '-'}
                                </td>
                              )}
                              <td className="px-4 py-3 text-sm text-gray-700">{detail.variety}</td>
                              <td className="px-4 py-3 text-sm text-gray-700">{detail.bagSize}</td>
                              <td className="px-4 py-3 text-sm text-gray-700 text-right">
                                {formatNumber(detail.quantity)}
                              </td>
                              {detailIndex === 0 && (
                                <td
                                  rowSpan={group.details.length}
                                  className="px-4 py-3 text-sm font-semibold text-gray-900 text-right align-top border-l"
                                >
                                  {formatNumber(group.totalBags)}
                                </td>
                              )}
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t-2">
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                          Grand Total:
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                          {formatNumber(
                            rowBreakdown.reduce((sum, group) => sum + group.totalBags, 0)
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {selectedChamber && floors.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No floor data available for Chamber {selectedChamber}</p>
              </div>
            )}

            {selectedChamber && selectedFloor && rowBreakdown.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No row data available for Chamber {selectedChamber}, Floor {selectedFloor}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationAnallytics;
