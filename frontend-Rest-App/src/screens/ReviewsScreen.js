import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getMyReviews, getFoodItemReviews, getRestaurantProfile } from '../services/api';
import { useTheme } from '../context/ThemeContext';

export default function ReviewsScreen() {
  const navigation = useNavigation();
  const { theme, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('restaurant'); // 'restaurant' or 'food'
  const [restaurantReviews, setRestaurantReviews] = useState([]);
  const [foodItemReviews, setFoodItemReviews] = useState([]);
  const [restaurantStats, setRestaurantStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const profile = await getRestaurantProfile();
      const resId = profile.data._id;
      setRestaurantId(resId);

      // Fetch restaurant reviews
      const response = await getMyReviews(resId);
      setRestaurantReviews(response.data.reviews);
      setRestaurantStats(response.data.stats);

      // Fetch food item reviews (all reviews with reviewType: 'food_item')
      const foodResponse = await getFoodItemReviews(resId);
      setFoodItemReviews(foodResponse.data.reviews || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <View style={[styles.header, { backgroundColor: theme.primary }]}>
      <Text style={[styles.headerLabel, { color: 'rgba(255,255,255,0.8)' }]}>Restaurant Rating</Text>
      <View style={styles.ratingRow}>
        <Text style={styles.ratingValue}>{restaurantStats.averageRating}</Text>
        <Ionicons name="star" size={32} color="#F59E0B" />
      </View>
      <Text style={[styles.reviewCount, { color: 'rgba(255,255,255,0.6)' }]}>
        {restaurantStats.totalReviews} Reviews
      </Text>
    </View>
  );

  const renderTabs = () => (
    <View style={[styles.tabsContainer, { backgroundColor: theme.background }]}>
      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'restaurant' && { borderBottomColor: theme.primary, borderBottomWidth: 3 }
        ]}
        onPress={() => setActiveTab('restaurant')}
      >
        <Ionicons
          name="restaurant"
          size={20}
          color={activeTab === 'restaurant' ? theme.primary : theme.subtext}
        />
        <Text style={[
          styles.tabText,
          { color: activeTab === 'restaurant' ? theme.primary : theme.subtext }
        ]}>
          Restaurant ({restaurantReviews.length})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.tab,
          activeTab === 'food' && { borderBottomColor: theme.primary, borderBottomWidth: 3 }
        ]}
        onPress={() => setActiveTab('food')}
      >
        <Ionicons
          name="fast-food"
          size={20}
          color={activeTab === 'food' ? theme.primary : theme.subtext}
        />
        <Text style={[
          styles.tabText,
          { color: activeTab === 'food' ? theme.primary : theme.subtext }
        ]}>
          Food Items ({foodItemReviews.length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderRestaurantReview = ({ item }) => (
    <View style={[styles.reviewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.reviewHeader}>
        <View style={styles.customerInfo}>
          <View style={[styles.avatar, { backgroundColor: theme.inputBg }]}>
            <Ionicons name="person" size={20} color={theme.subtext} />
          </View>
          <View>
            <Text style={[styles.customerName, { color: theme.text }]}>
              {item.customerId?.name || "Customer"}
            </Text>
            <Text style={[styles.reviewDate, { color: theme.subtext }]}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={[styles.ratingBadge, { backgroundColor: `${theme.primary}15` }]}>
          <Text style={[styles.ratingBadgeText, { color: theme.primary }]}>{item.rating}</Text>
          <Ionicons name="star" size={14} color={theme.primary} />
        </View>
      </View>

      {item.comment && (
        <Text style={[styles.comment, { color: theme.text, backgroundColor: theme.inputBg }]}>
          "{item.comment}"
        </Text>
      )}
    </View>
  );

  const renderFoodItemReview = ({ item }) => (
    <View style={[styles.reviewCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.reviewHeader}>
        <View style={styles.customerInfo}>
          <View style={[styles.avatar, { backgroundColor: theme.inputBg }]}>
            <Ionicons name="person" size={20} color={theme.subtext} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.customerName, { color: theme.text }]}>
              {item.customerId?.name || "Customer"}
            </Text>
            <Text style={[styles.foodItemName, { color: theme.primary }]}>
              {item.foodItemId?.name || "Food Item"}
            </Text>
            <Text style={[styles.reviewDate, { color: theme.subtext }]}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={[styles.ratingBadge, { backgroundColor: `${theme.primary}15` }]}>
          <Text style={[styles.ratingBadgeText, { color: theme.primary }]}>{item.rating}</Text>
          <Ionicons name="star" size={14} color={theme.primary} />
        </View>
      </View>

      {item.comment && (
        <Text style={[styles.comment, { color: theme.text, backgroundColor: theme.inputBg }]}>
          "{item.comment}"
        </Text>
      )}
    </View>
  );

  const currentReviews = activeTab === 'restaurant' ? restaurantReviews : foodItemReviews;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: theme.primary }} />

      {/* Back Button */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <>
          {renderHeader()}
          {renderTabs()}
          <FlatList
            data={currentReviews}
            keyExtractor={(item) => item._id}
            renderItem={activeTab === 'restaurant' ? renderRestaurantReview : renderFoodItemReview}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-ellipses-outline" size={64} color={theme.border} />
                <Text style={[styles.emptyText, { color: theme.subtext }]}>
                  No {activeTab === 'restaurant' ? 'restaurant' : 'food item'} reviews yet
                </Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
  },
  reviewCount: {
    fontSize: 14,
    marginTop: 8,
  },
  backButtonContainer: {
    position: 'absolute',
    top: 48,
    left: 20,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  reviewCard: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
  },
  foodItemName: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  reviewDate: {
    fontSize: 12,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    padding: 12,
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
  },
});
