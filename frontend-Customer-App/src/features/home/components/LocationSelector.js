import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme';

export default function LocationSelector({ address, onPress }) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📍</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Deliver to</Text>
          <Text style={styles.address} numberOfLines={1}>
            {address || 'Select location'}
          </Text>
        </View>
        <Text style={styles.chevron}>▼</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: colors.gray[500],
    fontWeight: '500',
    marginBottom: 2,
  },
  address: {
    fontSize: 14,
    color: colors.gray[900],
    fontWeight: '600',
  },
  chevron: {
    fontSize: 12,
    color: colors.gray[400],
    marginLeft: 8,
  },
});