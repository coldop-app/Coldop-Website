import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { StoreAdmin } from "@/utils/types";
import coldopLogo from "/coldop-logo.png";

interface BagSize {
  size: string;
  location?: string;
  quantity?:
    | number
    | {
        initialQuantity?: number;
        currentQuantity?: number;
      };
  quantityRemoved?: number;
}

interface OrderDetail {
  variety?: string;
  location?: string;
  bagSizes?: BagSize[];
  incomingOrder?: {
    incomingBagSizes?: Array<{
      size: string;
      location?: string;
    }>;
  };
}

interface Order {
  _id?: string;
  gatePass?: {
    type: "RECEIPT" | "DELIVERY";
    gatePassNumber: number;
  };
  dateOfSubmission?: string;
  dateOfExtraction?: string;
  createdAt?: string;
  orderDetails?: OrderDetail[];
}

interface SummaryData {
  data?: {
    incomingOrders?: Order[];
    outgoingOrders?: Order[];
    summary?: {
      totalIncomingOrders?: number;
      totalOutgoingOrders?: number;
      totalOrders?: number;
    };
  };
  incomingOrders?: Order[];
  outgoingOrders?: Order[];
  summary?: {
    totalIncomingOrders?: number;
    totalOutgoingOrders?: number;
    totalOrders?: number;
  };
}

interface DailySummaryPDFProps {
  adminInfo: StoreAdmin;
  summaryData: SummaryData | unknown;
  startDate: string;
  endDate: string;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FEFDF8",
    padding: 16,
    fontFamily: "Helvetica",
    fontSize: 8,
  },

  header: {
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 6,
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
    marginBottom: 3,
  },
  reportTitle: {
    fontSize: 12,
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

  ledgerContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  ledgerTitle: {
    fontSize: 10,
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
    paddingVertical: 6,
    minHeight: 24,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#666",
    paddingVertical: 2,
    minHeight: 16,
  },

  // Column styles - matching FarmerReportPDF
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
  colVariety: {
    width: "10%",
    borderRightWidth: 0.5,
    borderRightColor: "#666",
    paddingHorizontal: 2,
    justifyContent: "center",
  },
  colChamber: {
    width: "6%",
    borderRightWidth: 0.5,
    borderRightColor: "#666",
    paddingHorizontal: 2,
    justifyContent: "center",
  },
  colFloor: {
    width: "6%",
    borderRightWidth: 0.5,
    borderRightColor: "#666",
    paddingHorizontal: 2,
    justifyContent: "center",
  },
  colRow: {
    width: "6%",
    borderRightWidth: 0.5,
    borderRightColor: "#666",
    paddingHorizontal: 2,
    justifyContent: "center",
  },
  colBagSize: {
    width: "7%",
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
  colGrandTotal: {
    width: "8%",
    borderRightWidth: 0.5,
    borderRightColor: "#666",
    paddingHorizontal: 2,
    justifyContent: "center",
    backgroundColor: "#E8E8E8",
  },
  colMarka: {
    width: "8%",
    borderRightWidth: 0.5,
    borderRightColor: "#666",
    paddingHorizontal: 2,
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },

  cellHeaderText: {
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
    lineHeight: 1.2,
  },
  cellText: {
    fontSize: 7,
    textAlign: "center",
    color: "#000",
  },
  cellTextLeft: {
    fontSize: 7,
    textAlign: "left",
    color: "#000",
  },

  totalRow: {
    backgroundColor: "#E0E0E0",
    fontWeight: "bold",
  },
  balanceText: {
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
  },

  summaryContainer: {
    marginTop: 12,
    padding: 8,
    borderWidth: 2,
    borderColor: "#000",
    backgroundColor: "#F5F5F5",
  },
  summaryTitle: {
    fontSize: 10,
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
    fontSize: 8,
    fontWeight: "bold",
    color: "#000",
  },
  summaryValue: {
    width: "30%",
    paddingHorizontal: 4,
    fontSize: 8,
    fontWeight: "bold",
    textAlign: "right",
    borderLeftWidth: 0.5,
    borderLeftColor: "#666",
    color: "#000",
  },

  footer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
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
  logo: {
    width: 20,
    height: 20,
    marginBottom: 3,
    opacity: 0.85,
  },
  poweredBy: {
    fontSize: 6,
    color: "#555",
    marginTop: 2,
    fontStyle: "italic",
  },

  pageNumber: {
    position: "absolute",
    bottom: 6,
    right: 16,
    fontSize: 7,
    color: "#666",
  },
});

