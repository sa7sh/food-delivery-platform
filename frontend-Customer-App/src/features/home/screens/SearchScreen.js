import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  Animated,
  Keyboard,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { restaurants } from '../data/mockData';
import RestaurantCard from '../components/RestaurantCard';
import FoodCard from '../components/FoodCard';
import httpClient from '../../../services/api/httpClient';
import { useTheme } from '../../../hooks/useTheme';

const { width } = Dimensions.get('window');

/* -------------------- STATIC DATA -------------------- */
const TRENDING_SEARCHES = [
  { id: '1', term: 'Margherita Pizza', icon: 'pizza-outline', color: '#FF6B6B' },
  { id: '2', term: 'Chicken Biryani', icon: 'restaurant-outline', color: '#4ECDC4' },
  { id: '3', term: 'Veg Burger', icon: 'fast-food-outline', color: '#FFD93D' },
  { id: '4', term: 'Paneer Tikka', icon: 'flame-outline', color: '#FF8C42' },
  { id: '5', term: 'Sushi', icon: 'fish-outline', color: '#6C5CE7' },
];

const FILTERS = [
  { id: 'all', label: 'All', icon: 'apps-outline' },
  { id: 'veg', label: 'Veg Only', icon: 'leaf-outline' },
  { id: 'rating', label: 'Top Rated', icon: 'star-outline' },
  { id: 'fast', label: 'Fast Delivery', icon: 'flash-outline' },
];

/* -------------------- COMPONENTS -------------------- */
const SectionHeader = ({ title, action, colors }) => (
  <View style={styles.sectionHeader}>
    <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
    {action}
  </View>
);

const TrendingChip = ({ item, onPress, colors, isDark }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    style={[
      styles.trendingChip,
      {
        backgroundColor: isDark ? '#1F1F1F' : '#fff',
        borderWidth: 1,
        borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent',
        // Removed colored shadow for cleaner look
        shadowColor: isDark ? '#000' : '#888',
      }
    ]}
  >
    <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
      <Ionicons name={item.icon} size={18} color={item.color} />
    </View>
    <Text style={[styles.trendingText, { color: colors.text }]}>{item.term}</Text>
  </TouchableOpacity>
);

