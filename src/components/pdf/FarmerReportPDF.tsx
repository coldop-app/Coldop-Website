import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Order, StoreAdmin } from '@/utils/types';
import coldopLogo from '/coldop-logo.png';

interface Farmer {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
  farmerId: string;
  createdAt: string;
}

interface FarmerReportPDFProps {
  farmer: Farmer;
  adminInfo: StoreAdmin;
  orders: Order[];
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FEFDF8",
    padding: 16,
    paddingBottom: 80, // Add extra bottom padding to ensure space for footer
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
    fontSize: 8,
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
    minHeight: 16,
  },

  // Column styles - updated for new layout
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
    width: "6%",
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
    marginTop: 20,
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
    fontSize: 7,
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
  location: { chamber: string; floor: string; row: string };
  quantities: { [bagSize: string]: number }; // Map of bag size to quantity
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

const formatDate = (date: string | Date | undefined): string => {
  if (!date) return '-';
  try {
    // Check if date is in DD.MM.YY format
    if (typeof date === 'string' && date.match(/^\d{2}\.\d{2}\.\d{2}$/)) {
      // Already in the desired format, just replace dots with slashes
      return date.replace(/\./g, '/');
    }

    // For other formats, parse and format
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(parsedDate.getTime())) return '-';

    const day = parsedDate.getDate().toString().padStart(2, '0');
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, '0');
    const year = parsedDate.getFullYear().toString().slice(-2);

    return `${day}/${month}/${year}`;
  } catch {
    return '-';
  }
};

const getOrderDate = (order: Order): string | undefined => {
  // Try all possible date fields in order of preference
  return order.dateOfSubmission ||
         order.dateOfExtraction ||
         order.createdAt ||
         undefined;
};

