import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import axios from 'axios'; // Import axios

import { API_URL } from '../constants/Config';

const { width, height } = Dimensions.get('window');
const API_BASE = API_URL;
const ORDER_URL = `${API_BASE}/orders`;

export default function ActiveOrderScreen({ navigation, route }) {
  const { orderId } = route.params || {}; // Get orderId from params
  const [order, setOrder] = useState(null); // Store full order details
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
      const token = await AsyncStorage.getItem('deliveryToken');
      const response = await axios.get(`${ORDER_URL}/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const orderData = response.data;
      setOrder(orderData);

      if (orderData.status === 'reached_restaurant') {
        setStatus('REACHED');
        clearInterval(timerRef.current);
      } else if (order.status === 'out_for_delivery') {
        setStatus('PICKED_UP');
        clearInterval(timerRef.current);
      } else if (order.status === 'ready' || order.status === 'driver_assigned') {
        setStatus('ACCEPTED');
      }
    } catch (error) {
      console.log("Error fetching order details:", error);
    }
  };

  const handleAutoCancel = async () => {
    try {
      Alert.alert("Timeout", "You didn't reach the restaurant in time. Order cancelled.");
      const token = await AsyncStorage.getItem('deliveryToken');
      // Cancel order via API
      await axios.patch(`${ORDER_URL}/${orderId}/status`, // This might need update if I only allow logic via delivery endpoints, but keeping generic for cancel if exists
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
      const token = await AsyncStorage.getItem('deliveryToken');

      // Call API to update status
      await axios.patch(`${ORDER_URL}/${orderId}/delivery-reached`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      clearInterval(timerRef.current); // Stop timer
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
      const token = await AsyncStorage.getItem('deliveryToken');

      // Call API to update status
      await axios.patch(`${ORDER_URL}/${orderId}/delivery-pickup`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

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
      const token = await AsyncStorage.getItem('deliveryToken');
      await axios.patch(`${ORDER_URL}/${orderId}/delivery-complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", "Delivery Completed!");
      navigation.goBack();
    } catch (error) {
      console.log("Error completing delivery:", error);
      Alert.alert("Error", "Failed to complete delivery");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. THE MAP VIEW */}
      {/* 1. THE MAP VIEW */}
      <MapView
        style={styles.map}
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

        {/* Customer Marker */}
        <Marker
          coordinate={{
            latitude: order?.deliveryLocation?.latitude || 19.0820,
            longitude: order?.deliveryLocation?.longitude || 72.8820
          }}
          title={order?.customer?.name || "Customer"}
        >
          <MaterialCommunityIcons name="map-marker-radius" size={35} color="#2ecc71" />
        </Marker>
      </MapView>

      {/* 2. DELIVERY INFO SHEET */}
      <View style={styles.infoSheet}>
        <View style={styles.dragHandle} />

        <View style={styles.headerRow}>
          <Text style={styles.statusBadge}>
            {status === 'ACCEPTED' ? 'RUSH TO RESTAURANT' : status === 'REACHED' ? 'PICK UP ORDER' : 'DELIVERING ORDER'}
          </Text>
        </View>

        <View style={styles.addressBox}>
          <View style={styles.iconColumn}>
            <View style={[styles.dot, { backgroundColor: '#e74c3c' }]} />
            <View style={styles.line} />
            <View style={[styles.dot, { backgroundColor: '#2ecc71' }]} />
          </View>

          <View style={styles.textColumn}>
            <Text style={styles.locationTitle}>{order?.restaurantId?.name || "Restaurant"}</Text>
            <Text style={styles.locationSub}>
              {order?.restaurantId?.addresses?.[0]?.street || order?.restaurantId?.addresses?.[0]?.city || "Location N/A"}
            </Text>
            <View style={{ height: 25 }} />
            <Text style={styles.locationTitle}>{order?.customer?.name || "Customer"}</Text>
            <Text style={styles.locationSub}>{order?.deliveryAddress || "Delivery Address N/A"}</Text>
          </View>
        </View>

        {/* 3. ACTION BUTTONS */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.utilityButton}>
            <MaterialCommunityIcons name="phone" size={24} color="#333" />
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
});