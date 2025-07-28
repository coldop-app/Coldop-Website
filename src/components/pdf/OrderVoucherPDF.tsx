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

interface OrderVoucherPDFProps {
  order: Order;
  adminInfo: StoreAdmin;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 25,
    fontFamily: "Helvetica",
    fontSize: 10,
  },

  // Header Section
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  logoSection: {
    width: 70,
    marginRight: 15,
  },
  logo: {
    width: 60,
    height: 60,
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 5,
  },
  companyInfo: {
    flex: 1,
    paddingTop: 5,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 3,
    letterSpacing: 1,
  },
  companyAddress: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 2,
  },
  voucherTypeSection: {
    width: 140,
    alignItems: "flex-end",
  },
  voucherType: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
    marginBottom: 8,
    textDecoration: "underline",
  },
  managerInfo: {
    fontSize: 9,
    textAlign: "right",
    lineHeight: 1.2,
  },

  // Info Section
  infoSection: {
    marginBottom: 15,
    width: "100%",
  },
  infoRowMain: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
    width: "100%",
  },
  infoRowSplit: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "center",
    width: "100%",
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "bold",
    width: 120,
    flexShrink: 0,
  },
  infoLabelSmall: {
    fontSize: 10,
    fontWeight: "bold",
    minWidth: 60,
  },
  infoValue: {
    fontSize: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 2,
    paddingHorizontal: 5,
    minHeight: 16,
    flex: 1,
    marginRight: 20,
  },
  infoValueSmall: {
    fontSize: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 2,
    paddingHorizontal: 5,
    minHeight: 16,
    width: 150,
  },
  dateInfo: {
    fontSize: 11,
    fontWeight: "bold",
  },
  dateContainer: {
    width: 200,
    flexDirection: "row",
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: "bold",
    marginRight: 5,
  },
  dateValue: {
    fontSize: 11,
    fontWeight: "bold",
  },

  // Table Section
  tableContainer: {
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#000",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    minHeight: 40,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    minHeight: 35,
  },

  // Table Columns
  colVariety: {
    width: "20%",
    borderRightWidth: 1,
    borderRightColor: "#000",
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  colBagSize: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#000",
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  colTotal: {
    width: "15%",
    borderRightWidth: 1,
    borderRightColor: "#000",
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  colLocation: {
    width: "20%",
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
  },

  // Table Text Styles
  tableHeaderText: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCellText: {
    fontSize: 9,
    textAlign: "center",
  },
  tableCellTextBold: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },

  // Bottom Section
  bottomSection: {
    flexDirection: "row",
    marginTop: 25,
  },
  leftBottomSection: {
    flex: 1,
    marginRight: 40,
  },
  rightBottomSection: {
    width: 160,
    alignItems: "center",
  },

  // Total Bags Section
  totalBagsContainer: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
  },
  totalBagsLabel: {
    fontSize: 11,
    fontWeight: "bold",
    minWidth: 130,
  },
  totalBagsValue: {
    fontSize: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 2,
    paddingHorizontal: 5,
    minHeight: 16,
    flex: 1,
  },

  // Owner Risk
  ownerRiskText: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 20,
  },

  // Additional Remarks
  additionalRemarksContainer: {
    marginTop: 10,
  },
  additionalRemarksTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
  },
  remarksGrid: {
    flexDirection: "column",
  },
  remarksRow: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "center",
  },
  remarksLabel: {
    fontSize: 10,
    fontWeight: "bold",
    minWidth: 60,
  },
  remarksValue: {
    fontSize: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 2,
    paddingHorizontal: 5,
    minHeight: 14,
    width: 120,
  },
  remarksSection: {
    marginTop: 15,
    marginBottom: 20, // Add margin bottom to create space
    padding: 10,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
  },
  remarksTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5,
  },
  remarksText: {
    fontSize: 10,
    color: "#333",
  },

  // Marka styles
  markaContainer: {
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  markaStamp: {
    width: 120,
    height: 120,
    borderWidth: 3,
    borderColor: "#000",
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    transform: "rotate(-15deg)",
    position: "relative",
  },
  markaInnerCircle: {
    width: 110,
    height: 110,
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
  },
  markaText: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  markaLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 5,
  },

  // Footer styles
  footer: {
    position: "absolute",
    bottom: 25,
    left: 25,
    right: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 10,
  },
  coldopLogo: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  coldopText: {
    fontSize: 10,
    color: "#666",
  },

  // Signature
  signatureContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  signatureBox: {
    width: 150,
    height: 60,
    borderTopWidth: 2,
    borderTopColor: "#000",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 8,
  },
  signatureText: {
    fontSize: 11,
    fontWeight: "bold",
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

  // Calculate marka (format as "voucherNumber/totalBags")
  const calculateMarka = () => {
    const totalBags = calculateTotalBags();
    if (totalBags === 0) return "-";
    return `${order.voucher.voucherNumber}/${totalBags}`;
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

  interface TableRow {
    variety: string;
    bagSizes: TableBagSize[];
    location: string;
  }

  // Create table rows from order details
  const createTableRows = () => {
    const rows: TableRow[] = [];

    order.orderDetails.forEach(detail => {
      // Create a map of size to quantity for this detail
      const sizeQuantityMap = new Map(
        detail.bagSizes.map(bag => [
          bag.size,
          isReceipt ? bag.quantity?.initialQuantity || 0 : bag.quantityRemoved || 0
        ])
      );

      // Add a row for each variety
      rows.push({
        variety: detail.variety,
        bagSizes: allBagSizes.map(size => ({
          size,
          quantity: sizeQuantityMap.get(size) || "-"
        })),
        location: detail.location || "",
      });
    });

    return rows;
  };

  const tableRows = createTableRows();
  const totalBags = calculateTotalBags();

  // Calculate row totals (excluding "-" values)
  const calculateRowTotal = (bagSizes: TableBagSize[]) => {
    return bagSizes.reduce((sum, bag) => {
      const qty = bag.quantity;
      return sum + (typeof qty === 'number' ? qty : 0);
    }, 0);
  };

  console.log("order is: ", order);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
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
            </View>

            {/* Voucher Type and Manager Info */}
            <View style={styles.voucherTypeSection}>
              <Text style={styles.voucherType}>
                {isReceipt ? "RECEIPT VOUCHER" : "DELIVERY VOUCHER"}
              </Text>
              <Text style={styles.managerInfo}>
                Manager{"\n"}
                {adminInfo.name}{"\n"}
                {adminInfo.mobileNumber}
              </Text>
            </View>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          {/* Voucher Number and Date */}
          <View style={styles.infoRowSplit}>
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <Text style={styles.infoLabel}>{isReceipt ? "Receipt Voucher No:" : "Delivery Voucher No:"}</Text>
              <Text style={styles.infoValue}>{order.voucher.voucherNumber}</Text>
            </View>
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Dated:</Text>
              <Text style={styles.dateValue}>
                {new Date(order.createdAt || new Date()).toLocaleDateString("en-GB")}
              </Text>
            </View>
          </View>

          {/* Party Name */}
          <View style={styles.infoRowMain}>
            <Text style={styles.infoLabel}>Name of the Party:</Text>
            <Text style={styles.infoValue}>{order.farmerId.name}</Text>
          </View>

          {/* Account Number */}
          <View style={styles.infoRowMain}>
            <Text style={styles.infoLabel}>A/c No:</Text>
            <Text style={styles.infoValue}>{order.farmerId.farmerId}</Text>
          </View>

          {/* Address */}
          <View style={styles.infoRowMain}>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>{order.farmerId.address || 'N/A'}</Text>
          </View>

          {/* Mobile */}
          <View style={styles.infoRowMain}>
            <Text style={styles.infoLabel}>Mobile:</Text>
            <Text style={styles.infoValue}>{order.farmerId.mobileNumber || 'N/A'}</Text>
          </View>
        </View>

        {/* Table */}
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={styles.colVariety}>
              <Text style={styles.tableHeaderText}>Variety</Text>
            </View>
            {allBagSizes.map((size, index) => (
              <View key={index} style={styles.colBagSize}>
                <Text style={styles.tableHeaderText}>{size}</Text>
              </View>
            ))}
            <View style={styles.colTotal}>
              <Text style={styles.tableHeaderText}>Total</Text>
            </View>
            <View style={styles.colLocation}>
              <Text style={styles.tableHeaderText}>Location</Text>
            </View>
          </View>

          {/* Table Rows */}
          {tableRows.map((row, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.colVariety}>
                <Text style={styles.tableCellText}>{row.variety}</Text>
              </View>
              {row.bagSizes.map((bag, bagIndex) => (
                <View key={bagIndex} style={styles.colBagSize}>
                  <Text style={styles.tableCellText}>{bag.quantity}</Text>
                </View>
              ))}
              <View style={styles.colTotal}>
                <Text style={styles.tableCellTextBold}>
                  {calculateRowTotal(row.bagSizes)}
                </Text>
              </View>
              <View style={styles.colLocation}>
                <Text style={styles.tableCellText}>{row.location}</Text>
              </View>
            </View>
          ))}
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

            {/* Marka */}
            <View style={styles.markaContainer}>
              <View style={styles.markaStamp}>
                <View style={styles.markaInnerCircle}>
                  <Text style={styles.markaLabel}>Marka</Text>
                  <Text style={styles.markaText}>{calculateMarka()}</Text>
                </View>
              </View>
            </View>
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
          <Image
            style={styles.coldopLogo}
            src="/coldop-logo.png"
          />
          <Text style={styles.coldopText}>Powered by Coldop</Text>
        </View>
      </Page>
    </Document>
  );
};

export default OrderVoucherPDF;
