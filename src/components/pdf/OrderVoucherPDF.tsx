import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { Order, StoreAdmin } from "@/utils/types";
import coldopLogo from "/coldop-logo.png";

interface OrderVoucherPDFProps {
  order: Order;
  adminInfo: StoreAdmin;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FEFDF8",
    padding: 16,
    fontFamily: "Helvetica",
    fontSize: 8,
  },

  // Header Section - reduced size like FarmerReportPDF
  header: {
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
    position: "relative",
  },
  logoSection: {
    width: 50,
    marginRight: 12,
    position: "absolute",
    left: 0,
    top: 0,
  },
  logo: {
    width: 45,
    height: 45,
    borderWidth: 1.5,
    borderColor: "#000",
    borderRadius: 3,
  },
  companyInfo: {
    flex: 1,
    paddingTop: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  companyAddress: {
    fontSize: 8,
    textAlign: "center",
    marginBottom: 3,
    color: "#000",
  },
  // Header Coldop Branding
  headerColdopBranding: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  headerColdopLogo: {
    width: 16,
    height: 16,
    marginRight: 4,
    opacity: 0.8,
  },
  headerColdopText: {
    fontSize: 7,
    color: "#666",
    fontStyle: "italic",
    fontWeight: "400",
  },
  voucherTypeSection: {
    width: 120,
    alignItems: "flex-end",
    position: "absolute",
    right: 0,
    top: 0,
  },
  voucherType: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "right",
    color: "#000",
    marginBottom: 4,
    textDecoration: "underline",
  },
  managerInfo: {
    fontSize: 7,
    textAlign: "right",
    lineHeight: 1.1,
    color: "#000",
  },

  // Info Section - updated to match FarmerReportPDF layout
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

  // Table Section - updated to match FarmerReportPDF style
  tableContainer: {
    marginTop: 12,
    marginBottom: 12,
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
    minHeight: 16,
  },

  // Table Columns - updated to match FarmerReportPDF
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
  colVariety: {
    width: "12%",
    borderRightWidth: 0.5,
    borderRightColor: "#666",
    paddingHorizontal: 2,
    justifyContent: "center",
  },
  colBagSize: {
    width: "8%",
    borderRightWidth: 0.5,
    borderRightColor: "#666",
    paddingHorizontal: 2,
    justifyContent: "center",
  },
  colTotal: {
    width: "8%",
    paddingHorizontal: 2,
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },

  // Table Text Styles - updated to match FarmerReportPDF
  tableHeaderText: {
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
  },
  tableCellText: {
    fontSize: 7,
    textAlign: "center",
    color: "#000",
  },
  tableCellTextBold: {
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
  },

  // Bottom Section - simplified for half page
  bottomSection: {
    flexDirection: "row",
    marginTop: 15,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  leftBottomSection: {
    flex: 1,
    marginRight: 20,
    paddingTop: 0,
  },
  rightBottomSection: {
    width: 120,
    alignItems: "center",
    paddingTop: 0,
  },

  // Total Bags Section
  totalBagsContainer: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
    minHeight: 40,
  },
  totalBagsLabel: {
    fontSize: 8,
    fontWeight: "bold",
    minWidth: 80,
    color: "#000",
  },
  totalBagsValue: {
    fontSize: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 2,
    paddingHorizontal: 5,
    minHeight: 14,
    flex: 1,
    color: "#000",
  },

  // Remarks Section - simplified
  remarksSection: {
    marginTop: 8,
    padding: 6,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 2,
  },
  remarksTitle: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 3,
    color: "#000",
  },
  remarksText: {
    fontSize: 7,
    color: "#333",
  },

  // Signature - simplified
  signatureContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  signatureBox: {
    width: 100,
    height: 40,
    borderTopWidth: 1,
    borderTopColor: "#000",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 4,
    marginTop: 0,
  },
  signatureText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#000",
  },

  // Coldop Branding - added to first half of page
  coldopBranding: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    paddingVertical: 4,
  },
  coldopBrandingLogo: {
    width: 18,
    height: 18,
    marginRight: 6,
    opacity: 0.8,
  },
  coldopBrandingText: {
    fontSize: 8,
    color: "#666",
    fontStyle: "italic",
    fontWeight: "500",
  },

  // Footer - simplified
  footer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#000",
    paddingTop: 6,
  },
  coldopLogo: {
    width: 16,
    height: 16,
    marginRight: 4,
    opacity: 0.85,
  },
  coldopText: {
    fontSize: 6,
    color: "#555",
    fontStyle: "italic",
  },
});

