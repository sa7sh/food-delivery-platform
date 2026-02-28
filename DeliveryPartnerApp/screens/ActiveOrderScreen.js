import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, ActivityIndicator, useColorScheme, Linking, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { useDeliveryAuthStore } from '../store/authStore';

import { API_URL } from '../constants/Config';

const { width, height } = Dimensions.get('window');
const API_BASE = API_URL;
const ORDER_URL = `${API_BASE}/orders`;

// Theme Colors
const lightColors = {
  background: '#fff',
  sheet: '#fff',
  text: '#2d3436',
  subText: '#95a5a6',
  border: '#EEE',
  badgeBg: '#f5f0fa',
  badgeText: '#9139BA',
  utilityBtn: '#F3F5F7',
};

const darkColors = {
  background: '#121212',
  sheet: '#1e1e1e',
  text: '#ffffff',
  subText: '#b2bec3',
  border: '#2c2c2c',
  badgeBg: '#2c1a36',
  badgeText: '#bb86fc',
  utilityBtn: '#2c2c2c',
};

// Map Style for Dark Mode
const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#181818" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];

export default function ActiveOrderScreen({ navigation, route }) {
  const colorScheme = useColorScheme();
  const theme = colorScheme || 'light';
  const colors = theme === 'dark' ? darkColors : lightColors;

  const { token } = useDeliveryAuthStore();
  const { orderId, isBatch, orderIds } = route.params || {};
  const [order, setOrder] = useState(null); // Reference order for restaurant details
  const [orders, setOrders] = useState([]); // All orders in batch
  const [status, setStatus] = useState('ACCEPTED'); // Initial status when accepted
  const [timeLeft, setTimeLeft] = useState(60); // 60s timer
  const [loading, setLoading] = useState(false);

  // Timer Ref to clear it if needed
  const timerRef = useRef(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [status]);

  const fetchOrderDetails = async () => {
    try {
      if (!token) return;

      if (isBatch && orderIds) {
        const responses = await Promise.all(
          orderIds.map(id => axios.get(`${ORDER_URL}/${id}/delivery-view`, { headers: { Authorization: `Bearer ${token}` } }))
        );
        const fetchedOrders = responses.map(res => res.data);
        setOrders(fetchedOrders);
        setOrder(fetchedOrders[0]);

        const firstStatus = fetchedOrders[0].status;
        if (firstStatus === 'reached_restaurant') {
          setStatus('REACHED');
          clearInterval(timerRef.current);
        } else if (firstStatus === 'order_picked' || firstStatus === 'out_for_delivery') {
          setStatus('PICKED_UP');
          clearInterval(timerRef.current);
        } else {
          setStatus('ACCEPTED');
        }
      } else {
        const response = await axios.get(`${ORDER_URL}/${orderId}/delivery-view`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const orderData = response.data;
        setOrder(orderData);
        setOrders([orderData]);

        if (orderData.status === 'reached_restaurant') {
          setStatus('REACHED');
          clearInterval(timerRef.current);
        } else if (orderData.status === 'order_picked' || orderData.status === 'out_for_delivery') {
          setStatus('PICKED_UP');
          clearInterval(timerRef.current);
        } else {
          setStatus('ACCEPTED');
        }
      }
    } catch (error) {
      console.log("Error fetching order details:", error?.response?.data || error.message);
    }
  };

  const handleAutoCancel = async () => {
    try {
      Alert.alert("Timeout", "You didn't reach the restaurant in time. Order cancelled.");
      if (!token) return;
      // Cancel order via API
      await axios.patch(`${ORDER_URL}/${orderId}/status`,
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigation.goBack();
    } catch (error) {
      console.log("Auto-cancel error:", error);
      navigation.goBack();
    }
  };

  const markReachedRestaurant = async () => {
    try {
      setLoading(true);
      if (!token) return;

      if (isBatch && orderIds) {
        await axios.post(`${ORDER_URL}/delivery/batch-reached`, { orderIds }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.patch(`${ORDER_URL}/${orderId}/delivery-reached`, {}, { headers: { Authorization: `Bearer ${token}` } });
      }

      clearInterval(timerRef.current);
      setStatus('REACHED');
      Alert.alert("Success", "You have reached the restaurant!");
    } catch (error) {
      console.log("Error updating status:", error);
      Alert.alert("Error", "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const markPickedUp = async () => {
    try {
      setLoading(true);
      if (!token) return;

      if (isBatch && orderIds) {
        await axios.post(`${ORDER_URL}/delivery/batch-pickup`, { orderIds }, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.patch(`${ORDER_URL}/${orderId}/delivery-pickup`, {}, { headers: { Authorization: `Bearer ${token}` } });
      }

      setStatus('PICKED_UP');
      Alert.alert("Success", "Order Picked Up! Head to delivery location.");
    } catch (error) {
      console.log("Error updating status:", error);
      Alert.alert("Error", "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const markDelivered = async () => {
    try {
      setLoading(true);
      if (!token) return;

      if (isBatch && orderIds) {
        await Promise.all(orderIds.map(id =>
          axios.patch(`${ORDER_URL}/${id}/delivery-complete`, {}, { headers: { Authorization: `Bearer ${token}` } })
        ));
      } else {
        await axios.patch(`${ORDER_URL}/${orderId}/delivery-complete`, {}, { headers: { Authorization: `Bearer ${token}` } });
      }

      Alert.alert("Success", "Delivery Completed!");
      navigation.goBack();
    } catch (error) {
      console.log("Error completing delivery:", error);
      Alert.alert("Error", "Failed to complete delivery");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (lat, lng, addressString) => {
    if (lat && lng) {
      const navUrl = Platform.select({
        ios: `http://maps.apple.com/?daddr=${lat},${lng}`,
        android: `google.navigation:q=${lat},${lng}`
      });
      Linking.openURL(navUrl).catch(() => {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`);
      });
    } else if (addressString) {
      const query = encodeURIComponent(addressString);
      const url = Platform.select({
        ios: `http://maps.apple.com/?q=${query}`,
        // For address parsing on Android
        android: `geo:0,0?q=${query}`
      });
      Linking.openURL(url).catch(() => {
        Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
      });
    } else {
      Alert.alert("Unable to Navigate", "No valid coordinates or address found.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. THE MAP VIEW */}
      <MapView
        style={styles.map}
        customMapStyle={theme === 'dark' ? darkMapStyle : []}
        initialRegion={{
          latitude: order?.deliveryLocation?.latitude || 19.0760,
          longitude: order?.deliveryLocation?.longitude || 72.8777,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Restaurant Marker */}
        <Marker
          coordinate={{
            latitude: order?.restaurantId?.addresses?.[0]?.latitude || 19.0760,
            longitude: order?.restaurantId?.addresses?.[0]?.longitude || 72.8777
          }}
          title={order?.restaurantId?.name || "Restaurant"}
        >
          <MaterialCommunityIcons name="store" size={35} color="#9139BA" />
        </Marker>

        {/* Customer Markers */}
        {orders.map((ord, idx) => (
          <Marker
            key={`customer-${idx}`}
            coordinate={{
              latitude: ord?.deliveryLocation?.latitude || 19.0820 + (idx * 0.005),
              longitude: ord?.deliveryLocation?.longitude || 72.8820 + (idx * 0.005)
            }}
            title={ord?.customer?.name || `Customer ${idx + 1}`}
          >
            <MaterialCommunityIcons name="map-marker-radius" size={35} color="#2ecc71" />
          </Marker>
        ))}
      </MapView>

      {/* 2. DELIVERY INFO SHEET */}
      <View style={[styles.infoSheet, { backgroundColor: colors.sheet }]}>
        <View style={styles.dragHandle} />

        <View style={styles.headerRow}>
          <Text style={[styles.statusBadge, { backgroundColor: colors.badgeBg, color: colors.badgeText }]}>
            {status === 'ACCEPTED' ? 'RUSH TO RESTAURANT' : status === 'REACHED' ? 'PICK UP ORDER' : 'DELIVERING ORDER'}
          </Text>
        </View>

        <View style={styles.addressBox}>
          <View style={styles.iconColumn}>
            <View style={[styles.dot, { backgroundColor: '#e74c3c' }]} />
            <View style={[styles.line, { backgroundColor: colors.border }]} />
            <View style={[styles.dot, { backgroundColor: '#2ecc71' }]} />
          </View>

          <View style={styles.textColumn}>
            {/* Restaurant Address Row */}
            <View style={styles.addressRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.locationTitle, { color: colors.text }]}>{order?.restaurantId?.name || "Restaurant"}</Text>
                <Text style={[styles.locationSub, { color: colors.subText }]}>
                  {order?.restaurantId?.addresses?.[0]?.street || order?.restaurantId?.addresses?.[0]?.city || "Location N/A"}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.navMiniBtn, { backgroundColor: colors.badgeBg }]}
                onPress={() => handleNavigate(
                  order?.restaurantId?.addresses?.[0]?.latitude,
                  order?.restaurantId?.addresses?.[0]?.longitude,
                  order?.restaurantId?.addresses?.[0]?.street || order?.restaurantId?.addresses?.[0]?.city
                )}
              >
                <MaterialCommunityIcons name="navigation-variant" size={16} color={colors.badgeText} />
                <Text style={[styles.navMiniText, { color: colors.badgeText }]}>Nav</Text>
              </TouchableOpacity>
            </View>

            {orders.map((ord, idx) => (
              <View key={`info-${idx}`}>
                <View style={{ height: 15 }} />
                <View style={styles.addressRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.locationTitle, { color: colors.text }]}>{ord?.customer?.name || `Customer ${idx + 1}`}</Text>
                    <Text style={[styles.locationSub, { color: colors.subText }]}>{ord?.deliveryAddress || "Delivery Address N/A"}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.navMiniBtn, { backgroundColor: colors.badgeBg }]}
                    onPress={() => handleNavigate(
                      ord?.deliveryLocation?.latitude,
                      ord?.deliveryLocation?.longitude,
                      ord?.deliveryAddress
                    )}
                  >
                    <MaterialCommunityIcons name="navigation-variant" size={16} color={colors.badgeText} />
                    <Text style={[styles.navMiniText, { color: colors.badgeText }]}>Nav</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 3. ACTION BUTTONS */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.utilityButton, { backgroundColor: colors.utilityBtn }]}>
            <MaterialCommunityIcons name="phone" size={24} color={colors.text} />
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator size="large" color="#2ecc71" style={{ flex: 1 }} />
          ) : (
            <TouchableOpacity
              style={[styles.mainButton, {
                backgroundColor: status === 'ACCEPTED' ? '#9139BA' : status === 'REACHED' ? '#f39c12' : '#2ecc71'
              }]}
              onPress={status === 'ACCEPTED' ? markReachedRestaurant : status === 'REACHED' ? markPickedUp : markDelivered}
            >
              <Text style={styles.mainButtonText}>
                {status === 'ACCEPTED' ? 'REACHED RESTAURANT' : status === 'REACHED' ? 'PICK UP ORDER' : 'MARK DELIVERED'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: width, height: height * 0.65 },
  infoSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 40,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  dragHandle: { width: 40, height: 4, backgroundColor: '#E0E0E0', borderRadius: 2, alignSelf: 'center', marginBottom: 15 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  statusBadge: { backgroundColor: '#f5f0fa', color: '#9139BA', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 5, fontSize: 12, fontWeight: 'bold' },
  timerText: { fontSize: 16, fontWeight: 'bold' },
  addressBox: { flexDirection: 'row', marginVertical: 10 },
  iconColumn: { alignItems: 'center', width: 30, marginRight: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#9139BA' },
  line: { width: 2, flex: 1, backgroundColor: '#EEE', marginVertical: 4 },
  textColumn: { flex: 1 },
  locationTitle: { fontSize: 16, fontWeight: '700', color: '#2D3436' },
  locationSub: { fontSize: 13, color: '#636E72', marginTop: 2 },
  footer: { flexDirection: 'row', marginTop: 25, gap: 15 },
  utilityButton: { width: 55, height: 55, borderRadius: 15, backgroundColor: '#F3F5F7', justifyContent: 'center', alignItems: 'center' },
  mainButton: { flex: 1, height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  mainButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  addressRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navMiniBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, gap: 4 },
  navMiniText: { fontSize: 12, fontWeight: '700' },
});