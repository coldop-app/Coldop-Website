import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

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

interface StoreAdmin {
  coldStorageName?: string;
  coldStorageAddress?: string;
  coldStorageContactNumber?: string;
}

interface ProfitLossReportPDFProps {
  adminInfo: StoreAdmin;
  pnlSummary: PnLSummary;
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 30,
    borderBottom: "2 solid #000000",
    paddingBottom: 10,
  },
  companyName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "center",
    color: "#000000",
    textTransform: "uppercase",
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 4,
    color: "#000000",
    textTransform: "uppercase",
  },
  reportSubtitle: {
    fontSize: 9,
    textAlign: "center",
    color: "#333333",
    marginBottom: 6,
  },
  companyDetails: {
    fontSize: 9,
    textAlign: "center",
    color: "#333333",
    marginBottom: 2,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    backgroundColor: "#f0f0f0",
    padding: 8,
    marginBottom: 2,
    borderBottom: "2 solid #000000",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000000",
    textTransform: "uppercase",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottom: "1 solid #cccccc",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#f9f9f9",
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#000000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "0.5 solid #e0e0e0",
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableCell: {
    fontSize: 9,
    color: "#333333",
  },
  farmerSection: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottom: "1 solid #e0e0e0",
  },
  farmerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#f5f5f5",
  },
  farmerName: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#000000",
  },
  farmerDetails: {
    fontSize: 8,
    color: "#666666",
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    paddingHorizontal: 16,
    fontSize: 9,
  },
  indentedRow: {
    paddingLeft: 32,
  },
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginTop: 4,
    borderTop: "1 solid #cccccc",
    fontSize: 9,
    fontWeight: "bold",
  },
  categorySection: {
    marginBottom: 12,
  },
  categoryHeader: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#f9f9f9",
  },
  expenseRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
    paddingHorizontal: 16,
    fontSize: 9,
    color: "#333333",
  },
  totalSection: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#f5f5f5",
    border: "1 solid #cccccc",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottom: "1 solid #e0e0e0",
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000000",
  },
  totalAmount: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#000000",
    textAlign: "right",
    minWidth: 120,
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginTop: 6,
    borderTop: "2 solid #000000",
    borderBottom: "4 double #000000",
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#000000",
    textTransform: "uppercase",
  },
  grandTotalAmount: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "right",
    minWidth: 120,
  },
  netProfitBox: {
    marginTop: 25,
    padding: 15,
    backgroundColor: "#ffffff",
    border: "2 solid #000000",
    textAlign: "center",
  },
  netProfitLabel: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#000000",
    textTransform: "uppercase",
  },
  netProfitAmount: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  netProfitNote: {
    fontSize: 8,
    color: "#666666",
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#666666",
    borderTop: "1 solid #e0e0e0",
    paddingTop: 8,
  },
  pageNumber: {
    position: "absolute",
    bottom: 15,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 8,
    color: "#666666",
  },
  note: {
    fontSize: 8,
    color: "#666666",
    marginTop: 15,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderLeft: "2 solid #cccccc",
    lineHeight: 1.5,
  },
  emptyState: {
    fontSize: 9,
    color: "#999999",
    padding: 15,
    textAlign: "center",
    fontStyle: "italic",
  },
  rightAlign: {
    textAlign: "right",
  },
  bold: {
    fontWeight: "bold",
  },
});

const formatCurrency = (amount: number): string => {
  const absAmount = Math.abs(amount);
  const numStr = Math.round(absAmount).toString();
  const len = numStr.length;

  if (len <= 3) {
    return amount < 0 ? `Rs. (${numStr})` : `Rs. ${numStr}`;
  }

  let formatted = numStr.slice(-3);
  let remaining = numStr.slice(0, -3);

  while (remaining.length > 0) {
    const chunkLen = remaining.length > 2 ? 2 : remaining.length;
    const chunk = remaining.slice(-chunkLen);
    remaining = remaining.slice(0, -chunkLen);
    formatted = chunk + "," + formatted;
  }

  return amount < 0 ? `Rs. (${formatted})` : `Rs. ${formatted}`;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    LABOUR: "Labour Charges",
    ELECTRICITY: "Electricity Expenses",
    TRANSPORT: "Transportation Charges",
    SALARY: "Salary & Wages",
    FESTIVAL: "Festival Expenses",
    OTHER: "Other Expenses",
  };
  return labels[category] || category;
};

