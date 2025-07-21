import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Order, StoreAdmin } from '@/utils/types';
import coldopLogo from '/coldop-logo.png';

interface Farmer {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
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
    backgroundColor: '#FEFDF8', // Cream paper color
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 10,
  },

  // Header styles
  header: {
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    paddingBottom: 8,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    marginBottom: 8,
  },

  // Farmer info section
  farmerInfoSection: {
    marginBottom: 16,
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
    marginBottom: 4,
    fontSize: 9,
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

  // Ledger table styles
  ledgerContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  ledgerTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#000',
    textTransform: 'uppercase',
  },

  // Table styles
  table: {
    borderWidth: 1,
    borderColor: '#000',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E8E8E8',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    paddingVertical: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: '#666',
    paddingVertical: 3,
    minHeight: 20,
  },

  // Column styles - matching ledger layout
  colDate: {
    width: '12%',
    borderRightWidth: 0.5,
    borderRightColor: '#666',
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  colVoucher: {
    width: '12%',
    borderRightWidth: 0.5,
    borderRightColor: '#666',
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  colVariety: {
    width: '15%',
    borderRightWidth: 0.5,
    borderRightColor: '#666',
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  colLocation: {
    width: '12%',
    borderRightWidth: 0.5,
    borderRightColor: '#666',
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  colBagSize: {
    width: '10%',
    borderRightWidth: 0.5,
    borderRightColor: '#666',
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  colReceived: {
    width: '10%',
    borderRightWidth: 0.5,
    borderRightColor: '#666',
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  colDelivered: {
    width: '10%',
    borderRightWidth: 0.5,
    borderRightColor: '#666',
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  colBalance: {
    width: '10%',
    borderRightWidth: 0.5,
    borderRightColor: '#666',
    paddingHorizontal: 2,
    justifyContent: 'center',
  },
  colRemarks: {
    width: '9%',
    paddingHorizontal: 2,
    justifyContent: 'center',
  },

  // Cell text styles
  cellHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  cellText: {
    fontSize: 8,
    textAlign: 'center',
    color: '#000',
  },
  cellTextLeft: {
    fontSize: 8,
    textAlign: 'left',
    color: '#000',
  },

  // Summary section
  summaryContainer: {
    marginTop: 16,
    padding: 12,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#F5F5F5',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
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
    paddingVertical: 4,
  },
  summaryLabel: {
    width: '70%',
    paddingHorizontal: 6,
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000',
  },
  summaryValue: {
    width: '30%',
    paddingHorizontal: 6,
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'right',
    borderLeftWidth: 0.5,
    borderLeftColor: '#666',
    color: '#000',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#000',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
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
    width: 24,
    height: 24,
    marginBottom: 4,
    opacity: 0.85,
  },
  poweredBy: {
    fontSize: 7,
    color: '#555',
    marginTop: 2,
    fontStyle: 'italic',
  },

  // Page numbers and stamps
  pageNumber: {
    position: 'absolute',
    bottom: 8,
    right: 20,
    fontSize: 8,
    color: '#666',
  },

  // Running balance styles
  totalRow: {
    backgroundColor: '#E0E0E0',
    fontWeight: 'bold',
  },
  balanceText: {
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
});

interface LedgerEntry {
  date: string | undefined;
  voucher: number;
  type: 'RECEIPT' | 'DELIVERY';
  variety: string;
  location: string;
  bagSize: string;
  received: number | '-';
  delivered: number | '-';
  balance: number;
  remarks: string;
}

const formatDate = (date: string | Date | undefined): string => {
  if (!date) return '-';
  try {
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

  const receiptOrders = orders.filter(order => order.voucher.type === 'RECEIPT');
  const deliveryOrders = orders.filter(order => order.voucher.type === 'DELIVERY');

  // Create combined ledger entries
  const createLedgerEntries = () => {
    const entries: LedgerEntry[] = [];
    let runningBalance = 0;

    // Add receipt entries
    receiptOrders.forEach(order => {
      order.orderDetails.forEach(detail => {
        detail.bagSizes.forEach(bag => {
          const quantity = bag.quantity?.initialQuantity || 0;
          runningBalance += quantity;
          entries.push({
            date: new Date().toISOString(), // Temporarily using current date for testing
            voucher: order.voucher.voucherNumber,
            type: 'RECEIPT',
            variety: detail.variety,
            location: detail.location || '-',
            bagSize: bag.size,
            received: quantity,
            delivered: '-',
            balance: runningBalance,
            remarks: order.remarks || '-'
          });
        });
      });
    });

    // Add delivery entries
    deliveryOrders.forEach(order => {
      order.orderDetails.forEach(detail => {
        detail.bagSizes.forEach(bag => {
          const quantity = bag.quantityRemoved || 0;
          runningBalance -= quantity;
          entries.push({
            date: new Date().toISOString(), // Temporarily using current date for testing
            voucher: order.voucher.voucherNumber,
            type: 'DELIVERY',
            variety: detail.variety,
            location: detail.location || '-',
            bagSize: bag.size,
            received: '-',
            delivered: quantity,
            balance: runningBalance,
            remarks: order.remarks || '-'
          });
        });
      });
    });

    // Sort by date
    return entries.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateA - dateB;
    });
  };

  const ledgerEntries = createLedgerEntries();
  const totalReceived = ledgerEntries.reduce((sum, entry) => sum + (typeof entry.received === 'number' ? entry.received : 0), 0);
  const totalDelivered = ledgerEntries.reduce((sum, entry) => sum + (typeof entry.delivered === 'number' ? entry.delivered : 0), 0);
  const finalBalance = totalReceived - totalDelivered;

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
              <Text style={styles.infoValue}>{farmer._id.slice(-6).toUpperCase()}</Text>
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

        {/* Ledger Table */}
        <View style={styles.ledgerContainer}>
          <Text style={styles.ledgerTitle}>Storage Details</Text>

          <View style={styles.table}>
            {/* Table Header */}
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
              <View style={styles.colBagSize}>
                <Text style={styles.cellHeaderText}>BAG SIZE</Text>
              </View>
              <View style={styles.colReceived}>
                <Text style={styles.cellHeaderText}>RECEIVED</Text>
              </View>
              <View style={styles.colDelivered}>
                <Text style={styles.cellHeaderText}>DELIVERED</Text>
              </View>
              <View style={styles.colBalance}>
                <Text style={styles.cellHeaderText}>BALANCE</Text>
              </View>
              <View style={styles.colRemarks}>
                <Text style={styles.cellHeaderText}>REMARKS</Text>
              </View>
            </View>

            {/* Table Rows */}
            {ledgerEntries.map((entry, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.colDate}>
                  <Text style={styles.cellText}>
                    {formatDate(entry.date)}
                  </Text>
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
                <View style={styles.colBagSize}>
                  <Text style={styles.cellText}>{entry.bagSize}</Text>
                </View>
                <View style={styles.colReceived}>
                  <Text style={styles.cellText}>{entry.received}</Text>
                </View>
                <View style={styles.colDelivered}>
                  <Text style={styles.cellText}>{entry.delivered}</Text>
                </View>
                <View style={styles.colBalance}>
                  <Text style={styles.balanceText}>{entry.balance}</Text>
                </View>
                <View style={styles.colRemarks}>
                  <Text style={styles.cellText}>
                    {entry.remarks.length > 10 ? entry.remarks.substring(0, 10) + '...' : entry.remarks}
                  </Text>
                </View>
              </View>
            ))}

            {/* Total Row */}
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
              <View style={styles.colBagSize}>
                <Text style={styles.balanceText}>-</Text>
              </View>
              <View style={styles.colReceived}>
                <Text style={styles.balanceText}>{totalReceived}</Text>
              </View>
              <View style={styles.colDelivered}>
                <Text style={styles.balanceText}>{totalDelivered}</Text>
              </View>
              <View style={styles.colBalance}>
                <Text style={styles.balanceText}>{finalBalance}</Text>
              </View>
              <View style={styles.colRemarks}>
                <Text style={styles.balanceText}>-</Text>
              </View>
            </View>
          </View>
        </View>

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
              <Text style={styles.summaryValue}>{totalReceived}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Bags Delivered:</Text>
              <Text style={styles.summaryValue}>{totalDelivered}</Text>
            </View>
            <View style={[styles.summaryRow, { backgroundColor: '#D0D0D0' }]}>
              <Text style={styles.summaryLabel}>CLOSING BALANCE:</Text>
              <Text style={styles.summaryValue}>{finalBalance}</Text>
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