import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../hooks/useTheme';
import { ROUTES } from '../../../constants';
import { useUserStore } from '../../../store';
import { foodService, restaurantService } from '../../../services/api';
import FoodCard from '../components/FoodCard';

// --- CONFIGURATION & THEME ---
const { width } = Dimensions.get('window');

// --- MOCK DATA ---
const CATEGORIES = [
  { id: '1', name: 'Burger', image: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png' },
  { id: '2', name: 'Pizza', image: 'https://cdn-icons-png.flaticon.com/512/1404/1404945.png' },
  { id: '3', name: 'Asian', image: 'https://cdn-icons-png.flaticon.com/512/5717/5717446.png' },
  { id: '4', name: 'Tacos', image: 'https://cdn-icons-png.flaticon.com/512/4428/4428148.png' },
  { id: '5', name: 'Dessert', image: 'https://cdn-icons-png.flaticon.com/512/2836/2836645.png' },
];

const RESTAURANTS = [
  {
    id: '1',
    name: 'Burger King',
    rating: 4.5,
    reviews: '1.2k',
    time: '25-35 min',
    deliveryFee: 'Free',
    tags: ['American', 'Fast Food'],
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=800&auto=format&fit=crop',
    promo: '20% OFF',
  },
  {
    id: '2',
    name: 'Sushi Master',
    rating: 4.8,
    reviews: '500+',
    time: '40-55 min',
    deliveryFee: '$2.99',
    tags: ['Japanese', 'Sushi'],
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop',
    promo: null,
  },
  {
    id: '3',
    name: 'La Pizzeria',
    rating: 4.2,
    reviews: '850',
    time: '30-45 min',
    deliveryFee: '$1.49',
    tags: ['Italian', 'Pizza'],
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=800&auto=format&fit=crop',
    promo: 'Free Delivery',
  },
];

const FEATURED = [
  {
    id: '1',
    title: 'Healthy Bowls',
    subtitle: 'Fresh & Organic',
    color: '#DCFCE7',
    img: 'https://cdn-icons-png.flaticon.com/512/2921/2921822.png',
    darkColor: '#064E3B',
    params: { query: 'Healthy', type: 'food', tags: ['Healthy', 'Salad', 'Bowl'] }
  },
  {
    id: '2',
    title: 'Cheat Day',
    subtitle: 'Burgers & Fries',
    color: '#FEE2E2',
    img: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png',
    darkColor: '#7F1D1D',
    params: { query: 'Cheat', type: 'food', tags: ['Burger', 'Pizza', 'Fast Food', 'Cheat'] }
  },
];

const PROMOTIONS = [
  {
    id: '1',
    title: '50% OFF',
    subtitle: 'On your first order',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop',
    color: '#F97316',
  },
  {
    id: '2',
    title: 'FREE DELIVERY',
    subtitle: 'For orders over $20',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
    color: '#10B981',
  },
];

// --- REUSABLE COMPONENTS ---

const FadeInView = ({ delay = 0, children }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, delay, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, delay, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      {children}
    </Animated.View>
  );
};

