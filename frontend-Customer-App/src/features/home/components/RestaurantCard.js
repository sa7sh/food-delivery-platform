import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';

export default function RestaurantCard({ restaurant, onPress }) {
  const {
    name,
    profileImage,
    image,
    rating,
    ratingCount,
    cuisine,
    cuisineType,
    deliveryTime,
    costForTwo,
    distance,
    offers,
    isOpen = true,
  } = restaurant;

  // Use profileImage from backend, fallback to image, or default
  const restaurantImage = profileImage || image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800';

  // Handle cuisine as array or single string
  const cuisineArray = Array.isArray(cuisine) ? cuisine : (cuisineType ? [cuisineType] : ['Restaurant']);

  return (
    <Card onPress={onPress} style={styles.card}>
      {/* Restaurant Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: restaurantImage }}
          style={styles.image}
          resizeMode="cover"
        />
        {!isOpen && (
          <View style={styles.closedOverlay}>
            <Text style={styles.closedText}>Closed</Text>
          </View>
        )}
        {offers && offers.length > 0 && (
          <View style={styles.offerBadge}>
            <Text style={styles.offerText}>🎉 {offers[0]}</Text>
          </View>
        )}
      </View>

      {/* Restaurant Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>

        <View style={styles.row}>
          <View style={styles.rating}>
            <Text style={styles.star}>⭐</Text>
            <Text style={styles.ratingText}>
              {rating || 4.5} ({ratingCount || 0})
            </Text>
          </View>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.deliveryTime}>{deliveryTime || '25-35 min'}</Text>
        </View>

        <Text style={styles.cuisine} numberOfLines={1}>
          {cuisineArray.join(', ')}
        </Text>

        <View style={styles.footer}>
          <Text style={styles.cost}>₹{costForTwo || 300} for two</Text>
          {distance && (
            <>
              <Text style={styles.dot}>•</Text>
              <Text style={styles.distance}>{distance}</Text>
            </>
          )}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    marginBottom: 16,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 160,
    backgroundColor: colors.gray[100],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  offerBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  offerText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary[600],
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.gray[900],
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    fontSize: 14,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 13,
    color: colors.gray[600],
    fontWeight: '600',
  },
  dot: {
    fontSize: 13,
    color: colors.gray[400],
    marginHorizontal: 6,
  },
  deliveryTime: {
    fontSize: 13,
    color: colors.gray[600],
  },
  cuisine: {
    fontSize: 13,
    color: colors.gray[500],
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cost: {
    fontSize: 13,
    color: colors.gray[600],
    fontWeight: '500',
  },
  distance: {
    fontSize: 13,
    color: colors.gray[500],
  },
});