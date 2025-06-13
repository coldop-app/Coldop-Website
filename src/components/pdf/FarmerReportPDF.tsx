import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
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
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    width: '30%',
  },
  infoValue: {
    fontSize: 12,
    color: '#1f2937',
    width: '70%',
  },
  orderCard: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  voucherInfo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  voucherType: {
    fontSize: 10,
    color: '#ffffff',
    backgroundColor: '#2563eb',
    padding: '2 6',
    borderRadius: 3,
  },
  orderDate: {
    fontSize: 11,
    color: '#6b7280',
  },
  varietySection: {
    marginBottom: 10,
  },
  varietyTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  bagSizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: '#f3f4f6',
    marginBottom: 2,
    borderRadius: 3,
  },
  bagSizeLabel: {
    fontSize: 11,
    color: '#374151',
  },
  bagSizeValue: {
    fontSize: 11,
    color: '#1f2937',
    fontWeight: 'bold',
  },
  remarksSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  remarksLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 3,
  },
  remarksText: {
    fontSize: 10,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  summarySection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: 'bold',
  },
  summaryValue: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#6b7280',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
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
        <Text style={styles.footer}>
          Generated on {new Date().toLocaleDateString()} | {adminInfo.coldStorageDetails.coldStorageName}
        </Text>
      </Page>

      {/* Second Page for Delivery Orders if they exist */}
      {deliveryOrders.length > 0 && (
        <Page size="A4" style={styles.page}>
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

          <Text style={styles.footer}>
            Generated on {new Date().toLocaleDateString()} | {adminInfo.coldStorageDetails.coldStorageName}
          </Text>
        </Page>
      )}
    </Document>
  );
};

export default FarmerReportPDF;