import React, { useMemo } from "react";
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

interface ExpenseCategory {
  category: string;
  total: number;
  list: Array<{
    _id: string;
    amount: number;
    remarks: string;
    date: string;
  }>;
}

interface FarmerIncome {
  farmerId: string;
  name: string;
  address: string;
  stock: {
    totalBags: number;
    costPerBag: number;
  };
  rentIncome: number;
  shed: {
    list: Array<{
      _id: string;
      amount: number;
      amount_left: number;
      remarks: string;
      date: string;
    }>;
    total: number;
  };
  credit: {
    list: Array<{
      _id: string;
      amount: number;
      amount_left: number;
      remarks: string;
      date: string;
    }>;
    total: number;
  };
  totalIncome: number;
}

interface PnLSummary {
  expenses: {
    byCategory: ExpenseCategory[];
    total: number;
  };
  income: {
    farmers: FarmerIncome[];
    total: number;
  };
  netProfitOrLoss: number;
}

interface FinancesReportPDFProps {
  adminInfo: StoreAdmin;
  pnlSummary: PnLSummary;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FEFDF8",
    padding: 16,
    paddingBottom: 80,
    fontFamily: "Helvetica",
    fontSize: 8,
  },
  header: {
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    paddingBottom: 6,
  },
  logoSection: {
    width: 50,
    marginRight: 12,
    position: "absolute",
    left: 0,
    top: 0,
  },
  logo: {
    width: 20,
    height: 20,
    marginBottom: 3,
    opacity: 0.85,
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
  reportDate: {
    fontSize: 8,
    textAlign: "center",
    color: "#666",
    marginBottom: 6,
  },
  summaryCards: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#000",
    padding: 8,
    backgroundColor: "#fff",
  },
  summaryCardTitle: {
    fontSize: 7,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#666",
  },
  summaryCardValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000",
  },
  summaryCardValueGreen: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2e7d32",
  },
  summaryCardValueRed: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#d32f2f",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
    padding: 4,
    backgroundColor: "#E8E8E8",
    textAlign: "center",
    textTransform: "uppercase",
  },
  sectionTitleGreen: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
    padding: 4,
    backgroundColor: "#E8F5E9",
    textAlign: "center",
    textTransform: "uppercase",
  },
  sectionTitleRed: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 6,
    padding: 4,
    backgroundColor: "#FFEBEE",
    textAlign: "center",
    textTransform: "uppercase",
  },
  farmerCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 6,
    marginBottom: 6,
    backgroundColor: "#fff",
  },
  farmerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  farmerName: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#000",
  },
  farmerId: {
    fontSize: 7,
    color: "#666",
  },
  farmerAddress: {
    fontSize: 7,
    color: "#666",
    marginBottom: 4,
  },
  incomeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
    paddingHorizontal: 4,
    fontSize: 7,
  },
  incomeRowLabel: {
    flex: 1,
    color: "#333",
  },
  incomeRowValue: {
    flex: 1,
    textAlign: "right",
    color: "#000",
    fontWeight: "bold",
  },
  incomeRowValueGreen: {
    flex: 1,
    textAlign: "right",
    color: "#2e7d32",
    fontWeight: "bold",
  },
  incomeRowValueRed: {
    flex: 1,
    textAlign: "right",
    color: "#d32f2f",
    fontWeight: "bold",
  },
  divider: {
    borderTopWidth: 0.5,
    borderTopColor: "#ddd",
    marginVertical: 4,
  },
  expenseCategoryCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 6,
    marginBottom: 6,
    backgroundColor: "#fff",
  },
  expenseCategoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  expenseCategoryTitle: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#000",
  },
  expenseCategoryTotal: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#d32f2f",
  },
  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
    paddingLeft: 8,
    fontSize: 7,
    color: "#666",
  },
  expenseItemDate: {
    fontSize: 6,
    color: "#999",
    marginTop: 1,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    marginTop: 4,
    borderTopWidth: 2,
    borderTopColor: "#000",
    fontWeight: "bold",
    fontSize: 9,
  },
  netProfitLossSection: {
    marginTop: 12,
    padding: 10,
    borderWidth: 2,
    borderColor: "#000",
    backgroundColor: "#f5f5f5",
  },
  netProfitLossTitle: {
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  netProfitLossAmount: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  netProfitLossSubtitle: {
    fontSize: 7,
    textAlign: "center",
    color: "#666",
    marginTop: 4,
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
  emptyState: {
    textAlign: "center",
    padding: 20,
    fontSize: 9,
    color: "#666",
  },
});

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "-";
  }
};

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    LABOUR: "Labour",
    ELECTRICITY: "Electricity",
    TRANSPORT: "Transport",
    SALARY: "Salary",
    FESTIVAL: "Festival",
    OTHER: "Other",
  };
  return labels[category] || category;
};