/* -------------------- SCREEN -------------------- */
export default function SearchScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [recentSearches, setRecentSearches] = useState(['Pizza', 'Burger', 'Biryani']);

  // Animation values
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;

  /* -------------------- EFFECT -------------------- */
  useEffect(() => {
    if (route.params?.query || route.params?.tags) {
      const { query, type, tags } = route.params;
      setSearchQuery(query || (tags ? tags[0] : '')); // Set query text if available or first tag
      handleSearch(query || '', type, tags);
    }
  }, [route.params]);

  useEffect(() => {
    if (searchQuery.trim() && !route.params?.tags) { // Only auto-search if not triggered by params initially to avoid double call or loop
      const delaySearch = setTimeout(() => {
        handleSearch(searchQuery);
      }, 600);
      return () => clearTimeout(delaySearch);
    } else if (searchQuery.trim() === '') {
      // setSearchResults([]); // Optional: keep results or clear?
    }
  }, [searchQuery]); // Removed activeFilter from deps for simplicity for now

  /* -------------------- LOGIC -------------------- */
  const handleSearch = async (query, type = 'restaurant', tags = null) => {
    setIsSearching(true);
    try {
      const params = { query };
      if (type) params.type = type;
      if (tags && Array.isArray(tags)) params.tags = tags.join(',');

      const response = await httpClient.get('/public/search', { params });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    Keyboard.dismiss();
  };

  const handleRecentPress = (term) => setSearchQuery(term);

  // Header Animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* 1. BLURRED HEADER BACKGROUND (Visible on Scroll) */}
      <Animated.View style={[styles.blurredHeader, { opacity: headerOpacity, height: insets.top + 70 }]}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 70 : 100}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        <View style={[styles.headerBorder, { backgroundColor: colors.border }]} />
      </Animated.View>

      {/* 2. SEARCH INPUT HEADER (Fixed) */}
      <View style={[styles.fixedHeader, { paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={[styles.searchContainer, {
          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'transparent'
        }]}>
          <Ionicons name="search" size={20} color={colors.textSub} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Search for food..."
            placeholderTextColor={colors.textSub}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={colors.textSub} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 3. MAIN CONTENT */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 80, paddingBottom: 100 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        keyboardDismissMode="on-drag"
      >
        {searchQuery.trim() === '' ? (
          <>
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <SectionHeader
                  title="Recent"
                  colors={colors}
                  action={
                    <TouchableOpacity onPress={() => setRecentSearches([])}>
                      <Text style={[styles.clearText, { color: colors.primary[500] }]}>Clear</Text>
                    </TouchableOpacity>
                  }
                />
                {recentSearches.map((term, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.recentRow, { borderBottomColor: colors.border }]}
                    onPress={() => handleRecentPress(term)}
                  >
                    <Ionicons name="time-outline" size={20} color={colors.textSub} />
                    <Text style={[styles.recentText, { color: colors.text }]}>{term}</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.border} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Trending */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>Trending Now</Text>
              <View style={styles.trendingGrid}>
                {TRENDING_SEARCHES.map((item) => (
                  <TrendingChip
                    key={item.id}
                    item={item}
                    onPress={() => setSearchQuery(item.term)}
                    colors={colors}
                    isDark={isDark}
                  />
                ))}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScroll}
            >
              {FILTERS.map((filter) => {
                const isActive = activeFilter === filter.id;
                return (
                  <TouchableOpacity
                    key={filter.id}
                    onPress={() => setActiveFilter(filter.id)}
                    style={[
                      styles.filterPill,
                      {
                        backgroundColor: isActive ? colors.primary[500] : (isDark ? 'rgba(255,255,255,0.1)' : '#fff'),
                        borderWidth: isActive ? 0 : 1,
                        borderColor: isActive ? 'transparent' : colors.border
                      }
                    ]}
                  >
                    <Ionicons
                      name={filter.icon}
                      size={16}
                      color={isActive ? '#fff' : colors.textSub}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={{
                      color: isActive ? '#fff' : colors.text,
                      fontWeight: isActive ? '700' : '500',
                      fontSize: 13
                    }}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Results */}
            {isSearching ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[500]} />
                <Text style={[styles.loadingText, { color: colors.textSub }]}>Cooking up results...</Text>
              </View>
            ) : (
              <View style={styles.resultsContainer}>
                {searchResults.length > 0 ? (
                  searchResults.map((item) => {
                    // Check if it's a food item (has 'price') or restaurant
                    if (item.price !== undefined) {
                      return (
                        <View key={item._id} style={{ marginBottom: 16 }}>
                          <FoodCard
                            food={{
                              ...item,
                              image: item.imageUrl,
                              type: item.category,
                              rating: 4.5, // Mock rating for food item as backend doesn't have it yet
                              time: '20-30 min',
                              discount: null
                            }}
                            onPress={() => { }}
                          />
                        </View>
                      );
                    }
                    return (
                      <RestaurantCard
                        key={item._id}
                        restaurant={{
                          ...item,
                          image: item.profileImage || 'https://via.placeholder.com/400',
                          tags: item.cuisineType ? [item.cuisineType] : [],
                          rating: 4.5, // Mock
                          time: '30-45 min', // Mock
                          deliveryFee: '$2.00' // Mock
                        }}
                        onPress={() => { }}
                      />
                    );
                  })
                ) : (
                  <View style={styles.emptyContainer}>
                    <View style={[styles.emptyIconBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }]}>
                      <Ionicons name="search-outline" size={48} color={colors.textSub} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>No results found</Text>
                    <Text style={[styles.emptySub, { color: colors.textSub }]}>
                      We couldn't find anything for "{searchQuery}". Try searching for something else.
                    </Text>
                  </View>
                )}
              </View>
            )}
          </>
        )}
      </Animated.ScrollView>
    </View>
  );
}

/* -------------------- STYLES -------------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  blurredHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  headerBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 10,
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },

  // Sections
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Recent
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  recentText: {
    flex: 1,
    marginLeft: 14,
    fontSize: 15,
    fontWeight: '500',
  },

  // Trending
  trendingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  trendingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  trendingText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Filters
  filterScroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },

  // Results
  resultsContainer: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    marginTop: 80,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '500',
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});
