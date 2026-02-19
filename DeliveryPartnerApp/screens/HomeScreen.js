import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity, FlatList,
  Switch, StatusBar, Dimensions, Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';

import { API_URL } from '../constants/Config';

import { useFocusEffect } from '@react-navigation/native';
const { width } = Dimensions.get('window');
const API_BASE = API_URL;
const DRIVER_URL = `${API_BASE}/driver`;
const ORDER_URL = `${API_BASE}/orders`;

// Professional Order Card Component 
const OrderCard = ({ restaurant, distance, pay, items, location, onAccept, timestamp }) => {
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

  return (
    <View style={[styles.card, expired && styles.cardExpired]}>
      <View style={styles.cardHeader}>
        <View style={styles.brandInfo}>
          <View style={[styles.iconCircle, expired && styles.iconCircleExpired]}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={18} color={expired ? "#bdc3c7" : "#9139BA"} />
          </View>
          <View>
            <Text style={[styles.restaurantName, expired && styles.textExpired]}>{restaurant}</Text>
            <Text style={styles.locationText}>{location}</Text>
          </View>
        </View>
        <View style={[styles.priceContainer, expired && styles.priceContainerExpired]}>
          <Text style={[styles.currencySymbol, expired && styles.textExpired]}>₹</Text>
          <Text style={[styles.priceText, expired && styles.textExpired]}>{pay}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="map-marker-distance" size={16} color="#95a5a6" />
            <Text style={styles.metaText}>{distance} km</Text>
          </View>
          <View style={styles.dotSeparator} />
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="package-variant" size={16} color="#95a5a6" />
            <Text style={styles.metaText}>{items} items</Text>
          </View>
        </View>

        {!expired ? (
          <TouchableOpacity style={styles.acceptBtn} onPress={onAccept} activeOpacity={0.8}>
            <Text style={styles.acceptBtnText}>Accept</Text>
            <Text style={styles.timerText}>({formatTime(timeLeft)})</Text>
            <MaterialCommunityIcons name="check-circle" size={16} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.expiredBtn}>
            <Text style={styles.expiredBtnText}>Expired</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default function HomeScreen({ navigation }) {
  const [isOnline, setIsOnline] = useState(false);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch Orders
  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('deliveryToken');
      console.log("Fetching orders with token:", token ? "Present" : "Missing"); // DEBUG

      if (!token) return;

      const response = await axios.get(`${ORDER_URL}/delivery/available`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Fetch Orders Response Status:", response.status); // DEBUG
      console.log("Fetch Orders Data:", JSON.stringify(response.data, null, 2)); // DEBUG

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
    }
  };

  // Toggle Status
  const toggleStatus = async (value) => {
    try {
      setIsOnline(value);
      const token = await AsyncStorage.getItem('deliveryToken');
      if (token) {
        await axios.post(`${DRIVER_URL}/status`, { isOnline: value }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (value) fetchOrders();
      }
    } catch (error) {
      console.log("Error toggling status:", error);
      setIsOnline(!value);
    }
  };

  // Handle order acceptance
  const handleAcceptOrder = async (orderId) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('deliveryToken');
      if (!token) return;

      const response = await axios.patch(`${ORDER_URL}/${orderId}/delivery-accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Backend returns the updated order object directly
      if (response.data && response.data._id) {
        navigation.navigate('ActiveOrder', { orderId: orderId });
      } else {
        Alert.alert("Failed", "Failed to accept order");
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
      socket.on('newAvailableOrder', (newOrder) => {
        console.log("New order received via socket!", newOrder._id);
        // We can either append to list or refetch
        fetchOrders();
        Alert.alert("New Task", "A new delivery task is available nearby!");
      });

      return () => {
        socket.off('newAvailableOrder');
      };
    }
  }, [socket]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.brandNav}>
        <View>
          <Text style={styles.logoText}>TREATO</Text>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#2ecc71' : '#dfe6e9' }]} />
            <Text style={styles.statusSub}>{isOnline ? 'ACTIVE' : 'OFFLINE'}</Text>
          </View>
        </View>

        <View style={styles.navRight}>
          <TouchableOpacity style={styles.notifBtn}>
            <MaterialCommunityIcons name="bell-outline" size={22} color="#2d3436" />
            {isOnline && <View style={styles.notifBadge} />}
          </TouchableOpacity>
          <Switch
            value={isOnline}
            onValueChange={toggleStatus}
            trackColor={{ false: "#eee", true: "#2ecc71" }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {isOnline ? (
        <>
          <View style={styles.stickyWrapper}>
            <TouchableOpacity style={styles.miniEarningsBar} activeOpacity={0.9}>
              <View>
                <Text style={styles.miniLabel}>TODAY'S PAYOUT</Text>
                <Text style={styles.miniValue}>₹840.50</Text>
              </View>

              <View style={styles.miniStatsRight}>
                <View style={styles.pillStat}>
                  <MaterialCommunityIcons name="moped" size={14} color="#27ae60" />
                  <Text style={styles.pillText}>12</Text>
                </View>
                <View style={styles.pillStat}>
                  <MaterialCommunityIcons name="clock-outline" size={14} color="#27ae60" />
                  <Text style={styles.pillText}>5.5h</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#dfe6e9" />
              </View>
            </TouchableOpacity>
          </View>

          <FlatList
            data={availableOrders}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={() => (
              <View style={styles.taskHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Available Tasks</Text>
                  <Text style={styles.sectionSub}>Nearby opportunities</Text>
                </View>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{availableOrders.length} ORDERS</Text>
                </View>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={styles.cardPadding}>
                <OrderCard
                  restaurant={item.restaurantId?.name || "Unknown Restaurant"}
                  distance="2.5" // Mock distance for now
                  pay={item.totalAmount}
                  items={item.items?.length || 0}
                  location={item.restaurantId?.addresses?.[0]?.city || item.restaurantId?.addresses?.[0]?.street || "Location N/A"}
                  onAccept={() => handleAcceptOrder(item._id)}
                  timestamp={item.updatedAt || item.createdAt} // Use updatedAt if available, else createdAt
                />
              </View>
            )}
            showsVerticalScrollIndicator={false}
            onRefresh={onRefresh}
            refreshing={refreshing}
            contentContainerStyle={styles.listPadding}
          />
        </>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <MaterialCommunityIcons name="lightning-bolt" size={40} color="#dfe6e9" />
          </View>
          <Text style={styles.emptyTitle}>You're Offline</Text>
          <Text style={styles.emptySub}>Go online to start receiving delivery requests.</Text>
          <TouchableOpacity
            style={styles.primaryBtn}
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
  cardExpired: { opacity: 0.6, backgroundColor: '#f9f9f9' },
  iconCircleExpired: { backgroundColor: '#ecf0f1' },
  textExpired: { color: '#bdc3c7' },
  priceContainerExpired: { backgroundColor: '#ecf0f1' },
  timerText: { fontSize: 13, color: '#FFFFFF', fontWeight: 'bold', marginLeft: 6, textAlign: 'center' },
  expiredBtn: {
    backgroundColor: '#bdc3c7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  expiredBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' }
});