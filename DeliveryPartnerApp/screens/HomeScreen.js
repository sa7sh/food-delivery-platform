import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, FlatList,
  Switch, StatusBar, Dimensions, Alert, useColorScheme
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';
import { useDeliveryAuthStore } from '../store/authStore';

import { API_URL } from '../constants/Config';
import Skeleton from '../components/Skeleton';

import { useFocusEffect } from '@react-navigation/native';
const { width } = Dimensions.get('window');
const API_BASE = API_URL;
// Partners & status routes → /api/delivery/*
const DRIVER_URL = `${API_BASE}/delivery/partners`;
// Order routes for delivery → /api/orders/*
const ORDER_URL = `${API_BASE}/orders/delivery`;

// Professional Order Card Component 
const OrderCard = ({ restaurant, distance, pay, items, location, onAccept, onDelete, timestamp, theme }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!timestamp) return;

    // Calculate initial remaining time (1 minute window)
    const orderTime = new Date(timestamp).getTime();
    const expiryTime = orderTime + 2 * 60 * 1000; // 2 minutes later


    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));

      setTimeLeft(diff);

      if (diff <= 0) {
        setExpired(true);
      }
    };

    updateTimer(); // Initial call

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [timestamp]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, expired && styles.cardExpired]}>
      {/* Header Faded when expired */}
      <View style={[styles.cardHeader, expired && { opacity: 0.5 }]}>
        <View style={styles.brandInfo}>
          <View style={[styles.iconCircle, { backgroundColor: theme === 'dark' ? '#2c1a36' : '#f5f0fa' }, expired && styles.iconCircleExpired]}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={18} color={expired ? "#bdc3c7" : "#9139BA"} />
          </View>
          <View>
            <Text style={[styles.restaurantName, { color: colors.text }, expired && styles.textExpired]}>{restaurant}</Text>
            <Text style={[styles.locationText, { color: colors.subText }, expired && styles.textExpired]}>{location}</Text>
          </View>
        </View>
        <View style={[styles.priceContainer, { backgroundColor: theme === 'dark' ? '#1e3a24' : '#ebf7ee' }, expired && styles.priceContainerExpired]}>
          <Text style={[styles.currencySymbol, expired && styles.textExpired]}>₹</Text>
          <Text style={[styles.priceText, expired && styles.textExpired]}>{pay}</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }, expired && { opacity: 0.5 }]} />

      <View style={styles.cardFooter}>
        {/* Meta Row Faded when expired */}
        <View style={[styles.metaRow, expired && { opacity: 0.5 }]}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="map-marker-distance" size={16} color={colors.subText} />
            <Text style={[styles.metaText, { color: colors.subText }]}>{distance} km</Text>
          </View>
          <View style={[styles.dotSeparator, { backgroundColor: colors.border }]} />
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="package-variant" size={16} color={colors.subText} />
            <Text style={[styles.metaText, { color: colors.subText }]}>{items} items</Text>
          </View>
        </View>

        {!expired ? (
          <TouchableOpacity style={styles.acceptBtn} onPress={onAccept} activeOpacity={0.8}>
            <Text style={styles.acceptBtnText}>Accept</Text>
            <Text style={styles.timerText}>({formatTime(timeLeft)})</Text>
            <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.expiredBtn, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
            onPress={() => {
              console.log("[OrderCard] Remove button clicked");
              onDelete();
            }}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="delete-outline" size={16} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.expiredBtnText}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Theme Colors
const lightColors = {
  background: '#fff',
  card: '#fff',
  text: '#2d3436',
  subText: '#95a5a6',
  border: '#f1f2f6',
  navTitle: '#9139BA',
  earningsBg: '#f8f9fa',
};

const darkColors = {
  background: '#121212',
  card: '#1e1e1e',
  text: '#ffffff',
  subText: '#b2bec3',
  border: '#2c2c2c',
  navTitle: '#bb86fc',
  earningsBg: '#1a1a1a',
};

export default function HomeScreen({ navigation }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'light';
  const colors = theme === 'dark' ? darkColors : lightColors;

  const { token, hiddenOrderIds, hideOrder } = useDeliveryAuthStore();
  const [isOnline, setIsOnline] = useState(false);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDeleteExpired = async (orderId) => {
    try {
      if (!token) return;

      const fullUrl = `${ORDER_URL}/${orderId}/hide`;

      // Call backend to hide order permanently for this partner
      const response = await axios.patch(fullUrl, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        // Update local state immediately for better UX
        setAvailableOrders(prev => prev.filter(o => o._id !== orderId));
        // Also update store
        hideOrder(orderId);
      }
    } catch (error) {
      console.log("Error hiding order:", error);
    }
  };

  // Fetch Orders
  const fetchOrders = async () => {
    try {
      if (!token) return;
      setLoading(true);

      const response = await axios.get(`${ORDER_URL}/available`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Backend returns the array directly
      if (Array.isArray(response.data)) {
        setAvailableOrders(response.data);
      } else if (response.data.success && Array.isArray(response.data.orders)) {
        // Fallback in case I change backend later
        setAvailableOrders(response.data.orders);
      } else {
        console.log("Unexpected response format:", response.data);
      }
    } catch (error) {
      console.log("Error fetching orders:", error);
      if (error.response) {
        console.log("Error Response:", error.response.data);
        console.log("Error Status:", error.response.status);
      }
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  // Toggle Status
  const toggleStatus = async (value) => {
    // Get the freshest token directly from the store at call time
    const currentToken = useDeliveryAuthStore.getState().token;

    if (!currentToken) {
      Alert.alert('Not Logged In', 'Please log out and log back in to refresh your session.');
      return;
    }

    // Optimistically update UI
    setIsOnline(value);

    try {
      const response = await axios.post(
        `${DRIVER_URL}/status`,
        { isOnline: value },
        { headers: { Authorization: `Bearer ${currentToken}` } }
      );

      if (!response.data.success) {
        // Backend returned a failure response
        Alert.alert('Status Error', response.data.message || 'Failed to update status.');
        setIsOnline(!value); // revert
      } else if (value) {
        fetchOrders();
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Network error. Check your connection.';
      console.log('Toggle status error:', msg, error);
      Alert.alert('Connection Error', msg);
      setIsOnline(!value); // revert
    }
  };


  // Handle order acceptance
  const handleAcceptOrder = async (item) => {
    try {
      setLoading(true);
      if (!token) return;

      if (item.isBatch) {
        const orderIds = item.orders.map(o => o._id);
        const response = await axios.post(`${ORDER_URL}/accept-batch`, { orderIds }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data.acceptedCount > 0) {
          navigation.navigate('ActiveOrder', { isBatch: true, orderIds: orderIds, batchData: item });
        } else {
          Alert.alert("Failed", "Failed to accept batched orders");
        }
      } else {
        const response = await axios.patch(`${ORDER_URL}/${item._id}/accept`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data && response.data._id) {
          navigation.navigate('ActiveOrder', { orderId: item._id });
        } else {
          Alert.alert("Failed", "Failed to accept order");
        }
      }
    } catch (error) {
      console.log("Error accepting order:", error);
      Alert.alert("Error", "Error accepting order. It might already be taken.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  // Socket Listener
  const socket = useSocket();

  // Refetch when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [])
  );

  React.useEffect(() => {
    fetchOrders();

    if (socket) {
      socket.on('newOrderReady', (newOrder) => {
        console.log("New order received via socket!", newOrder._id);
        // We can either append to list or refetch
        fetchOrders();
        Alert.alert("New Task", "A new delivery task is available nearby!");
      });

      return () => {
        socket.off('newOrderReady');
      };
    }
  }, [socket]);

  const displayedOrders = availableOrders.filter(o => !hiddenOrderIds.includes(o._id));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} backgroundColor={colors.background} />

      <View style={[styles.brandNav, { backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.logoText, { color: colors.navTitle }]}>TREATO</Text>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#2ecc71' : (theme === 'dark' ? '#333' : '#dfe6e9') }]} />
            <Text style={styles.statusSub}>{isOnline ? 'ACTIVE' : 'OFFLINE'}</Text>
          </View>
        </View>

        <View style={styles.navRight}>
          <TouchableOpacity style={styles.notifBtn}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.text} />
            {isOnline && <View style={styles.notifBadge} />}
          </TouchableOpacity>
          <Switch
            value={isOnline}
            onValueChange={toggleStatus}
            trackColor={{ false: theme === 'dark' ? "#333" : "#eee", true: "#2ecc71" }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {isOnline ? (
        <>
          <View style={[styles.stickyWrapper, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
            <TouchableOpacity style={[styles.miniEarningsBar, { backgroundColor: colors.earningsBg, borderColor: colors.border }]} activeOpacity={0.9}>
              <View>
                <Text style={styles.miniLabel}>TODAY'S PAYOUT</Text>
                <Text style={[styles.miniValue, { color: colors.text }]}>₹840.50</Text>
              </View>

              <View style={styles.miniStatsRight}>
                <View style={[styles.pillStat, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <MaterialCommunityIcons name="moped" size={14} color="#27ae60" />
                  <Text style={[styles.pillText, { color: colors.text }]}>12</Text>
                </View>
                <View style={[styles.pillStat, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <MaterialCommunityIcons name="clock-outline" size={14} color="#27ae60" />
                  <Text style={[styles.pillText, { color: colors.text }]}>5.5h</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color={colors.subText} />
              </View>
            </TouchableOpacity>
          </View>

          <FlatList
            data={displayedOrders}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={() => (
              <View style={styles.taskHeader}>
                <View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Tasks</Text>
                  <Text style={[styles.sectionSub, { color: colors.subText }]}>Nearby opportunities</Text>
                </View>
                <View style={[styles.countBadge, { backgroundColor: colors.text }]}>
                  <Text style={[styles.countText, { color: colors.background }]}>{displayedOrders.length} ORDERS</Text>
                </View>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={styles.cardPadding}>
                <OrderCard
                  restaurant={item.isBatch ? `BATCHED: ${item.batchSize} x ${item.restaurantId?.name || "Restaurant"}` : (item.restaurantId?.name || "Unknown Restaurant")}
                  distance="2.5" // Mock distance for now
                  pay={item.totalAmount}
                  items={item.totalItemsCount || item.items?.length || 0}
                  location={item.restaurantId?.addresses?.[0]?.city || item.restaurantId?.addresses?.[0]?.street || "Location N/A"}
                  onAccept={() => handleAcceptOrder(item)}
                  onDelete={() => handleDeleteExpired(item._id)}
                  timestamp={item.createdAt} // Use createdAt
                  theme={theme}
                />
              </View>
            )}
            showsVerticalScrollIndicator={false}
            onRefresh={onRefresh}
            refreshing={refreshing}
            contentContainerStyle={styles.listPadding}
            ListEmptyComponent={() => (
              loading ? (
                <View style={{ paddingHorizontal: 20 }}>
                  {[1, 2, 3].map((key) => (
                    <View key={key} style={{ marginBottom: 16 }}>
                      <Skeleton width="100%" height={160} borderRadius={16} />
                    </View>
                  ))}
                </View>
              ) : (
                <View style={{ alignItems: 'center', marginTop: 40 }}>
                  <Text style={{ color: colors.subText }}>No available tasks nearby.</Text>
                </View>
              )
            )}
          />
        </>
      ) : (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.earningsBg }]}>
            <MaterialCommunityIcons name="lightning-bolt" size={40} color={colors.border} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>You're Offline</Text>
          <Text style={[styles.emptySub, { color: colors.subText }]}>Go online to start receiving delivery requests.</Text>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.navTitle }]}
            onPress={() => toggleStatus(true)}
          >
            <Text style={styles.primaryBtnText}>GO ONLINE</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  brandNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    zIndex: 20,
  },
  logoText: { fontSize: 24, fontWeight: '900', color: '#9139BA', letterSpacing: -1 },
  statusIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 5 },
  statusSub: { fontSize: 10, fontWeight: '800', color: '#b2bec3', letterSpacing: 0.5 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notifBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  notifBadge: { position: 'absolute', top: 10, right: 10, width: 7, height: 7, borderRadius: 4, backgroundColor: '#e74c3c', borderWidth: 1.5, borderColor: '#fff' },
  stickyWrapper: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 5,
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  miniEarningsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f1f2f6',
  },
  miniLabel: { fontSize: 9, fontWeight: '800', color: '#95a5a6', letterSpacing: 0.5 },
  miniValue: { fontSize: 20, fontWeight: '900', color: '#2d3436' },
  miniStatsRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pillStat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
    borderWidth: 1,
    borderColor: '#f1f2f6'
  },
  pillText: { fontSize: 13, fontWeight: '700', color: '#2d3436' },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 15
  },
  sectionTitle: { fontSize: 20, fontWeight: '800', color: '#2d3436' },
  sectionSub: { fontSize: 13, color: '#95a5a6' },
  countBadge: { backgroundColor: '#2d3436', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  countText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f2f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f5f0fa', // New Purple tint background
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantName: { fontSize: 16, fontWeight: '700', color: '#2d3436' },
  locationText: { fontSize: 13, color: '#95a5a6', marginTop: 2 },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#ebf7ee',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  currencySymbol: { fontSize: 12, fontWeight: '800', color: '#27ae60', marginRight: 1 },
  priceText: { fontSize: 18, fontWeight: '900', color: '#27ae60' },
  divider: { height: 1, backgroundColor: '#f1f2f6', marginVertical: 4 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, fontWeight: '600', color: '#636e72' },
  dotSeparator: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#dfe6e9' },
  acceptBtn: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  acceptBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  cardPadding: { paddingHorizontal: 20, marginBottom: 12 },
  listPadding: { paddingBottom: 30 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#f9f9f9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#2d3436' },
  emptySub: { textAlign: 'center', color: '#b2bec3', marginTop: 10, fontSize: 15, lineHeight: 20 },
  primaryBtn: { marginTop: 30, backgroundColor: '#9139BA', height: 54, borderRadius: 15, width: '100%', justifyContent: 'center', alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '900', fontSize: 15, letterSpacing: 1 },
  // Expired Styles
  cardExpired: { backgroundColor: '#f9f9f9', borderColor: '#f1f2f6', borderWidth: 1 },
  iconCircleExpired: { backgroundColor: '#ecf0f1' },
  textExpired: { color: '#bdc3c7' },
  priceContainerExpired: { backgroundColor: '#ecf0f1' },
  timerText: { fontSize: 13, color: '#FFFFFF', fontWeight: 'bold', marginLeft: 6, textAlign: 'center' },
  expiredBtn: {
    backgroundColor: '#ff4757', // Cleaner vibrant red
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ff7675', // Subtle lighter border
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  expiredBtnText: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' }
});