import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../theme';

export default function BillDetails({ subtotal, deliveryFee, taxes, total }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bill Details</Text>
      
      <View style={styles.row}>
        <Text style={styles.label}>Item Total</Text>
        <Text style={styles.value}>₹{subtotal.toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Delivery Fee</Text>
        <Text style={styles.value}>₹{deliveryFee.toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Taxes & Charges</Text>
        <Text style={styles.value}>₹{taxes.toFixed(2)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.totalLabel}>To Pay</Text>
        <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: colors.gray[600],
  },
  value: {
    fontSize: 14,
    color: colors.gray[900],
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
});