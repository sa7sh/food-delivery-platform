import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../../theme';

export default function SearchBar({
  placeholder = 'Search for restaurants...',
  onPress,
}) {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {/* Search Icon */}
        <View style={styles.iconWrapper}>
          <Text style={styles.iconText}>Search</Text>
        </View>

        {/* Placeholder */}
        <Text style={styles.placeholder} numberOfLines={1}>
          {placeholder}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ----------------------------------
   STYLES
----------------------------------- */
const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
    backgroundColor: colors.white,
  },

  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: colors.gray[50],
    borderWidth: 1,
    borderColor: colors.gray[200],

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 4,
  },

  iconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  iconText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.gray[400],
  },

  placeholder: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.gray[400],
  },
});
