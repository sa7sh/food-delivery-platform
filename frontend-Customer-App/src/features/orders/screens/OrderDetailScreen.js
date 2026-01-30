import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ORDER_STATUS } from '../../../constants';
import { useOrdersStore } from '../../../store';
import { useTheme } from '../../../hooks/useTheme';

import OrderStatusTimeline from '../components/OrderStatusTimeline';
import OrderItem from '../components/OrderItem';

export default function OrderDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params;
  const { currentOrder, isLoading, fetchOrderDetail, cancelOrder } = useOrdersStore();
  const { colors, isDark } = useTheme();

  useEffect(() => { fetchOrderDetail(orderId); }, [orderId]);

  const handleCancelOrder = () => {
    Alert.alert('Cancel Order', 'Are you sure?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
          const result = await cancelOrder(orderId);
          if (result.success) navigation.goBack();
        }
      },
    ]);
  };

  if (isLoading || !currentOrder) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  const canCancel = [ORDER_STATUS.PLACED, ORDER_STATUS.CONFIRMED].includes(currentOrder.status);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={[styles.headerArea, { backgroundColor: colors.surface }]} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { backgroundColor: colors.surfaceHighlight }]}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Order Summary</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Order Info Card */}
        <View style={[styles.statusHeaderCard, { backgroundColor: colors.primary[600] }]}>
          <View>
            <Text style={styles.orderLabel}>ORDER ID</Text>
            <Text style={styles.orderValue}>#{currentOrder.id}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{currentOrder.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <OrderStatusTimeline currentStatus={currentOrder.status} />
        </View>

        {/* Address */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={20} color={colors.primary[600]} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Delivery Details</Text>
          </View>
          <Text style={[styles.addressMain, { color: colors.text }]}>{currentOrder.deliveryAddress.street}</Text>
          <Text style={[styles.addressSub, { color: colors.textSub }]}>{currentOrder.deliveryAddress.city}</Text>
        </View>

        {/* Items */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="restaurant-outline" size={20} color={colors.primary[600]} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>{currentOrder.restaurant.name}</Text>
          </View>
          {currentOrder.items.map((item) => (
            <OrderItem key={item.id} item={item} />
          ))}
        </View>

        {/* Bill */}
        <View style={[styles.card, styles.billCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Bill Summary</Text>
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: colors.textSub }]}>Item Total</Text>
            <Text style={[styles.billValue, { color: colors.text }]}>₹{(currentOrder.total - 40 - currentOrder.total * 0.05).toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: colors.textSub }]}>Delivery Fee</Text>
            <Text style={[styles.billValue, { color: colors.text }]}>₹40.00</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: colors.textSub }]}>Taxes</Text>
            <Text style={[styles.billValue, { color: colors.text }]}>₹{(currentOrder.total * 0.05).toFixed(2)}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.billRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Grand Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary[600] }]}>₹{currentOrder.total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* FIXED FOOTER: Adjust paddingBottom to avoid TabBar overlap */}
      <View style={[styles.footer, { backgroundColor: colors.surface, shadowColor: isDark ? '#000' : '#000' }]}>
        {canCancel && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelOrder}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={[styles.supportBtn, { backgroundColor: isDark ? colors.surfaceHighlight : '#fff' }]}>
          <Ionicons name="headset-outline" size={20} color="#fff" />
          <Text style={styles.supportBtnText}>Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: {},
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scrollContent: { padding: 20, paddingBottom: 150 },
  statusHeaderCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16
  },
  orderLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  orderValue: { fontSize: 18, fontWeight: '900', color: '#fff' },
  statusBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  card: { borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '800' },
  addressMain: { fontSize: 15, fontWeight: '600' },
  addressSub: { fontSize: 14, marginTop: 4 },
  billCard: { gap: 12 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between' },
  billLabel: { fontSize: 14 },
  billValue: { fontSize: 14, fontWeight: '700' },
  divider: { height: 1, borderStyle: 'dashed', borderWidth: 0.5, borderRadius: 1, marginVertical: 4 },
  totalLabel: { fontSize: 16, fontWeight: '800' },
  totalValue: { fontSize: 18, fontWeight: '900' },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    gap: 12,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 20,
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  cancelBtn: { flex: 1, paddingVertical: 16, borderRadius: 18, borderWidth: 1.5, borderColor: '#9139BA', alignItems: 'center' },
  cancelBtnText: { color: '#9139BA', fontWeight: '700' },
  supportBtn: { flex: 2, paddingVertical: 16, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  supportBtnText: { color: '#fff', fontWeight: '700' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});