const HeaderGlass = ({ scrollY, colors, isDark, selectedAddress, profile }) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  // Animate blur intensity and border opacity based on scroll
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0.7, 1],
    extrapolate: 'clamp',
  });

  const handleLocationPress = () => {
    // Navigate to Profile -> Saved Addresses
    navigation.navigate(ROUTES.PROFILE, {
      screen: ROUTES.SAVED_ADDRESSES
    });
  };

  const profileImageSource = profile?.profileImage
    ? { uri: profile.profileImage }
    : { uri: 'https://i.pravatar.cc/150?img=12' }; // Fallback existing placeholder

  return (
    <View style={[styles.headerWrapper, { paddingTop: insets.top }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: headerOpacity }]}>
        <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(20,20,20,1)' : '#C9A6DB' }]} />
        <View style={[styles.headerBorder, { backgroundColor: colors.border }]} />
      </Animated.View>

      <View style={styles.headerContent}>
        <TouchableOpacity style={styles.locationBtn} onPress={handleLocationPress} activeOpacity={0.7}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
            <Ionicons name="location" size={18} color="#9139BA" />
          </View>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.locationLabel, { color: colors.textSub }]}>DELIVERING TO</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[styles.locationText, { color: colors.text }]} numberOfLines={1}>
                {selectedAddress ? selectedAddress.label : 'Select Location'} • {selectedAddress ? (selectedAddress.street || selectedAddress.city) : 'Add Address'}
              </Text>
              <Ionicons name="chevron-down" size={14} color={colors.textSub} style={{ marginLeft: 4 }} />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.profileBtn, { borderColor: colors.surface }]}
          onPress={() => navigation.navigate(ROUTES.PROFILE)}
        >
          <Image source={profileImageSource} style={styles.profileImg} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SearchSection = ({ colors, isDark }) => (
  <View style={styles.searchSection}>
    <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: isDark ? '#000' : '#64748B' }]}>
      <Ionicons name="search-outline" size={20} color={colors.textSub} />
      <TextInput
        placeholder="Food, groceries, drinks, etc."
        placeholderTextColor={colors.textSub}
        style={[styles.searchInput, { color: colors.text }]}
      />
      <View style={[styles.searchDivider, { backgroundColor: colors.border }]} />
      <TouchableOpacity>
        <Ionicons name="options-outline" size={20} color="#9139BA" />
      </TouchableOpacity>
    </View>
  </View>
);

const PromotionsCarousel = ({ colors, isDark, label }) => {
  return (
    <View style={styles.promoContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.promoScroll}
        decelerationRate="fast"
        snapToInterval={width * 0.9} // Snap to card width + margin
        snapToAlignment="start"
      >
        {PROMOTIONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.9}
            style={[styles.promoCard, { backgroundColor: colors.surface }]}
            onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon!')}
          >
            <Image source={{ uri: item.image }} style={styles.promoImg} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.promoGradient}
            />
            <View style={styles.promoContent}>
              <View style={[styles.promoTag, { backgroundColor: item.color }]}>
                <Text style={styles.promoTagText}>{label || 'LIMITED OFFER'}</Text>
              </View>
              <Text style={styles.promoTitle}>{item.title}</Text>
              <Text style={styles.promoSubtitle}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const CategoryPill = ({ item, colors }) => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.catPill}
      onPress={() => navigation.navigate(ROUTES.SEARCH, { query: item.name })}
    >
      <View style={[styles.catImgWrap, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <Image source={{ uri: item.image }} style={styles.catImg} />
      </View>
      <Text style={[styles.catText, { color: colors.text }]}>{item.name}</Text>
    </TouchableOpacity>
  );
};