const FinancesReportPDF: React.FC<FinancesReportPDFProps> = ({
  adminInfo,
  pnlSummary,
}) => {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Split farmers into pages if needed
  const farmersPerPage = 8;
  const farmerPages = useMemo(() => {
    const pages: FarmerIncome[][] = [];
    for (let i = 0; i < pnlSummary.income.farmers.length; i += farmersPerPage) {
      pages.push(pnlSummary.income.farmers.slice(i, i + farmersPerPage));
    }
    return pages;
  }, [pnlSummary.income.farmers]);

  // Split expenses into pages if needed
  const expensesPerPage = 6;
  const expensePages = useMemo(() => {
    const pages: ExpenseCategory[][] = [];
    for (
      let i = 0;
      i < pnlSummary.expenses.byCategory.length;
      i += expensesPerPage
    ) {
      pages.push(
        pnlSummary.expenses.byCategory.slice(i, i + expensesPerPage)
      );
    }
    return pages;
  }, [pnlSummary.expenses.byCategory]);

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
        {adminInfo.coldStorageDetails?.coldStorageName?.toUpperCase() ||
          "COLD STORAGE"}
      </Text>
      <Text style={styles.reportTitle}>PROFIT & LOSS STATEMENT</Text>
      <Text style={styles.reportDate}>Date: {currentDate}</Text>
    </View>
  );

  const renderSummaryCards = () => (
    <View style={styles.summaryCards}>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryCardTitle}>Net Income</Text>
        <Text style={styles.summaryCardValueGreen}>
          {formatCurrency(pnlSummary.income.total)}
        </Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryCardTitle}>Net Expenses</Text>
        <Text style={styles.summaryCardValueRed}>
          {formatCurrency(pnlSummary.expenses.total)}
        </Text>
      </View>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryCardTitle}>
          Net {pnlSummary.netProfitOrLoss >= 0 ? "Profit" : "Loss"}
        </Text>
        <Text
          style={
            pnlSummary.netProfitOrLoss >= 0
              ? styles.summaryCardValueGreen
              : styles.summaryCardValueRed
          }
        >
          {formatCurrency(pnlSummary.netProfitOrLoss)}
        </Text>
      </View>
    </View>
  );

  const renderFarmerCard = (farmer: FarmerIncome, index: number) => {
    const totalIncome = farmer.rentIncome + farmer.shed.total;
    const standingAmount =
      farmer.rentIncome + farmer.shed.total - farmer.credit.total;

    return (
      <View key={farmer.farmerId} style={styles.farmerCard}>
        <View style={styles.farmerHeader}>
          <View>
            <Text style={styles.farmerName}>
              {index + 1}. {farmer.name.toUpperCase()}
            </Text>
            <Text style={styles.farmerId}>ID: {farmer.farmerId}</Text>
          </View>
        </View>
        <Text style={styles.farmerAddress}>{farmer.address}</Text>

        <View style={styles.incomeRow}>
          <Text style={styles.incomeRowLabel}>
            Rent ({farmer.stock.totalBags} ×{" "}
            {formatCurrency(farmer.stock.costPerBag)})
          </Text>
          <Text style={styles.incomeRowValueGreen}>
            {formatCurrency(farmer.rentIncome)}
          </Text>
        </View>

        {farmer.shed.total > 0 && (
          <View style={styles.incomeRow}>
            <Text style={styles.incomeRowLabel}>Shed Income</Text>
            <Text style={styles.incomeRowValueGreen}>
              +{formatCurrency(farmer.shed.total)}
            </Text>
          </View>
        )}

        {farmer.credit.total > 0 && (
          <View style={styles.incomeRow}>
            <Text style={styles.incomeRowLabel}>Payments Made</Text>
            <Text style={styles.incomeRowValueRed}>
              -{formatCurrency(farmer.credit.total)}
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.incomeRow}>
          <Text style={[styles.incomeRowLabel, { fontWeight: "bold" }]}>
            Standing Amount
          </Text>
          <Text style={[styles.incomeRowValue, { fontWeight: "bold" }]}>
            {formatCurrency(standingAmount)}
          </Text>
        </View>

        <View style={[styles.incomeRow, { marginTop: 2 }]}>
          <Text style={[styles.incomeRowLabel, { fontWeight: "bold" }]}>
            Total Income
          </Text>
          <Text style={[styles.incomeRowValueGreen, { fontWeight: "bold" }]}>
            {formatCurrency(totalIncome)}
          </Text>
        </View>
      </View>
    );
  };

  const renderExpenseCategory = (category: ExpenseCategory) => (
    <View key={category.category} style={styles.expenseCategoryCard}>
      <View style={styles.expenseCategoryHeader}>
        <Text style={styles.expenseCategoryTitle}>
          {getCategoryLabel(category.category)}
        </Text>
        <Text style={styles.expenseCategoryTotal}>
          {formatCurrency(category.total)}
        </Text>
      </View>
      <Text style={{ fontSize: 6, color: "#666", marginBottom: 4 }}>
        {category.list.length} {category.list.length === 1 ? "entry" : "entries"}
      </Text>
      {category.list.map((expense) => (
        <View key={expense._id}>
          <View style={styles.expenseItem}>
            <View style={{ flex: 1 }}>
              <Text>{expense.remarks || "Expense"}</Text>
              <Text style={styles.expenseItemDate}>
                {formatDate(expense.date)}
              </Text>
            </View>
            <Text style={{ fontWeight: "bold" }}>
              {formatCurrency(expense.amount)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderFooter = (pageNumber: number, totalPages: number) => (
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
          <Text style={styles.footerText}>Date: {currentDate}</Text>
        </View>
      </View>
      <Text style={styles.pageNumber}>
        Page {pageNumber} of {totalPages}
      </Text>
    </>
  );

  // Calculate total pages based on what we're actually rendering
  // 1. First page: summary + first farmers (always rendered)
  // 2. Additional farmer pages: max(0, farmerPages.length - 1)
  // 3. Income summary page: only if there are farmers
  // 4. Additional expense pages: max(0, expensePages.length - 1) if expenses started on income summary, else expensePages.length
  // 5. Final summary page: always rendered
  const hasFarmers = pnlSummary.income.farmers.length > 0;
  const hasExpenses = pnlSummary.expenses.byCategory.length > 0;

  let totalPages = 1; // First page
  totalPages += Math.max(0, farmerPages.length - 1); // Additional farmer pages
  if (hasFarmers) {
    totalPages += 1; // Income summary page (which may include first expenses)
    if (hasExpenses) {
      totalPages += Math.max(0, expensePages.length - 1); // Additional expense pages
    }
  } else if (hasExpenses) {
    totalPages += expensePages.length; // All expense pages if no farmers
  }
  totalPages += 1; // Final summary page

  return (
    <Document>
      {/* First page with summary cards and first set of farmers */}
      <Page size="A4" style={styles.page}>
        {renderHeader()}
        {renderSummaryCards()}

        <View style={styles.section}>
          <Text style={styles.sectionTitleGreen}>INCOME DETAILS</Text>
          {farmerPages[0]?.map((farmer, index) =>
            renderFarmerCard(farmer, index)
          )}
        </View>

        {renderFooter(1, totalPages)}
      </Page>

      {/* Additional farmer pages */}
      {farmerPages.slice(1).map((pageFarmers, pageIndex) => (
        <Page key={`farmers-${pageIndex + 2}`} size="A4" style={styles.page}>
          {renderHeader()}
          <View style={styles.section}>
            <Text style={styles.sectionTitleGreen}>
              INCOME DETAILS (CONTINUED)
            </Text>
            {pageFarmers.map((farmer, index) =>
              renderFarmerCard(
                farmer,
                farmersPerPage * (pageIndex + 1) + index
              )
            )}
          </View>
          {renderFooter(pageIndex + 2, totalPages)}
        </Page>
      ))}

      {/* Income Summary and Expenses Start */}
      {hasFarmers && (
        <Page size="A4" style={styles.page}>
          {renderHeader()}
          <View style={styles.section}>
            <Text style={styles.sectionTitleGreen}>INCOME SUMMARY</Text>
            <View style={styles.totalRow}>
              <Text>TOTAL INCOME</Text>
              <Text>{formatCurrency(pnlSummary.income.total)}</Text>
            </View>
          </View>

          {/* Expenses section */}
          {hasExpenses && (
            <View style={styles.section}>
              <Text style={styles.sectionTitleRed}>EXPENSES DETAILS</Text>
              {expensePages[0]?.map((category) =>
                renderExpenseCategory(category)
              )}
            </View>
          )}

          {renderFooter(farmerPages.length + 1, totalPages)}
        </Page>
      )}

      {/* Expenses Start Page (if no farmers) */}
      {!hasFarmers && hasExpenses && expensePages.length > 0 && (
        <Page size="A4" style={styles.page}>
          {renderHeader()}
          <View style={styles.section}>
            <Text style={styles.sectionTitleRed}>EXPENSES DETAILS</Text>
            {expensePages[0]?.map((category) =>
              renderExpenseCategory(category)
            )}
          </View>
          {renderFooter(2, totalPages)}
        </Page>
      )}

      {/* Additional expense pages */}
      {expensePages.slice(1).map((pageExpenses, pageIndex) => {
        const pageNumber = hasFarmers
          ? farmerPages.length + 2 + pageIndex
          : 3 + pageIndex;
        return (
          <Page key={`expenses-${pageIndex + 1}`} size="A4" style={styles.page}>
            {renderHeader()}
            <View style={styles.section}>
              <Text style={styles.sectionTitleRed}>
                EXPENSES DETAILS (CONTINUED)
              </Text>
              {pageExpenses.map((category) => renderExpenseCategory(category))}
            </View>
            {renderFooter(pageNumber, totalPages)}
          </Page>
        );
      })}

      {/* Total Expenses and Net P&L */}
      <Page size="A4" style={styles.page}>
        {renderHeader()}
        {pnlSummary.expenses.byCategory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitleRed}>EXPENSES SUMMARY</Text>
            <View style={styles.totalRow}>
              <Text>TOTAL EXPENSES</Text>
              <Text>{formatCurrency(pnlSummary.expenses.total)}</Text>
            </View>
          </View>
        )}

        <View style={styles.netProfitLossSection}>
          <Text style={styles.netProfitLossTitle}>
            NET {pnlSummary.netProfitOrLoss >= 0 ? "PROFIT" : "LOSS"}
          </Text>
          <Text
            style={[
              styles.netProfitLossAmount,
              {
                color:
                  pnlSummary.netProfitOrLoss >= 0 ? "#2e7d32" : "#d32f2f",
              },
            ]}
          >
            {formatCurrency(pnlSummary.netProfitOrLoss)}
          </Text>
          <Text style={styles.netProfitLossSubtitle}>
            (Income - Expenses)
          </Text>
        </View>

        {renderFooter(totalPages, totalPages)}
      </Page>
    </Document>
  );
};

export default FinancesReportPDF;
