import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme';

export default function FoodItem({ item, onAddPress }) {
  const {
    name,
    description,
    price,
    image,
    isVeg,
    rating,
    ratingCount,
  } = item;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Veg/Non-Veg Indicator */}
        <View style={[styles.vegBadge, !isVeg && styles.nonVegBadge]}>
          <View style={[styles.vegDot, !isVeg && styles.nonVegDot]} />
        </View>

        {/* Item Info */}
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          {description && (
            <Text style={styles.description} numberOfLines={2}>
              {description}
            </Text>
          )}
          <View style={styles.footer}>
            <Text style={styles.price}>₹{price}</Text>
            {rating && (
              <View style={styles.rating}>
                <Text style={styles.star}>⭐</Text>
                <Text style={styles.ratingText}>
                  {rating} ({ratingCount})
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Image and Add Button */}
        <View style={styles.imageContainer}>
          {image ? (
            <Image
              source={{ uri: image }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>🍽️</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => onAddPress(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>ADD</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  content: {
    flexDirection: 'row',
  },
  vegBadge: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#10b981',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  nonVegBadge: {
    borderColor: '#dc2626',
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  nonVegDot: {
    backgroundColor: '#dc2626',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: colors.gray[500],
    marginBottom: 8,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginRight: 12,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 12,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.gray[100],
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 40,
  },
  addButton: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -40,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary[600],
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
});