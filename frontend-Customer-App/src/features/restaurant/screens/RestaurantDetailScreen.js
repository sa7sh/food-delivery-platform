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
  TextInput,
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
  const [searchQuery, setSearchQuery] = useState('');
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
    // 1. Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(query) && !item.description?.toLowerCase().includes(query)) {
        return false;
      }
    }

    // 2. Tag Filters
    if (activeFilter === 'veg') return item.isVeg;
    if (activeFilter === 'non-veg') return !item.isVeg;
    if (activeFilter === 'rated') return (item.rating || 4.2) >= 4.0;
    if (activeFilter === 'bestseller') return (item.price > 200);
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

      {!restaurantData.isOpen && (
        <View style={styles.closedBanner}>
          <Text style={styles.closedBannerText}>RESTAURANT CLOSED</Text>
        </View>
      )}

      {/* Scroll Content Layer */}
      <View style={styles.scrollLayer}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[3]}
        >
          {/* Header Image - Now inside ScrollView */}
          <View style={styles.headerImageWrapper}>
            <Image
              source={{ uri: restaurantData.image }}
              style={styles.headerImage}
            />
            <LinearGradient
              colors={['rgba(0,0,0,0.2)', 'transparent', 'rgba(0,0,0,0.6)']}
              style={StyleSheet.absoluteFill}
            />
          </View>

          {/* Restaurant Info Card */}
          <View style={[styles.infoSection, { backgroundColor: colors.background }]}>
            <View style={styles.infoHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.restaurantName, { color: colors.text }]}>{restaurantData.name}</Text>
                <Text style={[styles.metaText, { color: colors.textSub }]}>{restaurantData.tags?.join(' • ')}</Text>
              </View>
              <View style={styles.ratingBox}>
                <Text style={styles.ratingBoxText}>{restaurantData.rating}</Text>
                <Ionicons name="star" size={12} color="#fff" style={{ marginLeft: 2 }} />
              </View>
            </View>

            {/* Stats Row */}
            <View style={styles.modernStatsRow}>
              <View style={[styles.modernStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }]}>
                <Ionicons name="time-outline" size={18} color={colors.primary[500]} />
                <Text style={[styles.modernStatText, { color: colors.text }]}>{restaurantData.time}</Text>
              </View>

              <View style={[styles.modernStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }]}>
                <Ionicons name="bicycle-outline" size={18} color={colors.primary[500]} />
                <Text style={[styles.modernStatText, { color: colors.text }]}>Free</Text>
              </View>

              <View style={[styles.modernStatItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }]}>
                <Ionicons name="location-outline" size={18} color={colors.primary[500]} />
                <Text style={[styles.modernStatText, { color: colors.text }]}>2.4 km</Text>
              </View>
            </View>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
            <View style={[styles.modernSearchBar, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6' }]}>
              <Ionicons name="search-outline" size={20} color={colors.textSub} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search for dishes..."
                placeholderTextColor={colors.textSub}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textSub} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Sticky Filters & Categories */}
          <View style={{ backgroundColor: colors.background, paddingBottom: 16 }}>
            {/* Filters */}
            <View style={styles.filtersWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersContainer}>
                {['all', 'veg', 'non-veg', 'bestseller', 'rated'].map((filter) => {
                  const isActive = activeFilter === filter;
                  return (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.modernChip,
                        isActive ? { backgroundColor: colors.text } : { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#fff', borderWidth: 1, borderColor: colors.border }
                      ]}
                      onPress={() => setActiveFilter(isActive ? 'all' : filter)}
                    >
                      {filter === 'veg' && <View style={[styles.vegDot, { backgroundColor: isActive ? '#fff' : '#22C55E' }]} />}
                      {filter === 'non-veg' && <View style={[styles.vegDot, { backgroundColor: isActive ? '#fff' : '#EF4444' }]} />}
                      <Text style={[styles.modernChipText, { color: isActive ? colors.background : colors.text }]}>
                        {filter === 'all' ? 'Sort' :
                          filter === 'veg' ? 'Veg' :
                            filter === 'non-veg' ? 'Non-Veg' :
                              filter === 'bestseller' ? 'Bestseller' : 'Ratings 4.0+'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Categories */}
            <View style={styles.categoriesWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContent}>
                {categories.map((category) => {
                  const isSelected = selectedCategory === category;
                  return (
                    <TouchableOpacity
                      key={category}
                      style={[
                        styles.categoryTab,
                        isSelected && { borderBottomColor: colors.primary[500], borderBottomWidth: 3 }
                      ]}
                      onPress={() => setSelectedCategory(category)}
                    >
                      <Text style={[
                        styles.categoryTabText,
                        { color: isSelected ? colors.text : colors.textSub, fontWeight: isSelected ? '700' : '500' }
                      ]}>
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
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
                  {/* Veg/Non-Veg Indicator */}
                  {item.isVeg ? (
                    <View style={{
                      width: 15, height: 15, borderWidth: 1, borderColor: '#22C55E',
                      alignItems: 'center', justifyContent: 'center', marginBottom: 6, borderRadius: 3
                    }}>
                      <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: '#22C55E' }} />
                    </View>
                  ) : (
                    <View style={{
                      width: 15, height: 15, borderWidth: 1, borderColor: '#EF4444',
                      alignItems: 'center', justifyContent: 'center', marginBottom: 6, borderRadius: 3
                    }}>
                      <Ionicons name="caret-up" size={10} color="#EF4444" />
                    </View>
                  )}

                  <Text style={[styles.menuItemName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.menuItemPrice, { color: colors.text }]}>₹{item.price}</Text>
                  <Text style={[styles.menuItemDescription, { color: colors.textSub }]} numberOfLines={2}>
                    {item.description}
                  </Text>

                  {item.averageRating > 0 && (
                    <View style={styles.ratingPill}>
                      <Ionicons name="star" size={10} color="#F59E0B" />
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#F59E0B', marginLeft: 2 }}>{item.averageRating}</Text>
                      <Text style={{ fontSize: 11, color: colors.textSub, marginLeft: 2 }}>({item.totalReviews})</Text>
                    </View>
                  )}
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
      </View>

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

      {/* Fixed Header Overlay - Guaranteed to stay on top */}
      <View style={styles.headerOverlay} pointerEvents="box-none">
        <SafeAreaView style={styles.headerButtons} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.blurButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.blurButton}
            onPress={() => toggleFavorite(restaurantId)}
          >
            <Ionicons
              name={favorites.some(f => (f._id || f) === restaurantId) ? "heart" : "heart-outline"}
              size={22}
              color={favorites.some(f => (f._id || f) === restaurantId) ? "#E23744" : "#fff"}
            />
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollLayer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  headerImageWrapper: {
    width: '100%',
    height: 280,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 45 : 10,
  },
  blurButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedBanner: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 100 : 80,
    left: 20,
    right: 20,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    zIndex: 99,
  },
  closedBannerText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  infoSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    marginTop: -30,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  metaText: {
    fontSize: 14,
    marginTop: 4,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ratingBoxText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  modernStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modernStatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  modernStatText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingBottom: 4,
  },
  modernSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
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
    paddingTop: 12,
  },
  filtersContainer: {
    paddingHorizontal: 24,
    gap: 10,
  },
  modernChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 6,
  },
  modernChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoriesWrapper: {
    paddingTop: 12,
  },
  categoriesContent: {
    paddingHorizontal: 24,
    gap: 20,
  },
  categoryTab: {
    paddingBottom: 12,
  },
  categoryTabText: {
    fontSize: 15,
  },
  menuSection: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    borderBottomWidth: 1,
  },
  menuItemInfo: {
    flex: 1,
    paddingRight: 16,
  },
  menuItemName: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 6,
  },
  menuItemDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  imageContainer: {
    position: 'relative',
  },
  menuItemImage: {
    width: 130,
    height: 120,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  plusButton: {
    position: 'absolute',
    bottom: -8,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
});