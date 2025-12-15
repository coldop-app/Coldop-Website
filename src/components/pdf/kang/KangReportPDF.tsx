import React, { useMemo } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// Mock types - replace with your actual imports
interface Order {
  voucher: { voucherNumber: number; type: "RECEIPT" | "DELIVERY" };
  dateOfSubmission?: string;
  dateOfExtraction?: string;
  createdAt?: string;
  remarks?: string;
  orderDetails: Array<{
    variety?: string;
    location?: string;
    bagSizes: Array<{
      size: string;
      location?: string;
      quantity?: number | { initialQuantity: number };
      quantityRemoved?: number;
    }>;
  }>;
}

interface StoreAdmin {
  imageUrl?: string;
  coldStorageDetails: { coldStorageName: string };
  preferences?: { bagSizes?: string[] };
}

interface Farmer {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
  farmerId: string;
  createdAt: string;
}

interface KangReportPdfProps {
  farmer: Farmer;
  adminInfo: StoreAdmin;
  orders: Order[];
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FEFDF8",
    padding: 16,
    paddingBottom: 60,
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
  farmerInfoSection: {
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  farmerInfoLeft: {
    width: "48%",
  },
  farmerInfoRight: {
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
  logoSection: {
    width: 50,
    marginRight: 12,
    position: "absolute",
    left: 0,
    top: 0,
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
  colGrandTotal: {
    width: "8%",
    borderRightWidth: 0.5,
    borderRightColor: "#666",
    paddingHorizontal: 2,
    justifyContent: "center",
    backgroundColor: "#E8E8E8",
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
  balanceText: {
    fontSize: 9,
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
  logo: {
    width: 20,
    height: 20,
    marginBottom: 3,
    opacity: 0.85,
  },
  poweredBy: {
    fontSize: 8,
    color: "#555",
    marginTop: 2,
    fontStyle: "italic",
  },
  pageNumber: {
    fontSize: 9,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
});

interface LedgerEntry {
  date: string | undefined;
  voucher: number;
  type: "RECEIPT" | "DELIVERY";
  variety: string;
  quantitiesWithLocation: {
    [bagSize: string]: { quantity: number; location: string }[];
  };
  total: number;
  grandTotal: number;
}

const formatDate = (date: string | Date | undefined): string => {
  if (!date) return "-";
  try {
    if (typeof date === "string" && date.match(/^\d{2}\.\d{2}\.\d{2}$/)) {
      return date.replace(/\./g, "/");
    }
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    if (isNaN(parsedDate.getTime())) return "-";
    const day = parsedDate.getDate().toString().padStart(2, "0");
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, "0");
    const year = parsedDate.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  } catch {
    return "-";
  }
};

const getOrderDate = (order: Order): string | undefined => {
  return (
    order.dateOfSubmission ||
    order.dateOfExtraction ||
    order.createdAt ||
    undefined
  );
};

const KangReportPdf: React.FC<KangReportPdfProps> = ({
  farmer,
  adminInfo,
  orders,
}) => {
  const bagSizes = useMemo(
    () => adminInfo.preferences?.bagSizes || [],
    [adminInfo.preferences?.bagSizes]
  );

  const { receiptOrders, deliveryOrders } = useMemo(() => {
    const receipt = orders.filter((order) => order.voucher.type === "RECEIPT");
    const delivery = orders.filter(
      (order) => order.voucher.type === "DELIVERY"
    );
    return { receiptOrders: receipt, deliveryOrders: delivery };
  }, [orders]);

  const receiptEntries = useMemo(() => {
    const entries: LedgerEntry[] = [];

    receiptOrders.forEach((order) => {
      order.orderDetails.forEach((detail) => {
        const normalizedBagSizes = new Map(
          detail.bagSizes.map((bag) => [
            bag.size.toLowerCase().replace(/[-\s]/g, ""),
            bag,
          ])
        );

        const quantitiesWithLocation: {
          [bagSize: string]: { quantity: number; location: string }[];
        } = {};

        bagSizes.forEach((size) => {
          quantitiesWithLocation[size] = [];
        });

        let entryTotal = 0;

        bagSizes.forEach((preferredSize) => {
          const normalizedSize = preferredSize
            .toLowerCase()
            .replace(/[-\s]/g, "");
          const matchingBag = normalizedBagSizes.get(normalizedSize);

          if (matchingBag) {
            const location = matchingBag.location || detail.location || "-";

            let initialQty = 0;
            if (matchingBag.quantity) {
              if (
                typeof matchingBag.quantity === "object" &&
                "initialQuantity" in matchingBag.quantity
              ) {
                initialQty = matchingBag.quantity.initialQuantity || 0;
              } else if (typeof matchingBag.quantity === "number") {
                initialQty = matchingBag.quantity;
              }
            }

            if (initialQty > 0) {
              quantitiesWithLocation[preferredSize].push({
                quantity: initialQty,
                location: location,
              });
              entryTotal += initialQty;
            }
          }
        });

        if (entryTotal > 0) {
          entries.push({
            date: getOrderDate(order),
            voucher: order.voucher.voucherNumber,
            type: "RECEIPT",
            variety: detail.variety || "-",
            quantitiesWithLocation,
            total: entryTotal,
            grandTotal: 0,
          });
        }
      });
    });

    entries.sort((a, b) => a.voucher - b.voucher);

    let runningTotal = 0;
    entries.forEach((entry) => {
      runningTotal += entry.total;
      entry.grandTotal = runningTotal;
    });

    return entries;
  }, [receiptOrders, bagSizes]);

  const deliveryEntries = useMemo(() => {
    const entries: LedgerEntry[] = [];

    deliveryOrders.forEach((order) => {
      order.orderDetails.forEach((detail) => {
        const normalizedBagSizes = new Map(
          detail.bagSizes.map((bag) => [
            bag.size.toLowerCase().replace(/[-\s]/g, ""),
            bag,
          ])
        );

        const quantitiesWithLocation: {
          [bagSize: string]: { quantity: number; location: string }[];
        } = {};

        bagSizes.forEach((size) => {
          quantitiesWithLocation[size] = [];
        });

        let entryTotal = 0;

        bagSizes.forEach((preferredSize) => {
          const normalizedSize = preferredSize
            .toLowerCase()
            .replace(/[-\s]/g, "");
          const matchingBag = normalizedBagSizes.get(normalizedSize);

          if (matchingBag && matchingBag.quantityRemoved) {
            const location = matchingBag.location || detail.location || "-";

            if (matchingBag.quantityRemoved > 0) {
              quantitiesWithLocation[preferredSize].push({
                quantity: matchingBag.quantityRemoved,
                location: location,
              });
              entryTotal += matchingBag.quantityRemoved;
            }
          }
        });

        if (entryTotal > 0) {
          entries.push({
            date: getOrderDate(order),
            voucher: order.voucher.voucherNumber,
            type: "DELIVERY",
            variety: detail.variety || "-",
            quantitiesWithLocation,
            total: entryTotal,
            grandTotal: 0,
          });
        }
      });
    });

    entries.sort((a, b) => a.voucher - b.voucher);

    let total = 0;
    entries.forEach((entry) => {
      total += entry.total;
      entry.grandTotal = total;
    });

    return entries;
  }, [deliveryOrders, bagSizes]);

  const receiptTotals = useMemo(() => {
    const totals: { [key: string]: number } = {};
    bagSizes.forEach((size) => {
      totals[size] = receiptEntries.reduce((sum, entry) => {
        const items = entry.quantitiesWithLocation[size] || [];
        return (
          sum + items.reduce((itemSum, item) => itemSum + item.quantity, 0)
        );
      }, 0);
    });
    return totals;
  }, [receiptEntries, bagSizes]);

  // FIXED: Better pagination logic
  const splitEntriesIntoPages = useMemo(() => {
    return (entries: LedgerEntry[], isFirstPage: boolean = false) => {
      const pages: LedgerEntry[][] = [];
      // First page has less space due to farmer info, subsequent pages have more
      const firstPageRows = 20; // Conservative for first page with farmer info
      const subsequentPageRows = 28; // More rows for continuation pages

      if (entries.length === 0) return pages;

      if (isFirstPage && entries.length > firstPageRows) {
        // Split first page
        pages.push(entries.slice(0, firstPageRows));

        // Split remaining entries
        let remaining = entries.slice(firstPageRows);
        while (remaining.length > 0) {
          pages.push(remaining.slice(0, subsequentPageRows));
          remaining = remaining.slice(subsequentPageRows);
        }
      } else if (isFirstPage) {
        // All entries fit on first page
        pages.push(entries);
      } else {
        // Split without first page consideration
        let remaining = entries;
        while (remaining.length > 0) {
          pages.push(remaining.slice(0, subsequentPageRows));
          remaining = remaining.slice(subsequentPageRows);
        }
      }

      return pages;
    };
  }, []);

  const renderTableHeader = (isDeliveryTable: boolean = false) => (
    <View style={styles.tableHeader}>
      <View style={styles.colDate}>
        <Text style={styles.cellHeaderText}>DATE</Text>
      </View>
      <View style={styles.colVoucher}>
        <Text style={styles.cellHeaderText}>VOUCHER</Text>
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
      <View style={styles.colGrandTotal}>
        <Text style={styles.cellHeaderText}>G.TOTAL</Text>
      </View>
      {!isDeliveryTable && (
        <View style={styles.colRemarks}>
          <Text style={styles.cellHeaderText}>REMARKS</Text>
        </View>
      )}
    </View>
  );

  const renderOpeningBalanceRow = (
    initialGrandTotal: number,
    receiptTotals: { [key: string]: number }
  ) => (
    <View style={[styles.tableRow, { backgroundColor: "#F5F5F5" }]}>
      <View style={styles.colDate}>
        <Text style={styles.balanceText}>OPENING</Text>
      </View>
      <View style={styles.colVoucher}>
        <Text style={styles.balanceText}>BALANCE</Text>
      </View>
      <View style={styles.colVariety}>
        <Text style={styles.balanceText}>-</Text>
      </View>
      {bagSizes.map((size) => (
        <View key={size} style={styles.colBagSize}>
          <Text style={styles.balanceText}>{receiptTotals[size] || 0}</Text>
        </View>
      ))}
      <View style={styles.colTotal}>
        <Text style={styles.balanceText}>{initialGrandTotal}</Text>
      </View>
      <View style={styles.colGrandTotal}>
        <Text style={styles.balanceText}>{initialGrandTotal}</Text>
      </View>
    </View>
  );

  const renderTableRow = (
    entry: LedgerEntry,
    index: number,
    isDeliveryTable: boolean,
    initialGrandTotal: number
  ) => (
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
        <Text style={styles.balanceText}>{entry.total}</Text>
      </View>
      <View style={styles.colGrandTotal}>
        <Text style={styles.balanceText}>
          {isDeliveryTable
            ? initialGrandTotal - entry.grandTotal
            : entry.grandTotal}
        </Text>
      </View>
      {!isDeliveryTable && (
        <View style={styles.colRemarks}>
          <Text style={styles.cellText}>
            {receiptOrders.find(
              (o) => o.voucher.voucherNumber === entry.voucher
            )?.remarks || "-"}
          </Text>
        </View>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {adminInfo.imageUrl && (
        <View style={styles.logoSection}>
          <Image style={styles.logo} src={adminInfo.imageUrl} />
        </View>
      )}
      <Text style={styles.companyName}>
        {adminInfo.coldStorageDetails.coldStorageName.toUpperCase()}
      </Text>
      <Text style={styles.reportTitle}>FARMER ACCOUNT LEDGER</Text>
    </View>
  );

  const renderFarmerInfo = () => (
    <View style={styles.farmerInfoSection}>
      <View style={styles.farmerInfoLeft}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>A/c No.:</Text>
          <Text style={styles.infoValue}>{farmer.farmerId}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>{farmer.name.toUpperCase()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Address:</Text>
          <Text style={styles.infoValue}>{farmer.address}</Text>
        </View>
      </View>
      <View style={styles.farmerInfoRight}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mobile:</Text>
          <Text style={styles.infoValue}>{farmer.mobileNumber}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Member Since:</Text>
          <Text style={styles.infoValue}>{formatDate(farmer.createdAt)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Report Date:</Text>
          <Text style={styles.infoValue}>{formatDate(new Date())}</Text>
        </View>
      </View>
    </View>
  );

  const renderSummary = () => (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>Account Summary</Text>
      <View style={styles.summaryTable}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Receipt Transactions:</Text>
          <Text style={styles.summaryValue}>{receiptOrders.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Delivery Transactions:</Text>
          <Text style={styles.summaryValue}>{deliveryOrders.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Bags Received:</Text>
          <Text style={styles.summaryValue}>
            {receiptEntries.reduce((sum, entry) => sum + entry.total, 0)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Bags Delivered:</Text>
          <Text style={styles.summaryValue}>
            {deliveryEntries.reduce((sum, entry) => sum + entry.total, 0)}
          </Text>
        </View>
        <View style={[styles.summaryRow, { backgroundColor: "#D0D0D0" }]}>
          <Text style={styles.summaryLabel}>CLOSING BALANCE:</Text>
          <Text style={styles.summaryValue}>
            {receiptEntries.reduce((sum, entry) => sum + entry.total, 0) -
              deliveryEntries.reduce((sum, entry) => sum + entry.total, 0)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderFooter = (pageNumber: number, totalPages: number) => (
    <View style={styles.footer}>
      <View style={styles.footerLeft}>
        <Text style={styles.footerText}>
          Authorized Signature: ____________________
        </Text>
      </View>
      <View style={styles.footerCenter}>
        <Text style={styles.footerText}>Date: {formatDate(new Date())}</Text>
      </View>
      <View style={styles.footerRight}>
        <Text style={styles.footerText}>
          Page {pageNumber} of {totalPages}
        </Text>
      </View>
    </View>
  );

  if (!orders || orders.length === 0) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          {renderHeader()}
          {renderFarmerInfo()}
          <Text style={styles.reportTitle}>NO TRANSACTIONS FOUND</Text>
          {renderFooter(1, 1)}
        </Page>
      </Document>
    );
  }

  // FIXED: Use the improved pagination
  const receiptPages = splitEntriesIntoPages(receiptEntries, true);
  const deliveryPages = splitEntriesIntoPages(deliveryEntries, false);

  const totalPages = receiptPages.length + deliveryPages.length + 1; // +1 for summary

  const initialGrandTotal = receiptEntries.reduce(
    (sum, entry) => sum + entry.total,
    0
  );

  let currentPageNumber = 1;

  return (
    <Document>
      {/* Receipt pages */}
      {receiptPages.map((pageEntries, pageIndex) => (
        <Page key={`receipt-${pageIndex}`} size="A4" style={styles.page}>
          {renderHeader()}
          {pageIndex === 0 && renderFarmerInfo()}

          <View style={styles.ledgerContainer}>
            <Text style={styles.ledgerTitle}>
              {pageIndex === 0
                ? "Receipt Details"
                : "Receipt Details (continued)"}
            </Text>
            <View style={styles.table}>
              {renderTableHeader(false)}
              {pageEntries.map((entry, index) =>
                renderTableRow(entry, index, false, 0)
              )}
            </View>
          </View>

          {renderFooter(currentPageNumber++, totalPages)}
        </Page>
      ))}

      {/* Delivery pages */}
      {deliveryPages.map((pageEntries, pageIndex) => (
        <Page key={`delivery-${pageIndex}`} size="A4" style={styles.page}>
          {renderHeader()}

          <View style={styles.ledgerContainer}>
            <Text style={styles.ledgerTitle}>
              {pageIndex === 0
                ? "Delivery Details"
                : "Delivery Details (continued)"}
            </Text>
            <View style={styles.table}>
              {renderTableHeader(true)}

              {pageIndex === 0 &&
                receiptTotals &&
                renderOpeningBalanceRow(initialGrandTotal, receiptTotals)}

              {pageEntries.map((entry, index) =>
                renderTableRow(entry, index, true, initialGrandTotal)
              )}
            </View>
          </View>

          {renderFooter(currentPageNumber++, totalPages)}
        </Page>
      ))}

      {/* Summary page */}
      <Page size="A4" style={styles.page}>
        {renderHeader()}
        {renderSummary()}
        {renderFooter(currentPageNumber, totalPages)}
      </Page>
    </Document>
  );
};

export default KangReportPdf;
