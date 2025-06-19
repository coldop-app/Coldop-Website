import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Order, StoreAdmin } from '@/utils/types';

interface OrderVoucherPDFProps {
  order: Order;
  adminInfo: StoreAdmin;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 24,
    fontFamily: 'Helvetica',
    lineHeight: 1.6,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#22c55e',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#22c55e',
    letterSpacing: -0.5,
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: 'normal',
  },
  section: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 6,
    letterSpacing: -0.2,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    width: '35%',
    paddingRight: 8,
  },
  infoValue: {
    fontSize: 11,
    color: '#1F2937',
    width: '65%',
    lineHeight: 1.4,
  },
  orderCard: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  voucherInfo: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
    letterSpacing: -0.1,
  },
  voucherType: {
    fontSize: 9,
    color: '#FFFFFF',
    backgroundColor: '#22c55e',
    padding: '3 8',
    borderRadius: 4,
    fontWeight: 'bold',
  },
  varietySection: {
    marginBottom: 12,
  },
  varietyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  bagSizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 10,
    backgroundColor: '#F3F4F6',
    marginBottom: 3,
    borderRadius: 4,
    alignItems: 'center',
  },
  bagSizeLabel: {
    fontSize: 10,
    color: '#374151',
    fontWeight: 'normal',
  },
  bagSizeValue: {
    fontSize: 10,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  remarksSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  remarksLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 4,
  },
  remarksText: {
    fontSize: 9,
    color: '#6B7280',
    fontStyle: 'italic',
    lineHeight: 1.3,
  },
  summarySection: {
    marginTop: 24,
    padding: 20,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#22c55e',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22c55e',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#166534',
    fontWeight: 'bold',
  },
  summaryValue: {
    fontSize: 11,
    color: '#166534',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 9,
    color: '#6B7280',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 9,
    color: '#6B7280',
  },
  footerBrand: {
    fontSize: 9,
    color: '#22c55e',
    fontWeight: 'bold',
  },
});

const OrderVoucherPDF: React.FC<OrderVoucherPDFProps> = ({ order, adminInfo }) => {
  const isReceipt = order.voucher.type === 'RECEIPT';

  const calculateTotalBags = () => {
    return order.orderDetails.reduce((total, detail) => {
      if (isReceipt) {
        return total + detail.bagSizes.reduce((sum, bag) =>
          sum + (bag.quantity?.initialQuantity || 0), 0
        );
      } else {
        return total + detail.bagSizes.reduce((sum, bag) =>
          sum + (bag.quantityRemoved || 0), 0
        );
      }
    }, 0);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <Image
            style={styles.logo}
            src="/coldop-logo.png"
          />
          <Text style={styles.brandTitle}>COLDOP</Text>
          {adminInfo.imageUrl && (
            <Image
              style={[styles.logo, { marginLeft: 'auto' }]}
              src={adminInfo.imageUrl}
            />
          )}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{isReceipt ? 'Receipt Voucher' : 'Delivery Voucher'}</Text>
          <Text style={styles.subtitle}>#{order.voucher.voucherNumber}</Text>
        </View>

        {/* Cold Storage Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cold Storage Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{adminInfo.coldStorageDetails.coldStorageName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>{adminInfo.coldStorageDetails.coldStorageAddress}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contact:</Text>
            <Text style={styles.infoValue}>{adminInfo.coldStorageDetails.coldStorageContactNumber}</Text>
          </View>
        </View>

        {/* Farmer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farmer Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{order.farmerId.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Farmer ID:</Text>
            <Text style={styles.infoValue}>{order.farmerId.farmerId}</Text>
          </View>
        </View>

        {/* Order Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          {order.orderDetails.map((detail, index) => (
            <View key={index} style={styles.varietySection}>
              <Text style={styles.varietyTitle}>
                {detail.variety} - {isReceipt ? detail.location : detail.incomingOrder?.location}
              </Text>
              {detail.bagSizes.map((bag, bagIndex) => (
                <View key={bagIndex} style={styles.bagSizeRow}>
                  <Text style={styles.bagSizeLabel}>{bag.size}</Text>
                  {isReceipt ? (
                    <Text style={styles.bagSizeValue}>
                      Initial: {bag.quantity?.initialQuantity || 0} | Current: {bag.quantity?.currentQuantity || 0}
                    </Text>
                  ) : (
                    <Text style={styles.bagSizeValue}>
                      Quantity Removed: {bag.quantityRemoved || 0}
                    </Text>
                  )}
                </View>
              ))}
              {!isReceipt && detail.incomingOrder && (
                <View style={styles.remarksSection}>
                  <Text style={styles.remarksLabel}>From Receipt Voucher:</Text>
                  <Text style={styles.remarksText}>
                    #{detail.incomingOrder.voucher.voucherNumber} - {detail.incomingOrder.location}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total {isReceipt ? 'Bags Received' : 'Bags Delivered'}:</Text>
            <Text style={styles.summaryValue}>{calculateTotalBags()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Stock After Operation:</Text>
            <Text style={styles.summaryValue}>{order.currentStockAtThatTime}</Text>
          </View>
        </View>

        {/* Remarks if any */}
        {order.remarks && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Remarks</Text>
            <Text style={styles.remarksText}>{order.remarks}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated on {new Date().toLocaleDateString()}
          </Text>
          <Text style={styles.footerBrand}>
            Powered by COLDOP
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default OrderVoucherPDF;