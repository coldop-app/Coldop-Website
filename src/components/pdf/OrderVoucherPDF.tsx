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
    padding: 8,
    fontFamily: 'Courier',
    fontSize: 8,
    width: '144pt', // 2 inches = 144 points
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 35,
    height: 35,
    objectFit: 'contain',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
  },
  storeInfo: {
    fontSize: 6,
    textAlign: 'center',
    marginBottom: 1,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'dashed',
    marginVertical: 4,
  },
  voucherTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  voucherNumber: {
    fontSize: 8,
    textAlign: 'center',
    marginBottom: 4,
  },
  section: {
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 1,
    fontSize: 7,
    flexWrap: 'wrap',
  },
  label: {
    width: '35%',
  },
  value: {
    width: '65%',
  },
  orderItem: {
    marginBottom: 2,
  },
  varietyTitle: {
    fontSize: 7,
    fontWeight: 'bold',
  },
  bagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    marginLeft: 4,
  },
  summary: {
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    fontWeight: 'bold',
  },
  remarks: {
    fontSize: 6,
    fontStyle: 'italic',
    marginTop: 4,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 6,
    textAlign: 'center',
    marginBottom: 2,
  },
  footerLogo: {
    width: 20,
    height: 20,
    objectFit: 'contain',
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
      <Page size={[144, 800]} style={styles.page}>
        {/* Header with Cold Storage Logo */}
        <View style={styles.header}>
          {adminInfo.imageUrl && (
            <Image style={styles.logo} src={adminInfo.imageUrl} />
          )}
          <Text style={styles.storeName}>
            {adminInfo.coldStorageDetails.coldStorageName}
          </Text>
          <Text style={styles.storeInfo}>
            {adminInfo.coldStorageDetails.coldStorageAddress}
          </Text>
          <Text style={styles.storeInfo}>
            Ph: {adminInfo.coldStorageDetails.coldStorageContactNumber}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Voucher Info */}
        <Text style={styles.voucherTitle}>
          {isReceipt ? 'RECEIPT VOUCHER' : 'DELIVERY VOUCHER'}
        </Text>
        <Text style={styles.voucherNumber}>#{order.voucher.voucherNumber}</Text>

        <View style={styles.divider} />

        {/* Farmer Info */}
        <View style={styles.section}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Farmer:</Text>
            <Text style={styles.value}>{order.farmerId.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>ID:</Text>
            <Text style={styles.value}>{order.farmerId.farmerId}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Order Details */}
        <View style={styles.section}>
          {order.orderDetails.map((detail, index) => (
            <View key={index} style={styles.orderItem}>
              <Text style={styles.varietyTitle}>
                {detail.variety}
                {'\n'}
                {isReceipt ? detail.location : detail.incomingOrder?.location}
              </Text>
              {detail.bagSizes.map((bag, bagIndex) => (
                <View key={bagIndex} style={styles.bagRow}>
                  <Text>{bag.size}</Text>
                  {isReceipt ? (
                    <Text>
                      In:{bag.quantity?.initialQuantity || 0}
                      Cur:{bag.quantity?.currentQuantity || 0}
                    </Text>
                  ) : (
                    <Text>Qty:{bag.quantityRemoved || 0}</Text>
                  )}
                </View>
              ))}
              {!isReceipt && detail.incomingOrder && (
                <Text style={styles.remarks}>
                  From #{detail.incomingOrder.voucher.voucherNumber}
                </Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text>Total {isReceipt ? 'In' : 'Out'}:</Text>
            <Text>{calculateTotalBags()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text>Stock:</Text>
            <Text>{order.currentStockAtThatTime}</Text>
          </View>
        </View>

        {order.remarks && (
          <>
            <View style={styles.divider} />
            <Text style={styles.remarks}>{order.remarks}</Text>
          </>
        )}

        <View style={styles.divider} />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {new Date().toLocaleDateString()}
          </Text>
          <Image
            style={styles.footerLogo}
            src="/coldop-logo.png"
          />
        </View>
      </Page>
    </Document>
  );
};

export default OrderVoucherPDF;