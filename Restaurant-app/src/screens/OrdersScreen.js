import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useOrders } from '../context/OrderContext.js';
import OrderCard from '../components/OrderCard.js';
import EmptyState from '../components/EmptyState.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import { ORDER_STATUSES } from '../constants/mockData.js';
import { useTheme } from '../context/ThemeContext.js';

const OrdersScreen = ({ navigation }) => {
  const { orders, loading, fetchOrders } = useOrders();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // ...

  useFocusEffect(
    React.useCallback(() => {
      fetchOrders();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleOrderPress = (order) => {
    navigation.navigate('OrderDetails', { orderId: order._id });
  };

  // Filter orders based on selected filter
  const filteredOrders = selectedFilter === 'all'
    ? orders
    : orders.filter((order) => order.status === selectedFilter);

  const filters = [
    { key: 'all', label: 'All' },
    { key: ORDER_STATUSES.PENDING, label: 'Pending' },
    { key: ORDER_STATUSES.ACCEPTED, label: 'Accepted' },
    { key: ORDER_STATUSES.PREPARING, label: 'Preparing' },
  ];

  if (loading && orders.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              { backgroundColor: theme.border },
              selectedFilter === filter.key && [styles.filterTabActive, { backgroundColor: theme.primary }],
            ]}
            onPress={() => setSelectedFilter(filter.key)}
          >
            <Text
              style={[
                styles.filterText,
                { color: theme.subtext },
                selectedFilter === filter.key && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={handleOrderPress} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="📦"
            title="No Orders"
            message={
              selectedFilter === 'all'
                ? 'No orders yet. They will appear here when customers place orders.'
                : `No ${selectedFilter} orders at the moment.`
            }
          />
        }
        contentContainerStyle={
          filteredOrders.length === 0 ? styles.emptyContainer : styles.listContent
        }
      />
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterTabActive: {
    backgroundColor: '#9139BA',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6C757D',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
});

export default OrdersScreen;
