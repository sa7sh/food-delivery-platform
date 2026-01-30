import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useCartStore, useRestaurantStore } from '../../../store';
import { useTheme } from '../../../hooks/useTheme';

const { width } = Dimensions.get('window');

export default function RestaurantDetailScreen({ route, navigation }) {
  const { restaurant } = route.params || {};
  const { colors, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('Popular');

  // Get cart state
  const { totalItems, total, addItem } = useCartStore();

  // Animation scroll value for header effects
  // Using useRef to persist value across renders
  const scrollY = React.useRef(new Animated.Value(0)).current;

  // Use real restaurant data from backend or fallback to defaults
  const restaurantData = {
    id: restaurant?._id || restaurant?.id || '1',
    name: restaurant?.name || 'Restaurant',
    rating: restaurant?.rating || 4.5,
    reviews: restaurant?.reviews || '0',
    image: restaurant?.profileImage || restaurant?.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    tags: restaurant?.cuisineType ? [restaurant.cuisineType] : ['Restaurant'],
    time: '25-35 min',
    deliveryFee: 'Free Delivery',
  };

  // Use _id from MongoDB or fallback to id
  const restaurantId = restaurant?._id || restaurant?.id || restaurantData.id;

  const { menu, fetchMenu, isLoading } = useRestaurantStore();

  useEffect(() => {
    if (restaurantId) {
      console.log('Fetching menu for restaurant ID:', restaurantId);
      fetchMenu(restaurantId);
    }
  }, [restaurantId]);

  // Derive categories from menu data
  const categories = menu.map(cat => cat.name);

  // Set initial category when menu loads
  useEffect(() => {
    if (categories.length > 0 && !categories.includes(selectedCategory)) {
      setSelectedCategory(categories[0]);
    }
  }, [categories]);

  // Get items for selected category
  const activeItems = menu.find(cat => cat.name === selectedCategory)?.items || [];

  // Handler to add item to cart
  const handleAddToCart = (item) => {
    // Ensure we have a valid restaurant ID from the item or the screen context
    const itemRestaurantId = item.restaurantId || restaurantData.id;

    console.log('Adding to cart:', item.name, 'RestID:', itemRestaurantId);

    const cartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      isVeg: item.isVeg,
      restaurantId: itemRestaurantId,
      restaurantName: restaurantData.name,
      selectedCustomizations: [],
    };

    addItem(cartItem);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />

      {/* Hero Image Section */}
      <View style={styles.headerImageContainer}>
        <Image source={{ uri: restaurantData.image }} style={styles.headerImage} />
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'transparent', isDark ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.05)']}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.roundButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)' }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={isDark ? '#fff' : colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.roundButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)' }]}>
            <Ionicons name="share-outline" size={22} color={isDark ? '#fff' : colors.text} />
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]} // Makes categories stick when scrolling
      >
        {/* Restaurant Info Card */}
        <View style={[styles.infoSection, { backgroundColor: colors.surface, shadowColor: isDark ? '#000' : '#000' }]}>
          <View style={[styles.indicator, { backgroundColor: colors.border }]} />
          <View style={styles.titleRow}>
            <Text style={[styles.restaurantName, { color: colors.text }]}>{restaurantData.name}</Text>
            <TouchableOpacity>
              <Ionicons name="heart-outline" size={28} color={colors.primary[500]} />
            </TouchableOpacity>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FFB800" />
              <Text style={[styles.ratingText, { color: colors.text }]}>{restaurantData.rating}</Text>
              <Text style={[styles.reviewText, { color: colors.textSub }]}>({restaurantData.reviews})</Text>
            </View>
            <Text style={[styles.dotSeparator, { color: colors.textSub }]}>•</Text>
            <Text style={[styles.metaText, { color: colors.textSub }]}>{restaurantData.tags?.join(' • ') || 'Restaurant'}</Text>
          </View>

          <View style={[styles.deliveryStats, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9' }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textSub }]}>Delivery</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{restaurantData.time}</Text>
            </View>
            <View style={[styles.statItem, styles.statBorder, { borderColor: colors.border }]}>
              <Text style={[styles.statLabel, { color: colors.textSub }]}>Fee</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{restaurantData.deliveryFee}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.textSub }]}>Distance</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>2.4 km</Text>
            </View>
          </View>
        </View>

        {/* Categories Selector */}
        <View style={[styles.categoriesWrapper, { backgroundColor: colors.background }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: selectedCategory === category ? colors.primary[500] : colors.surface,
                    borderColor: selectedCategory === category ? colors.primary[500] : colors.border
                  }
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  { color: selectedCategory === category ? '#fff' : colors.textSub }
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Menu Items List */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{selectedCategory}</Text>

          {activeItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemInfo}>
                <Text style={[styles.menuItemName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.menuItemDescription, { color: colors.textSub }]} numberOfLines={2}>
                  {item.description}
                </Text>
                <Text style={[styles.menuItemPrice, { color: colors.text }]}>₹{item.price}</Text>
              </View>

              <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.menuItemImage} />
                <TouchableOpacity
                  style={[styles.plusButton, { backgroundColor: colors.primary[500], borderColor: colors.surface }]}
                  onPress={() => handleAddToCart(item)}
                >
                  <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {activeItems.length === 0 && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: colors.textSub }}>No items in this category</Text>
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Cart Bar - Only show when cart has items */}
      {totalItems > 0 && (
        <View style={[styles.cartBarContainer, { backgroundColor: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(248, 250, 252, 0.9)' }]}>
          <TouchableOpacity
            style={[styles.cartButton, { backgroundColor: colors.primary[500], shadowColor: colors.primary[500] }]}
            onPress={() => navigation.navigate('Cart')}
          >
            <View style={[styles.cartBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={[styles.cartBadgeText, { color: '#fff' }]}>{totalItems}</Text>
            </View>
            <Text style={[styles.cartButtonText, { color: '#fff' }]}>View Cart</Text>
            <Text style={[styles.cartTotal, { color: '#fff' }]}>₹{total.toFixed(0)}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImageContainer: {
    width: '100%',
    height: 280,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerButtons: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
  },
  roundButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  content: {
    flex: 1,
    marginTop: -30,
  },
  infoSection: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 10,
  },
  indicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontWeight: '700',
    fontSize: 15,
  },
  reviewText: {
    fontSize: 14,
  },
  dotSeparator: {
    marginHorizontal: 8,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '500',
  },
  deliveryStats: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  categoriesWrapper: {
    paddingVertical: 12,
  },
  categoriesContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuSection: {
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  menuItemInfo: {
    flex: 1,
    paddingRight: 12,
  },
  menuItemName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  menuItemDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  menuItemPrice: {
    fontSize: 18,
    fontWeight: '800',
  },
  imageContainer: {
    position: 'relative',
  },
  menuItemImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
  },
  plusButton: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  cartBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cartBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cartButtonText: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cartTotal: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});