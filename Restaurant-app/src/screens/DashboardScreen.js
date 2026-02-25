import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext.js';
import { useOrders } from '../context/OrderContext.js';
import { useFood } from '../context/FoodContext.js';
import { useTheme } from '../context/ThemeContext.js';
import { updateRestaurantProfile, getRestaurantStats } from '../services/api.js';
import OrderCard from '../components/OrderCard.js';
import CustomToggle from '../components/CustomToggle.js';
import { formatCurrency } from '../utils/formatters.js';
import { ORDER_STATUSES } from '../constants/mockData.js';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const { restaurant, updateRestaurantData } = useAuth();
  const { orders, fetchOrders } = useOrders();
  const { foodItems } = useFood();
  const { theme, isDarkMode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await getRestaurantStats();
      setAnalytics(response.data);
    } catch (error) {
      console.error("Analytics load failed:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchOrders(), loadAnalytics()]);
    setRefreshing(false);
  };

  const handleToggleStatus = async (value) => {
    try {
      await updateRestaurantProfile({ isOpen: value });
      await updateRestaurantData({ isOpen: value });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const displayRevenue = analytics ? analytics.todayRevenue : 0;
  const displayOrdersCount = analytics ? analytics.todayOrdersCount : 0;

  const chartData = {
    labels: analytics?.weeklyStats?.labels || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        data: analytics?.weeklyStats?.data || [0, 0, 0, 0, 0, 0, 0],
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 3
      }
    ]
  };

  const activeItems = foodItems.filter((item) => item.isAvailable).length;
  const pendingOrders = orders.filter((o) => o.status === ORDER_STATUSES.PENDING).length;
  const preparingOrders = orders.filter((o) => o.status === ORDER_STATUSES.PREPARING).length;
  const recentOrders = orders.slice(0, 3);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header - Purple variant or theme primary */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? '#2D1A3B' : '#C9A6DB', borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.restaurantName, { color: isDarkMode ? '#FFFFFF' : '#111827' }]}>Treato Partner</Text>
          <Text style={[styles.dateText, { color: isDarkMode ? '#D1D5DB' : '#6B7280' }]}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric'
            })}
          </Text>
        </View>
        <CustomToggle
          value={restaurant?.isOpen}
          onValueChange={handleToggleStatus}
          trackColor={{ false: theme.border, true: theme.success }}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={styles.section}>
          <View style={[styles.statusCard, { backgroundColor: theme.card, borderColor: restaurant?.isOpen ? theme.success : theme.error }]}>
            <View style={styles.statusInfo}>
              <View style={[styles.statusDot, { backgroundColor: restaurant?.isOpen ? theme.success : theme.error }]} />
              <Text style={[styles.statusText, { color: theme.text }]}>
                {restaurant?.isOpen ? 'Restaurant is Open' : 'Restaurant is Closed'}
              </Text>
            </View>
            <Text style={[styles.statusSubtext, { color: theme.subtext }]}>
              {restaurant?.isOpen ? 'You are receiving orders' : 'Go online to start receiving orders'}
            </Text>
          </View>
        </View>

        {/* Stats Grid - 2x2 */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#4C1D9533' : '#F3E8FF' }]}>
                <Ionicons name="cash" size={24} color={theme.primary} />
              </View>
              <View>
                <Text style={[styles.statLabel, { color: theme.subtext }]}>Revenue</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{formatCurrency(displayRevenue)}</Text>
              </View>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#92400E33' : '#FEF3C7' }]}>
                <Ionicons name="star" size={24} color={theme.warning} />
              </View>
              <View>
                <Text style={[styles.statLabel, { color: theme.subtext }]}>Rating</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{analytics?.averageRating ? parseFloat(analytics.averageRating).toFixed(1) : 'New'}</Text>
              </View>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#07598533' : '#E0F2FE' }]}>
                <Ionicons name="receipt" size={24} color="#0EA5E9" />
              </View>
              <View>
                <Text style={[styles.statLabel, { color: theme.subtext }]}>Orders</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{displayOrdersCount}</Text>
              </View>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#92400E33' : '#FEF3C7' }]}>
                <Ionicons name="time" size={24} color={theme.warning} />
              </View>
              <View>
                <Text style={[styles.statLabel, { color: theme.subtext }]}>Pending</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{pendingOrders}</Text>
              </View>
            </View>

            <View style={[styles.statCard, { backgroundColor: theme.card }]}>
              <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#065F4633' : '#DCFCE7' }]}>
                <Ionicons name="restaurant" size={24} color={theme.success} />
              </View>
              <View>
                <Text style={[styles.statLabel, { color: theme.subtext }]}>Active Items</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{activeItems}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('FoodTab', { screen: 'AddFood' })}>
              <View style={[styles.actionIcon, { backgroundColor: isDarkMode ? '#4C1D9533' : '#F3E8FF' }]}>
                <Ionicons name="add" size={24} color={theme.primary} />
              </View>
              <Text style={[styles.actionLabel, { color: theme.subtext }]}>Add Item</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('OrdersTab')}>
              <View style={[styles.actionIcon, { backgroundColor: isDarkMode ? '#37415133' : '#F3F4F6' }]}>
                <Ionicons name="list" size={24} color={theme.text} />
              </View>
              <Text style={[styles.actionLabel, { color: theme.subtext }]}>Orders</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('FoodTab')}>
              <View style={[styles.actionIcon, { backgroundColor: isDarkMode ? '#37415133' : '#F3F4F6' }]}>
                <Ionicons name="fast-food" size={24} color={theme.text} />
              </View>
              <Text style={[styles.actionLabel, { color: theme.subtext }]}>Menu</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Profile')}>
              <View style={[styles.actionIcon, { backgroundColor: isDarkMode ? '#37415133' : '#F3F4F6' }]}>
                <Ionicons name="settings" size={24} color={theme.text} />
              </View>
              <Text style={[styles.actionLabel, { color: theme.subtext }]}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Weekly Performance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Weekly Performance</Text>
          <View style={[styles.chartContainer, { backgroundColor: theme.card }]}>
            <LineChart
              data={chartData}
              width={width - 32} // Screen width - padding
              height={220}
              yAxisLabel="₹"
              chartConfig={{
                backgroundColor: theme.card,
                backgroundGradientFrom: theme.card,
                backgroundGradientTo: theme.card,
                decimalPlaces: 0,
                color: (opacity = 1) => isDarkMode ? `rgba(145, 57, 186, ${opacity})` : `rgba(145, 57, 186, ${opacity})`,
                labelColor: (opacity = 1) => theme.subtext,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: "4",
                  strokeWidth: "2",
                  stroke: theme.primary
                }
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 0 }]}>Recent Orders</Text>
            {orders.length > 3 && (
              <TouchableOpacity onPress={() => navigation.navigate('OrdersTab')}>
                <Text style={styles.linkText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onPress={(order) =>
                  navigation.navigate('OrdersTab', {
                    screen: 'OrderDetails',
                    params: { orderId: order._id },
                  })
                }
              />
            ))
          ) : (
            <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Ionicons name="receipt-outline" size={48} color={theme.subtext} />
              <Text style={[styles.emptyText, { color: theme.subtext }]}>No orders yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50, // Status bar accounting
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  dateText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  statusSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chart: {
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  linkText: {
    fontSize: 14,
    color: '#9139BA',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyText: {
    marginTop: 8,
    color: '#9CA3AF',
    fontSize: 14,
  },
});

export default DashboardScreen;