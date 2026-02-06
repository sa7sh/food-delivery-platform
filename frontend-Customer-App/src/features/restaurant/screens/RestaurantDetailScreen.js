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
import { useCartStore, useRestaurantStore, useUserStore } from '../../../store';
import { useTheme } from '../../../hooks/useTheme';
import { reviewService } from '../../../services/api';

const { width } = Dimensions.get('window');

export default function RestaurantDetailScreen({ route, navigation }) {
  const { restaurant } = route.params || {};
  const { colors, isDark } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('Popular');
  const [activeFilter, setActiveFilter] = useState('all');
  const [ratingStats, setRatingStats] = useState({ averageRating: 0, totalReviews: 0 });

  // Get cart state
  const { totalItems, total, addItem } = useCartStore();
  const { favorites, toggleFavorite } = useUserStore();

  // Animation scroll value for header effects
  // Using useRef to persist value across renders
  const scrollY = React.useRef(new Animated.Value(0)).current;

  // Use real restaurant data from backend or fallback to defaults
  const restaurantData = {
    id: restaurant?._id || restaurant?.id || '1',
    name: restaurant?.name || 'Restaurant',
    rating: ratingStats.averageRating || 0,
    reviews: ratingStats.totalReviews || 0,
    image: restaurant?.restaurantImage || restaurant?.profileImage || restaurant?.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
    tags: restaurant?.cuisineType ? [restaurant.cuisineType] : ['Restaurant'],
    time: '25-35 min',
    deliveryFee: 'Free Delivery',
    isOpen: restaurant?.isOpen !== undefined ? restaurant.isOpen : true,
  };

  // Use _id from MongoDB or fallback to id
  const restaurantId = restaurant?._id || restaurant?.id || restaurantData.id;

  const { menu, fetchMenu, isLoading } = useRestaurantStore();

  useEffect(() => {
    if (restaurantId) {
      fetchMenu(restaurantId);
      fetchRatings(restaurantId);
    }
  }, [restaurantId]);

  const fetchRatings = async (id) => {
    try {
      const data = await reviewService.getRestaurantReviews(id);
      // httpClient response interceptor returns response.data, so data is already unwrapped
      // Backend returns { reviews: [], stats: { averageRating, totalReviews } }
      if (data && data.stats) {
        setRatingStats(data.stats);
      } else {
        // Fallback to default values if stats not available
        setRatingStats({ averageRating: 0, totalReviews: 0 });
      }
    } catch (error) {
      console.error('Error fetching ratings:', error);
      // Set default values on error
      setRatingStats({ averageRating: 0, totalReviews: 0 });
    }
  };

  // Derive categories from menu data
  const categories = menu.map(cat => cat.name);

  // Set initial category when menu loads
  useEffect(() => {
    if (categories.length > 0 && !categories.includes(selectedCategory)) {
      setSelectedCategory(categories[0]);
    }
  }, [categories]);

  // Get items for selected category and apply filters
  const categoryItems = menu.find(cat => cat.name === selectedCategory)?.items || [];

  const filteredItems = categoryItems.filter(item => {
    if (activeFilter === 'veg') return item.isVeg;
    if (activeFilter === 'non-veg') return !item.isVeg;
    if (activeFilter === 'rated') return (item.rating || 4.2) >= 4.0; // Mock rating for now
    if (activeFilter === 'bestseller') return (item.price > 200); // Mock rule: pricey = bestseller
    return true;
  });

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

        {!restaurantData.isOpen && (
          <View style={styles.closedBanner}>
            <Text style={styles.closedBannerText}>RESTAURANT CLOSED</Text>
            <Text style={styles.closedBannerSub}>Not accepting orders right now</Text>
          </View>
        )}
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
            <TouchableOpacity onPress={() => toggleFavorite(restaurantId)}>
              <Ionicons
                name={favorites.some(f => (f._id || f) === restaurantId) ? "heart" : "heart-outline"}
                size={28}
                color={favorites.some(f => (f._id || f) === restaurantId) ? "#E23744" : colors.primary[500]}
              />
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

        {/* Filters Bar */}
        <View style={[styles.filtersWrapper, { backgroundColor: colors.background }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersContainer}
          >
            {['all', 'veg', 'non-veg', 'bestseller', 'rated'].map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  activeFilter === filter && { backgroundColor: colors.primary[500], borderColor: colors.primary[500] }
                ]}
                onPress={() => setActiveFilter(activeFilter === filter ? 'all' : filter)}
              >
                {filter === 'veg' && <View style={[styles.vegDot, { backgroundColor: activeFilter === 'veg' ? '#fff' : '#22C55E' }]} />}
                {filter === 'non-veg' && <View style={[styles.vegDot, { backgroundColor: activeFilter === 'non-veg' ? '#fff' : '#EF4444' }]} />}
                <Text style={[
                  styles.filterText,
                  { color: activeFilter === filter ? '#fff' : colors.text },
                  filter === 'rated' && { fontWeight: '700' }
                ]}>
                  {filter === 'all' ? 'All' :
                    filter === 'veg' ? 'Pure Veg' :
                      filter === 'non-veg' ? 'Non-Veg' :
                        filter === 'bestseller' ? 'Bestseller' : 'Rated 4+'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedCategory} ({filteredItems.length})
          </Text>

          {filteredItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemInfo}>
                <View style={styles.menuItemHeader}>
                  <Text style={[styles.menuItemName, { color: colors.text }]}>{item.name}</Text>
                  {item.averageRating > 0 && (
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color="#F59E0B" />
                      <Text style={[styles.ratingText, { color: colors.text }]}>
                        {item.averageRating}
                      </Text>
                      <Text style={[styles.reviewCount, { color: colors.textSub }]}>
                        ({item.totalReviews})
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.menuItemDescription, { color: colors.textSub }]} numberOfLines={2}>
                  {item.description}
                </Text>
                <Text style={[styles.menuItemPrice, { color: colors.text }]}>₹{item.price}</Text>
              </View>

              <View style={styles.imageContainer}>
                <Image source={{ uri: item.image }} style={styles.menuItemImage} />
                <TouchableOpacity
                  style={[
                    styles.plusButton,
                    { backgroundColor: restaurantData.isOpen ? colors.primary[500] : colors.gray[400], borderColor: colors.surface }
                  ]}
                  disabled={!restaurantData.isOpen}
                  onPress={() => handleAddToCart(item)}
                >
                  <Ionicons name={restaurantData.isOpen ? "add" : "lock-closed"} size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {filteredItems.length === 0 && (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: colors.textSub }}>No items in this category</Text>
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Cart Bar - Only show when cart has items */}
      {
        totalItems > 0 && (
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
        )
      }
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
  closedBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.75)',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedBannerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  closedBannerSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
  },
  filtersWrapper: {
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  filtersContainer: {
    paddingHorizontal: 24,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  vegDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});