const OrderVoucherPDF: React.FC<OrderVoucherPDFProps> = ({
  order,
  adminInfo,
}) => {
  const isReceipt = order.voucher.type === "RECEIPT";

  // Get all bag sizes from admin preferences
  const allBagSizes = React.useMemo(() => {
    return adminInfo?.preferences?.bagSizes || [];
  }, [adminInfo?.preferences?.bagSizes]);

  // Calculate total bags
  const calculateTotalBags = () => {
    return order.orderDetails.reduce((total, detail) => {
      if (isReceipt) {
        return (
          total +
          detail.bagSizes.reduce(
            (sum, bag) => sum + (bag.quantity?.initialQuantity || 0),
            0
          )
        );
      } else {
        return (
          total +
          detail.bagSizes.reduce(
            (sum, bag) => sum + (bag.quantityRemoved || 0),
            0
          )
        );
      }
    }, 0);
  };

  // Convert number to words (basic implementation)
  const numberToWords = (num: number): string => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    if (num === 0) return "Zero";
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100)
      return (
        tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "")
      );
    if (num < 1000)
      return (
        ones[Math.floor(num / 100)] +
        " Hundred" +
        (num % 100 ? " " + numberToWords(num % 100) : "")
      );

    return num.toString(); // For numbers > 999, just return the number
  };

  // Define types for table rows
  interface TableBagSize {
    size: string;
    quantity: number | string;
  }

  interface LocationDetails {
    chamber: string;
    floor: string;
    row: string;
  }

  interface TableRow {
    variety: string;
    bagSizes: TableBagSize[];
    location: LocationDetails;
  }

  // Parse location string into chamber, floor, and row
  const parseLocation = (location: string): LocationDetails => {
    if (!location || typeof location !== "string") {
      return { chamber: "", floor: "", row: "" };
    }

    // Expected format: "2-1-C" or "2-1-A" etc.
    const parts = location.trim().split("-");

    // Handle different possible formats
    if (parts.length >= 3) {
      return {
        chamber: parts[0] || "",
        floor: parts[1] || "",
        row: parts[2] || "",
      };
    } else if (parts.length === 2) {
      // If only 2 parts, assume it's chamber-floor
      return {
        chamber: parts[0] || "",
        floor: parts[1] || "",
        row: "",
      };
    } else if (parts.length === 1) {
      // If only 1 part, assume it's chamber
      return {
        chamber: parts[0] || "",
        floor: "",
        row: "",
      };
    }

    return { chamber: "", floor: "", row: "" };
  };

  // Create table rows from order details
  const createTableRows = () => {
    const rows: TableRow[] = [];

    order.orderDetails.forEach((detail) => {
      // Group bags by location and variety
      const bagsByLocation = new Map<string, { size: string; quantity: number }[]>();

      detail.bagSizes.forEach((bag) => {
        const quantity = isReceipt
          ? bag.quantity?.initialQuantity || 0
          : bag.quantityRemoved || 0;

        if (quantity > 0) {
          // Get location for this bag
          const locationString = bag.location || detail.location || detail.incomingOrder?.location || "-";

          if (!bagsByLocation.has(locationString)) {
            bagsByLocation.set(locationString, []);
          }

          bagsByLocation.get(locationString)?.push({
            size: bag.size,
            quantity: quantity,
          });
        }
      });

      // Create rows for each location, prioritizing bag sizes according to admin preferences order
      bagsByLocation.forEach((bags, location) => {
        const locationDetails = parseLocation(location);

        // Create bag sizes array with quantities filled according to admin preferences order
        const bagSizesWithQuantities = allBagSizes.map((preferredSize) => {
          // Find if this preferred size has a quantity in the current location
          const matchingBag = bags.find(bag =>
            bag.size.toLowerCase().replace(/[-\s]/g, "") === preferredSize.toLowerCase().replace(/[-\s]/g, "")
          );

          return {
            size: preferredSize,
            quantity: matchingBag ? matchingBag.quantity : "-",
          };
        });

        // Only add row if there are actual quantities (not all "-")
        const hasQuantities = bagSizesWithQuantities.some(bag => bag.quantity !== "-");
        if (hasQuantities) {
          rows.push({
            variety: detail.variety,
            bagSizes: bagSizesWithQuantities,
            location: locationDetails,
          });
        }
      });
    });

    // Sort rows based on the priority of bag sizes they contain
    rows.sort((a, b) => {
      // Find the highest priority bag size (lowest index) that has a quantity for each row
      let aPriority = allBagSizes.length;
      let bPriority = allBagSizes.length;

      for (let i = 0; i < allBagSizes.length; i++) {
        if (a.bagSizes[i].quantity !== "-" && a.bagSizes[i].quantity !== 0) {
          aPriority = i;
          break;
        }
      }

      for (let i = 0; i < allBagSizes.length; i++) {
        if (b.bagSizes[i].quantity !== "-" && b.bagSizes[i].quantity !== 0) {
          bPriority = i;
          break;
        }
      }

      // Lower priority index means higher priority (should come first)
      return aPriority - bPriority;
    });

    return rows;
  };

  const tableRows = createTableRows();
  const totalBags = calculateTotalBags();

  // Calculate row totals (excluding "-" values)
  const calculateRowTotal = (bagSizes: TableBagSize[]) => {
    return bagSizes.reduce((sum, bag) => {
      const qty = bag.quantity;
      return sum + (typeof qty === "number" ? qty : 0);
    }, 0);
  };

  // Calculate column totals for each bag size
  const calculateColumnTotals = () => {
    const columnTotals = new Map<string, number>();

    // Initialize totals for all bag sizes
    allBagSizes.forEach((size) => columnTotals.set(size, 0));

    // Sum up quantities for each column
    tableRows.forEach((row) => {
      row.bagSizes.forEach((bag) => {
        const qty = bag.quantity;
        const currentTotal = columnTotals.get(bag.size) || 0;
        columnTotals.set(
          bag.size,
          currentTotal + (typeof qty === "number" ? qty : 0)
        );
      });
    });

    return columnTotals;
  };

  // Get column totals for the marka row
  const columnTotals = calculateColumnTotals();

  return (
    <Document>
      <Page size={[595.28, 420.94]} style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              {adminInfo.imageUrl ? (
                <Image style={styles.logo} src={adminInfo.imageUrl} />
              ) : (
                <View style={[styles.logo, { backgroundColor: "#f0f0f0" }]} />
              )}
            </View>

            {/* Company Info */}
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>
                {adminInfo.coldStorageDetails.coldStorageName.toUpperCase()}
              </Text>
              <Text style={styles.companyAddress}>
                {adminInfo.coldStorageDetails.coldStorageAddress}
              </Text>
              {/* Coldop Branding below address */}
              <View style={styles.headerColdopBranding}>
                <Image style={styles.headerColdopLogo} src={coldopLogo} />
                <Text style={styles.headerColdopText}>Powered by Coldop</Text>
              </View>
            </View>

            {/* Voucher Type and Manager Info */}
            <View style={styles.voucherTypeSection}>
              <Text
                style={[
                  styles.voucherType,
                  {
                    color: isReceipt ? "#008000" : "#FF0000" // Green for Receipt, Red for Delivery
                  }
                ]}
              >
                {isReceipt ? "R VOUCHER" : "D VOUCHER"}
              </Text>
              <Text style={styles.managerInfo}>
                Manager{"\n"}
                {adminInfo.name}
                {"\n"}
                {adminInfo.mobileNumber}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoLeft}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>A/c No.:</Text>
              <Text style={styles.infoValue}>{order.farmerId.farmerId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{order.farmerId.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>
                {order.farmerId.address || "N/A"}
              </Text>
            </View>
          </View>
          <View style={styles.infoRight}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mobile:</Text>
              <Text style={styles.infoValue}>
                {order.farmerId.mobileNumber || "N/A"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {isReceipt ? "Receipt Voucher No:" : "Delivery Voucher No:"}
              </Text>
              <Text style={styles.infoValue}>
                {order.voucher.voucherNumber}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dated:</Text>
              <Text style={styles.infoValue}>
                {new Date(order.createdAt || new Date()).toLocaleDateString(
                  "en-GB"
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Table */}
        <View style={styles.tableContainer}>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={styles.colChamber}>
                <Text style={styles.tableHeaderText}>CH</Text>
              </View>
              <View style={styles.colFloor}>
                <Text style={styles.tableHeaderText}>FL</Text>
              </View>
              <View style={styles.colRow}>
                <Text style={styles.tableHeaderText}>ROW</Text>
              </View>
              <View style={styles.colVariety}>
                <Text style={styles.tableHeaderText}>VARIETY</Text>
              </View>
              {allBagSizes.map((size, index) => (
                <View key={index} style={styles.colBagSize}>
                  <Text style={styles.tableHeaderText}>{size}</Text>
                </View>
              ))}
              <View style={styles.colTotal}>
                <Text style={styles.tableHeaderText}>TOTAL</Text>
              </View>
            </View>

            {/* Table Rows */}
            {tableRows.map((row, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.colChamber}>
                  <Text style={styles.tableCellText}>
                    {row.location.chamber}
                  </Text>
                </View>
                <View style={styles.colFloor}>
                  <Text style={styles.tableCellText}>
                    {row.location.floor}
                  </Text>
                </View>
                <View style={styles.colRow}>
                  <Text style={styles.tableCellText}>
                    {row.location.row}
                  </Text>
                </View>
                <View style={styles.colVariety}>
                  <Text style={styles.tableCellText}>
                    {row.variety}
                  </Text>
                </View>
                {row.bagSizes.map((bag, bagIndex) => (
                  <View key={bagIndex} style={styles.colBagSize}>
                    <Text style={styles.tableCellText}>
                      {bag.quantity}
                    </Text>
                  </View>
                ))}
                <View style={styles.colTotal}>
                  <Text style={styles.tableCellTextBold}>
                    {calculateRowTotal(row.bagSizes)}
                  </Text>
                </View>
              </View>
            ))}

            {/* Marka Row */}
            <View style={[styles.tableRow, { backgroundColor: "#F5F5F5" }]}>
              <View style={styles.colChamber}>
                <Text style={styles.tableCellTextBold}>-</Text>
              </View>
              <View style={styles.colFloor}>
                <Text style={styles.tableCellTextBold}>-</Text>
              </View>
              <View style={styles.colRow}>
                <Text style={styles.tableCellTextBold}>-</Text>
              </View>
              <View style={styles.colVariety}>
                <Text style={styles.tableCellTextBold}>MARKA</Text>
              </View>
              {allBagSizes.map((size, index) => (
                <View key={index} style={styles.colBagSize}>
                  <Text style={styles.tableCellTextBold}>
                    {columnTotals.get(size)
                      ? `${order.voucher.voucherNumber}/${columnTotals.get(size)}`
                      : ""}
                  </Text>
                </View>
              ))}
              <View style={styles.colTotal}>
                <Text style={styles.tableCellTextBold}>
                  {Array.from(columnTotals.values()).reduce(
                    (sum, total) => sum + total,
                    0
                  )}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Left Section */}
          <View style={styles.leftBottomSection}>
            {/* Total Bags in Words */}
            <View style={styles.totalBagsContainer}>
              <Text style={styles.totalBagsLabel}>Total Bags in words:</Text>
              <Text style={styles.totalBagsValue}>
                {totalBags > 0 ? numberToWords(totalBags) : ""}
              </Text>
            </View>

            {/* Remarks Section */}
            {order.remarks && (
              <View style={styles.remarksSection}>
                <Text style={styles.remarksTitle}>Remarks:</Text>
                <Text style={styles.remarksText}>{order.remarks}</Text>
              </View>
            )}
          </View>

          {/* Right Section - Signature */}
          <View style={styles.rightBottomSection}>
            <View style={styles.signatureContainer}>
              <View style={styles.signatureBox}>
                <Text style={styles.signatureText}>Signature</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default OrderVoucherPDF;
