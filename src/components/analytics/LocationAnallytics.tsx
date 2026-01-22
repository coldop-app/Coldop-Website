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
import { MapPin, ChevronRight, Users } from 'lucide-react';

interface LocationData {
  chamber: string;
  floor: string;
  row: string;
  quantity: number;
  variety: string;
  bagSize: string;
  farmerId: string;
  farmerName: string;
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

interface FarmerSummary {
  farmerId: string;
  farmerName: string;
  totalBags: number;
  locations: LocationData[];
}

interface FarmerGroup {
  farmerId: string;
  farmerName: string;
  totalBags: number;
  details: {
    variety: string;
    bagSize: string;
    quantity: number;
    location: string; // Full location string
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

// Helper function to group by key using Object.groupBy (with proper typing)
const groupBy = <T,>(items: T[], keyFn: (item: T) => string): Record<string, T[]> => {
  // Type assertion for Object.groupBy (ES2024+)
  const obj = Object as unknown as {
    groupBy?: <T,>(items: T[], keyFn: (item: T) => string) => Record<string, T[]>
  };
  if (typeof obj.groupBy === 'function') {
    return obj.groupBy(items, keyFn);
  }
  // Fallback implementation
  const result: Record<string, T[]> = {};
  for (const item of items) {
    const key = keyFn(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
  }
  return result;
};


const LocationAnallytics = () => {
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo) as StoreAdmin | null;
  const [selectedChamber, setSelectedChamber] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'location' | 'farmer'>('location');
  const [selectedFarmer, setSelectedFarmer] = useState<string | null>(null);

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
  const allLocationData = useMemo(() => {
    // Extract orders from API response
    const apiResponse = ordersData as { data?: Order[]; status?: string } | undefined;
    const orders = apiResponse?.data || [];

    if (!orders || orders.length === 0) return [];

    const locationDataList: LocationData[] = [];

    (orders as Order[]).forEach((order) => {
      const farmer = typeof order.farmerId === 'object' ? order.farmerId : null;
      const farmerId = farmer?._id || (typeof order.farmerId === 'string' ? order.farmerId : '') || '';
      const farmerName = farmer?.name || 'Unknown Farmer';

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
                locationDataList.push({
                  chamber: parsed.chamber,
                  floor: parsed.floor,
                  row: parsed.row,
                  quantity,
                  variety: orderDetail.variety,
                  bagSize: bagSize.size,
                  farmerId,
                  farmerName,
                });
              }
            }
          }
        });
      });
    });

    return locationDataList;
  }, [ordersData]);

  // Group by chamber using Object.groupBy()
  const chamberData = useMemo(() => {
    if (allLocationData.length === 0) return new Map<string, ChamberSummary>();

    const grouped = groupBy(allLocationData, (item) => item.chamber || 'Unknown');

    const chamberMap = new Map<string, ChamberSummary>();

    Object.entries(grouped).forEach(([chamber, locations]) => {
      if (!locations || locations.length === 0) return;
      const totalBags = locations.reduce((sum, loc) => sum + loc.quantity, 0);
      chamberMap.set(chamber, {
        chamber,
        totalBags,
        locations,
      });
    });

    return chamberMap;
  }, [allLocationData]);

  // Convert map to sorted array
  const chambers = useMemo(() => {
    return Array.from(chamberData.values()).sort((a, b) => a.chamber.localeCompare(b.chamber));
  }, [chamberData]);

  // Get floor summary for selected chamber using Object.groupBy()
  const floors = useMemo(() => {
    if (!selectedChamber) return [];

    const chamberSummary = chamberData.get(selectedChamber);
    if (!chamberSummary) return [];

    // Group by floor using Object.groupBy()
    const grouped = groupBy(chamberSummary.locations, (location) => location.floor || 'Unknown');

    const floorSummaries: FloorSummary[] = Object.entries(grouped).map(([floor, locations]) => {
      if (!locations || locations.length === 0) return { floor, totalBags: 0, locations: [] };
      const totalBags = locations.reduce((sum, loc) => sum + loc.quantity, 0);
      return {
        floor,
        totalBags,
        locations,
      };
    });

    // Sort by floor (numeric if possible, otherwise alphabetical)
    return floorSummaries.sort((a, b) => {
      const floorA = parseInt(a.floor) || 0;
      const floorB = parseInt(b.floor) || 0;
      if (floorA !== 0 || floorB !== 0) {
        return floorA - floorB;
      }
      return a.floor.localeCompare(b.floor);
    });
  }, [selectedChamber, chamberData]);

  // Get row breakdown for selected floor using Object.groupBy()
  const rowBreakdown = useMemo(() => {
    if (!selectedChamber || !selectedFloor) return [];

    const floorSummary = floors.find((f) => f.floor === selectedFloor);
    if (!floorSummary) return [];

    // Group by row using Object.groupBy()
    const grouped = groupBy(floorSummary.locations, (location) => location.row || 'Unknown');

    const rowGroups: RowGroup[] = Object.entries(grouped).map(([row, locations]) => {
      const locationArray = locations as LocationData[];
      if (!locationArray || locationArray.length === 0) return { row, totalBags: 0, details: [] };

      // Group by variety and bagSize within each row
      const varietyBagGrouped = groupBy(
        locationArray,
        (loc) => `${loc.variety}|${loc.bagSize}`
      );

      const details = Object.entries(varietyBagGrouped).map(([key, locs]) => {
        const locArray = locs as LocationData[];
        if (!locArray || locArray.length === 0) return { variety: '', bagSize: '', quantity: 0 };
        const [variety, bagSize] = key.split('|');
        const quantity = locArray.reduce((sum, loc) => sum + loc.quantity, 0);
        return { variety, bagSize, quantity };
      });

      const totalBags = locationArray.reduce((sum, loc) => sum + loc.quantity, 0);

      return {
        row,
        totalBags,
        details,
      };
    });

    // Sort by row (numeric if possible, otherwise alphabetical)
    return rowGroups.sort((a, b) => {
      const rowA = parseInt(a.row) || 0;
      const rowB = parseInt(b.row) || 0;
      if (rowA !== 0 || rowB !== 0) {
        return rowA - rowB;
      }
      return a.row.localeCompare(b.row);
    });
  }, [selectedChamber, selectedFloor, floors]);

  // Get farmer summary using Object.groupBy()
  const farmerData = useMemo(() => {
    if (allLocationData.length === 0) return new Map<string, FarmerSummary>();

    // Group by farmer using Object.groupBy()
    const grouped = groupBy(allLocationData, (item) => item.farmerId || 'Unknown');

    const farmerMap = new Map<string, FarmerSummary>();

    Object.entries(grouped).forEach(([farmerId, locations]) => {
      const locationArray = locations as LocationData[];
      if (!locationArray || locationArray.length === 0) return;
      const farmerName = locationArray[0].farmerName;
      const totalBags = locationArray.reduce((sum, loc) => sum + loc.quantity, 0);
      farmerMap.set(farmerId, {
        farmerId,
        farmerName,
        totalBags,
        locations: locationArray,
      });
    });

    return farmerMap;
  }, [allLocationData]);

  // Convert farmer map to sorted array
  const farmers = useMemo(() => {
    return Array.from(farmerData.values()).sort((a, b) => a.farmerName.localeCompare(b.farmerName));
  }, [farmerData]);

  // Get farmer details breakdown using Object.groupBy()
  const farmerBreakdown = useMemo(() => {
    if (farmers.length === 0) return [];

    // Filter to selected farmer if one is selected
    const farmersToProcess = selectedFarmer
      ? farmers.filter(f => f.farmerId === selectedFarmer)
      : farmers;

    // For each farmer, group by variety and bagSize, and include location
    const breakdown: FarmerGroup[] = farmersToProcess.map((farmer) => {
      // Group by variety and bagSize
      const grouped = groupBy(
        farmer.locations,
        (loc) => `${loc.variety}|${loc.bagSize}`
      );

      const details = Object.entries(grouped).flatMap(([key, locs]) => {
        const locArray = locs as LocationData[];
        if (!locArray || locArray.length === 0) return [];
        const [variety, bagSize] = key.split('|');

        // Group by location for this variety-bagSize combination
        const locationGrouped = groupBy(locArray, (loc) =>
          `${loc.chamber}-${loc.floor}-${loc.row}`.replace(/-+$/, '') || 'Unknown'
        );

        return Object.entries(locationGrouped).map(([location, locationLocs]) => {
          const locationArray = locationLocs as LocationData[];
          if (!locationArray || locationArray.length === 0) return null;
          const quantity = locationArray.reduce((sum, loc) => sum + loc.quantity, 0);
          return {
            variety,
            bagSize,
            quantity,
            location,
          };
        }).filter((d): d is { variety: string; bagSize: string; quantity: number; location: string } => d !== null);
      });

      return {
        farmerId: farmer.farmerId,
        farmerName: farmer.farmerName,
        totalBags: farmer.totalBags,
        details,
      };
    });

    return breakdown;
  }, [farmers, selectedFarmer]);

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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Location Analytics</CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {viewMode === 'location'
                ? 'View storage distribution by chamber, floor, and row. Click on a chamber to see floors, then click on a floor to see rows.'
                : 'View storage distribution by farmer. See detailed breakdown of varieties, bag sizes, and locations for each farmer.'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setViewMode('location');
                setSelectedChamber(null);
                setSelectedFloor(null);
                setSelectedFarmer(null);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'location'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </button>
            <button
              onClick={() => {
                setViewMode('farmer');
                setSelectedChamber(null);
                setSelectedFloor(null);
                setSelectedFarmer(null);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'farmer'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-1" />
              Farmer
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {viewMode === 'location' ? (
          chambers.length === 0 ? (
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
          )
        ) : (
          // Farmer View
          farmers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No farmer data available</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Farmer Overview */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Farmers</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {farmers.map((farmer) => (
                    <button
                      key={farmer.farmerId}
                      onClick={() => setSelectedFarmer(selectedFarmer === farmer.farmerId ? null : farmer.farmerId)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedFarmer === farmer.farmerId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-bold text-gray-900 truncate">{farmer.farmerName}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {formatNumber(farmer.totalBags)} bags
                          </div>
                        </div>
                        <ChevronRight
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            selectedFarmer === farmer.farmerId ? 'rotate-90' : ''
                          }`}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Farmer Breakdown Table - Show only when a farmer is selected */}
              {selectedFarmer && farmerBreakdown.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Breakdown - {farmerBreakdown[0]?.farmerName || 'Selected Farmer'}
                  </h3>
                  <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Location
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
                        {farmerBreakdown.map((farmer) => (
                          <React.Fragment key={farmer.farmerId}>
                            {farmer.details.map((detail, detailIndex) => (
                              <tr
                                key={`${farmer.farmerId}-${detail.location}-${detail.variety}-${detail.bagSize}`}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-4 py-3 text-sm text-gray-700">{detail.location}</td>
                                <td className="px-4 py-3 text-sm text-gray-700">{detail.variety}</td>
                                <td className="px-4 py-3 text-sm text-gray-700">{detail.bagSize}</td>
                                <td className="px-4 py-3 text-sm text-gray-700 text-right">
                                  {formatNumber(detail.quantity)}
                                </td>
                                {detailIndex === 0 && (
                                  <td
                                    rowSpan={farmer.details.length}
                                    className="px-4 py-3 text-sm font-semibold text-gray-900 text-right align-top border-l"
                                  >
                                    {formatNumber(farmer.totalBags)}
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
                              farmerBreakdown.reduce((sum, farmer) => sum + farmer.totalBags, 0)
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {selectedFarmer && farmerBreakdown.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No data available for the selected farmer</p>
                </div>
              )}
            </div>
          )
        )}
      </CardContent>
    </Card>
  );
};

export default LocationAnallytics;
