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
    flexDirection: 'column',
    backgroundColor: '#FEFDF8',
    padding: 16,
    fontFamily: 'Helvetica',
    fontSize: 8,
  },

  header: {
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 6,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 3,
  },
  reportTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 6,
  },

  farmerInfoSection: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  farmerInfoLeft: {
    width: '48%',
  },
  farmerInfoRight: {
    width: '48%',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
    fontSize: 8,
  },
  infoLabel: {
    width: '40%',
    fontWeight: 'bold',
    color: '#000',
  },
  infoValue: {
    width: '60%',
    color: '#000',
  },

  ledgerContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  ledgerTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
    color: '#000',
    textTransform: 'uppercase',
  },

  table: {
    borderWidth: 1,
    borderColor: '#000',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E8E8E8',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 3,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#666',
    paddingVertical: 2,
    minHeight: 16,
  },

  // Column styles - updated for new layout
  colDate: {
    width: '8%',
    borderRightWidth: 0.5,
    borderRightColor: '#666',
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  colVoucher: {
    width: '8%',
    borderRightWidth: 0.5,
    borderRightColor: '#666',
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  colVariety: {
    width: '10%',
    borderRightWidth: 0.5,
    borderRightColor: '#666',
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  colLocation: {
    width: '8%',
    borderRightWidth: 0.5,
    borderRightColor: '#666',
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  colBagSize: {
    width: '6%',
    borderRightWidth: 0.5,
    borderRightColor: '#666',
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  colTotal: {
    width: '8%',
    borderRightWidth: 0.5,
    borderRightColor: '#666',
    paddingHorizontal: 2,
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  colGrandTotal: {
    width: '8%',
    borderRightWidth: 0.5,
    borderRightColor: '#666',
    paddingHorizontal: 2,
    justifyContent: 'center',
    backgroundColor: '#E8E8E8',
  },
  colMarka: {
    width: '8%',
    borderRightWidth: 0.5,
    borderRightColor: '#666',
    paddingHorizontal: 2,
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },

  cellHeaderText: {
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  cellText: {
    fontSize: 7,
    textAlign: 'center',
    color: '#000',
  },
  cellTextLeft: {
    fontSize: 7,
    textAlign: 'left',
    color: '#000',
  },

  totalRow: {
    backgroundColor: '#E0E0E0',
    fontWeight: 'bold',
  },
  balanceText: {
    fontSize: 7,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },

  summaryContainer: {
    marginTop: 12,
    padding: 8,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#F5F5F5',
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
    textTransform: 'uppercase',
    color: '#000',
  },
  summaryTable: {
    borderWidth: 1,
    borderColor: '#000',
  },
  summaryRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#666',
    paddingVertical: 3,
  },
  summaryLabel: {
    width: '70%',
    paddingHorizontal: 4,
    fontSize: 8,
    fontWeight: 'bold',
    color: '#000',
  },
  summaryValue: {
    width: '30%',
    paddingHorizontal: 4,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'right',
    borderLeftWidth: 0.5,
    borderLeftColor: '#666',
    color: '#000',
  },

  footer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: '#000',
  },
  footerLeft: {
    flex: 1,
  },
  footerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  footerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  logo: {
    width: 20,
    height: 20,
    marginBottom: 3,
    opacity: 0.85,
  },
  poweredBy: {
    fontSize: 6,
    color: '#555',
    marginTop: 2,
    fontStyle: 'italic',
  },

  pageNumber: {
    position: 'absolute',
    bottom: 6,
    right: 16,
    fontSize: 7,
    color: '#666',
  },
});

interface LedgerEntry {
  date: string | undefined;
  voucher: number;
  type: 'RECEIPT' | 'DELIVERY';
  variety: string;
  location: string;
  quantities: { [bagSize: string]: number }; // Map of bag size to quantity
  total: number;
  grandTotal: number;
}

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

const FarmerReportPDF: React.FC<FarmerReportPDFProps> = ({ farmer, adminInfo, orders }) => {
  if (!orders || orders.length === 0) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.companyName}>{adminInfo.coldStorageDetails.coldStorageName.toUpperCase()}</Text>
            <Text style={styles.reportTitle}>NO TRANSACTIONS FOUND</Text>
          </View>
        </Page>
      </Document>
    );
  }

  const bagSizes = adminInfo.preferences?.bagSizes || [];
  const receiptOrders = orders.filter(order => order.voucher.type === 'RECEIPT');
  const deliveryOrders = orders.filter(order => order.voucher.type === 'DELIVERY');

  // Create receipt ledger entries with totals
  const createReceiptEntries = () => {
    const entries: LedgerEntry[] = [];

    // First create all entries
    receiptOrders.forEach(order => {
      // Initialize quantities map for all bag sizes
      const quantities: { [bagSize: string]: number } = {};
      bagSizes.forEach(size => {
        quantities[size] = 0;
      });

      // Collect all quantities for this voucher
      let voucherTotal = 0;
      order.orderDetails.forEach(detail => {
        detail.bagSizes.forEach(bag => {
          const quantity = bag.quantity?.initialQuantity || 0;
          quantities[bag.size] = (quantities[bag.size] || 0) + quantity;
          voucherTotal += quantity;
        });
      });

      // Get the first variety and location for the voucher
      const firstDetail = order.orderDetails[0];

      entries.push({
        date: getOrderDate(order),
        voucher: order.voucher.voucherNumber,
        type: 'RECEIPT',
        variety: firstDetail?.variety || '-',
        location: firstDetail?.location || '-',
        quantities,
        total: voucherTotal,
        grandTotal: 0 // Will be calculated after sorting
      });
    });

    // Sort entries by voucher number
    entries.sort((a, b) => a.voucher - b.voucher);

    // Calculate running grand total after sorting
    let total = 0;
    entries.forEach(entry => {
      total += entry.total;
      entry.grandTotal = total;
    });

    return entries;
  };

  // Create delivery ledger entries with totals
  const createDeliveryEntries = () => {
    const entries: LedgerEntry[] = [];

    // First create all entries
    deliveryOrders.forEach(order => {
      // Initialize quantities map for all bag sizes
      const quantities: { [bagSize: string]: number } = {};
      bagSizes.forEach(size => {
        quantities[size] = 0;
      });

      // Collect all quantities for this voucher
      let voucherTotal = 0;
      order.orderDetails.forEach(detail => {
        detail.bagSizes.forEach(bag => {
          const quantity = bag.quantityRemoved || 0;
          quantities[bag.size] = (quantities[bag.size] || 0) + quantity;
          voucherTotal += quantity;
        });
      });

      // Get the first variety and location for the voucher
      const firstDetail = order.orderDetails[0];

      entries.push({
        date: getOrderDate(order),
        voucher: order.voucher.voucherNumber,
        type: 'DELIVERY',
        variety: firstDetail?.variety || '-',
        location: firstDetail?.location || '-',
        quantities,
        total: voucherTotal,
        grandTotal: 0 // Will be calculated after sorting
      });
    });

    // Sort entries by voucher number
    entries.sort((a, b) => a.voucher - b.voucher);

    // Calculate running grand total after sorting
    let total = 0;
    entries.forEach(entry => {
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
    bagSizes.forEach(size => {
      totals[size] = entries.reduce((sum, entry) => sum + (entry.quantities[size] || 0), 0);
    });
    return totals;
  };

  const receiptTotals = calculateBagSizeTotals(receiptEntries);
  const deliveryTotals = calculateBagSizeTotals(deliveryEntries);

  const renderTable = (entries: LedgerEntry[], title: string, totals: { [key: string]: number }, isDeliveryTable: boolean = false, receiptTotals?: { [key: string]: number }) => {
    const initialGrandTotal = isDeliveryTable && receiptTotals
      ? Object.values(receiptTotals).reduce((sum, qty) => sum + qty, 0)
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
              <Text style={styles.cellHeaderText}>VOUCHER</Text>
            </View>
            <View style={styles.colVariety}>
              <Text style={styles.cellHeaderText}>VARIETY</Text>
            </View>
            <View style={styles.colLocation}>
              <Text style={styles.cellHeaderText}>LOCATION</Text>
            </View>
            {bagSizes.map(size => (
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
            {/* Show Marka column only for receipt table */}
            {!isDeliveryTable && (
              <View style={styles.colMarka}>
                <Text style={styles.cellHeaderText}>MARKA</Text>
              </View>
            )}
          </View>

          {/* For delivery table, show receipt totals as first row */}
          {isDeliveryTable && receiptTotals && (
            <View style={[styles.tableRow, { backgroundColor: '#F5F5F5' }]}>
              <View style={styles.colDate}>
                <Text style={styles.balanceText}>OPENING</Text>
              </View>
              <View style={styles.colVoucher}>
                <Text style={styles.balanceText}>BALANCE</Text>
              </View>
              <View style={styles.colVariety}>
                <Text style={styles.balanceText}>-</Text>
              </View>
              <View style={styles.colLocation}>
                <Text style={styles.balanceText}>-</Text>
              </View>
              {bagSizes.map(size => (
                <View key={size} style={styles.colBagSize}>
                  <Text style={styles.balanceText}>{receiptTotals[size]}</Text>
                </View>
              ))}
              <View style={styles.colTotal}>
                <Text style={styles.balanceText}>{initialGrandTotal}</Text>
              </View>
              <View style={styles.colGrandTotal}>
                <Text style={styles.balanceText}>{initialGrandTotal}</Text>
              </View>
            </View>
          )}

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
              <View style={styles.colLocation}>
                <Text style={styles.cellText}>{entry.location}</Text>
              </View>
              {bagSizes.map(size => (
                <View key={size} style={styles.colBagSize}>
                  <Text style={styles.cellText}>
                    {entry.quantities[size] || '-'}
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
              {/* Show Marka column only for receipt table */}
              {!isDeliveryTable && (
                <View style={styles.colMarka}>
                  <Text style={styles.cellText}>{`${entry.voucher}/${entry.total}`}</Text>
                </View>
              )}
            </View>
          ))}

          {/* Show total row only for receipt table */}
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
              <View style={styles.colLocation}>
                <Text style={styles.balanceText}>-</Text>
              </View>
              {bagSizes.map(size => (
                <View key={size} style={styles.colBagSize}>
                  <Text style={styles.balanceText}>{totals[size]}</Text>
                </View>
              ))}
              <View style={styles.colTotal}>
                <Text style={styles.balanceText}>
                  {entries[entries.length - 1]?.grandTotal || 0}
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
          <Text style={styles.reportTitle}>FARMER ACCOUNT LEDGER</Text>
        </View>

        {/* Farmer Information */}
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

        {/* Receipt Table */}
        {renderTable(receiptEntries, 'Receipt Details', receiptTotals)}

        {/* Delivery Table */}
        {renderTable(deliveryEntries, 'Delivery Details', deliveryTotals, true, receiptTotals)}

        {/* Summary Box */}
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
              <Text style={styles.summaryValue}>{receiptEntries[receiptEntries.length - 1]?.grandTotal || 0}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Bags Delivered:</Text>
              <Text style={styles.summaryValue}>{deliveryEntries[deliveryEntries.length - 1]?.grandTotal || 0}</Text>
            </View>
            <View style={[styles.summaryRow, { backgroundColor: '#D0D0D0' }]}>
              <Text style={styles.summaryLabel}>CLOSING BALANCE:</Text>
              <Text style={styles.summaryValue}>
                {(receiptEntries[receiptEntries.length - 1]?.grandTotal || 0) -
                 (deliveryEntries[deliveryEntries.length - 1]?.grandTotal || 0)}
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
              Date: {formatDate(new Date())}
            </Text>
          </View>
        </View>

        <Text style={styles.pageNumber}>Page 1</Text>
      </Page>
    </Document>
  );
};

export default FarmerReportPDF;