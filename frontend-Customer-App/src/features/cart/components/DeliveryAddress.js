import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme';

export default function DeliveryAddress({ address, onChangePress }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Deliver to</Text>
        <TouchableOpacity onPress={onChangePress} activeOpacity={0.7}>
          <Text style={styles.changeText}>Change</Text>
        </TouchableOpacity>
      </View>

      {address ? (
        <View style={styles.addressContent}>
          <View style={styles.labelContainer}>
            <Text style={styles.label}>{address.label}</Text>
          </View>
          <Text style={styles.addressText}>
            {address.street}, {address.city}, {address.state} - {address.pincode}
          </Text>
          {address.landmark && (
            <Text style={styles.landmark}>Landmark: {address.landmark}</Text>
          )}
        </View>
      ) : (
        <View style={styles.noAddress}>
          <Text style={styles.noAddressText}>No delivery address selected</Text>
          <TouchableOpacity onPress={onChangePress} activeOpacity={0.7}>
            <Text style={styles.addAddressText}>Add Address</Text>
          </TouchableOpacity>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[600],
  },
  addressContent: {
    marginTop: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
    backgroundColor: colors.gray[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  addressText: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
    marginBottom: 4,
  },
  landmark: {
    fontSize: 13,
    color: colors.gray[500],
  },
  noAddress: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  noAddressText: {
    fontSize: 14,
    color: colors.gray[500],
    marginBottom: 12,
  },
  addAddressText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[600],
  },
});