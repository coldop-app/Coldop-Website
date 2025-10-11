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

interface DeliveryVoucherPDFProps {
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

  // Header Section
  header: {
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
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
    color: "#FF0000", // Red for Delivery
    marginBottom: 4,
    textDecoration: "underline",
  },
  managerInfo: {
    fontSize: 7,
    textAlign: "right",
    lineHeight: 1.1,
    color: "#000",
  },

  // Info Section
  infoSection: {
    marginBottom: 10,
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

  // Table Section
  tableContainer: {
    marginTop: 10,
    marginBottom: 10,
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

  // Table Columns
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
    width: "10%",
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
  colIncomingVoucher: {
    width: "12%",
    paddingHorizontal: 2,
    justifyContent: "center",
  },

  // Table Text Styles
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

  // Bottom Section
  bottomSection: {
    flexDirection: "row",
    marginTop: 10,
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
    marginBottom: 8,
    alignItems: "center",
    minHeight: 35,
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

  // Remarks Section
  remarksSection: {
    marginTop: 6,
    padding: 5,
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

  // Signature
  signatureContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
  },
  signatureBox: {
    width: 100,
    height: 35,
    borderTopWidth: 1,
    borderTopColor: "#000",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 3,
    marginTop: 0,
  },
  signatureText: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#000",
  },

  // Footer
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

const DeliveryVoucherPDF: React.FC<DeliveryVoucherPDFProps> = ({
  order,
  adminInfo,
}) => {
  // Get all bag sizes from admin preferences
  const allBagSizes = React.useMemo(() => {
    return adminInfo?.preferences?.bagSizes || [];
  }, [adminInfo?.preferences?.bagSizes]);

  // Calculate total bags (quantity removed for delivery)
  const calculateTotalBags = () => {
    if (!order.orderDetails) return 0;
    return order.orderDetails.reduce((total, detail) => {
      return (
        total +
        detail.bagSizes.reduce(
          (sum, bag) => sum + (bag.quantityRemoved || 0),
          0
        )
      );
    }, 0);
  };

  // Convert number to words
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

    return num.toString();
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
    incomingVoucher?: string;
  }

  // Parse location string into chamber, floor, and row
  const parseLocation = (location: string): LocationDetails => {
    if (!location || typeof location !== "string") {
      return { chamber: "", floor: "", row: "" };
    }

    const parts = location.trim().split("-");

    if (parts.length >= 3) {
      return {
        chamber: parts[0] || "",
        floor: parts[1] || "",
        row: parts[2] || "",
      };
    } else if (parts.length === 2) {
      return {
        chamber: parts[0] || "",
        floor: parts[1] || "",
        row: "",
      };
    } else if (parts.length === 1) {
      return {
        chamber: parts[0] || "",
        floor: "",
        row: "",
      };
    }

    return { chamber: "", floor: "", row: "" };
  };

  // Get bag sizes that actually have values
  const getUsedBagSizes = () => {
    const usedSizes = new Set<string>();

    if (order.orderDetails) {
      order.orderDetails.forEach((detail) => {
        detail.bagSizes.forEach((bag) => {
          const quantity = bag.quantityRemoved || 0;
          if (quantity > 0) {
            usedSizes.add(bag.size);
          }
        });
      });
    }

    // Return sizes in the order they appear in admin preferences, but only if they have values
    return allBagSizes.filter(size =>
      Array.from(usedSizes).some(usedSize =>
        usedSize.toLowerCase().replace(/[-\s]/g, "") === size.toLowerCase().replace(/[-\s]/g, "")
      )
    );
  };

  // Create table rows from order details
  const createTableRows = () => {
    const rows: TableRow[] = [];
    const usedBagSizes = getUsedBagSizes();

    if (order.orderDetails) {
      order.orderDetails.forEach((detail) => {
        // Group bags by location and variety
        const bagsByLocation = new Map<string, { size: string; quantity: number }[]>();

        detail.bagSizes.forEach((bag) => {
          const quantity = bag.quantityRemoved || 0;

          if (quantity > 0) {
            const locationString = bag.location || detail.location || "-";

            if (!bagsByLocation.has(locationString)) {
              bagsByLocation.set(locationString, []);
            }

            bagsByLocation.get(locationString)?.push({
              size: bag.size,
              quantity: quantity,
            });
          }
        });

        // Create rows for each location
        bagsByLocation.forEach((bags, location) => {
          const locationDetails = parseLocation(location);

          // Create bag sizes array with quantities filled according to used bag sizes order
          const bagSizesWithQuantities = usedBagSizes.map((preferredSize) => {
            const matchingBag = bags.find(bag =>
              bag.size.toLowerCase().replace(/[-\s]/g, "") === preferredSize.toLowerCase().replace(/[-\s]/g, "")
            );

            return {
              size: preferredSize,
              quantity: matchingBag ? matchingBag.quantity : "-",
            };
          });

          // Only add row if there are actual quantities
          const hasQuantities = bagSizesWithQuantities.some(bag => bag.quantity !== "-");
          if (hasQuantities) {
            rows.push({
              variety: detail.variety,
              bagSizes: bagSizesWithQuantities,
              location: locationDetails,
              incomingVoucher: detail.incomingOrder?.gatePass?.gatePassNumber?.toString() || "-",
            });
          }
        });
      });
    }

    return rows;
  };

  const tableRows = createTableRows();
  const totalBags = calculateTotalBags();
  const usedBagSizes = getUsedBagSizes();

  // Calculate row totals
  const calculateRowTotal = (bagSizes: TableBagSize[]) => {
    return bagSizes.reduce((sum, bag) => {
      const qty = bag.quantity;
      return sum + (typeof qty === "number" ? qty : 0);
    }, 0);
  };

  // Calculate column totals for each bag size
  const calculateColumnTotals = () => {
    const columnTotals = new Map<string, number>();

    usedBagSizes.forEach((size) => columnTotals.set(size, 0));

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

  const columnTotals = calculateColumnTotals();

  console.log("=== DELIVERY VOUCHER PDF DATA ===");
  console.log("Order:", JSON.stringify(order, null, 2));
  console.log("Admin Info:", JSON.stringify(adminInfo, null, 2));
  console.log("Table Rows:", tableRows);
  console.log("Total Bags:", totalBags);
  console.log("Column Totals:", columnTotals);
  console.log("Used Bag Sizes:", usedBagSizes);
  console.log("All Bag Sizes from Admin:", allBagSizes);

  return (
    <Document>
      <Page
        size={[595.28, 420.94]}
        style={styles.page}
        wrap={true}
        break={false}
      >
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
              <View style={styles.headerColdopBranding}>
                <Image style={styles.headerColdopLogo} src={coldopLogo} />
                <Text style={styles.headerColdopText}>Powered by Coldop</Text>
              </View>
            </View>

            {/* Voucher Type and Manager Info */}
            <View style={styles.voucherTypeSection}>
              <Text style={styles.voucherType}>
                D VOUCHER
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
              <Text style={styles.infoValue}>{order.farmerId?.farmerId || "N/A"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{order.farmerId?.name || "N/A"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>
                {order.farmerId?.address || "N/A"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mobile:</Text>
              <Text style={styles.infoValue}>
                {order.farmerId?.mobileNumber || "N/A"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Variety:</Text>
              <Text style={styles.infoValue}>{order.orderDetails?.[0]?.variety || "N/A"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Lot No:</Text>
              <Text style={styles.infoValue}>
                {order.gatePass?.gatePassNumber || "N/A"}/{totalBags}
              </Text>
            </View>
          </View>
          <View style={styles.infoRight}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Delivery Voucher No:</Text>
              <Text style={styles.infoValue}>
                {order.gatePass?.gatePassNumber || "N/A"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date of Extraction:</Text>
              <Text style={styles.infoValue}>
                {order.dateOfExtraction || "N/A"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current Stock:</Text>
              <Text style={styles.infoValue}>{order.currentStockAtThatTime || "N/A"}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Outgoing:</Text>
              <Text style={styles.infoValue}>{totalBags}</Text>
            </View>
          </View>
        </View>

        {/* Table */}
        <View style={styles.tableContainer} wrap={true}>
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
              {usedBagSizes.map((size, index) => (
                <View key={index} style={styles.colBagSize}>
                  <Text style={styles.tableHeaderText}>{size}</Text>
                </View>
              ))}
              <View style={styles.colTotal}>
                <Text style={styles.tableHeaderText}>TOTAL</Text>
              </View>
              <View style={styles.colIncomingVoucher}>
                <Text style={styles.tableHeaderText}>R. VOUCHER</Text>
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
                <View style={styles.colIncomingVoucher}>
                  <Text style={styles.tableCellText}>
                    {row.incomingVoucher || "-"}
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
              {usedBagSizes.map((size, index) => (
                <View key={index} style={styles.colBagSize}>
                  <Text style={styles.tableCellTextBold}>
                    {columnTotals.get(size)
                      ? `${order.farmerId?.farmerId || "N/A"}/${columnTotals.get(size)}`
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
              <View style={styles.colIncomingVoucher}>
                <Text style={styles.tableCellTextBold}>-</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection} wrap={true}>
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

        {/* Footer with Coldop Branding */}
        <View style={styles.footer}>
          <Image style={styles.coldopLogo} src={coldopLogo} />
          <Text style={styles.coldopText}>Powered by Coldop</Text>
        </View>
      </Page>
    </Document>
  );
};

export default DeliveryVoucherPDF;