interface LedgerEntry {
  date: string | undefined;
  voucher: number;
  type: "RECEIPT" | "DELIVERY";
  variety: string;
  location: { chamber: string; floor: string; row: string };
  quantities: { [bagSize: string]: number };
  total: number;
  grandTotal: number;
}

// Parse location string into chamber, floor, and row
const parseLocation = (location: string | undefined) => {
  if (!location) return { chamber: "-", floor: "-", row: "-" };

  const parts = location.trim().split("-");
  if (parts.length >= 3) {
    return {
      chamber: parts[0] || "-",
      floor: parts[1] || "-",
      row: parts[2] || "-",
    };
  } else if (parts.length === 2) {
    return {
      chamber: parts[0] || "-",
      floor: parts[1] || "-",
      row: "-",
    };
  }
  return {
    chamber: parts[0] || "-",
    floor: "-",
    row: "-",
  };
};

const formatDate = (date: string | undefined): string => {
  if (!date) return "-";

  // Handle DD.MM.YY format
  if (date.match(/^\d{2}\.\d{2}\.\d{2}$/)) {
    return date.replace(/\./g, "/");
  }
  // Handle DD.MM.YYYY format
  if (date.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
    const parts = date.split(".");
    return `${parts[0]}/${parts[1]}/${parts[2].slice(-2)}`;
  }

  return date;
};

const getOrderDate = (order: Order): string | undefined => {
  if (order.gatePass?.type === "RECEIPT") {
    return order.dateOfSubmission || order.createdAt;
  } else if (order.gatePass?.type === "DELIVERY") {
    return order.dateOfExtraction || order.createdAt;
  }
  return order.createdAt;
};

// Function to clean up bag size headings
const cleanBagSizeHeading = (size: string): string => {
  return size
    .replace(/mm/g, "")
    .replace(/Be-low/g, "Below")
    .trim();
};

