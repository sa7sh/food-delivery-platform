import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ROUTES, ORDER_STATUS } from '../../../constants';
import { useOrdersStore } from '../../../store';
import { useTheme } from '../../../hooks/useTheme';
import OrderCard from '../../orders/components/OrderCard';

export default function OrderHistoryScreen() {
  const navigation = useNavigation();
  const { orders, isLoading, fetchOrders } = useOrdersStore();
  const { colors, isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    await fetchOrders();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleOrderPress = (order) => {
    navigation.navigate(ROUTES.ORDERS, {
      screen: ROUTES.ORDER_DETAIL,
      params: { orderId: order.id },
    });
  };

  const getFilteredOrders = () => {
    switch (selectedFilter) {
      case 'completed':
        return orders.filter((order) => order.status === ORDER_STATUS.DELIVERED);
      case 'cancelled':
        return orders.filter((order) => order.status === ORDER_STATUS.CANCELLED);
      case 'pending':
        return orders.filter(
          (order) =>
            order.status !== ORDER_STATUS.DELIVERED &&
            order.status !== ORDER_STATUS.CANCELLED
        );
      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  // Calculate statistics
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === ORDER_STATUS.DELIVERED).length;
  const cancelledOrders = orders.filter((o) => o.status === ORDER_STATUS.CANCELLED).length;
  const totalSpent = orders
    .filter((o) => o.status === ORDER_STATUS.DELIVERED)
    .reduce((sum, order) => sum + order.total, 0);

  const renderStatistics = () => (
    <View style={[styles.statsContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <View style={[styles.statCard, { backgroundColor: colors.surfaceHighlight }]}>
        <Text style={[styles.statValue, { color: colors.primary[500] }]}>{totalOrders}</Text>
        <Text style={[styles.statLabel, { color: colors.textSub }]}>Total Orders</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: colors.surfaceHighlight }]}>
        <Text style={[styles.statValue, { color: colors.primary[500] }]}>{completedOrders}</Text>
        <Text style={[styles.statLabel, { color: colors.textSub }]}>Completed</Text>
      </View>
      <View style={[styles.statCard, { backgroundColor: colors.surfaceHighlight }]}>
        <Text style={[styles.statValue, { color: colors.primary[500] }]}>₹{totalSpent.toFixed(0)}</Text>
        <Text style={[styles.statLabel, { color: colors.textSub }]}>Total Spent</Text>
      </View>
    </View>
  );

  const renderFilterTabs = () => (
    <View style={[styles.filterContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      <TouchableOpacity
        style={[
          styles.filterTab,
          { backgroundColor: colors.surfaceHighlight },
          selectedFilter === 'all' && { backgroundColor: colors.primary[100] },
        ]}
        onPress={() => setSelectedFilter('all')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.filterText,
            { color: colors.textSub },
            selectedFilter === 'all' && { color: colors.primary[500] },
          ]}
        >
          All ({orders.length})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterTab,
          { backgroundColor: colors.surfaceHighlight },
          selectedFilter === 'completed' && { backgroundColor: colors.primary[100] },
        ]}
        onPress={() => setSelectedFilter('completed')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.filterText,
            { color: colors.textSub },
            selectedFilter === 'completed' && { color: colors.primary[500] },
          ]}
        >
          Completed ({completedOrders})
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterTab,
          { backgroundColor: colors.surfaceHighlight },
          selectedFilter === 'pending' && { backgroundColor: colors.primary[100] },
        ]}
        onPress={() => setSelectedFilter('pending')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.filterText,
            { color: colors.textSub },
            selectedFilter === 'pending' && { color: colors.primary[500] },
          ]}
        >
          Pending
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterTab,
          { backgroundColor: colors.surfaceHighlight },
          selectedFilter === 'cancelled' && { backgroundColor: colors.primary[100] },
        ]}
        onPress={() => setSelectedFilter('cancelled')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.filterText,
            { color: colors.textSub },
            selectedFilter === 'cancelled' && { color: colors.primary[500] },
          ]}
        >
          Cancelled ({cancelledOrders})
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {selectedFilter === 'all'
          ? 'No order history'
          : selectedFilter === 'completed'
            ? 'No completed orders'
            : selectedFilter === 'cancelled'
              ? 'No cancelled orders'
              : 'No pending orders'}
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSub }]}>
        {selectedFilter === 'all'
          ? 'Your past orders will appear here'
          : 'No orders found in this category'}
      </Text>
      {selectedFilter === 'all' && (
        <TouchableOpacity
          style={[styles.browseButton, { backgroundColor: colors.primary[500] }]}
          onPress={() => navigation.navigate(ROUTES.HOME)}
          activeOpacity={0.8}
        >
          <Text style={styles.browseButtonText}>Start Ordering</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isLoading && orders.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.surface }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
        <Text style={[styles.loadingText, { color: colors.textSub }]}>Loading order history...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: colors.surfaceHighlight }]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Order History</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          filteredOrders.length === 0 && styles.listContentEmpty,
        ]}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={() => handleOrderPress(item)} />
        )}
        ListHeaderComponent={
          orders.length > 0 ? (
            <>
              {renderStatistics()}
              {renderFilterTabs()}
            </>
          ) : null
        }
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});