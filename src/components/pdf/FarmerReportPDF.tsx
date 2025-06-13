import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Order, StoreAdmin } from '@/utils/types';

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
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
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
  orderDate: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: 'normal',
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

const FarmerReportPDF: React.FC<FarmerReportPDFProps> = ({ farmer, adminInfo, orders }) => {
  const receiptOrders = orders.filter(order => order.voucher.type === 'RECEIPT');
  const deliveryOrders = orders.filter(order => order.voucher.type === 'DELIVERY');

    const calculateTotalBags = (orders: Order[]) => {
    return orders.reduce((total, order) => {
      return total + order.orderDetails.reduce((orderTotal, detail) => {
        if (order.voucher.type === 'RECEIPT') {
          return orderTotal + detail.bagSizes.reduce((bagTotal, bag) =>
            bagTotal + (bag.quantity?.initialQuantity || 0), 0
          );
        } else {
          return orderTotal + detail.bagSizes.reduce((bagTotal, bag) =>
            bagTotal + (bag.quantityRemoved || 0), 0
          );
        }
      }, 0);
    }, 0);
  };

  const totalReceiptBags = calculateTotalBags(receiptOrders);
  const totalDeliveryBags = calculateTotalBags(deliveryOrders);
  const netBags = totalReceiptBags - totalDeliveryBags;

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
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Farmer Report</Text>
          <Text style={styles.subtitle}>{adminInfo.coldStorageDetails.coldStorageName}</Text>
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
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Admin:</Text>
            <Text style={styles.infoValue}>{adminInfo.name}</Text>
          </View>
        </View>

        {/* Farmer Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farmer Information</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{farmer.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Address:</Text>
            <Text style={styles.infoValue}>{farmer.address}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mobile:</Text>
            <Text style={styles.infoValue}>{farmer.mobileNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since:</Text>
            <Text style={styles.infoValue}>{new Date(farmer.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Receipt Orders:</Text>
            <Text style={styles.summaryValue}>{receiptOrders.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Delivery Orders:</Text>
            <Text style={styles.summaryValue}>{deliveryOrders.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Bags Received:</Text>
            <Text style={styles.summaryValue}>{totalReceiptBags}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Bags Delivered:</Text>
            <Text style={styles.summaryValue}>{totalDeliveryBags}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Net Bags in Storage:</Text>
            <Text style={styles.summaryValue}>{netBags}</Text>
          </View>
        </View>

        {/* Receipt Orders */}
        {receiptOrders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Receipt Orders ({receiptOrders.length})</Text>
            {receiptOrders.map((order) => (
              <View key={order._id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.voucherInfo}>Voucher #{order.voucher.voucherNumber}</Text>
                  <Text style={styles.voucherType}>{order.voucher.type}</Text>
                  <Text style={styles.orderDate}>{order.dateOfSubmission}</Text>
                </View>

                {order.orderDetails.map((detail, index) => (
                  <View key={index} style={styles.varietySection}>
                    <Text style={styles.varietyTitle}>{detail.variety} - {detail.location}</Text>
                    {detail.bagSizes.map((bag, bagIndex) => (
                      <View key={bagIndex} style={styles.bagSizeRow}>
                        <Text style={styles.bagSizeLabel}>{bag.size}</Text>
                        <Text style={styles.bagSizeValue}>
                          Initial: {bag.quantity?.initialQuantity || 0} | Current: {bag.quantity?.currentQuantity || 0}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}

                {order.remarks && (
                  <View style={styles.remarksSection}>
                    <Text style={styles.remarksLabel}>Remarks:</Text>
                    <Text style={styles.remarksText}>{order.remarks}</Text>
                  </View>
                )}
              </View>
            ))}
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

      {/* Second Page for Delivery Orders if they exist */}
      {deliveryOrders.length > 0 && (
        <Page size="A4" style={styles.page}>
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <Image
              style={styles.logo}
              src="/coldop-logo.png"
            />
            <Text style={styles.brandTitle}>COLDOP</Text>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Delivery Orders</Text>
            <Text style={styles.subtitle}>{farmer.name}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Orders ({deliveryOrders.length})</Text>
            {deliveryOrders.map((order) => (
              <View key={order._id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.voucherInfo}>Voucher #{order.voucher.voucherNumber}</Text>
                  <Text style={styles.voucherType}>{order.voucher.type}</Text>
                  <Text style={styles.orderDate}>{order.dateOfExtraction}</Text>
                </View>

                {order.orderDetails.map((detail, index) => (
                  <View key={index} style={styles.varietySection}>
                    <Text style={styles.varietyTitle}>{detail.variety}</Text>
                    {detail.bagSizes.map((bag, bagIndex) => (
                      <View key={bagIndex} style={styles.bagSizeRow}>
                        <Text style={styles.bagSizeLabel}>{bag.size}</Text>
                        <Text style={styles.bagSizeValue}>
                          Quantity Removed: {bag.quantityRemoved}
                        </Text>
                      </View>
                    ))}
                    {detail.incomingOrder && (
                      <View style={styles.remarksSection}>
                        <Text style={styles.remarksLabel}>From Receipt Voucher:</Text>
                        <Text style={styles.remarksText}>
                          #{detail.incomingOrder.voucher.voucherNumber} - {detail.incomingOrder.location}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}

                {order.remarks && (
                  <View style={styles.remarksSection}>
                    <Text style={styles.remarksLabel}>Remarks:</Text>
                    <Text style={styles.remarksText}>{order.remarks}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Generated on {new Date().toLocaleDateString()}
            </Text>
            <Text style={styles.footerBrand}>
              Powered by COLDOP
            </Text>
          </View>
        </Page>
      )}
    </Document>
  );
};

export default FarmerReportPDF;