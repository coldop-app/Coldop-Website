import React, { useMemo } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { StoreAdmin } from "@/utils/types";

interface Farmer {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
  farmerId?: string; // Account number
}

interface BagSizeQuantity {
  initialQuantity: number;
  currentQuantity: number;
}

interface IncomingBagSize {
  size: string;
  quantity: BagSizeQuantity;
  location: string;
}

interface IncomingOrderDetail {
  variety: string;
  bagSizes: IncomingBagSize[];
}

interface IncomingOrder {
  _id: string;
  farmerId: Farmer;
  voucher: {
    type: string;
    voucherNumber: number;
  };
  dateOfSubmission: string;
  remarks: string;
  orderDetails: IncomingOrderDetail[];
  orderType: string;
}

interface OutgoingBagSize {
  size: string;
  quantityRemoved: number;
  location: string;
}

interface OutgoingOrderDetail {
  variety: string;
  incomingOrder?: {
    _id: string;
    voucher: {
      type: string;
      voucherNumber: number;
    };
    incomingBagSizes?: Array<{
      size: string;
      currentQuantity: number;
      initialQuantity: number;
      location: string;
    }>;
  };
  bagSizes: OutgoingBagSize[];
}

interface OutgoingOrder {
  _id: string;
  farmerId: Farmer;
  voucher: {
    type: string;
    voucherNumber: number;
  };
  dateOfExtraction: string;
  remarks: string;
  orderDetails: OutgoingOrderDetail[];
  orderType: string;
}

interface DailySummaryData {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  incomingOrders: IncomingOrder[];
  outgoingOrders: OutgoingOrder[];
  summary: {
    totalIncomingOrders: number;
    totalOutgoingOrders: number;
    totalOrders: number;
  };
}

interface DailySummaryResponse {
  status: string;
  message: string;
  data: DailySummaryData;
}

interface DailySummaryPDFProps {
  adminInfo: StoreAdmin;
  summaryData: unknown;
  startDate: string;
  endDate: string;
  groupByFarmers?: boolean;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FEFDF8",
    padding: 16,
    paddingBottom: 80,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  header: {
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 6,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
    marginBottom: 3,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
    marginBottom: 6,
  },
  dateRange: {
    fontSize: 10,
    textAlign: "center",
    color: "#000",
    marginBottom: 6,
  },
  infoSection: {
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLeft: {
    width: "48%",
  },
  infoRight: {
    width: "48%",
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 3,
    fontSize: 10,
  },
  infoLabel: {
    width: "40%",
    fontWeight: "bold",
    color: "#000",
  },
  infoValue: {
    width: "60%",
    color: "#000",
  },
  ledgerContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  ledgerTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
    color: "#000",
    textTransform: "uppercase",
  },
  table: {
    borderWidth: 1,
    borderColor: "#000",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E8E8E8",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingVertical: 3,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#666",
    paddingVertical: 2,
    minHeight: 24,
  },
  colDate: {
    width: "8%",
    borderRightWidth: 0.5,
    borderRightColor: "#666",
    paddingHorizontal: 2,
    justifyContent: "center",
  },
  colVoucher: {
    width: "8%",
    borderRightWidth: 0.5,
    borderRightColor: "#666",
    paddingHorizontal: 2,
    justifyContent: "center",
  },
  colFarmer: {
    width: "12%",
    borderRightWidth: 0.5,
    borderRightColor: "#666",
    paddingHorizontal: 2,
    justifyContent: "center",
  },
  colVariety: {
    width: "12%",
    borderRightWidth: 0.5,
    borderRightColor: "#666",
    paddingHorizontal: 2,
    justifyContent: "center",
  },
  colBagSize: {
    width: "10%",
    borderRightWidth: 0.5,
    borderRightColor: "#666",
    paddingHorizontal: 2,
    justifyContent: "center",
  },
  colTotal: {
    width: "8%",
    borderRightWidth: 0.5,
    borderRightColor: "#666",
    paddingHorizontal: 2,
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  colRemarks: {
    width: "10%",
    borderRightWidth: 0.5,
    borderRightColor: "#666",
    paddingHorizontal: 2,
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  cellHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
  },
  cellText: {
    fontSize: 9,
    textAlign: "center",
    color: "#000",
  },
  cellTextLeft: {
    fontSize: 9,
    textAlign: "left",
    color: "#000",
  },
  bagCellContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  locationText: {
    fontSize: 8,
    color: "#555",
    marginBottom: 2,
  },
  quantityText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
  },
  totalRow: {
    backgroundColor: "#E0E0E0",
    fontWeight: "bold",
  },
  summaryContainer: {
    marginTop: 12,
    padding: 8,
    borderWidth: 2,
    borderColor: "#000",
    backgroundColor: "#F5F5F5",
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
    textTransform: "uppercase",
    color: "#000",
  },
  summaryTable: {
    borderWidth: 1,
    borderColor: "#000",
  },
  summaryRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#666",
    paddingVertical: 3,
  },
  summaryLabel: {
    width: "70%",
    paddingHorizontal: 4,
    fontSize: 10,
    fontWeight: "bold",
    color: "#000",
  },
  summaryValue: {
    width: "30%",
    paddingHorizontal: 4,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "right",
    borderLeftWidth: 0.5,
    borderLeftColor: "#666",
    color: "#000",
  },
  footer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 6,
  },
  footerText: {
    fontSize: 9,
    color: "#000",
  },
  footerLeft: {
    flex: 1,
  },
  footerCenter: {
    flex: 1,
    alignItems: "center",
  },
  footerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
});

