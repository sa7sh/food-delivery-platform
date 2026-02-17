import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const OrderCard = ({ restaurant, distance, pay, items, location, onAccept }) => (
  <View style={styles.card}>
    {/* Top Row: Meta Info */}
    <View style={styles.cardHeader}>
      <View style={styles.distanceBadge}>
        <MaterialCommunityIcons name="map-marker-distance" size={14} color="#636e72" />
        <Text style={styles.distanceText}>{distance} km</Text>
      </View>
      <View style={styles.itemBadge}>
        <Text style={styles.itemText}>{items} Items</Text>
      </View>
    </View>

    {/* Middle Row: Restaurant & Pay */}
    <View style={styles.mainInfo}>
      <View style={{ flex: 1 }}>
        <Text style={styles.restaurantName}>{restaurant}</Text>
        <Text style={styles.locationText}>{location}</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.currency}>₹</Text>
        <Text style={styles.price}>{pay}</Text>
      </View>
    </View>

    <View style={styles.divider} />

    {/* Bottom Row: Acceptance */}
    <TouchableOpacity 
      activeOpacity={0.8} 
      style={styles.acceptButton} 
      onPress={onAccept}
    >
      <Text style={styles.acceptButtonText}>ACCEPT & NAVIGATE</Text>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    // Professional Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  distanceBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f2f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  distanceText: { fontSize: 12, fontWeight: '600', color: '#636e72', marginLeft: 4 },
  itemBadge: { backgroundColor: '#E8F3FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  itemText: { fontSize: 12, fontWeight: '600', color: '#0984e3' },
  mainInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  restaurantName: { fontSize: 20, fontWeight: '800', color: '#2d3436' },
  locationText: { fontSize: 14, color: '#b2bec3', marginTop: 2 },
  priceContainer: { flexDirection: 'row', alignItems: 'baseline' },
  currency: { fontSize: 16, fontWeight: 'bold', color: '#2ecc71', marginRight: 2 },
  price: { fontSize: 24, fontWeight: '900', color: '#2ecc71' },
  divider: { height: 1, backgroundColor: '#f1f2f6', marginBottom: 16 },
  acceptButton: { 
    backgroundColor: '#e74c3c', 
    flexDirection: 'row', 
    height: 54, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 10
  },
  acceptButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 }
});