const RestaurantCard = ({ item, onPress, colors, isDark, isFavorite, onToggleFavorite }) => (
  <TouchableOpacity activeOpacity={0.9} style={[styles.card, { backgroundColor: colors.surface, shadowColor: isDark ? '#000' : '#64748B' }]} onPress={onPress}>
    <View style={styles.cardImgContainer}>
      <Image source={{ uri: item.image }} style={styles.cardImg} />
      {!item.isOpen && (
        <View style={styles.closedOverlay}>
          <Text style={styles.closedText}>Closed</Text>
        </View>
      )}
      {item.promo && (
        <View style={[styles.promoBadge, { backgroundColor: '#9139BA' }]}>
          <Text style={styles.promoText}>{item.promo}</Text>
        </View>
      )}
      <TouchableOpacity style={styles.favBtn} onPress={onToggleFavorite}>
        <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={20} color={isFavorite ? "#E23744" : "#fff"} />
      </TouchableOpacity>
      <View style={[styles.timeChip, { backgroundColor: colors.surface }]}>
        <Text style={[styles.timeText, { color: colors.text }]}>{item.time}</Text>
      </View>
    </View>

    <View style={styles.cardInfo}>
      <View style={styles.cardHeader}>
        <Text style={[styles.restName, { color: colors.text }]}>{item.name}</Text>
        <View style={[styles.ratingBadge, { backgroundColor: colors.success }]}>
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Ionicons name="star" size={10} color="#fff" style={{ marginLeft: 2 }} />
        </View>
      </View>

      <View style={styles.cardMeta}>
        <Text style={[styles.metaText, { color: colors.textSub }]}>{item.tags.join(' • ')}</Text>
        <View style={[styles.dot, { backgroundColor: colors.textSub }]} />
        <Text style={[styles.metaText, { color: colors.textSub }]}>{item.deliveryFee}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

// FloatingNav component moved to src/navigation/FloatingTabBar.js

const FilterModal = ({ visible, onClose, onApply, activeFilters, onReset }) => {
  const [localFilters, setLocalFilters] = useState(activeFilters);
  const { colors, isDark } = useTheme();

  useEffect(() => {
    setLocalFilters(activeFilters);
  }, [visible, activeFilters]);

  const toggleCuisine = (cuisine) => {
    setLocalFilters(prev => ({
      ...prev,
      cuisine: prev.cuisine === cuisine ? null : cuisine
    }));
  };

  const toggleOpen = () => {
    setLocalFilters(prev => ({
      ...prev,
      isOpen: !prev.isOpen
    }));
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} />
        </TouchableOpacity>

        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {/* Drag Handle */}
          <View style={styles.dragHandleContainer}>
            <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
          </View>

          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Filter</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
              <Ionicons name="close" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.textSub }]}>AVAILABILITY</Text>
            <TouchableOpacity
              style={[
                styles.filterOptionRow,
                {
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : colors.background,
                  borderColor: localFilters.isOpen ? '#9139BA' : colors.border,
                  borderWidth: 1
                }
              ]}
              onPress={toggleOpen}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="time-outline" size={22} color={localFilters.isOpen ? '#9139BA' : colors.textSub} style={{ marginRight: 12 }} />
                <Text style={[styles.filterOptionText, { color: colors.text }]}>Open Now</Text>
              </View>

              <View style={[
                styles.toggleCircle,
                {
                  backgroundColor: localFilters.isOpen ? '#9139BA' : 'transparent',
                  borderColor: localFilters.isOpen ? '#9139BA' : colors.textSub
                }
              ]}>
                {localFilters.isOpen && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: colors.textSub }]}>CUISINES</Text>
            <View style={styles.chipContainer}>
              {CATEGORIES.map(cat => {
                const isActive = localFilters.cuisine === cat.name;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isActive ? '#9139BA' : (isDark ? 'rgba(255,255,255,0.05)' : colors.background),
                        borderColor: isActive ? '#9139BA' : colors.border,
                      }
                    ]}
                    onPress={() => toggleCuisine(cat.name)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isActive ? '#fff' : colors.text }
                      ]}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={onReset} style={styles.resetBtn}>
              <Text style={[styles.resetText, { color: colors.textSub }]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onApply(localFilters)}
              style={[styles.applyBtn, { backgroundColor: '#9139BA' }]}
              activeOpacity={0.8}
            >
              <Text style={styles.applyText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};


