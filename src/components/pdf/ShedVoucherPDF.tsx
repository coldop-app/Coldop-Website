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

interface ShedVoucherPDFProps {
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
  },
  titleSection: {
    flex: 1,
    alignItems: "center",
    marginLeft: 50,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 2,
    color: "#B8860B", // Dark goldenrod for shed voucher
  },
  subtitle: {
    fontSize: 10,
    textAlign: "center",
    color: "#666",
  },
  voucherInfo: {
    position: "absolute",
    right: 0,
    top: 0,
    alignItems: "flex-end",
  },
  voucherNumber: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#B8860B",
  },
  voucherDate: {
    fontSize: 8,
    color: "#666",
    marginTop: 2,
  },

  // Company Info Section
  companyInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    paddingTop: 4,
  },
  companyDetails: {
    flex: 1,
  },
  companyName: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
  },
  companyAddress: {
    fontSize: 8,
    lineHeight: 1.2,
    color: "#333",
  },
  contactInfo: {
    fontSize: 8,
    marginTop: 2,
    color: "#666",
  },

  // Farmer Details Section
  farmerSection: {
    marginBottom: 8,
    padding: 6,
    backgroundColor: "#FFF8DC", // Light goldenrod background
    borderWidth: 1,
    borderColor: "#B8860B",
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#B8860B",
  },
  farmerDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  farmerInfo: {
    flex: 1,
  },
  farmerLabel: {
    fontSize: 7,
    color: "#666",
    marginBottom: 1,
  },
  farmerValue: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 2,
  },

  // Processing Summary Section
  summarySection: {
    marginBottom: 8,
    padding: 6,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  summaryTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  summaryGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  summaryItem: {
    alignItems: "center",
    flex: 1,
  },
  summaryLabel: {
    fontSize: 7,
    color: "#666",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
  },

  // Order Details Section
  orderDetailsSection: {
    marginBottom: 8,
  },
  orderDetailsTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  varietySection: {
    marginBottom: 6,
    padding: 4,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  varietyTitle: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 3,
    color: "#B8860B",
  },
  table: {
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F0F0F0",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableHeaderCell: {
    flex: 1,
    padding: 3,
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#DDD",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#DDD",
  },
  tableCell: {
    flex: 1,
    padding: 3,
    fontSize: 7,
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#DDD",
  },
  tableCellLeft: {
    textAlign: "left",
  },
  subtotalRow: {
    flexDirection: "row",
    backgroundColor: "#F8F8F8",
    borderTopWidth: 1,
    borderTopColor: "#000",
  },
  subtotalCell: {
    flex: 1,
    padding: 3,
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#DDD",
  },

  // Grand Total Section
  grandTotalSection: {
    marginTop: 8,
    padding: 6,
    backgroundColor: "#E6E6FA", // Light purple background
    borderWidth: 1,
    borderColor: "#B8860B",
  },
  grandTotalTitle: {
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
    color: "#B8860B",
  },
  grandTotalGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  grandTotalItem: {
    alignItems: "center",
    flex: 1,
  },
  grandTotalLabel: {
    fontSize: 7,
    color: "#666",
    marginBottom: 2,
  },
  grandTotalValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#B8860B",
  },

  // Remarks Section
  remarksSection: {
    marginTop: 8,
    padding: 6,
    backgroundColor: "#FFFACD", // Lemon chiffon background
    borderWidth: 1,
    borderColor: "#B8860B",
  },
  remarksTitle: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 3,
    color: "#B8860B",
  },
  remarksText: {
    fontSize: 8,
    lineHeight: 1.3,
    color: "#333",
  },

  // Footer Section
  footer: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#DDD",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  signatureSection: {
    alignItems: "center",
    flex: 1,
  },
  signatureLine: {
    width: 100,
    height: 1,
    backgroundColor: "#000",
    marginBottom: 2,
  },
  signatureLabel: {
    fontSize: 7,
    color: "#666",
  },
  dateSection: {
    alignItems: "center",
    flex: 1,
  },
  dateLabel: {
    fontSize: 7,
    color: "#666",
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 8,
    fontWeight: "bold",
  },
});

