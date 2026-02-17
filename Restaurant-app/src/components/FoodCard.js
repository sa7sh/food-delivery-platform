import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext.js';
import CustomToggle from './CustomToggle.js';
import { formatCurrency } from '../utils/formatters.js';

const FoodCard = ({ food, onEdit, onToggleAvailability }) => {
  const { theme, isDarkMode } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Image
        source={{ uri: food.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.info}>
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
              {food.name}
            </Text>
            <Text style={[styles.category, { backgroundColor: isDarkMode ? '#2D2D2D' : '#F3F4F6', color: theme.subtext }]}>
              {food.category}
            </Text>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={() => onEdit(food)}>
            <Ionicons name="pencil" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.description, { color: theme.subtext }]} numberOfLines={2}>
          {food.description}
        </Text>

        <View style={styles.footer}>
          <Text style={[styles.price, { color: theme.primary }]}>{formatCurrency(food.price)}</Text>
          <View style={styles.availability}>
            <Text style={[styles.availabilityText, { color: theme.subtext }]}>
              {food.isAvailable ? 'Available' : 'Unavailable'}
            </Text>
            <CustomToggle
              value={food.isAvailable}
              onValueChange={(value) => onToggleAvailability(food._id, value)}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D2D2D',
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: '#6C757D',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  editButton: {
    padding: 4,
  },
  editIcon: {
    fontSize: 20,
  },
  description: {
    fontSize: 14,
    color: '#6C757D',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9139BA',
  },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  availabilityText: {
    fontSize: 12,
    color: '#6C757D',
  },
});

export default FoodCard;
