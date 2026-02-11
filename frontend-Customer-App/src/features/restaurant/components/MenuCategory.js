import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../../theme';
import FoodItem from './FoodItem';

export default function MenuCategory({ category, onAddPress }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{category.name}</Text>
        <Text style={styles.count}>({category.items.length})</Text>
      </View>
      {category.items.map((item) => (
        <FoodItem
          key={item.id}
          item={item}
          onAddPress={onAddPress}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.gray[50],
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  count: {
    fontSize: 16,
    color: colors.gray[500],
    marginLeft: 8,
  },
});