const ShedVoucherPDF: React.FC<ShedVoucherPDFProps> = ({ order, adminInfo }) => {
  // Calculate totals
  const calculateTotalTakenOut = () => {
    if (!order.orderDetails) return 0;
    return order.orderDetails.reduce(
      (total, detail) =>
        total +
        detail.bagSizes.reduce(
          (sum, bag) => sum + (bag.quantityTakenOut || 0),
          0
        ),
      0
    );
  };

  const calculateTotalRejected = () => {
    if (!order.orderDetails) return 0;
    return order.orderDetails.reduce(
      (total, detail) =>
        total +
        detail.bagSizes.reduce(
          (sum, bag) => sum + (bag.quantityRejected || 0),
          0
        ),
      0
    );
  };

  const calculateTotalRestored = () => {
    if (!order.orderDetails) return 0;
    return order.orderDetails.reduce(
      (total, detail) =>
        total +
        detail.bagSizes.reduce(
          (sum, bag) => sum + (bag.quantityRestored || 0),
          0
        ),
      0
    );
  };

  // Get all unique varieties
  const getAllVarieties = () => {
    if (!order.orderDetails) return [];
    return Array.from(
      new Set(
        order.orderDetails
          .map((detail) => detail.variety)
          .filter((variety) => variety)
      )
    );
  };

  // Calculate variety totals
  const calculateVarietyTotalTakenOut = (variety: string) => {
    if (!order.orderDetails) return 0;
    return order.orderDetails
      .filter((detail) => detail.variety === variety)
      .reduce(
        (total, detail) =>
          total +
          detail.bagSizes.reduce(
            (sum, bag) => sum + (bag.quantityTakenOut || 0),
            0
          ),
        0
      );
  };

  const calculateVarietyTotalRejected = (variety: string) => {
    if (!order.orderDetails) return 0;
    return order.orderDetails
      .filter((detail) => detail.variety === variety)
      .reduce(
        (total, detail) =>
          total +
          detail.bagSizes.reduce(
            (sum, bag) => sum + (bag.quantityRejected || 0),
            0
          ),
        0
      );
  };

  const calculateVarietyTotalRestored = (variety: string) => {
    if (!order.orderDetails) return 0;
    return order.orderDetails
      .filter((detail) => detail.variety === variety)
      .reduce(
        (total, detail) =>
          total +
          detail.bagSizes.reduce(
            (sum, bag) => sum + (bag.quantityRestored || 0),
            0
          ),
        0
      );
  };

  const calculateVarietyTotalCurrent = (variety: string) => {
    if (!order.orderDetails) return 0;
    return order.orderDetails
      .filter((detail) => detail.variety === variety)
      .reduce(
        (total, detail) =>
          total +
          detail.bagSizes.reduce(
            (sum, bag) => sum + (bag.currentQuantity || 0),
            0
          ),
        0
      );
  };

  const totalTakenOut = calculateTotalTakenOut();
  const totalRejected = calculateTotalRejected();
  const totalRestored = calculateTotalRestored();
  const netProcessed = totalTakenOut - totalRejected - totalRestored;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoSection}>
              <Image style={styles.logo} src={coldopLogo} />
            </View>
            <View style={styles.titleSection}>
              <Text style={styles.title}>SHED VOUCHER</Text>
              <Text style={styles.subtitle}>
                {adminInfo.coldStorageDetails.coldStorageName}
              </Text>
            </View>
            <View style={styles.voucherInfo}>
              <Text style={styles.voucherNumber}>
                #{order.gatePass.gatePassNumber}
              </Text>
              <Text style={styles.voucherDate}>
                {order.dateOfExtraction || "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* Company Information */}
        <View style={styles.companyInfo}>
          <View style={styles.companyDetails}>
            <Text style={styles.companyName}>
              {adminInfo.coldStorageDetails.coldStorageName}
            </Text>
            <Text style={styles.companyAddress}>
              {adminInfo.coldStorageDetails.coldStorageAddress}
            </Text>
            <Text style={styles.contactInfo}>
              Contact: {adminInfo.coldStorageDetails.coldStorageContactNumber}
            </Text>
          </View>
        </View>

        {/* Farmer Details */}
        {order.farmerId && (
          <View style={styles.farmerSection}>
            <Text style={styles.sectionTitle}>Farmer Details</Text>
            <View style={styles.farmerDetails}>
              <View style={styles.farmerInfo}>
                <Text style={styles.farmerLabel}>Name:</Text>
                <Text style={styles.farmerValue}>{order.farmerId.name}</Text>
                <Text style={styles.farmerLabel}>Farmer ID:</Text>
                <Text style={styles.farmerValue}>{order.farmerId.farmerId}</Text>
              </View>
              <View style={styles.farmerInfo}>
                <Text style={styles.farmerLabel}>Address:</Text>
                <Text style={styles.farmerValue}>{order.farmerId.address}</Text>
                <Text style={styles.farmerLabel}>Mobile:</Text>
                <Text style={styles.farmerValue}>{order.farmerId.mobileNumber}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Processing Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Processing Summary</Text>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Taken Out</Text>
              <Text style={styles.summaryValue}>{totalTakenOut}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Rejected</Text>
              <Text style={styles.summaryValue}>{totalRejected}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Restored</Text>
              <Text style={styles.summaryValue}>{totalRestored}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Net Processed</Text>
              <Text style={styles.summaryValue}>{netProcessed}</Text>
            </View>
          </View>
        </View>

        {/* Order Details */}
        <View style={styles.orderDetailsSection}>
          <Text style={styles.orderDetailsTitle}>Processing Details by Variety</Text>
          {getAllVarieties().map((variety, varietyIndex) => {
            const varietyDetails = order.orderDetails?.filter(
              (detail) => detail.variety === variety
            ) || [];

            // Get all unique bag sizes for this variety
            const varietyBagSizes = Array.from(
              new Set(
                varietyDetails.flatMap((d) =>
                  d.bagSizes.map((b) => b.size)
                )
              )
            );

            if (varietyBagSizes.length === 0) return null;

            return (
              <View key={varietyIndex} style={styles.varietySection}>
                <Text style={styles.varietyTitle}>{variety}</Text>
                <View style={styles.table}>
                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Bag Type</Text>
                    <Text style={styles.tableHeaderCell}>Taken Out</Text>
                    <Text style={styles.tableHeaderCell}>Rejected</Text>
                    <Text style={styles.tableHeaderCell}>Restored</Text>
                    <Text style={styles.tableHeaderCell}>Current</Text>
                  </View>

                  {/* Table Rows */}
                  {varietyBagSizes.map((bagSize, idx) => {
                    const bagData = varietyDetails.reduce(
                      (acc, detail) => {
                        const bag = detail.bagSizes.find((b) => b.size === bagSize);
                        if (bag) {
                          acc.takenOut += bag.quantityTakenOut || 0;
                          acc.rejected += bag.quantityRejected || 0;
                          acc.restored += bag.quantityRestored || 0;
                          acc.current += bag.currentQuantity || 0;
                        }
                        return acc;
                      },
                      { takenOut: 0, rejected: 0, restored: 0, current: 0 }
                    );

                    return (
                      <View key={idx} style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.tableCellLeft, { flex: 2 }]}>
                          {bagSize}
                        </Text>
                        <Text style={styles.tableCell}>{bagData.takenOut}</Text>
                        <Text style={styles.tableCell}>{bagData.rejected}</Text>
                        <Text style={styles.tableCell}>{bagData.restored}</Text>
                        <Text style={styles.tableCell}>{bagData.current}</Text>
                      </View>
                    );
                  })}

                  {/* Subtotal Row */}
                  <View style={styles.subtotalRow}>
                    <Text style={[styles.subtotalCell, { flex: 2 }]}>Subtotal</Text>
                    <Text style={styles.subtotalCell}>
                      {calculateVarietyTotalTakenOut(variety)}
                    </Text>
                    <Text style={styles.subtotalCell}>
                      {calculateVarietyTotalRejected(variety)}
                    </Text>
                    <Text style={styles.subtotalCell}>
                      {calculateVarietyTotalRestored(variety)}
                    </Text>
                    <Text style={styles.subtotalCell}>
                      {calculateVarietyTotalCurrent(variety)}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Grand Total */}
        <View style={styles.grandTotalSection}>
          <Text style={styles.grandTotalTitle}>Grand Total</Text>
          <View style={styles.grandTotalGrid}>
            <View style={styles.grandTotalItem}>
              <Text style={styles.grandTotalLabel}>Total Taken Out</Text>
              <Text style={styles.grandTotalValue}>{totalTakenOut}</Text>
            </View>
            <View style={styles.grandTotalItem}>
              <Text style={styles.grandTotalLabel}>Total Rejected</Text>
              <Text style={styles.grandTotalValue}>{totalRejected}</Text>
            </View>
            <View style={styles.grandTotalItem}>
              <Text style={styles.grandTotalLabel}>Total Restored</Text>
              <Text style={styles.grandTotalValue}>{totalRestored}</Text>
            </View>
            <View style={styles.grandTotalItem}>
              <Text style={styles.grandTotalLabel}>Net Processed</Text>
              <Text style={styles.grandTotalValue}>{netProcessed}</Text>
            </View>
          </View>
        </View>

        {/* Remarks */}
        {order.remarks && (
          <View style={styles.remarksSection}>
            <Text style={styles.remarksTitle}>Remarks</Text>
            <Text style={styles.remarksText}>{order.remarks}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.signatureSection}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Authorized Signature</Text>
          </View>
          <View style={styles.dateSection}>
            <Text style={styles.dateLabel}>Date:</Text>
            <Text style={styles.dateValue}>
              {order.dateOfExtraction || new Date().toLocaleDateString()}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ShedVoucherPDF;
