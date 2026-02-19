import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ORDER_STATUS } from '../../../constants';
import { useTheme } from '../../../hooks/useTheme';

export default function OrderStatusTimeline({ currentStatus }) {
  const { colors, isDark } = useTheme();

  // Defensive check
  const status = currentStatus || 'UNKNOWN';

  const getStepStatus = (stepStatus) => {
    const steps = [
      ORDER_STATUS.PLACED,
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PREPARING,
      ORDER_STATUS.READY,
      ORDER_STATUS.OUT_FOR_DELIVERY,
      ORDER_STATUS.DELIVERED,
    ];

    const currentIndex = steps.indexOf(status);
    const stepIndex = steps.indexOf(stepStatus);

    if (status === ORDER_STATUS.CANCELLED) return 'cancelled';
    if (currentIndex >= stepIndex) return 'completed';
    return 'pending';
  };

  const statuses = [
    { key: ORDER_STATUS.PLACED, label: 'Order Placed', icon: '📝' },
    { key: ORDER_STATUS.CONFIRMED, label: 'Confirmed', icon: '✅' },
    { key: ORDER_STATUS.PREPARING, label: 'Preparing', icon: '👨‍🍳' },
    { key: ORDER_STATUS.READY, label: 'Order Ready', icon: '🛍️' },
    { key: ORDER_STATUS.OUT_FOR_DELIVERY, label: 'Out for Delivery', icon: '🚴' },
    { key: ORDER_STATUS.DELIVERED, label: 'Delivered', icon: '✨' },
  ];

  const getCurrentIndex = () => {
    return statuses.findIndex((s) => s.key === currentStatus);
  };

  const currentIndex = getCurrentIndex();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? 'transparent' : colors.surface }]}>
      {statuses.map((status, index) => {
        const isCompleted = index <= currentIndex;
        const isActive = index === currentIndex;

        return (
          <View key={status.key} style={styles.statusItem}>
            {/* Timeline Line */}
            {index > 0 && (
              <View
                style={[
                  styles.line,
                  { backgroundColor: isCompleted ? colors.success : (isDark ? colors.border : '#E5E7EB') },
                ]}
              />
            )}

            {/* Status Circle */}
            <View
              style={[
                styles.circle,
                {
                  backgroundColor: isDark ? colors.surfaceHighlight : '#F3F4F6',
                  borderColor: isDark ? colors.border : '#E5E7EB'
                },
                isCompleted && {
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : '#d1fae5',
                  borderColor: colors.success
                },
                isActive && {
                  backgroundColor: isDark ? 'rgba(249, 115, 22, 0.2)' : '#fff7ed',
                  borderColor: colors.primary[600],
                  shadowColor: colors.primary[600]
                },
              ]}
            >
              <Text style={styles.icon}>{status.icon}</Text>
            </View>

            {/* Status Label */}
            <Text
              style={[
                styles.label,
                { color: colors.textSub },
                isCompleted && { color: colors.text, fontWeight: '700' },
              ]}
            >
              {status.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 12,
  },
  statusItem: {
    paddingLeft: 50,
    paddingBottom: 30,
    minHeight: 60,
  },
  line: {
    position: 'absolute',
    left: 19,
    top: -30,
    width: 2,
    height: 46, // Connects circles
    zIndex: -1,
  },
  circle: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: 14,
    marginTop: 8,
  },
});