const FarmerReportPDF: React.FC<FarmerReportPDFProps> = ({
  farmer,
  adminInfo,
  orders,
}) => {
  console.log("adminInfo", adminInfo);
  if (!orders || orders.length === 0) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
          <View style={styles.logoSection}>
              {adminInfo.imageUrl ? (
                <Image style={styles.logo} src={adminInfo.imageUrl} />
              ) : (
                <View style={[styles.logo, { backgroundColor: "#f0f0f0" }]} />
              )}
            </View>
            <Text style={styles.companyName}>
              {adminInfo.coldStorageDetails.coldStorageName.toUpperCase()}
            </Text>
            <Text style={styles.reportTitle}>NO TRANSACTIONS FOUND</Text>
          </View>
        </Page>
      </Document>
    );
  }

  const bagSizes = adminInfo.preferences?.bagSizes || [];
  const receiptOrders = orders.filter(
    (order) => order.voucher.type === "RECEIPT"
  );
  const deliveryOrders = orders.filter(
    (order) => order.voucher.type === "DELIVERY"
  );

  // Create receipt ledger entries with totals
  const createReceiptEntries = () => {
    const entries: LedgerEntry[] = [];

    // First create all entries
    receiptOrders.forEach((order) => {
      // Initialize quantities map for all bag sizes according to admin preferences
      const quantities: { [bagSize: string]: number } = {};
      adminInfo.preferences?.bagSizes.forEach((size) => {
        quantities[size] = 0;
      });

      // Create separate entries for each unique location-variety combination
      order.orderDetails.forEach((detail) => {
        // Create a normalized map of bag sizes to match with admin preferences
        const normalizedBagSizes = new Map(
          detail.bagSizes.map((bag) => [
            bag.size.toLowerCase().replace(/[-\s]/g, ""),
            bag,
          ])
        );

        // Group bags by location
        const bagsByLocation = new Map<
          string,
          { size: string; initialQuantity: number }[]
        >();

        // Go through admin preferred bag sizes first
        adminInfo.preferences?.bagSizes.forEach((preferredSize) => {
          const normalizedSize = preferredSize
            .toLowerCase()
            .replace(/[-\s]/g, "");
          const matchingBag = normalizedBagSizes.get(normalizedSize);

          if (matchingBag) {
            const location = matchingBag.location || detail.location || "-";
            if (!bagsByLocation.has(location)) {
              bagsByLocation.set(location, []);
            }

            // Get the initial quantity from the bag data
            let initialQty = 0;
            if (matchingBag.quantity) {
              if (typeof matchingBag.quantity === 'object' && 'initialQuantity' in matchingBag.quantity) {
                initialQty = matchingBag.quantity.initialQuantity || 0;
              } else if (typeof matchingBag.quantity === 'number') {
                initialQty = matchingBag.quantity;
              }
            }

            bagsByLocation.get(location)?.push({
              size: preferredSize, // Use the preferred size name
              initialQuantity: initialQty,
            });
          }
        });

        // Create an entry for each location
        bagsByLocation.forEach((bags, location) => {
          // Initialize quantities according to admin preferences
          const locationQuantities: { [bagSize: string]: number } = {};
          adminInfo.preferences?.bagSizes.forEach((size) => {
            locationQuantities[size] = 0;
          });

          // Fill in the quantities for this location
          let locationTotal = 0;
          bags.forEach((bag) => {
            locationQuantities[bag.size] = bag.initialQuantity;
            locationTotal += bag.initialQuantity;
          });

          if (locationTotal > 0) {
            // Only add entry if there are bags
            entries.push({
              date: getOrderDate(order),
              voucher: order.voucher.voucherNumber,
              type: "RECEIPT",
              variety: detail.variety || "-",
              location: parseLocation(location),
              quantities: locationQuantities,
              total: locationTotal,
              grandTotal: 0, // Will be calculated after sorting
            });
          }
        });
      });
    });

    // Sort entries by voucher number
    entries.sort((a, b) => a.voucher - b.voucher);

    // Calculate running grand total after sorting
    let runningTotal = 0;
    entries.forEach((entry) => {
      runningTotal += entry.total;
      entry.grandTotal = runningTotal;
    });

    return entries;
  };

  // Create delivery ledger entries with totals
  const createDeliveryEntries = () => {
    const entries: LedgerEntry[] = [];

    // First create all entries
    deliveryOrders.forEach((order) => {
      // Initialize quantities map for all bag sizes according to admin preferences
      const quantities: { [bagSize: string]: number } = {};
      adminInfo.preferences?.bagSizes.forEach((size) => {
        quantities[size] = 0;
      });

      // Create separate entries for each unique location-variety combination
      order.orderDetails.forEach((detail) => {
        // Create a normalized map of bag sizes to match with admin preferences
        const normalizedBagSizes = new Map(
          detail.bagSizes.map((bag) => [
            bag.size.toLowerCase().replace(/[-\s]/g, ""),
            bag,
          ])
        );

        // Group bags by location
        const bagsByLocation = new Map<
          string,
          { size: string; quantity: number }[]
        >();

        // Go through admin preferred bag sizes first
        adminInfo.preferences?.bagSizes.forEach((preferredSize) => {
          const normalizedSize = preferredSize
            .toLowerCase()
            .replace(/[-\s]/g, "");
          const matchingBag = normalizedBagSizes.get(normalizedSize);

          if (matchingBag) {
            const location = matchingBag.location || detail.location || "-";
            if (!bagsByLocation.has(location)) {
              bagsByLocation.set(location, []);
            }
            bagsByLocation.get(location)?.push({
              size: preferredSize, // Use the preferred size name
              quantity: matchingBag.quantityRemoved || 0,
            });
          }
        });

        // Create an entry for each location
        bagsByLocation.forEach((bags, location) => {
          // Initialize quantities according to admin preferences
          const locationQuantities: { [bagSize: string]: number } = {};
          adminInfo.preferences?.bagSizes.forEach((size) => {
            locationQuantities[size] = 0;
          });

          // Fill in the quantities for this location
          let locationTotal = 0;
          bags.forEach((bag) => {
            locationQuantities[bag.size] = bag.quantity;
            locationTotal += bag.quantity;
          });

          if (locationTotal > 0) {
            // Only add entry if there are bags
            entries.push({
              date: getOrderDate(order),
              voucher: order.voucher.voucherNumber,
              type: "DELIVERY",
              variety: detail.variety || "-",
              location: parseLocation(location),
              quantities: locationQuantities,
              total: locationTotal,
              grandTotal: 0, // Will be calculated after sorting
            });
          }
        });
      });
    });

    // Sort entries by voucher number
    entries.sort((a, b) => a.voucher - b.voucher);

    // Calculate running grand total after sorting
    let total = 0;
    entries.forEach((entry) => {
      total += entry.total;
      entry.grandTotal = total;
    });

    return entries;
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

  // Helper function to render table header
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
          <Text style={styles.cellHeaderText}>{size}</Text>
        </View>
      ))}
      <View style={styles.colTotal}>
        <Text style={styles.cellHeaderText}>TOTAL</Text>
      </View>
      <View style={styles.colGrandTotal}>
        <Text style={styles.cellHeaderText}>G.TOTAL</Text>
      </View>
      {/* Show Remarks column only for receipt table */}
      {!isDeliveryTable && (
        <View style={styles.colRemarks}>
          <Text style={styles.cellHeaderText}>REMARKS</Text>
        </View>
      )}
    </View>
  );

  // Helper function to render opening balance row for delivery table
  const renderOpeningBalanceRow = (initialGrandTotal: number, receiptTotals: { [key: string]: number }) => (
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


  // Helper function to render a single table row
  const renderTableRow = (entry: LedgerEntry, index: number, isDeliveryTable: boolean, initialGrandTotal: number) => (
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
            ? initialGrandTotal - entry.grandTotal
            : entry.grandTotal}
        </Text>
      </View>
      {/* Show Remarks column only for receipt table */}
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

  // Function to split entries into pages based on available space
  const splitEntriesIntoPages = (entries: LedgerEntry[]) => {
    const pages: LedgerEntry[][] = [];
    const entriesPerPage = 25; // Approximate number of entries that can fit on one page

    for (let i = 0; i < entries.length; i += entriesPerPage) {
      pages.push(entries.slice(i, i + entriesPerPage));
    }

    return pages;
  };


  // Helper function to render header section
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoSection}>
        {adminInfo.imageUrl ? (
          <Image style={styles.logo} src={adminInfo.imageUrl} />
        ) : (
          <View style={[styles.logo, { backgroundColor: "#f0f0f0" }]} />
        )}
      </View>
      <Text style={styles.companyName}>
        {adminInfo.coldStorageDetails.coldStorageName.toUpperCase()}
      </Text>
      <Text style={styles.reportTitle}>FARMER ACCOUNT LEDGER</Text>
    </View>
  );

  // Helper function to render farmer information section
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
          <Text style={styles.infoValue}>
            {formatDate(farmer.createdAt)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Report Date:</Text>
          <Text style={styles.infoValue}>{formatDate(new Date())}</Text>
        </View>
      </View>
    </View>
  );

  // Helper function to render summary section
  const renderSummary = () => (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>Account Summary</Text>
      <View style={styles.summaryTable}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Total Receipt Transactions:
          </Text>
          <Text style={styles.summaryValue}>{receiptOrders.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Total Delivery Transactions:
          </Text>
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

  // Helper function to render footer
  const renderFooter = (pageNumber: number) => (
    <>
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
            Date: {formatDate(new Date())}
          </Text>
        </View>
      </View>
      <Text style={styles.pageNumber}>Page {pageNumber}</Text>
    </>
  );

  // Split entries into pages
  const receiptPages = splitEntriesIntoPages(receiptEntries);
  const deliveryPages = splitEntriesIntoPages(deliveryEntries);

  // Calculate total pages needed
  const totalPages = Math.max(1, receiptPages.length + deliveryPages.length + 1); // +1 for summary page

  return (
    <Document>
      {/* First page with header, farmer info, and first receipt table page */}
      <Page size="A4" style={styles.page}>
        {renderHeader()}
        {renderFarmerInfo()}

        {/* First receipt table page */}
        {receiptPages.length > 0 && (
          <View style={styles.ledgerContainer}>
            <Text style={styles.ledgerTitle}>Receipt Details</Text>
            <View style={styles.table}>
              {renderTableHeader(false)}
              {receiptPages[0].map((entry, index) =>
                renderTableRow(entry, index, false, 0)
              )}
            </View>
          </View>
        )}

        {renderFooter(1)}
      </Page>

      {/* Additional receipt table pages */}
      {receiptPages.slice(1).map((pageEntries, pageIndex) => (
        <Page key={`receipt-${pageIndex + 2}`} size="A4" style={styles.page}>
          {renderHeader()}

          <View style={styles.ledgerContainer}>
            <Text style={styles.ledgerTitle}>Receipt Details (continued)</Text>
            <View style={styles.table}>
              {renderTableHeader(false)}
              {pageEntries.map((entry, index) =>
                renderTableRow(entry, (pageIndex + 1) * 25 + index, false, 0)
              )}
            </View>
          </View>

          {renderFooter(pageIndex + 2)}
        </Page>
      ))}

      {/* Delivery table pages */}
      {deliveryPages.map((pageEntries, pageIndex) => (
        <Page key={`delivery-${pageIndex + 1}`} size="A4" style={styles.page}>
          {renderHeader()}

          <View style={styles.ledgerContainer}>
            <Text style={styles.ledgerTitle}>
              {pageIndex === 0 ? "Delivery Details" : "Delivery Details (continued)"}
            </Text>
            <View style={styles.table}>
              {renderTableHeader(true)}

              {/* Show opening balance only on first delivery page */}
              {pageIndex === 0 && receiptTotals &&
                renderOpeningBalanceRow(
                  receiptEntries.reduce((sum, entry) => sum + entry.total, 0),
                  receiptTotals
                )
              }

              {pageEntries.map((entry, index) =>
                renderTableRow(
                  entry,
                  pageIndex * 25 + index,
                  true,
                  receiptEntries.reduce((sum, entry) => sum + entry.total, 0)
                )
              )}
            </View>
          </View>

          {renderFooter(receiptPages.length + pageIndex + 1)}
        </Page>
      ))}

      {/* Summary page */}
      <Page size="A4" style={styles.page}>
        {renderHeader()}
        {renderSummary()}
        {renderFooter(totalPages)}
      </Page>
    </Document>
  );
};

export default FarmerReportPDF;