import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ROUTES } from '../../../constants';
import { useTheme } from '../../../hooks/useTheme';
import { useCartStore } from '../../../store';
import { orderService } from '../../../services/api';

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, isDark } = useTheme();
  const { clearCart } = useCartStore();
  const { orderData } = route.params || {};

  const [selectedMethod, setSelectedMethod] = useState('gpay');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!orderData) {
      Alert.alert('Error', 'Order data not found.');
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // In a real app, we would process payment here based on selectedMethod
      // For this mock, we assume payment is successful and place the order

      const finalOrderData = {
        ...orderData,
        paymentMethod: selectedMethod.toUpperCase(),
        isPaid: true, // Mark as paid since we simulate success
      };

      await orderService.placeOrder(finalOrderData);

      Alert.alert(
        'Order Placed!',
        'Your order has been successfully placed. The restaurant has been notified.',
        [
          {
            text: 'View Orders',
            onPress: () => {
              clearCart();
              // Navigate to Orders tab (which is a stack)
              // We need to navigate to the Tab Navigator first, then the specific tab
              navigation.navigate(ROUTES.MAIN, {
                screen: ROUTES.ORDERS,
                params: {
                  screen: ROUTES.ORDERS_LIST
                }
              });
            },
          },
          {
            text: 'Home',
            onPress: () => {
              clearCart();
              navigation.navigate(ROUTES.MAIN, { screen: ROUTES.HOME });
            },
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('Payment Error:', error);
      Alert.alert('Payment Failed', error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const PaymentOption = ({ id, title, iconName, iconType = 'ionicons', subtitle }) => (
    <TouchableOpacity
      style={[
        styles.optionCard,
        {
          backgroundColor: colors.surface,
          borderColor: selectedMethod === id ? colors.primary[500] : colors.border,
          borderWidth: selectedMethod === id ? 2 : 1,
        },
      ]}
      onPress={() => setSelectedMethod(id)}
      activeOpacity={0.7}
    >
      <View style={styles.optionContent}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surfaceHighlight }]}>
          {iconType === 'ionicons' ? (
            <Ionicons name={iconName} size={24} color={selectedMethod === id ? colors.primary[500] : colors.text} />
          ) : (
            <MaterialCommunityIcons name={iconName} size={24} color={selectedMethod === id ? colors.primary[500] : colors.text} />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.optionTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.optionSubtitle, { color: colors.textSub }]}>{subtitle}</Text>}
        </View>
        <View style={[styles.radioButton, { borderColor: selectedMethod === id ? colors.primary[500] : colors.textSub }]}>
          {selectedMethod === id && <View style={[styles.radioButtonInner, { backgroundColor: colors.primary[500] }]} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.surface }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Payment</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.amountContainer}>
          <Text style={[styles.totalLabel, { color: colors.textSub }]}>Total to Pay</Text>
          <Text style={[styles.totalAmount, { color: colors.text }]}>₹{orderData?.totalAmount?.toFixed(2) || '0.00'}</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Methods</Text>

        <PaymentOption
          id="gpay"
          title="Google Pay"
          iconName="google"
          iconType="material"
          subtitle="Faster checkout"
        />

        <PaymentOption
          id="phonepe"
          title="PhonePe"
          iconName="cellphone-sound" // Placeholder or close match
          iconType="material"
          subtitle="UPI Payment"
        />

        <PaymentOption
          id="card"
          title="Credit / Debit Card"
          iconName="card-outline"
          subtitle="Visa, Mastercard, Rupay"
        />

        <PaymentOption
          id="cod"
          title="Cash on Delivery"
          iconName="cash-outline"
          subtitle="Pay significantly on delivery"
        />

      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.payButton, { backgroundColor: colors.primary[500], opacity: isProcessing ? 0.7 : 1 }]}
          onPress={handlePayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.payButtonText}>Pay ₹{orderData?.totalAmount?.toFixed(2)}</Text>
          )}
        </TouchableOpacity>
        <View style={styles.secureContainer}>
          <Ionicons name="shield-checkmark" size={14} color={colors.success || '#10B981'} />
          <Text style={[styles.secureText, { color: colors.textSub }]}>100% Secure Payment</Text>
        </View>
      </View>
    </View>
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
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  optionCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 10,
  },
  payButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  secureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6
  },
  secureText: {
    fontSize: 12,
    fontWeight: '500'
  }
});
