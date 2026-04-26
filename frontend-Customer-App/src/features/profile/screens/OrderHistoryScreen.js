import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ROUTES, ORDER_STATUS } from '../../../constants';
import { useOrdersStore } from '../../../store';
import { useTheme } from '../../../hooks/useTheme';
import OrderCard from '../../orders/components/OrderCard';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'pending', label: 'Pending' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function OrderHistoryScreen() {
  const navigation = useNavigation();
  const { orders, isLoading, fetchOrders } = useOrdersStore();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  }, [fetchOrders]);

  const handleOrderPress = useCallback((order) => {
    navigation.navigate(ROUTES.ORDERS, {
      screen: ROUTES.ORDER_DETAIL,
      params: { orderId: order.id },
    });
  }, [navigation]);

  // Stats — computed once
  const stats = useMemo(() => {
    const completed = orders.filter((o) => o.status === ORDER_STATUS.DELIVERED);
    const cancelled = orders.filter((o) => o.status === ORDER_STATUS.CANCELLED);
    return {
      total: orders.length,
      completed: completed.length,
      cancelled: cancelled.length,
      totalSpent: completed.reduce((sum, o) => sum + (o.total || 0), 0),
    };
  }, [orders]);

  // Filtered list — only recomputes when filter or orders change
  const filteredOrders = useMemo(() => {
    switch (selectedFilter) {
      case 'completed':
        return orders.filter((o) => o.status === ORDER_STATUS.DELIVERED);
      case 'cancelled':
        return orders.filter((o) => o.status === ORDER_STATUS.CANCELLED);
      case 'pending':
        return orders.filter(
          (o) => o.status !== ORDER_STATUS.DELIVERED && o.status !== ORDER_STATUS.CANCELLED
        );
      default:
        return orders;
    }
  }, [orders, selectedFilter]);

  const getFilterCount = useCallback((key) => {
    switch (key) {
      case 'completed': return stats.completed;
      case 'cancelled': return stats.cancelled;
      case 'pending': return orders.length - stats.completed - stats.cancelled;
      default: return stats.total;
    }
  }, [stats, orders]);

  const ListHeader = useMemo(() => (
    <>
      {/* Stats */}
      <View style={[styles.statsContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.statCard, { backgroundColor: colors.surfaceHighlight }]}>
          <Text style={[styles.statValue, { color: colors.primary[500] }]}>{stats.total}</Text>
          <Text style={[styles.statLabel, { color: colors.textSub }]}>Total Orders</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surfaceHighlight }]}>
          <Text style={[styles.statValue, { color: colors.primary[500] }]}>{stats.completed}</Text>
          <Text style={[styles.statLabel, { color: colors.textSub }]}>Completed</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surfaceHighlight }]}>
          <Text style={[styles.statValue, { color: colors.primary[500] }]}>₹{stats.totalSpent.toFixed(0)}</Text>
          <Text style={[styles.statLabel, { color: colors.textSub }]}>Total Spent</Text>
        </View>
      </View>

      {/* Filter Tabs — horizontal scroll so text never wraps */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.filterContainer, { borderBottomColor: colors.border }]}
        style={{ backgroundColor: colors.surface }}
      >
        {FILTERS.map((f) => {
          const isActive = selectedFilter === f.key;
          const count = getFilterCount(f.key);
          return (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterTab,
                { backgroundColor: isActive ? colors.primary[500] : colors.surfaceHighlight },
              ]}
              onPress={() => setSelectedFilter(f.key)}
              activeOpacity={0.75}
            >
              <Text
                numberOfLines={1}
                style={[
                  styles.filterText,
                  { color: isActive ? '#fff' : colors.textSub },
                ]}
              >
                {f.label}
              </Text>
              <View style={[styles.countBadge, { backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : colors.border }]}>
                <Text style={[styles.countText, { color: isActive ? '#fff' : colors.textSub }]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </>
  ), [stats, selectedFilter, colors, getFilterCount]);

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📦</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        {selectedFilter === 'all'
          ? 'No order history'
          : `No ${selectedFilter} orders`}
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
        ListHeaderComponent={orders.length > 0 ? ListHeader : null}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
          />
        }
        removeClippedSubviews
        maxToRenderPerBatch={8}
        windowSize={10}
        initialNumToRender={6}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  placeholder: { width: 40 },

  // ─── Stats ────────────────────────────────────────────────
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  statCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  // ─── Filter Tabs ──────────────────────────────────────────
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  countText: { fontSize: 11, fontWeight: '700' },

  // ─── List ────────────────────────────────────────────────
  listContent: { padding: 16 },
  listContentEmpty: { flexGrow: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 14, marginTop: 12 },

  // ─── Empty ───────────────────────────────────────────────
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIcon: { fontSize: 80, marginBottom: 24 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  browseButton: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 10 },
  browseButtonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});