const formatDate = (date: string | undefined): string => {
  if (!date) return "-";
  try {
    if (typeof date === "string" && date.match(/^\d{2}\.\d{2}\.\d{2}$/)) {
      return date.replace(/\./g, "/");
    }
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "-";
    const day = parsedDate.getDate().toString().padStart(2, "0");
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, "0");
    const year = parsedDate.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  } catch {
    return "-";
  }
};

// Helper function to group by key using Object.groupBy (with fallback for compatibility)
const groupBy = <T,>(items: T[], keyFn: (item: T) => string): Record<string, T[]> => {
  // Check if Object.groupBy is available (ES2024+)
  // Using bracket notation to access groupBy to avoid TypeScript errors
  const obj = Object as unknown as { groupBy?: <T,>(items: T[], keyFn: (item: T) => string) => Record<string, T[]> };
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

interface LedgerEntry {
  date: string;
  voucher: number;
  farmer: string;
  variety: string;
  quantitiesWithLocation: {
    [bagSize: string]: { quantity: number; location: string }[];
  };
  total: number;
  remarks: string;
}

const DailySummaryPDF: React.FC<DailySummaryPDFProps> = ({
  adminInfo,
  summaryData,
  startDate,
  endDate,
  groupByFarmers = false,
}) => {
  // Handle nested API response structure
  const response = summaryData as DailySummaryResponse | null;
  const data = response?.data || (summaryData as DailySummaryData | null);

  const bagSizes = useMemo(() => {
    if (!data) return [];
    const sizes = new Set<string>();
    (data.incomingOrders || []).forEach((order) => {
      if (order.orderDetails) {
        order.orderDetails.forEach((detail) => {
          if (detail.bagSizes) {
            detail.bagSizes.forEach((bag) => {
              sizes.add(bag.size);
            });
          }
        });
      }
    });
    (data.outgoingOrders || []).forEach((order) => {
      if (order.orderDetails) {
        order.orderDetails.forEach((detail) => {
          if (detail.bagSizes) {
            detail.bagSizes.forEach((bag) => {
              sizes.add(bag.size);
            });
          }
        });
      }
    });
    return Array.from(sizes).sort();
  }, [data]);

  const incomingEntries = useMemo(() => {
    if (!data) return [];
    const entries: LedgerEntry[] = [];

    (data.incomingOrders || []).forEach((order) => {
      if (!order.orderDetails) return;
      order.orderDetails.forEach((detail) => {
        const quantitiesWithLocation: {
          [bagSize: string]: { quantity: number; location: string }[];
        } = {};

        bagSizes.forEach((size) => {
          quantitiesWithLocation[size] = [];
        });

        let entryTotal = 0;

        if (!detail.bagSizes) return;
        detail.bagSizes.forEach((bag) => {
          const initialQty = bag.quantity?.initialQuantity || 0;
          if (initialQty > 0) {
            if (!quantitiesWithLocation[bag.size]) {
              quantitiesWithLocation[bag.size] = [];
            }
            quantitiesWithLocation[bag.size].push({
              quantity: initialQty,
              location: bag.location || "-",
            });
            entryTotal += initialQty;
          }
        });

        if (entryTotal > 0) {
          entries.push({
            date: order.dateOfSubmission || "-",
            voucher: order.voucher?.voucherNumber || 0,
            farmer: order.farmerId?.name || "-",
            variety: detail.variety || "-",
            quantitiesWithLocation,
            total: entryTotal,
            remarks: order.remarks || "-",
          });
        }
      });
    });

    entries.sort((a, b) => a.voucher - b.voucher);
    return entries;
  }, [data, bagSizes]);

  const outgoingEntries = useMemo(() => {
    if (!data) return [];
    const entries: LedgerEntry[] = [];

    (data.outgoingOrders || []).forEach((order) => {
      if (!order.orderDetails) return;
      order.orderDetails.forEach((detail) => {
        const quantitiesWithLocation: {
          [bagSize: string]: { quantity: number; location: string }[];
        } = {};

        bagSizes.forEach((size) => {
          quantitiesWithLocation[size] = [];
        });

        let entryTotal = 0;

        if (!detail.bagSizes) return;
        detail.bagSizes.forEach((bag) => {
          const qtyRemoved = bag.quantityRemoved || 0;
          if (qtyRemoved > 0) {
            if (!quantitiesWithLocation[bag.size]) {
              quantitiesWithLocation[bag.size] = [];
            }
            quantitiesWithLocation[bag.size].push({
              quantity: qtyRemoved,
              location: bag.location || "-",
            });
            entryTotal += qtyRemoved;
          }
        });

        if (entryTotal > 0) {
          entries.push({
            date: order.dateOfExtraction || "-",
            voucher: order.voucher?.voucherNumber || 0,
            farmer: order.farmerId?.name || "-",
            variety: detail.variety || "-",
            quantitiesWithLocation,
            total: entryTotal,
            remarks: order.remarks || "-",
          });
        }
      });
    });

    entries.sort((a, b) => a.voucher - b.voucher);
    return entries;
  }, [data, bagSizes]);

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <View style={styles.colDate}>
        <Text style={styles.cellHeaderText}>DATE</Text>
      </View>
      <View style={styles.colVoucher}>
        <Text style={styles.cellHeaderText}>VOUCHER</Text>
      </View>
      <View style={styles.colFarmer}>
        <Text style={styles.cellHeaderText}>FARMER</Text>
      </View>
      <View style={styles.colVariety}>
        <Text style={styles.cellHeaderText}>VARIETY</Text>
      </View>
      {bagSizes.map((size) => (
        <View key={size} style={styles.colBagSize}>
          <Text style={styles.cellHeaderText}>{size}</Text>
        </View>
      ))}
      <View style={styles.colTotal}>
        <Text style={styles.cellHeaderText}>TOTAL</Text>
      </View>
      <View style={styles.colRemarks}>
        <Text style={styles.cellHeaderText}>REMARKS</Text>
      </View>
    </View>
  );

  const renderTableRow = (entry: LedgerEntry, index: number) => (
    <View key={index} style={styles.tableRow}>
      <View style={styles.colDate}>
        <Text style={styles.cellText}>{formatDate(entry.date)}</Text>
      </View>
      <View style={styles.colVoucher}>
        <Text style={styles.cellText}>{entry.voucher}</Text>
      </View>
      <View style={styles.colFarmer}>
        <Text style={styles.cellTextLeft}>{entry.farmer}</Text>
      </View>
      <View style={styles.colVariety}>
        <Text style={styles.cellTextLeft}>{entry.variety}</Text>
      </View>
      {bagSizes.map((size) => {
        const items = entry.quantitiesWithLocation[size] || [];
        return (
          <View key={size} style={styles.colBagSize}>
            {items.length > 0 ? (
              items.map((item, idx) => (
                <View key={idx} style={styles.bagCellContainer}>
                  <Text style={styles.quantityText}>{item.quantity}</Text>
                  <Text style={styles.locationText}>{item.location}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.cellText}>-</Text>
            )}
          </View>
        );
      })}
      <View style={styles.colTotal}>
        <Text style={styles.quantityText}>{entry.total}</Text>
      </View>
      <View style={styles.colRemarks}>
        <Text style={styles.cellText}>{entry.remarks}</Text>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.companyName}>
        {adminInfo.coldStorageDetails.coldStorageName.toUpperCase()}
      </Text>
      <Text style={styles.reportTitle}>DAILY SUMMARY REPORT</Text>
      <Text style={styles.dateRange}>
        {formatDate(startDate)} to {formatDate(endDate)}
      </Text>
    </View>
  );

  const renderInfoSection = () => (
    <View style={styles.infoSection}>
      <View style={styles.infoLeft}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cold Storage:</Text>
          <Text style={styles.infoValue}>
            {adminInfo.coldStorageDetails.coldStorageName}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Address:</Text>
          <Text style={styles.infoValue}>
            {adminInfo.coldStorageDetails.coldStorageAddress}
          </Text>
        </View>
      </View>
      <View style={styles.infoRight}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Contact:</Text>
          <Text style={styles.infoValue}>
            {adminInfo.coldStorageDetails.coldStorageContactNumber}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Report Date:</Text>
          <Text style={styles.infoValue}>
            {formatDate(new Date().toISOString())}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderSummary = () => {
    if (!data) return null;

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <View style={styles.summaryTable}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Incoming Orders:</Text>
            <Text style={styles.summaryValue}>
              {data.summary.totalIncomingOrders}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Outgoing Orders:</Text>
            <Text style={styles.summaryValue}>
              {data.summary.totalOutgoingOrders}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Orders:</Text>
            <Text style={styles.summaryValue}>
              {data.summary.totalOrders}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  // Group entries by farmer if groupByFarmers is enabled
  const groupedIncomingEntries = useMemo(() => {
    if (!groupByFarmers) return null;
    return groupBy(incomingEntries, (entry: LedgerEntry) => entry.farmer || "Unknown");
  }, [incomingEntries, groupByFarmers]);

  const groupedOutgoingEntries = useMemo(() => {
    if (!groupByFarmers) return null;
    return groupBy(outgoingEntries, (entry: LedgerEntry) => entry.farmer || "Unknown");
  }, [outgoingEntries, groupByFarmers]);

  if (!data || (!data.incomingOrders?.length && !data.outgoingOrders?.length)) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {renderHeader()}
          {renderInfoSection()}
          <Text style={styles.reportTitle}>NO TRANSACTIONS FOUND</Text>
        </Page>
      </Document>
    );
  }

  const itemsPerPage = 15;

  // Render grouped by farmers
  if (groupByFarmers) {
    // Create a map of farmer name to account number for sorting
    const farmerAccountMap = new Map<string, string>();

    // Extract account numbers from incoming orders
    (data.incomingOrders || []).forEach((order) => {
      const farmerName = order.farmerId?.name || "Unknown";
      const accountNumber = order.farmerId?.farmerId || "0";
      if (!farmerAccountMap.has(farmerName)) {
        farmerAccountMap.set(farmerName, accountNumber);
      }
    });

    // Extract account numbers from outgoing orders
    (data.outgoingOrders || []).forEach((order) => {
      const farmerName = order.farmerId?.name || "Unknown";
      const accountNumber = order.farmerId?.farmerId || "0";
      if (!farmerAccountMap.has(farmerName)) {
        farmerAccountMap.set(farmerName, accountNumber);
      }
    });

    const allFarmers = new Set<string>();
    if (groupedIncomingEntries) {
      Object.keys(groupedIncomingEntries).forEach((farmer) => allFarmers.add(farmer));
    }
    if (groupedOutgoingEntries) {
      Object.keys(groupedOutgoingEntries).forEach((farmer) => allFarmers.add(farmer));
    }

    // Sort farmers by account number (numeric sort)
    const sortedFarmers = Array.from(allFarmers).sort((a, b) => {
      const accountA = farmerAccountMap.get(a) || "0";
      const accountB = farmerAccountMap.get(b) || "0";
      // Convert to numbers for numeric sort, fallback to string comparison if not numeric
      const numA = parseInt(accountA, 10);
      const numB = parseInt(accountB, 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return accountA.localeCompare(accountB);
    });

    return (
      <Document>
        {sortedFarmers.map((farmer) => {
          const farmerIncomingEntries = groupedIncomingEntries?.[farmer] || [];
          const farmerOutgoingEntries = groupedOutgoingEntries?.[farmer] || [];

          if (farmerIncomingEntries.length === 0 && farmerOutgoingEntries.length === 0) {
            return null;
          }

          const incomingPages = Math.ceil(farmerIncomingEntries.length / itemsPerPage);
          const outgoingPages = Math.ceil(farmerOutgoingEntries.length / itemsPerPage);

          return (
            <React.Fragment key={farmer}>
              {/* Incoming Orders Pages for this farmer */}
              {farmerIncomingEntries.length > 0 && (
                <>
                  {Array.from({ length: incomingPages }).map((_, pageIndex) => {
                    const startIdx = pageIndex * itemsPerPage;
                    const endIdx = startIdx + itemsPerPage;
                    const pageEntries = farmerIncomingEntries.slice(startIdx, endIdx);
                    const isLastPage = pageIndex === incomingPages - 1;
                    const isFirstPage = pageIndex === 0;

                    return (
                      <Page key={`incoming-${farmer}-${pageIndex}`} size="A4" style={styles.page}>
                        {isFirstPage && renderHeader()}
                        {isFirstPage && renderInfoSection()}
                        <View style={styles.ledgerContainer}>
                          <Text style={styles.ledgerTitle}>
                            Incoming Orders - {farmer}
                          </Text>
                          <View style={styles.table}>
                            {isFirstPage && renderTableHeader()}
                            {pageEntries.map((entry: LedgerEntry, idx: number) =>
                              renderTableRow(entry, startIdx + idx)
                            )}
                          </View>
                        </View>
                        {isLastPage && farmerOutgoingEntries.length === 0 && renderSummary()}
                        <View style={styles.footer}>
                          <View style={styles.footerLeft}>
                            <Text style={styles.footerText}>
                              Page {pageIndex + 1} of {incomingPages} - {farmer}
                            </Text>
                          </View>
                          <View style={styles.footerCenter}>
                            <Text style={styles.footerText}>
                              Generated on {formatDate(new Date().toISOString())}
                            </Text>
                          </View>
                          <View style={styles.footerRight}>
                            <Text style={styles.footerText}>Coldop ERP System</Text>
                          </View>
                        </View>
                      </Page>
                    );
                  })}
                </>
              )}

              {/* Outgoing Orders Pages for this farmer */}
              {farmerOutgoingEntries.length > 0 && (
                <>
                  {Array.from({ length: outgoingPages }).map((_, pageIndex) => {
                    const startIdx = pageIndex * itemsPerPage;
                    const endIdx = startIdx + itemsPerPage;
                    const pageEntries = farmerOutgoingEntries.slice(startIdx, endIdx);
                    const isFirstPage = pageIndex === 0;
                    const isLastPage = pageIndex === outgoingPages - 1;

                    return (
                      <Page key={`outgoing-${farmer}-${pageIndex}`} size="A4" style={styles.page}>
                        {isFirstPage && farmerIncomingEntries.length === 0 && renderHeader()}
                        {isFirstPage && farmerIncomingEntries.length === 0 && renderInfoSection()}
                        <View style={styles.ledgerContainer}>
                          <Text style={styles.ledgerTitle}>
                            Outgoing Orders - {farmer}
                          </Text>
                          <View style={styles.table}>
                            {isFirstPage && renderTableHeader()}
                            {pageEntries.map((entry: LedgerEntry, idx: number) =>
                              renderTableRow(entry, startIdx + idx)
                            )}
                          </View>
                        </View>
                        {isLastPage && renderSummary()}
                        <View style={styles.footer}>
                          <View style={styles.footerLeft}>
                            <Text style={styles.footerText}>
                              Page {pageIndex + 1} of {outgoingPages} - {farmer}
                            </Text>
                          </View>
                          <View style={styles.footerCenter}>
                            <Text style={styles.footerText}>
                              Generated on {formatDate(new Date().toISOString())}
                            </Text>
                          </View>
                          <View style={styles.footerRight}>
                            <Text style={styles.footerText}>Coldop ERP System</Text>
                          </View>
                        </View>
                      </Page>
                    );
                  })}
                </>
              )}
            </React.Fragment>
          );
        })}
      </Document>
    );
  }

  // Original rendering (not grouped)
  const incomingPages = Math.ceil(incomingEntries.length / itemsPerPage);
  const outgoingPages = Math.ceil(outgoingEntries.length / itemsPerPage);

  return (
    <Document>
      {/* Incoming Orders Pages */}
      {incomingEntries.length > 0 && (
        <>
          {Array.from({ length: incomingPages }).map((_, pageIndex) => {
            const startIdx = pageIndex * itemsPerPage;
            const endIdx = startIdx + itemsPerPage;
            const pageEntries = incomingEntries.slice(startIdx, endIdx);
            const isLastPage = pageIndex === incomingPages - 1;

            return (
              <Page key={`incoming-${pageIndex}`} size="A4" style={styles.page}>
                {renderHeader()}
                {pageIndex === 0 && renderInfoSection()}
                <View style={styles.ledgerContainer}>
                  <Text style={styles.ledgerTitle}>Incoming Orders</Text>
                  <View style={styles.table}>
                    {pageIndex === 0 && renderTableHeader()}
                    {pageEntries.map((entry, idx) =>
                      renderTableRow(entry, startIdx + idx)
                    )}
                  </View>
                </View>
                {isLastPage && renderSummary()}
                <View style={styles.footer}>
                  <View style={styles.footerLeft}>
                    <Text style={styles.footerText}>
                      Page {pageIndex + 1} of {incomingPages}
                    </Text>
                  </View>
                  <View style={styles.footerCenter}>
                    <Text style={styles.footerText}>
                      Generated on {formatDate(new Date().toISOString())}
                    </Text>
                  </View>
                  <View style={styles.footerRight}>
                    <Text style={styles.footerText}>Coldop ERP System</Text>
                  </View>
                </View>
              </Page>
            );
          })}
        </>
      )}

      {/* Outgoing Orders Pages */}
      {outgoingEntries.length > 0 && (
        <>
          {Array.from({ length: outgoingPages }).map((_, pageIndex) => {
            const startIdx = pageIndex * itemsPerPage;
            const endIdx = startIdx + itemsPerPage;
            const pageEntries = outgoingEntries.slice(startIdx, endIdx);
            const isFirstPage = pageIndex === 0;
            const isLastPage = pageIndex === outgoingPages - 1;

            return (
              <Page key={`outgoing-${pageIndex}`} size="A4" style={styles.page}>
                {isFirstPage && renderHeader()}
                {isFirstPage && renderInfoSection()}
                <View style={styles.ledgerContainer}>
                  <Text style={styles.ledgerTitle}>Outgoing Orders</Text>
                  <View style={styles.table}>
                    {isFirstPage && renderTableHeader()}
                    {pageEntries.map((entry, idx) =>
                      renderTableRow(entry, startIdx + idx)
                    )}
                  </View>
                </View>
                {isLastPage && !incomingEntries.length && renderSummary()}
                <View style={styles.footer}>
                  <View style={styles.footerLeft}>
                    <Text style={styles.footerText}>
                      Page {pageIndex + 1} of {outgoingPages}
                    </Text>
                  </View>
                  <View style={styles.footerCenter}>
                    <Text style={styles.footerText}>
                      Generated on {formatDate(new Date().toISOString())}
                    </Text>
                  </View>
                  <View style={styles.footerRight}>
                    <Text style={styles.footerText}>Coldop ERP System</Text>
                  </View>
                </View>
              </Page>
            );
          })}
        </>
      )}

      {/* Summary Page if both sections exist */}
      {incomingEntries.length > 0 &&
        outgoingEntries.length > 0 &&
        outgoingPages > 0 && (
          <Page size="A4" style={styles.page}>
            {renderHeader()}
            {renderSummary()}
            <View style={styles.footer}>
              <View style={styles.footerLeft}>
                <Text style={styles.footerText}>Summary Page</Text>
              </View>
              <View style={styles.footerCenter}>
                <Text style={styles.footerText}>
                  Generated on {formatDate(new Date().toISOString())}
                </Text>
              </View>
              <View style={styles.footerRight}>
                <Text style={styles.footerText}>Coldop ERP System</Text>
              </View>
            </View>
          </Page>
        )}
    </Document>
  );
};

export default DailySummaryPDF;
