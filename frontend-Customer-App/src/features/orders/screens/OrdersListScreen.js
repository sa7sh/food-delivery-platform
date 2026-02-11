import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ROUTES, ORDER_STATUS } from '../../../constants';
import { useOrdersStore, useCartStore } from '../../../store';
import { useTheme } from '../../../hooks/useTheme';

// Components
import OrderCard from '../components/OrderCard';

export default function OrdersListScreen() {
  const navigation = useNavigation();
  const { orders, isLoading, fetchOrders } = useOrdersStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const { colors, isDark } = useTheme();

  useEffect(() => {
    loadOrders();

    // Poll for order updates every 30 seconds to keep list fresh (reduced from 15s for better performance)
    const interval = setInterval(() => {
      loadOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => { await fetchOrders(); };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const { items: cartItems, setCart, restaurant: cartRestaurant } = useCartStore();

  const handleReorder = (order) => {
    const proceedWithReorder = () => {
      setCart(order.items, {
        id: order.restaurant.id || order.restaurant._id,
        name: order.restaurant.name,
        image: order.restaurant.image
      });
      navigation.navigate(ROUTES.CART_TAB);
    };

    if (cartItems.length > 0 && cartRestaurant?.id !== (order.restaurant.id || order.restaurant._id)) {
      Alert.alert(
        'Replace Cart?',
        `Your cart contains items from ${cartRestaurant.name}. Do you want to discard them and add items from ${order.restaurant.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Yes, Replace', onPress: proceedWithReorder, style: 'destructive' }
        ]
      );
    } else {
      proceedWithReorder();
    }
  };

  const getFilteredOrders = () => {
    if (selectedFilter === 'all') return orders;
    if (selectedFilter === 'ongoing') {
      return orders.filter(o => o.status !== ORDER_STATUS.DELIVERED && o.status !== ORDER_STATUS.CANCELLED);
    }
    return orders.filter(o => o.status === ORDER_STATUS.DELIVERED);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceHighlight }]}>
        <Ionicons name="receipt-outline" size={48} color={colors.textSub} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No orders yet</Text>
      <Text style={[styles.emptyText, { color: colors.textSub }]}>Delicious meals you order will appear here for tracking.</Text>
      <TouchableOpacity
        style={[styles.browseButton, { backgroundColor: colors.primary[500] }]}
        onPress={() => navigation.navigate(ROUTES.HOME)}
      >
        <Text style={styles.browseButtonText}>Browse Restaurants</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && orders.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={[styles.headerArea, { backgroundColor: colors.surface, shadowColor: isDark ? '#000' : '#000' }]} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Orders</Text>
        </View>

        <View style={styles.filterContainer}>
          {['all', 'ongoing', 'completed'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterTab,
                {
                  backgroundColor: selectedFilter === filter ? colors.primary[600] : colors.surfaceHighlight,
                  borderColor: selectedFilter === filter ? colors.primary[600] : colors.border
                }
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterText,
                { color: selectedFilter === filter ? '#fff' : colors.textSub }
              ]}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      <FlatList
        data={getFilteredOrders()}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() => navigation.navigate(ROUTES.ORDER_DETAIL, { orderId: item.id })}
            onReorder={() => handleReorder(item)}
          />
        )}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary[600]} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: {
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4
  },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12, // Taller tabs
    borderRadius: 16, // More rounded
    alignItems: 'center',
    borderWidth: 1,
    elevation: 2, // Subtle shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  listContent: {
    padding: 24, // More breathing room
    paddingBottom: 120
  },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, marginTop: 80 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  browseButton: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16 },
  browseButtonText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});