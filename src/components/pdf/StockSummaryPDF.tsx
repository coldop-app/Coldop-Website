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

export interface StockSummary {
  variety: string;
  sizes: {
    size: string;
    initialQuantity: number;
    currentQuantity: number;
    quantityRemoved?: number;
  }[];
}

export type TabType = 'current' | 'initial' | 'outgoing';

interface StockSummaryPDFProps {
  stockSummary: StockSummary[];
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

  reportInfoSection: {
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reportInfoLeft: {
    width: "48%",
  },
  reportInfoRight: {
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

  tableContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  tableTitle: {
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
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#E8E8E8",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingVertical: 4,
    minHeight: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#666",
    paddingVertical: 2,
    minHeight: 14,
  },

  // Column styles
  colVariety: {
    width: "25%",
    borderRightWidth: 0.5,
    borderRightColor: "#666",
    paddingHorizontal: 2,
    justifyContent: "center",
  },
  colBagSize: {
    width: "12%",
    borderRightWidth: 0.5,
    borderRightColor: "#666",
    paddingHorizontal: 2,
    justifyContent: "center",
  },
  colTotal: {
    width: "15%",
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

const calculateVarietyTotal = (variety: StockSummary, allBagSizes: string[], tabType: TabType = 'current') => {
  return allBagSizes.reduce((acc, sizeName) => {
    const sizeData = variety.sizes.find(s => s.size === sizeName);
    if (!sizeData) return acc;

    switch (tabType) {
      case 'current':
        return acc + sizeData.currentQuantity;
      case 'initial':
        return acc + sizeData.initialQuantity;
      case 'outgoing':
        return acc + (sizeData.quantityRemoved || 0);
      default:
        return acc + sizeData.currentQuantity;
    }
  }, 0);
};

const calculateTotalBags = (stockSummary: StockSummary[], allBagSizes: string[], tabType: TabType = 'current') => {
  return stockSummary.reduce((total, variety) => {
    return total + calculateVarietyTotal(variety, allBagSizes, tabType);
  }, 0);
};

const getQuantityForSize = (variety: StockSummary, sizeName: string, tabType: TabType = 'current') => {
  const sizeData = variety.sizes.find(s => s.size === sizeName);
  if (!sizeData) return 0;

  switch (tabType) {
    case 'current':
      return sizeData.currentQuantity;
    case 'initial':
      return sizeData.initialQuantity;
    case 'outgoing':
      return sizeData.quantityRemoved || 0;
    default:
      return sizeData.currentQuantity;
  }
};

const getTotalForSize = (stockSummary: StockSummary[], sizeName: string, tabType: TabType = 'current') => {
  return stockSummary.reduce((total, variety) => {
    return total + getQuantityForSize(variety, sizeName, tabType);
  }, 0);
};

const formatDate = (date: string | Date | undefined): string => {
  if (!date) return "-";

  try {
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    if (isNaN(parsedDate.getTime())) {
      return "-";
    }

    const day = parsedDate.getDate().toString().padStart(2, "0");
    const month = (parsedDate.getMonth() + 1).toString().padStart(2, "0");
    const year = parsedDate.getFullYear().toString().slice(-2);

    return `${day}/${month}/${year}`;
  } catch {
    return "-";
  }
};

const cleanBagSizeHeading = (size: string): string => {
  return size
    .replace(/mm/g, "")
    .replace(/Be-low/g, "Below")
    .trim();
};

const StockSummaryPDF: React.FC<StockSummaryPDFProps> = ({
  stockSummary,
  adminInfo,
}) => {
  // Get all unique bag sizes from the data
  const allBagSizes = React.useMemo(() => {
    const bagSizes = adminInfo.preferences?.bagSizes || [];
    if (!bagSizes || bagSizes.length === 0) {
      const uniqueSizes = new Set<string>();
      stockSummary.forEach(variety => {
        variety.sizes.forEach(size => uniqueSizes.add(size.size));
      });
      return Array.from(uniqueSizes).sort();
    }
    return bagSizes;
  }, [adminInfo.preferences?.bagSizes, stockSummary]);

  if (!stockSummary || stockSummary.length === 0) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.companyName}>
              {adminInfo.coldStorageDetails.coldStorageName.toUpperCase()}
            </Text>
            <Text style={styles.reportTitle}>NO STOCK DATA FOUND</Text>
          </View>
        </Page>
      </Document>
    );
  }

  // Filter bag sizes that have values for each tab type
  const getBagSizesWithValues = (tabType: TabType) => {
    return allBagSizes.filter(size => {
      return stockSummary.some(variety => {
        const sizeData = variety.sizes.find(s => s.size === size);
        if (!sizeData) return false;

        switch (tabType) {
          case 'current':
            return sizeData.currentQuantity > 0;
          case 'initial':
            return sizeData.initialQuantity > 0;
          case 'outgoing':
            return (sizeData.quantityRemoved || 0) > 0;
          default:
            return sizeData.currentQuantity > 0;
        }
      });
    });
  };

  const renderTable = (tabType: TabType, title: string) => {
    const bagSizesWithValues = getBagSizesWithValues(tabType);
    const sortedVarieties = [...stockSummary].sort((a, b) => a.variety.localeCompare(b.variety));
    const totalBags = calculateTotalBags(stockSummary, bagSizesWithValues, tabType);

    return (
      <View style={styles.tableContainer}>
        <Text style={styles.tableTitle}>{title}</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <View style={styles.colVariety}>
              <Text style={styles.cellHeaderText}>VARIETIES</Text>
            </View>
            {bagSizesWithValues.map((size) => (
              <View key={size} style={styles.colBagSize}>
                <Text style={styles.cellHeaderText}>{cleanBagSizeHeading(size)}</Text>
              </View>
            ))}
            <View style={styles.colTotal}>
              <Text style={styles.cellHeaderText}>TOTAL</Text>
            </View>
          </View>

          {sortedVarieties.map((variety) => (
            <View key={variety.variety} style={styles.tableRow}>
              <View style={styles.colVariety}>
                <Text style={styles.cellTextLeft}>{variety.variety}</Text>
              </View>
              {bagSizesWithValues.map((size) => (
                <View key={size} style={styles.colBagSize}>
                  <Text style={styles.cellText}>
                    {getQuantityForSize(variety, size, tabType) > 0 ? getQuantityForSize(variety, size, tabType) : "-"}
                  </Text>
                </View>
              ))}
              <View style={styles.colTotal}>
                <Text style={styles.balanceText}>
                  {calculateVarietyTotal(variety, bagSizesWithValues, tabType) > 0 ? calculateVarietyTotal(variety, bagSizesWithValues, tabType) : "-"}
                </Text>
              </View>
            </View>
          ))}

          {/* Totals Row */}
          <View style={[styles.tableRow, styles.totalRow]}>
            <View style={styles.colVariety}>
              <Text style={styles.balanceText}>BAG TOTAL</Text>
            </View>
            {bagSizesWithValues.map((size) => (
              <View key={size} style={styles.colBagSize}>
                <Text style={styles.balanceText}>
                  {getTotalForSize(stockSummary, size, tabType) > 0 ? getTotalForSize(stockSummary, size, tabType) : "-"}
                </Text>
              </View>
            ))}
            <View style={styles.colTotal}>
              <Text style={styles.balanceText}>
                {totalBags > 0 ? totalBags : "-"}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const currentTotal = calculateTotalBags(stockSummary, getBagSizesWithValues('current'), 'current');
  const initialTotal = calculateTotalBags(stockSummary, getBagSizesWithValues('initial'), 'initial');
  const outgoingTotal = calculateTotalBags(stockSummary, getBagSizesWithValues('outgoing'), 'outgoing');

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.companyName}>
            {adminInfo.coldStorageDetails.coldStorageName.toUpperCase()}
          </Text>
          <Text style={styles.reportTitle}>STOCK SUMMARY REPORT</Text>
          <Text style={[styles.reportTitle, { fontSize: 10, marginTop: 4 }]}>
            {formatDate(new Date())}
          </Text>
        </View>

        {/* Report Information */}
        <View style={styles.reportInfoSection}>
          <View style={styles.reportInfoLeft}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Report Date:</Text>
              <Text style={[styles.infoValue, { fontWeight: 'bold' }]}>{formatDate(new Date())}</Text>
            </View>
          </View>
          <View style={styles.reportInfoRight}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Varieties:</Text>
              <Text style={styles.infoValue}>{stockSummary.length}</Text>
            </View>
          </View>
        </View>

        {/* Current Stock Table */}
        {renderTable('current', 'Current Stock')}

        {/* Initial Quantities Table */}
        {renderTable('initial', 'Initial Quantities')}

        {/* Outgoing Quantities Table */}
        {renderTable('outgoing', 'Outgoing Quantities')}

        {/* Summary Box */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Stock Summary</Text>
          <View style={styles.summaryTable}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Varieties:</Text>
              <Text style={styles.summaryValue}>{stockSummary.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Initial Bags:</Text>
              <Text style={styles.summaryValue}>{initialTotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Outgoing Bags:</Text>
              <Text style={styles.summaryValue}>{outgoingTotal}</Text>
            </View>
            <View style={[styles.summaryRow, { backgroundColor: "#D0D0D0" }]}>
              <Text style={styles.summaryLabel}>CURRENT BALANCE:</Text>
              <Text style={styles.summaryValue}>{currentTotal}</Text>
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
              Date: {formatDate(new Date())}
            </Text>
          </View>
        </View>

        <Text style={styles.pageNumber}>Page 1</Text>
      </Page>
    </Document>
  );
};

export default StockSummaryPDF;
