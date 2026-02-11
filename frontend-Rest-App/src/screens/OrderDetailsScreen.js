import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../context/OrderContext.js';
import apiClient, { getOrderById, updateOrderStatus, deleteOrder } from '../services/api.js';
import CustomButton from '../components/CustomButton.js';
import StatusBadge from '../components/StatusBadge.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';
import { ORDER_STATUSES } from '../constants/mockData.js';
import { useTheme } from '../context/ThemeContext.js';

const OrderDetailsScreen = ({ route, navigation }) => {
  const { orderId } = route.params;
  const { theme, isDarkMode } = useTheme();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Define fetch function outside useEffect so we can call it repeatedly
  const fetchOrderDetails = async (isPolling = false) => {
    try {
      // Only set loading true if we have no data yet (initial load)
      if (!order && !isPolling) setLoading(true);

      const response = await getOrderById(orderId);
      // The API returns response.data directly due to interceptors/helpers usually,
      // but let's be safe. apiClient.get returns axios response object { data: ... }
      // Our api.js getOrderById returns apiClient.get...
      // So response.data is the payload.

      setOrder(response.data);
      setError(null);
    } catch (err) {
      console.error("Fetch Order Error:", err);
      if (!isPolling) setError(err.message || 'Failed to load order');
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();

    // Poll for updates every 10 seconds without showing loading spinner
    const interval = setInterval(() => {
      fetchOrderDetails(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [orderId]);

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      const response = await updateOrderStatus(orderId, newStatus);
      // Backend returns updated order
      setOrder(response.data);
      Alert.alert('Success', `Order status updated to ${newStatus}`);
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = () => {
    Alert.alert(
      "Remove Order",
      "Hide this order from your history? It will still be visible to the customer.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await deleteOrder(orderId);

              Alert.alert("Success", "Order removed from list");
              navigation.goBack();
            } catch (err) {
              Alert.alert("Error", err.message);
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const getNextActions = () => {
    switch (order?.status) {
      case 'pending':
        return [
          { label: 'Accept Order', status: 'accepted', variant: 'primary' },
        ];
      case 'accepted':
        return [
          { label: 'Start Preparing', status: 'preparing', variant: 'primary' },
        ];
      case 'preparing':
        return [
          { label: 'Mark as Ready', status: 'ready', variant: 'primary' },
        ];
      case 'ready':
        return [ // Assuming next step is completed or maybe out_for_delivery if handled by restaurant
          { label: 'Mark Completed', status: 'completed', variant: 'primary' },
        ];
      default:
        return [];
    }
  };

  if (loading && !order) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <LoadingSpinner />
      </View>
    );
  }

  if (error && !order) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.text }}>{error}</Text>
        <CustomButton title="Retry" onPress={() => fetchOrderDetails()} />
      </View>
    );
  }

  if (!order) return null;

  const actions = getNextActions();
  // Allow deletion for completed/cancelled/delivered/rejected states
  const isDeletable = ['completed', 'cancelled', 'delivered', 'rejected'].includes(order.status?.toLowerCase());

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Order #{order._id?.slice(-6).toUpperCase()}</Text>

          {isDeletable ? (
            <TouchableOpacity onPress={handleDeleteOrder} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 24 }} />
          )}
        </View>
      </View>

      <View style={styles.content}>
        {/* Order Header Info */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.orderNumber, { color: theme.text }]}>Status</Text>
            <StatusBadge status={order.status} />
          </View>
          <Text style={[styles.orderTime, { color: theme.subtext }]}>{formatDate(order.createdAt)}</Text>
        </View>

        {/* Customer Details */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Customer Details</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.subtext }]}>Name:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{order.customer?.name || 'Guest'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.subtext }]}>Phone:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{order.customer?.phone || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.subtext }]}>Address:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>
              {typeof order.deliveryAddress === 'string' ? order.deliveryAddress : `${order.deliveryAddress?.street}, ${order.deliveryAddress?.city}`}
            </Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Order Items</Text>
          {order.items?.map((item, index) => (
            <View key={index} style={[styles.itemRow, { borderBottomColor: theme.border }]}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.itemQuantity, { color: theme.subtext }]}>Qty: {item.quantity}</Text>
              </View>
              <Text style={[styles.itemPrice, { color: theme.text }]}>{formatCurrency((item.price || 0) * item.quantity)}</Text>
            </View>
          ))}
        </View>

        {/* Payment Details */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Payment Details</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.subtext }]}>Method:</Text>
            <Text style={[styles.infoValue, { color: theme.text }]}>{order.paymentMethod}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>Total:</Text>
            <Text style={[styles.totalValue, { color: theme.primary }]}>{formatCurrency(order.totalAmount)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {actions.length > 0 && (
          <View style={styles.actionsSection}>
            {actions.map((action, index) => (
              <CustomButton
                key={index}
                title={action.label}
                onPress={() => handleStatusUpdate(action.status)}
                variant={action.variant}
                loading={updating}
                style={styles.actionButton}
              />
            ))}
          </View>
        )}

        {order.status === 'ready' && (
          <View style={[styles.readyBanner, { backgroundColor: isDarkMode ? 'rgba(34, 197, 94, 0.15)' : '#DCFCE7' }]}>
            <Text style={[styles.readyText, { color: isDarkMode ? theme.success : '#16A34A' }]}>✅ Order is Ready</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  header: {
    padding: 16,
    paddingTop: 60, // status bar space
    marginBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)'
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  orderTime: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)'
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionsSection: {
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
  readyBanner: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  readyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteBtn: {
    padding: 8
  }
});

export default OrderDetailsScreen;