const DailySummaryPDF: React.FC<DailySummaryPDFProps> = ({
  adminInfo,
  summaryData,
  startDate,
  endDate,
}) => {
  const data = (summaryData as SummaryData)?.data || (summaryData as SummaryData);
  const incomingOrders = (data?.incomingOrders || []) as Order[];
  const outgoingOrders = (data?.outgoingOrders || []) as Order[];
  const summary = data?.summary || {};
  const bagSizes = adminInfo.preferences?.bagSizes || [];

  // Create receipt ledger entries
  const createReceiptEntries = () => {
    const entries: LedgerEntry[] = [];

    incomingOrders.forEach((order: Order) => {
      if (order.orderDetails) {
        order.orderDetails.forEach((detail: OrderDetail) => {
          const quantities: { [bagSize: string]: number } = {};
          bagSizes.forEach((size) => {
            quantities[size] = 0;
          });

          const normalizedBagSizes = new Map<string, BagSize>(
            detail.bagSizes?.map((bag: BagSize) => [
              bag.size.toLowerCase().replace(/[-\s]/g, ""),
              bag,
            ]) || []
          );

          const bagsByLocation = new Map<
            string,
            { size: string; initialQuantity: number }[]
          >();

          bagSizes.forEach((preferredSize) => {
            const normalizedSize = preferredSize
              .toLowerCase()
              .replace(/[-\s]/g, "");
            const matchingBag = normalizedBagSizes.get(normalizedSize);

            if (matchingBag) {
              const location = matchingBag.location || detail.location || "-";
              if (!bagsByLocation.has(location)) {
                bagsByLocation.set(location, []);
              }

              let initialQty = 0;
              if (matchingBag.quantity) {
                if (
                  typeof matchingBag.quantity === "object" &&
                  "initialQuantity" in matchingBag.quantity
                ) {
                  initialQty =
                    (matchingBag.quantity as { initialQuantity?: number })
                      .initialQuantity || 0;
                } else if (typeof matchingBag.quantity === "number") {
                  initialQty = matchingBag.quantity;
                }
              }

              bagsByLocation.get(location)?.push({
                size: preferredSize,
                initialQuantity: initialQty,
              });
            }
          });

          bagsByLocation.forEach((bags, location) => {
            const locationQuantities: { [bagSize: string]: number } = {};
            bagSizes.forEach((size) => {
              locationQuantities[size] = 0;
            });

            let locationTotal = 0;
            bags.forEach((bag) => {
              locationQuantities[bag.size] = bag.initialQuantity;
              locationTotal += bag.initialQuantity;
            });

            if (locationTotal > 0) {
              entries.push({
                date: getOrderDate(order),
                voucher: order.gatePass?.gatePassNumber || 0,
                type: "RECEIPT",
                variety: detail.variety || "-",
                location: parseLocation(location),
                quantities: locationQuantities,
                total: locationTotal,
                grandTotal: 0,
              });
            }
          });
        });
      }
    });

    entries.sort((a, b) => a.voucher - b.voucher);

    // Aggregate entries with same date and voucher
    const aggregatedEntries: LedgerEntry[] = [];
    const entryMap = new Map<string, LedgerEntry>();

    entries.forEach((entry) => {
      const key = `${entry.date || ""}_${entry.voucher}`;

      if (entryMap.has(key)) {
        const existing = entryMap.get(key)!;
        // Aggregate quantities
        bagSizes.forEach((size) => {
          existing.quantities[size] =
            (existing.quantities[size] || 0) + (entry.quantities[size] || 0);
        });
        // Update total
        existing.total += entry.total;
        // Location can be "-" or keep the first non-empty location
        if (entry.location.chamber !== "-" && existing.location.chamber === "-") {
          existing.location = entry.location;
        }
        // Variety can be combined or keep first
        if (existing.variety !== entry.variety && entry.variety !== "-") {
          existing.variety = existing.variety.includes(entry.variety)
            ? existing.variety
            : `${existing.variety}, ${entry.variety}`;
        }
      } else {
        // Create a new entry
        entryMap.set(key, {
          ...entry,
          quantities: { ...entry.quantities },
        });
      }
    });

    // Convert map to array
    aggregatedEntries.push(...Array.from(entryMap.values()));

    // Sort again after aggregation
    aggregatedEntries.sort((a, b) => {
      if (a.voucher !== b.voucher) {
        return a.voucher - b.voucher;
      }
      return (a.date || "").localeCompare(b.date || "");
    });

    // Recalculate grand totals
    let cumulativeTotal = 0;
    aggregatedEntries.forEach((entry) => {
      cumulativeTotal += entry.total;
      entry.grandTotal = cumulativeTotal;
    });

    return aggregatedEntries;
  };

  // Create delivery ledger entries
  const createDeliveryEntries = () => {
    const entries: LedgerEntry[] = [];

    outgoingOrders.forEach((order: Order) => {
      if (order.orderDetails) {
        order.orderDetails.forEach((detail: OrderDetail) => {
          const quantities: { [bagSize: string]: number } = {};
          bagSizes.forEach((size) => {
            quantities[size] = 0;
          });

          const normalizedBagSizes = new Map<string, BagSize>(
            detail.bagSizes?.map((bag: BagSize) => [
              bag.size.toLowerCase().replace(/[-\s]/g, ""),
              bag,
            ]) || []
          );

          const bagsByLocation = new Map<
            string,
            { size: string; quantity: number }[]
          >();

          // First, collect locations from incoming bag sizes
          const incomingLocations = new Map<string, string>();
          if (detail.incomingOrder?.incomingBagSizes) {
            detail.incomingOrder.incomingBagSizes.forEach((incomingBag) => {
              const normalizedIncomingSize = incomingBag.size
                .toLowerCase()
                .replace(/[-\s]/g, "");
              const location = incomingBag.location || "-";
              incomingLocations.set(normalizedIncomingSize, location);
            });
          }

          bagSizes.forEach((preferredSize) => {
            const normalizedSize = preferredSize
              .toLowerCase()
              .replace(/[-\s]/g, "");
            const matchingBag = normalizedBagSizes.get(normalizedSize);

            if (matchingBag) {
              // Try to get location from outgoing bag, then from incoming bag sizes
              const location =
                matchingBag.location ||
                incomingLocations.get(normalizedSize) ||
                "-";
              if (!bagsByLocation.has(location)) {
                bagsByLocation.set(location, []);
              }

              bagsByLocation.get(location)?.push({
                size: preferredSize,
                quantity: matchingBag.quantityRemoved || 0,
              });
            }
          });

          bagsByLocation.forEach((bags, location) => {
            const locationQuantities: { [bagSize: string]: number } = {};
            bagSizes.forEach((size) => {
              locationQuantities[size] = 0;
            });

            let locationTotal = 0;
            bags.forEach((bag) => {
              locationQuantities[bag.size] = bag.quantity;
              locationTotal += bag.quantity;
            });

            if (locationTotal > 0) {
              entries.push({
                date: getOrderDate(order),
                voucher: order.gatePass?.gatePassNumber || 0,
                type: "DELIVERY",
                variety: detail.variety || "-",
                location: parseLocation(location),
                quantities: locationQuantities,
                total: locationTotal,
                grandTotal: 0,
              });
            }
          });
        });
      }
    });

    entries.sort((a, b) => a.voucher - b.voucher);

    // Aggregate entries with same date and voucher
    const aggregatedEntries: LedgerEntry[] = [];
    const entryMap = new Map<string, LedgerEntry>();

    entries.forEach((entry) => {
      const key = `${entry.date || ""}_${entry.voucher}`;

      if (entryMap.has(key)) {
        const existing = entryMap.get(key)!;
        // Aggregate quantities
        bagSizes.forEach((size) => {
          existing.quantities[size] =
            (existing.quantities[size] || 0) + (entry.quantities[size] || 0);
        });
        // Update total
        existing.total += entry.total;
        // Location can be "-" or keep the first non-empty location
        if (entry.location.chamber !== "-" && existing.location.chamber === "-") {
          existing.location = entry.location;
        }
        // Variety can be combined or keep first
        if (existing.variety !== entry.variety && entry.variety !== "-") {
          existing.variety = existing.variety.includes(entry.variety)
            ? existing.variety
            : `${existing.variety}, ${entry.variety}`;
        }
      } else {
        // Create a new entry
        entryMap.set(key, {
          ...entry,
          quantities: { ...entry.quantities },
        });
      }
    });

    // Convert map to array
    aggregatedEntries.push(...Array.from(entryMap.values()));

    // Sort again after aggregation
    aggregatedEntries.sort((a, b) => {
      if (a.voucher !== b.voucher) {
        return a.voucher - b.voucher;
      }
      return (a.date || "").localeCompare(b.date || "");
    });

    // Recalculate grand totals
    let cumulativeTotal = 0;
    aggregatedEntries.forEach((entry) => {
      cumulativeTotal += entry.total;
      entry.grandTotal = cumulativeTotal;
    });

    return aggregatedEntries;
  };

  const receiptEntries = createReceiptEntries();
  const deliveryEntries = createDeliveryEntries();

  // Calculate totals for each bag size
  const calculateBagSizeTotals = (entries: LedgerEntry[]) => {
    const totals: { [key: string]: number } = {};
    bagSizes.forEach((size) => {
      totals[size] = entries.reduce(
        (sum, entry) => sum + (entry.quantities[size] || 0),
        0
      );
    });
    return totals;
  };

  const receiptTotals = calculateBagSizeTotals(receiptEntries);
  const deliveryTotals = calculateBagSizeTotals(deliveryEntries);

  const renderTable = (
    entries: LedgerEntry[],
    title: string,
    totals: { [key: string]: number },
    isDeliveryTable: boolean = false,
    receiptTotalsForDelivery?: { [key: string]: number }
  ) => {
    const initialGrandTotal =
      isDeliveryTable && receiptTotalsForDelivery
        ? Object.values(receiptTotalsForDelivery).reduce(
            (sum, qty) => sum + qty,
            0
          )
        : 0;

    return (
      <View style={styles.ledgerContainer}>
        <Text style={styles.ledgerTitle}>{title}</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.colDate}>
              <Text style={styles.cellHeaderText}>DATE</Text>
            </View>
            <View style={styles.colVoucher}>
              <Text style={styles.cellHeaderText}>G. Pass</Text>
            </View>
            <View style={styles.colVariety}>
              <Text style={styles.cellHeaderText}>VARIETY</Text>
            </View>
            <View style={styles.colChamber}>
              <Text style={styles.cellHeaderText}>CH</Text>
            </View>
            <View style={styles.colFloor}>
              <Text style={styles.cellHeaderText}>FL</Text>
            </View>
            <View style={styles.colRow}>
              <Text style={styles.cellHeaderText}>ROW</Text>
            </View>
            {bagSizes.map((size) => (
              <View key={size} style={styles.colBagSize}>
                <Text style={styles.cellHeaderText}>
                  {cleanBagSizeHeading(size)}
                </Text>
              </View>
            ))}
            <View style={styles.colTotal}>
              <Text style={styles.cellHeaderText}>TOTAL</Text>
            </View>
            <View style={styles.colGrandTotal}>
              <Text style={styles.cellHeaderText}>G.TOTAL</Text>
            </View>
            {!isDeliveryTable && (
              <View style={styles.colMarka}>
                <Text style={styles.cellHeaderText}>MARKA</Text>
              </View>
            )}
          </View>

          {entries.map((entry, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.colDate}>
                <Text style={styles.cellText}>{formatDate(entry.date)}</Text>
              </View>
              <View style={styles.colVoucher}>
                <Text style={styles.cellText}>{entry.voucher}</Text>
              </View>
              <View style={styles.colVariety}>
                <Text style={styles.cellTextLeft}>{entry.variety}</Text>
              </View>
              <View style={styles.colChamber}>
                <Text style={styles.cellText}>{entry.location.chamber}</Text>
              </View>
              <View style={styles.colFloor}>
                <Text style={styles.cellText}>{entry.location.floor}</Text>
              </View>
              <View style={styles.colRow}>
                <Text style={styles.cellText}>{entry.location.row}</Text>
              </View>
              {bagSizes.map((size) => (
                <View key={size} style={styles.colBagSize}>
                  <Text style={styles.cellText}>
                    {entry.quantities[size] || "-"}
                  </Text>
                </View>
              ))}
              <View style={styles.colTotal}>
                <Text style={styles.balanceText}>{entry.total}</Text>
              </View>
              <View style={styles.colGrandTotal}>
                <Text style={styles.balanceText}>
                  {isDeliveryTable
                    ? Math.abs(initialGrandTotal - entry.grandTotal)
                    : entry.grandTotal}
                </Text>
              </View>
              {!isDeliveryTable && (
                <View style={styles.colMarka}>
                  <Text style={styles.cellText}>
                    {`${entry.voucher}/${entry.total}`}
                  </Text>
                </View>
              )}
            </View>
          ))}

          {/* Total row for receipt table */}
          {!isDeliveryTable && (
            <View style={[styles.tableRow, styles.totalRow]}>
              <View style={styles.colDate}>
                <Text style={styles.balanceText}>TOTAL</Text>
              </View>
              <View style={styles.colVoucher}>
                <Text style={styles.balanceText}>-</Text>
              </View>
              <View style={styles.colVariety}>
                <Text style={styles.balanceText}>-</Text>
              </View>
              <View style={styles.colChamber}>
                <Text style={styles.balanceText}>-</Text>
              </View>
              <View style={styles.colFloor}>
                <Text style={styles.balanceText}>-</Text>
              </View>
              <View style={styles.colRow}>
                <Text style={styles.balanceText}>-</Text>
              </View>
              {bagSizes.map((size) => (
                <View key={size} style={styles.colBagSize}>
                  <Text style={styles.balanceText}>{totals[size] || 0}</Text>
                </View>
              ))}
              <View style={styles.colTotal}>
                <Text style={styles.balanceText}>
                  {entries.reduce((sum, entry) => sum + entry.total, 0)}
                </Text>
              </View>
              <View style={styles.colGrandTotal}>
                <Text style={styles.balanceText}>
                  {entries[entries.length - 1]?.grandTotal || 0}
                </Text>
              </View>
              <View style={styles.colMarka}>
                <Text style={styles.balanceText}>-</Text>
              </View>
            </View>
          )}

          {/* Net bags row for delivery table */}
          {isDeliveryTable && receiptTotalsForDelivery && (
            <View style={[styles.tableRow, styles.totalRow]}>
              <View style={styles.colDate}>
                <Text style={styles.balanceText}>NET BAGS</Text>
              </View>
              <View style={styles.colVoucher}>
                <Text style={styles.balanceText}>-</Text>
              </View>
              <View style={styles.colVariety}>
                <Text style={styles.balanceText}>-</Text>
              </View>
              <View style={styles.colChamber}>
                <Text style={styles.balanceText}>-</Text>
              </View>
              <View style={styles.colFloor}>
                <Text style={styles.balanceText}>-</Text>
              </View>
              <View style={styles.colRow}>
                <Text style={styles.balanceText}>-</Text>
              </View>
              {bagSizes.map((size) => {
                const netBalance =
                  (receiptTotalsForDelivery[size] || 0) - (totals[size] || 0);
                return (
                  <View key={size} style={styles.colBagSize}>
                    <Text style={styles.balanceText}>
                      {Math.abs(netBalance)}
                    </Text>
                  </View>
                );
              })}
              <View style={styles.colTotal}>
                <Text style={styles.balanceText}>
                  {Math.abs(
                    Object.values(receiptTotalsForDelivery).reduce(
                      (sum, qty) => sum + qty,
                      0
                    ) -
                      Object.values(totals).reduce((sum, qty) => sum + qty, 0)
                  )}
                </Text>
              </View>
              <View style={styles.colGrandTotal}>
                <Text style={styles.balanceText}>
                  {Math.abs(
                    Object.values(receiptTotalsForDelivery).reduce(
                      (sum, qty) => sum + qty,
                      0
                    ) -
                      Object.values(totals).reduce((sum, qty) => sum + qty, 0)
                  )}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>
            {adminInfo.coldStorageDetails.coldStorageName.toUpperCase()}
          </Text>
          <Text style={styles.reportTitle}>DAILY SUMMARY REPORT</Text>
          <Text style={styles.dateRange}>
            {formatDate(startDate)} - {formatDate(endDate)}
          </Text>
        </View>

        {/* Receipt Table */}
        {receiptEntries.length > 0 &&
          renderTable(receiptEntries, "Receipt Details", receiptTotals)}

        {/* Delivery Table */}
        {deliveryEntries.length > 0 &&
          renderTable(
            deliveryEntries,
            "Delivery Details",
            deliveryTotals,
            true,
            receiptTotals
          )}

        {/* Summary Box */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Account Summary</Text>
          <View style={styles.summaryTable}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Total Receipt Transactions:
              </Text>
              <Text style={styles.summaryValue}>
                {(summary.totalIncomingOrders || 0) === 0
                  ? "no incoming vouchers were made for this date range"
                  : summary.totalIncomingOrders}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Total Delivery Transactions:
              </Text>
              <Text style={styles.summaryValue}>
                {(summary.totalOutgoingOrders || 0) === 0
                  ? "no outgoing vouchers were made for this date range"
                  : summary.totalOutgoingOrders}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Bags Received:</Text>
              <Text style={styles.summaryValue}>
                {receiptEntries[receiptEntries.length - 1]?.grandTotal || 0}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Bags Delivered:</Text>
              <Text style={styles.summaryValue}>
                {deliveryEntries[deliveryEntries.length - 1]?.grandTotal || 0}
              </Text>
            </View>
            <View style={[styles.summaryRow, { backgroundColor: "#D0D0D0" }]}>
              <Text style={styles.summaryLabel}>CLOSING BALANCE:</Text>
              <Text style={styles.summaryValue}>
                {Math.abs(
                  (receiptEntries[receiptEntries.length - 1]?.grandTotal || 0) -
                    (deliveryEntries[deliveryEntries.length - 1]?.grandTotal ||
                      0)
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerText}>
              Authorized Signature: ____________________
            </Text>
          </View>
          <View style={styles.footerCenter}>
            <Image style={styles.logo} src={coldopLogo} />
            <Text style={styles.poweredBy}>Powered by Coldop</Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.footerText}>
              Date: {(() => {
                const today = new Date();
                const day = today.getDate().toString().padStart(2, "0");
                const month = (today.getMonth() + 1).toString().padStart(2, "0");
                const year = today.getFullYear().toString().slice(-2);
                return `${day}/${month}/${year}`;
              })()}
            </Text>
          </View>
        </View>

        <Text style={styles.pageNumber}>Page 1</Text>
      </Page>
    </Document>
  );
};

export default DailySummaryPDF;
