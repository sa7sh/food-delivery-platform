import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ROUTES } from '../../../constants';
import { useCartStore, useUserStore } from '../../../store';
import { useTheme } from '../../../hooks/useTheme';
import { orderService } from '../../../services/api';

/**
 * SUB-COMPONENT: CartItem
 * High-fidelity list item with quantity controls
 */
const InternalCartItem = ({ item, onIncrement, onDecrement, isLast, colors, isDark }) => (
  <View style={[itemStyles.container, !isLast && { borderBottomWidth: 1, borderBottomColor: colors.surfaceHighlight }]}>
    <Image source={{ uri: item.image }} style={itemStyles.image} />
    <View style={itemStyles.details}>
      <Text style={[itemStyles.name, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
      <Text style={[itemStyles.price, { color: colors.primary[500] }]}>₹{item.price}</Text>
    </View>
    <View style={[itemStyles.quantityContainer, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
      <TouchableOpacity onPress={onDecrement} style={itemStyles.qtyBtn}>
        <Ionicons name={item.quantity === 1 ? "trash-outline" : "remove"} size={16} color={colors.textSub} />
      </TouchableOpacity>
      <Text style={[itemStyles.quantityText, { color: colors.text }]}>{item.quantity}</Text>
      <TouchableOpacity onPress={onIncrement} style={[itemStyles.qtyBtn, { backgroundColor: colors.primary[500] }]}>
        <Ionicons name="add" size={16} color="#fff" />
      </TouchableOpacity>
    </View>
  </View>
);

/**
 * SUB-COMPONENT: BillDetails
 */
const InternalBillDetails = ({ subtotal, deliveryFee, taxes, total, colors }) => (
  <View style={billStyles.container}>
    <View style={billStyles.row}><Text style={[billStyles.label, { color: colors.textSub }]}>Item Total</Text><Text style={[billStyles.value, { color: colors.text }]}>₹{subtotal.toFixed(2)}</Text></View>
    <View style={billStyles.row}><Text style={[billStyles.label, { color: colors.textSub }]}>Delivery Fee</Text><Text style={[billStyles.value, { color: colors.text }]}>₹{deliveryFee.toFixed(2)}</Text></View>
    <View style={billStyles.row}><Text style={[billStyles.label, { color: colors.textSub }]}>Taxes & Charges</Text><Text style={[billStyles.value, { color: colors.text }]}>₹{taxes.toFixed(2)}</Text></View>
    <View style={[billStyles.divider, { backgroundColor: colors.border }]} />
    <View style={billStyles.row}>
      <Text style={[billStyles.totalLabel, { color: colors.text }]}>To Pay</Text>
      <Text style={[billStyles.totalValue, { color: colors.text }]}>₹{total.toFixed(2)}</Text>
    </View>
  </View>
);

/**
 * MAIN SCREEN: CartScreen
 */
export default function CartScreen() {
  const navigation = useNavigation();
  const { items, restaurant, totalItems, subtotal, deliveryFee, taxes, total, updateItemQuantity, removeItem, clearCart } = useCartStore();
  const { selectedAddress } = useUserStore();
  const { colors, isDark } = useTheme();

  const handleIncrement = (id) => {
    const item = items.find(i => i.cartItemId === id);
    if (item) updateItemQuantity(id, item.quantity + 1);
  };

  const handleDecrement = (id) => {
    const item = items.find(i => i.cartItemId === id);
    if (item?.quantity === 1) {
      Alert.alert('Remove Item', 'Remove this from your cart?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeItem(id) },
      ]);
    } else if (item) {
      updateItemQuantity(id, item.quantity - 1);
    }
  };

  const [isPlacingOrder, setIsPlacingOrder] = React.useState(false);

  const handleCheckout = async () => {
    if (!selectedAddress) {
      Alert.alert('Address Required', 'Please select a delivery address.');
      return;
    }

    const orderData = {
      restaurantId: restaurant.id,
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        foodId: item.id,
        image: item.image || item.imageUrl || 'https://via.placeholder.com/100',
        // Only include foodId if it's a valid MongoDB ObjectId (24 hex chars)
        // This prevents "Cast to ObjectId failed" errors if using mock IDs
        ...(item.id && /^[0-9a-fA-F]{24}$/.test(item.id) ? { foodId: item.id } : {})
      })),
      totalAmount: total,
      deliveryAddress: `${selectedAddress.street}, ${selectedAddress.city}`,
    };

    navigation.navigate(ROUTES.PAYMENT, { orderData });
  };

  if (items.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: colors.surface }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>My Cart</Text>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyIconCircle, { backgroundColor: colors.surfaceHighlight }]}>
            <Ionicons name="cart-outline" size={64} color={colors.icon} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Your cart is empty</Text>
          <Text style={[styles.emptyText, { color: colors.textSub }]}>Add items from restaurants to get started</Text>
          <TouchableOpacity
            style={[styles.browseButton, { backgroundColor: '#9139BA' }]}
            onPress={() => navigation.navigate(ROUTES.HOME)}
          >
            <Text style={styles.browseButtonText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.surface }}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSub }]}>{totalItems} Items from {restaurant?.name}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={clearCart}><Text style={styles.clearText}>Clear</Text></TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Restaurant Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: isDark ? '#000' : '#0F172A' }]}>
          <View style={[styles.restaurantRow, { borderBottomColor: colors.surfaceHighlight }]}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(249,115,22, 0.2)' : '#FFF7ED' }]}><Ionicons name="restaurant" size={18} color={colors.primary[600]} /></View>
            <Text style={[styles.restaurantName, { color: colors.text }]}>{restaurant?.name}</Text>
          </View>
          <View style={styles.itemsWrapper}>
            {items.map((item, index) => (
              <InternalCartItem
                key={item.cartItemId}
                item={item}
                isLast={index === items.length - 1}
                onIncrement={() => handleIncrement(item.cartItemId)}
                onDecrement={() => handleDecrement(item.cartItemId)}
                colors={colors}
                isDark={isDark}
              />
            ))}
          </View>
        </View>

        {/* Delivery Address Card */}
        <Text style={[styles.sectionLabel, { color: colors.textSub }]}>Delivery Location</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: isDark ? '#000' : '#0F172A' }]}>
          <TouchableOpacity
            style={styles.addressContainer}
            onPress={() => navigation.navigate(ROUTES.PROFILE, { screen: ROUTES.SAVED_ADDRESSES })}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceHighlight }]}><Ionicons name="location" size={18} color={colors.icon} /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.addressLabel, { color: colors.text }]}>{selectedAddress ? 'Home' : 'Add Address'}</Text>
              <Text style={[styles.addressSub, { color: colors.textSub }]} numberOfLines={1}>{selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}` : 'Tap to select delivery location'}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textSub} />
          </TouchableOpacity>
        </View>

        {/* Bill Summary Card */}
        <Text style={[styles.sectionLabel, { color: colors.textSub }]}>Bill Summary</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: isDark ? '#000' : '#0F172A' }]}>
          <InternalBillDetails subtotal={subtotal} deliveryFee={deliveryFee} taxes={taxes} total={total} colors={colors} />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Premium Sticky Footer */}
      <View style={[styles.footer, { backgroundColor: colors.surface, shadowColor: isDark ? '#000' : '#000' }]}>
        <View style={styles.footerPriceRow}>
          <View>
            <Text style={[styles.totalPriceLabel, { color: colors.textSub }]}>Total Amount</Text>
            <Text style={[styles.totalPriceValue, { color: colors.text }]}>₹{total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.checkoutButton, { backgroundColor: colors.primary[500], opacity: isPlacingOrder ? 0.7 : 1 }]}
            onPress={handleCheckout}
            disabled={isPlacingOrder}
          >
            <Text style={styles.checkoutText}>{isPlacingOrder ? 'Placing Order...' : 'Place Order'}</Text>
            {!isPlacingOrder && <Ionicons name="arrow-forward" size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 12 },
  clearText: { fontSize: 14, fontWeight: '600', color: '#9139BA' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 150 },
  sectionLabel: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 4, marginTop: 24, marginBottom: 12 },
  card: { borderRadius: 24, padding: 16, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  restaurantRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, borderBottomWidth: 1, paddingBottom: 12 },
  iconCircle: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  restaurantName: { fontSize: 16, fontWeight: '700' },
  addressContainer: { flexDirection: 'row', alignItems: 'center' },
  addressLabel: { fontSize: 15, fontWeight: '700' },
  addressSub: { fontSize: 13, marginTop: 2 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 20, paddingTop: 20, paddingBottom: Platform.OS === 'ios' ? 120 : 104, borderTopLeftRadius: 32, borderTopRightRadius: 32, shadowOpacity: 0.1, shadowRadius: 20, elevation: 25 },
  footerPriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalPriceLabel: { fontSize: 12, fontWeight: '600' },
  totalPriceValue: { fontSize: 24, fontWeight: '900' },
  checkoutButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 18, gap: 8 },
  checkoutText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, marginTop: 80 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 10 },
  emptyText: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  browseButton: { paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16 },
  browseButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

const itemStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  image: { width: 60, height: 60, borderRadius: 12 },
  details: { flex: 1, marginLeft: 12 },
  name: { fontSize: 15, fontWeight: '600' },
  price: { fontSize: 14, fontWeight: '700', marginTop: 2 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 4, borderWidth: 1 },
  qtyBtn: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  quantityText: { marginHorizontal: 8, fontSize: 14, fontWeight: '700' },
});

const billStyles = StyleSheet.create({
  container: { gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 14 },
  value: { fontSize: 14, fontWeight: '600' },
  divider: { height: 1, borderStyle: 'dashed', borderRadius: 1, marginVertical: 8, borderWidth: 0.5 },
  totalLabel: { fontSize: 16, fontWeight: '800' },
  totalValue: { fontSize: 18, fontWeight: '900' },
});