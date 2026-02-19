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
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ORDER_STATUS } from '../../../constants';
import { useOrdersStore } from '../../../store';
import { useTheme } from '../../../hooks/useTheme';

import OrderStatusTimeline from '../components/OrderStatusTimeline';
import OrderItem from '../components/OrderItem';
import ReviewModal from '../../../components/ReviewModal';
import { orderService } from '../../../services/api';
import { useSocket } from '../../../context/SocketContext';

export default function OrderDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { orderId } = route.params;
  const { currentOrder, isLoading, fetchOrderDetail, cancelOrder } = useOrdersStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const [showReviewModal, setShowReviewModal] = React.useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = React.useState(false);
  const { colors, isDark } = useTheme();
  const socket = useSocket();

  useEffect(() => {
    fetchOrderDetail(orderId);

    // Socket.IO Listener for Real-Time Updates
    if (socket) {
      socket.on('orderStatusUpdated', (data) => {
        if (data.orderId === orderId) {
          console.log('[Socket] Order Update Received:', data.status);
          fetchOrderDetail(orderId); // Refresh data
        }
      });
    }

    // Keep polling as fallback, but less frequent (30s)
    const interval = setInterval(() => {
      if (currentOrder && currentOrder.status && ![ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(currentOrder.status)) {
        fetchOrderDetail(orderId);
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.off('orderStatusUpdated');
      }
    };
  }, [orderId, socket, currentOrder?.status]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchOrderDetail(orderId);
    setRefreshing(false);
  }, [orderId]);

  const handleCancelOrder = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const result = await cancelOrder(currentOrder.id);
            if (!result.success) {
              Alert.alert('Error', result.error);
            }
          },
        },
      ]
    );
  };

  const handleSubmitReview = async ({ deliveryRating, deliveryComment, restaurantRating, restaurantComment, foodItemReviews }) => {
    try {
      setIsSubmittingReview(true);

      // Extract IDs safely
      const orderId = currentOrder._id || currentOrder.id;
      const restaurantId = typeof currentOrder.restaurantId === 'object'
        ? currentOrder.restaurantId._id
        : currentOrder.restaurantId;
      const deliveryPartnerId = typeof currentOrder.deliveryPartnerId === 'object'
        ? currentOrder.deliveryPartnerId._id
        : currentOrder.deliveryPartnerId;

      // Validation
      if (!orderId || !restaurantId) {
        console.error('[ReviewSubmission] Missing required IDs:', { orderId, restaurantId });
        Alert.alert('Error', 'Unable to submit review: Missing order or restaurant information');
        return;
      }

      const promises = [];

      // 1. Submit Restaurant/Food Review
      if (restaurantRating > 0 || (foodItemReviews && foodItemReviews.length > 0)) {
        const reviewPayload = {
          orderId,
          restaurantId,
          restaurantRating,
          restaurantComment,
          foodItemReviews,
        };
        console.log('[ReviewSubmission] Submitting restaurant review:', reviewPayload);
        promises.push(orderService.submitReview(reviewPayload));
      }

      // 2. Submit Delivery Partner Review
      if (deliveryRating > 0 && deliveryPartnerId) {
        const deliveryPayload = {
          orderId,
          deliveryPartnerId,
          rating: deliveryRating,
          review: deliveryComment,
          userId: currentOrder.userId // Assuming userId is in order or backend infers it
        };
        console.log('[ReviewSubmission] Submitting delivery review:', deliveryPayload);
        promises.push(orderService.rateDeliveryPartner(deliveryPayload));
      } else if (deliveryRating > 0 && !deliveryPartnerId) {
        console.warn('[ReviewSubmission] Cannot submit delivery rating: No delivery partner ID');
      }

      await Promise.all(promises);

      setShowReviewModal(false);
      Alert.alert('Success', 'Thank you for your reviews!');
      fetchOrderDetail(orderId); // Refresh to update review status
    } catch (error) {
      console.error('[ReviewSubmission] Error:', error);
      Alert.alert('Error', 'Failed to submit reviews');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Loading or Null Safety Check
  // Only show full screen loader if we have NO data. 
  // If we have data but are reloading (polling), show the data.
  if (!currentOrder && isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  // If no order and not loading, it failed? or just initial?
  if (!currentOrder) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Order not found</Text>
      </View>
    );
  }

  // Safe Status Calculation
  const orderStatus = currentOrder.status ? currentOrder.status.toUpperCase() : 'UNKNOWN';
  const canCancel = [ORDER_STATUS.PLACED, ORDER_STATUS.CONFIRMED].includes(orderStatus);
  const canReview = [ORDER_STATUS.DELIVERED, 'COMPLETED'].includes(orderStatus) && (!currentOrder.restaurantReviewed || !currentOrder.deliveryReviewed);

  const getStatusColor = (status) => {
    switch (status) {
      case ORDER_STATUS.PLACED:
      case 'PENDING':
        return '#FFA500'; // Orange
      case ORDER_STATUS.CONFIRMED:
      case 'ACCEPTED':
        return '#2196F3'; // Blue
      case ORDER_STATUS.PREPARING:
        return '#9C27B0'; // Purple
      case ORDER_STATUS.OUT_FOR_DELIVERY:
      case 'READY':
        return '#4CAF50'; // Green
      case ORDER_STATUS.DELIVERED:
      case 'COMPLETED':
        return '#757575'; // Grey
      case ORDER_STATUS.CANCELLED:
        return '#F44336'; // Red
      default:
        return colors.primary[600]; // Default fallback
    }
  };

  // Bill Calculation Logic
  // currentOrder.total is Grand Total
  // Tax = Total * 0.05 (based on previous logic)
  // Delivery = 40
  // Item Total = Grand Total - Tax - Delivery
  const grandTotal = currentOrder.total || 0;
  const tax = grandTotal * 0.05;
  const deliveryFee = 40;
  const itemTotal = grandTotal - tax - deliveryFee;

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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[600]} />
        }
      >
        {/* Order Info Card */}
        <View style={[styles.statusHeaderCard, { backgroundColor: getStatusColor(orderStatus) }]}>
          <View style={styles.orderInfoContainer}>
            <Text style={styles.orderLabel}>ORDER ID</Text>
            <Text style={styles.orderValue} numberOfLines={1} ellipsizeMode="middle">#{currentOrder.id || '---'}</Text>
          </View>
          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{orderStatus}</Text>
          </View>
        </View>


        {/* Timeline */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <OrderStatusTimeline currentStatus={orderStatus} />
        </View>

        {/* Address */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={20} color={colors.primary[600]} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Delivery Details</Text>
          </View>
          {currentOrder.deliveryAddress ? (
            typeof currentOrder.deliveryAddress === 'string' ? (
              <Text style={[styles.addressMain, { color: colors.text }]}>{currentOrder.deliveryAddress}</Text>
            ) : (
              <>
                <Text style={[styles.addressMain, { color: colors.text }]}>{currentOrder.deliveryAddress.street || 'No Street'}</Text>
                <Text style={[styles.addressSub, { color: colors.textSub }]}>{currentOrder.deliveryAddress.city || 'No City'}</Text>
              </>
            )
          ) : (
            <Text style={{ color: colors.textSub }}>No address available</Text>
          )}
        </View>

        {/* Items */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="restaurant-outline" size={20} color={colors.primary[600]} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>{currentOrder.restaurant?.name || 'Restaurant'}</Text>
          </View>
          {currentOrder.items?.filter(item => item != null).map((item, index) => (
            <OrderItem key={item.id || index.toString()} item={item} />
          ))}
        </View>

        {/* Bill */}
        <View style={[styles.card, styles.billCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Bill Summary</Text>
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: colors.textSub }]}>Item Total</Text>
            <Text style={[styles.billValue, { color: colors.text }]}>₹{itemTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: colors.textSub }]}>Delivery Fee</Text>
            <Text style={[styles.billValue, { color: colors.text }]}>₹{deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={[styles.billLabel, { color: colors.textSub }]}>Taxes</Text>
            <Text style={[styles.billValue, { color: colors.text }]}>₹{tax.toFixed(2)}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.billRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Grand Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary[600] }]}>₹{grandTotal.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* FIXED FOOTER */}
      <View style={[styles.footer, { backgroundColor: colors.surface, shadowColor: isDark ? '#000' : '#000' }]}>
        {canCancel && (
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelOrder}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        )}

        {canReview && (
          <TouchableOpacity
            style={[styles.reviewBtn, { backgroundColor: '#F59E0B' }]}
            onPress={() => setShowReviewModal(true)}
          >
            <Ionicons name="star" size={20} color="#fff" />
            <Text style={styles.reviewBtnText}>Rate Order</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.supportBtn, { backgroundColor: isDark ? colors.surfaceHighlight : '#fff' }]}>
          <Ionicons name="headset-outline" size={20} color={isDark ? '#fff' : colors.text} />
          <Text style={[styles.supportBtnText, { color: isDark ? '#fff' : colors.text }]}>Support</Text>
        </TouchableOpacity>
      </View>

      <ReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleSubmitReview}
        isSubmitting={isSubmittingReview}
        orderItems={currentOrder.items || []}
        isDeliveryReviewed={currentOrder.deliveryReviewed}
        isRestaurantReviewed={currentOrder.restaurantReviewed}
      />
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
  orderInfoContainer: { flex: 1, flexShrink: 1, marginRight: 12 },
  statusBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, flexShrink: 0 },

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
  reviewBtn: { flex: 2, paddingVertical: 16, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  reviewBtnText: { color: '#fff', fontWeight: '700' },
  supportBtn: { flex: 2, paddingVertical: 16, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  supportBtnText: { color: '#fff', fontWeight: '700' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});