// --- MAIN SCREEN ---
export default function HomeScreen() {
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [restaurants, setRestaurants] = useState([]);

  // New State for Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({ cuisine: null, isOpen: false });
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { selectedAddress, fetchAddresses, profile, fetchProfile, favorites, fetchFavorites, toggleFavorite } = useUserStore();

  const fetchData = async (query = '', filters = activeFilters) => {
    setLoading(true);
    try {
      const hasFilters = query.trim() !== '' || filters.cuisine || filters.isOpen;
      setIsFiltered(hasFilters);

      if (hasFilters) {
        // Fetch Restaurants matching filters/query
        const restParams = {
          query: query,
          cuisine: filters.cuisine,
          isOpen: filters.isOpen
        };
        const fetchedRestaurants = await restaurantService.getRestaurants(restParams);
        setFilteredRestaurants(fetchedRestaurants || []);

        // Fetch Foods matching filters/query
        const foodParams = {
          query: query || (filters.cuisine ? filters.cuisine : ' '), // If only cuisine selected, strict filter might be tricky, but query helps. Or we can just search.
          // Note: foodService.searchFoods uses /foods/search which expects 'query'. 
          // If query is empty but cuisine is selected, we might want to query by cuisine name or rely on backend to handle empty query if we update it.
          // Current backend implementation of /search: requires query or just regex matches. 
          // If query is empty strings, regex matches everything.
          isOpen: filters.isOpen
        };

        // Slightly hacky: passing cuisine as query if query is empty for food search
        const foodQuery = query || filters.cuisine || '';
        const fetchedFoods = await foodService.searchFoods(foodQuery); // Note: this calls /foods/search?query=...&isOpen=...

        // If cuisine is selected, we should filter foods by category manually if backend doesn't support 'cuisine' param on /search
        // Backend /search uses query against name. It DOES NOT filter by category yet unless we update it. 
        // OPTIONAL FIXME: Update backend to support category on /search. 
        // For now, let's filter client side if needed or assume query covers it.

        let validFoods = fetchedFoods || [];
        if (filters.cuisine) {
          validFoods = validFoods.filter(f =>
            f.category?.toLowerCase().includes(filters.cuisine.toLowerCase()) ||
            f.description?.toLowerCase().includes(filters.cuisine.toLowerCase())
          );
        }

        setFilteredFoods(validFoods);

      } else {
        // Default Load - Just Restaurants (Popular)
        const response = await restaurantService.getRestaurants();
        console.log('Fetched Restaurants:', response);
        const fetchedRestaurants = response.restaurants || response || []; // Handle { restaurants: [...] } or [...]

        const validRestaurants = Array.isArray(fetchedRestaurants)
          ? fetchedRestaurants.filter(r => r.name && r.name.trim() !== '')
          : [];
        setRestaurants(validRestaurants);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(searchQuery, activeFilters);
    setRefreshing(false);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAddresses(),
        !profile && fetchProfile(),
        fetchFavorites(),
        fetchData()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleSearchSubmit = () => {
    fetchData(searchQuery, activeFilters);
  };

  const applyFilters = (newFilters) => {
    setActiveFilters(newFilters);
    setIsFilterVisible(false);
    fetchData(searchQuery, newFilters);
  };

  const resetFilters = () => {
    const defaultFilters = { cuisine: null, isOpen: false };
    setActiveFilters(defaultFilters);
    setSearchQuery('');
    fetchData('', defaultFilters);
    setIsFilterVisible(false);
  };

  const handleRestaurantPress = (restaurant) => {
    navigation.navigate(ROUTES.RESTAURANT_DETAIL, {
      restaurantId: restaurant._id || restaurant.id,
      restaurant: restaurant
    });
  };

  const handleFoodPress = (food) => {
    if (food.restaurantId) {
      navigation.navigate(ROUTES.RESTAURANT_DETAIL, {
        restaurantId: food.restaurantId._id || food.restaurantId,
        restaurant: food.restaurantId
      });
    }
  };


  const renderSkeleton = () => (
    <View style={{ padding: 20 }}>
      <ActivityIndicator size="large" color="#9139BA" />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* 1. Header Layer */}
      <HeaderGlass scrollY={scrollY} colors={colors} isDark={isDark} selectedAddress={selectedAddress} profile={profile} />

      {/* 2. Scrollable Content */}
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingTop: insets.top + 70, // Space for header
          paddingBottom: 100
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
      >
        {/* Search */}
        <FadeInView delay={100}>
          <View style={styles.searchSection}>
            <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: isDark ? '#000' : '#64748B' }]}>
              <Ionicons name="search-outline" size={20} color={colors.textSub} />
              <TextInput
                placeholder="Food, groceries, drinks, etc."
                placeholderTextColor={colors.textSub}
                style={[styles.searchInput, { color: colors.text }]}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => { setSearchQuery(''); fetchData('', activeFilters); }}>
                  <Ionicons name="close-circle" size={16} color={colors.textSub} style={{ marginRight: 8 }} />
                </TouchableOpacity>
              )}
              <View style={[styles.searchDivider, { backgroundColor: colors.border }]} />
              <TouchableOpacity onPress={() => setIsFilterVisible(true)}>
                <Ionicons name="options-outline" size={20} color="#9139BA" />
              </TouchableOpacity>
            </View>
            {(activeFilters.cuisine || activeFilters.isOpen) && (
              <View style={{ flexDirection: 'row', marginTop: 10 }}>
                {activeFilters.cuisine && (
                  <View style={[styles.activeFilterChip, { backgroundColor: '#9139BA' }]}>
                    <Text style={styles.activeFilterText}>{activeFilters.cuisine}</Text>
                  </View>
                )}
                {activeFilters.isOpen && (
                  <View style={[styles.activeFilterChip, { backgroundColor: '#10B981', marginLeft: 8 }]}>
                    <Text style={styles.activeFilterText}>Open Now</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </FadeInView>

        {isFiltered ? (
          <FadeInView delay={200}>
            {/* Filtered Results View */}
            {loading ? renderSkeleton() : (
              <View>
                {/* Matching Restaurants */}
                {filteredRestaurants.length > 0 && (
                  <View style={{ marginBottom: 24 }}>
                    <View style={styles.sectionHeader}>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>Matching Restaurants</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
                      {filteredRestaurants.map(rest => (
                        <View key={rest._id} style={{ width: width * 0.75, marginRight: 16 }}>
                          <RestaurantCard
                            item={{
                              id: rest._id,
                              name: rest.name,
                              rating: rest.averageRating || 0,
                              reviews: rest.totalReviews || 0,
                              time: '25-35 min',
                              deliveryFee: 'Free',
                              tags: [rest.cuisineType || 'Restaurant'],
                              image: rest.restaurantImage || rest.profileImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop',
                              isOpen: rest.isOpen,
                              promo: null,
                            }}
                            colors={colors}
                            isDark={isDark}
                            onPress={() => handleRestaurantPress(rest)}
                            isFavorite={favorites.some(f => (f._id || f) === rest._id)}
                            onFavoritePress={() => toggleFavorite(rest._id)}
                          />
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Matching Foods */}
                {filteredFoods.length > 0 && (
                  <View style={{ paddingHorizontal: 20 }}>
                    <View style={[styles.sectionHeader, { paddingHorizontal: 0 }]}>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>Matching Foods</Text>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                      {filteredFoods.map(food => (
                        <View key={food._id} style={{ width: '48%', marginBottom: 16 }}>
                          <FoodCard
                            food={{
                              name: food.name,
                              image: food.imageUrl,
                              price: food.price,
                              restaurantId: food.restaurantId,
                              rating: 4.8,
                              time: '20 min'
                            }}
                            onPress={() => handleFoodPress(food)}
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {filteredRestaurants.length === 0 && filteredFoods.length === 0 && (
                  <View style={styles.emptyState}>
                    <Ionicons name="search" size={48} color={colors.textSub} />
                    <Text style={[styles.emptyText, { color: colors.textSub }]}>No results found</Text>
                    <Text style={[styles.emptySubtext, { color: colors.textSub }]}>Try adjusting your filters or search query.</Text>
                  </View>
                )}
              </View>
            )}
          </FadeInView>
        ) : (
          <>
            {/* Promotions Carousel */}
            <FadeInView delay={150}>
              <PromotionsCarousel colors={colors} isDark={isDark} />
            </FadeInView>

            {/* Featured Campaigns */}
            <FadeInView delay={200}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredScroll}>
                {FEATURED.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.featuredCard, { backgroundColor: isDark && item.darkColor ? item.darkColor : item.color }]}
                    onPress={() => navigation.navigate(ROUTES.SEARCH, item.params)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.featuredTitle, { color: isDark ? '#fff' : '#333' }]}>{item.title}</Text>
                      <Text style={[styles.featuredSub, { color: isDark ? 'rgba(255,255,255,0.7)' : '#666' }]}>{item.subtitle}</Text>
                    </View>
                    <Image source={{ uri: item.img }} style={styles.featuredImg} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </FadeInView>

            {/* Categories */}
            <FadeInView delay={300}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
                <TouchableOpacity onPress={() => navigation.navigate(ROUTES.CATEGORIES)}>
                  <Text style={[styles.seeAll, { color: '#9139BA' }]}>See All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
                {CATEGORIES.map(cat => <CategoryPill key={cat.id} item={cat} colors={colors} />)}
              </ScrollView>
            </FadeInView>

            {/* Popular Near You - Real Restaurants from Backend */}
            <FadeInView delay={400}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular Near You</Text>
                <TouchableOpacity onPress={onRefresh}>
                  <Ionicons name="refresh" size={20} color={colors.primary[500]} />
                </TouchableOpacity>
              </View>

              {loading ? renderSkeleton() : (
                <View style={styles.listContainer}>
                  {restaurants.length > 0 ? (
                    restaurants.map(rest => (
                      <RestaurantCard
                        key={rest._id}
                        item={{
                          id: rest._id,
                          name: rest.name,
                          rating: rest.averageRating || 0,
                          reviews: rest.totalReviews || 0,
                          time: '25-35 min',
                          deliveryFee: 'Free',
                          tags: [rest.cuisineType || 'Restaurant'],
                          image: rest.profileImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop',
                          isOpen: rest.isOpen,
                          promo: null,
                        }}
                        colors={colors}
                        isDark={isDark}
                        onPress={() => handleRestaurantPress({
                          id: rest._id,
                          name: rest.name,
                          ...rest
                        })}
                        isFavorite={favorites.some(f => (f._id || f) === rest._id)}
                        onFavoritePress={() => toggleFavorite(rest._id)}
                      />
                    ))
                  ) : (
                    <View style={styles.emptyState}>
                      <Ionicons name="restaurant-outline" size={48} color={colors.textSub} />
                      <Text style={[styles.emptyText, { color: colors.textSub }]}>No restaurants available yet</Text>
                      <Text style={[styles.emptySubtext, { color: colors.textSub }]}>Check back soon!</Text>
                    </View>
                  )}
                </View>
              )}
            </FadeInView>
          </>
        )}
      </Animated.ScrollView>

      <FilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        activeFilters={activeFilters}
        onApply={applyFilters}
        onReset={resetFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // --- HEADER STYLES ---
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  // --- FILTER MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  dragHandleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.3,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  filterOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
  },
  filterOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  toggleCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
  },
  resetBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 12,
  },
  resetText: {
    fontSize: 15,
    fontWeight: '600',
  },
  applyBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  activeFilterChip: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  activeFilterText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700'
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  locationLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  locationText: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
  },
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 2,
  },
  profileImg: {
    width: '100%',
    height: '100%',
  },

  // --- SEARCH ---
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
  },
  searchDivider: {
    width: 1,
    height: 20,
    marginHorizontal: 12,
  },

  // --- PROMOTIONS ---
  promoContainer: {
    marginBottom: 24,
  },
  promoScroll: {
    paddingHorizontal: 20,
    paddingRight: 10, // Adjust for last item
  },
  promoCard: {
    width: width * 0.85, // 85% width to show peek of next card
    height: 160,
    borderRadius: 24,
    marginRight: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  promoImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  promoGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  promoContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  promoTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  promoTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  promoTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  promoSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },

  // --- FEATURED ---
  featuredScroll: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  featuredCard: {
    width: width * 0.42,
    height: 100,
    borderRadius: 20,
    marginRight: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  featuredTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  featuredSub: {
    fontSize: 11,
    marginTop: 2,
  },
  featuredImg: {
    width: 60,
    height: 60,
    position: 'absolute',
    right: -10,
    bottom: -10,
    opacity: 0.9,
  },

  // --- CATEGORIES ---
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  seeAll: {
    fontWeight: '600',
    fontSize: 13,
  },
  catScroll: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  catPill: {
    alignItems: 'center',
    marginRight: 16,
  },
  catImgWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  catImg: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  catText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // --- FOOD SCROLL ---
  foodScroll: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  // --- EMPTY STATE ---
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 40,
    minWidth: width - 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },

  // --- CARDS ---
  listContainer: {
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 24,
    marginBottom: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  cardImgContainer: {
    height: 180,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  cardImg: {
    width: '100%',
    height: '100%',
  },
  promoBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  promoText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  favBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closedText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timeChip: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardInfo: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 8,
  },

});