const ProfitLossReportPDF: React.FC<ProfitLossReportPDFProps> = ({
  adminInfo,
  pnlSummary,
}) => {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.companyName}>
            {adminInfo.coldStorageName || "COLD STORAGE"}
          </Text>
          <Text style={styles.reportTitle}>Profit and Loss Statement</Text>
          <Text style={styles.reportSubtitle}>
            For the period ended {currentDate}
          </Text>
          {adminInfo.coldStorageAddress && (
            <Text style={styles.companyDetails}>
              {adminInfo.coldStorageAddress}
            </Text>
          )}
          {adminInfo.coldStorageContactNumber && (
            <Text style={styles.companyDetails}>
              Tel: {adminInfo.coldStorageContactNumber}
            </Text>
          )}
        </View>

        {/* INCOME SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Income</Text>
          </View>

          {pnlSummary.income.farmers.length === 0 ? (
            <Text style={styles.emptyState}>No income recorded</Text>
          ) : (
            <>
              {pnlSummary.income.farmers.map((farmer, index) => (
                <View key={farmer.farmerId} style={styles.farmerSection}>
                  <View style={styles.farmerHeader}>
                    <Text style={styles.farmerName}>
                      {index + 1}. {farmer.name}
                    </Text>
                  </View>
                  <Text style={styles.farmerDetails}>
                    ID: {farmer.farmerId} | {farmer.address}
                  </Text>

                  <View style={styles.detailRow}>
                    <Text>
                      Storage Rent ({farmer.stock.totalBags} bags @{" "}
                      {formatCurrency(farmer.stock.costPerBag)}/bag)
                    </Text>
                    <Text style={styles.rightAlign}>
                      {formatCurrency(farmer.rentIncome)}
                    </Text>
                  </View>

                  {farmer.shed.total > 0 && (
                    <View style={styles.detailRow}>
                      <Text>Shed Charges</Text>
                      <Text style={styles.rightAlign}>
                        {formatCurrency(farmer.shed.total)}
                      </Text>
                    </View>
                  )}

                  <View style={[styles.detailRow, { marginTop: 2 }]}>
                    <Text style={styles.bold}>Gross Income from Farmer</Text>
                    <Text style={[styles.rightAlign, styles.bold]}>
                      {formatCurrency(farmer.rentIncome + farmer.shed.total)}
                    </Text>
                  </View>

                  {farmer.credit.total > 0 && (
                    <>
                      <View style={[styles.detailRow, { marginTop: 4 }]}>
                        <Text>Less: Payments Made</Text>
                        <Text style={styles.rightAlign}>
                          {formatCurrency(farmer.credit.total)}
                        </Text>
                      </View>

                      <View style={styles.subtotalRow}>
                        <Text>Net Receivable from Farmer</Text>
                        <Text style={styles.rightAlign}>
                          {formatCurrency(
                            farmer.rentIncome +
                              farmer.shed.total -
                              farmer.credit.total
                          )}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              ))}

              <View style={styles.grandTotal}>
                <Text style={styles.grandTotalLabel}>Total Income</Text>
                <Text style={[styles.grandTotalAmount, { color: "#2e7d32" }]}>
                  {formatCurrency(pnlSummary.income.total)}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* EXPENSES SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Expenses</Text>
          </View>

          {pnlSummary.expenses.byCategory.length === 0 ? (
            <Text style={styles.emptyState}>No expenses recorded</Text>
          ) : (
            <>
              {pnlSummary.expenses.byCategory.map((category) => (
                <View key={category.category} style={styles.categorySection}>
                  <Text style={styles.categoryHeader}>
                    {getCategoryLabel(category.category)}
                  </Text>
                  {category.list.map((expense) => (
                    <View key={expense._id} style={styles.expenseRow}>
                      <Text>
                        {expense.remarks || "Expense"} -{" "}
                        {formatDate(expense.date)}
                      </Text>
                      <Text style={styles.rightAlign}>
                        {formatCurrency(expense.amount)}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.subtotalRow}>
                    <Text>Subtotal</Text>
                    <Text style={styles.rightAlign}>
                      {formatCurrency(category.total)}
                    </Text>
                  </View>
                </View>
              ))}

              <View style={styles.grandTotal}>
                <Text style={styles.grandTotalLabel}>Total Expenses</Text>
                <Text style={[styles.grandTotalAmount, { color: "#d32f2f" }]}>
                  {formatCurrency(pnlSummary.expenses.total)}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* SUMMARY SECTION */}
        <View style={styles.totalSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Income</Text>
            <Text style={[styles.totalAmount, { color: "#2e7d32" }]}>
              {formatCurrency(pnlSummary.income.total)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Expenses</Text>
            <Text style={[styles.totalAmount, { color: "#d32f2f" }]}>
              {formatCurrency(pnlSummary.expenses.total)}
            </Text>
          </View>
          <View
            style={[styles.totalRow, { borderBottom: "none", paddingTop: 8 }]}
          >
            <Text style={[styles.totalLabel, { fontSize: 12 }]}>
              Net {pnlSummary.netProfitOrLoss >= 0 ? "Profit" : "Loss"}
            </Text>
            <Text
              style={[
                styles.totalAmount,
                {
                  fontSize: 12,
                  color:
                    pnlSummary.netProfitOrLoss >= 0 ? "#2e7d32" : "#d32f2f",
                },
              ]}
            >
              {formatCurrency(pnlSummary.netProfitOrLoss)}
            </Text>
          </View>
        </View>

        {/* NET PROFIT/LOSS HIGHLIGHT */}
        <View style={styles.netProfitBox}>
          <Text style={styles.netProfitLabel}>
            Net {pnlSummary.netProfitOrLoss >= 0 ? "Profit" : "Loss"}
          </Text>
          <Text
            style={[
              styles.netProfitAmount,
              {
                color: pnlSummary.netProfitOrLoss >= 0 ? "#2e7d32" : "#d32f2f",
              },
            ]}
          >
            {formatCurrency(Math.abs(pnlSummary.netProfitOrLoss))}
          </Text>
          <Text style={styles.netProfitNote}>
            (Total Income minus Total Expenses)
          </Text>
        </View>

        {/* NOTES */}
        <View style={styles.note}>
          <Text style={styles.bold}>Notes:</Text>
          <Text>
            {"\n"}1. All amounts are stated in Indian Rupees (Rs.)
            {"\n"}2. This statement is prepared as per Indian accounting
            practices
            {"\n"}3. Net Receivable represents outstanding amount from farmers
            after adjusting payments
            {"\n"}4. This is a system-generated document
          </Text>
        </View>

        <Text style={styles.footer} fixed>
          This is a computer-generated report and does not require signature
        </Text>
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export default ProfitLossReportPDF;
