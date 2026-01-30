import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme';

export default function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  const {
    name,
    image,
    price,
    quantity,
    isVeg,
    selectedCustomizations = [],
  } = item;

  const itemTotal = price * quantity;
  const customizationsTotal = selectedCustomizations.reduce(
    (sum, cust) => sum + cust.price,
    0
  ) * quantity;
  const totalPrice = itemTotal + customizationsTotal;

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Veg/Non-Veg Indicator */}
        <View style={[styles.vegBadge, !isVeg && styles.nonVegBadge]}>
          <View style={[styles.vegDot, !isVeg && styles.nonVegDot]} />
        </View>

        {/* Item Info */}
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          
          {/* Customizations */}
          {selectedCustomizations.length > 0 && (
            <View style={styles.customizations}>
              {selectedCustomizations.map((cust, index) => (
                <Text key={index} style={styles.customizationText}>
                  + {cust.name} (₹{cust.price})
                </Text>
              ))}
            </View>
          )}

          <Text style={styles.price}>₹{totalPrice}</Text>
        </View>

        {/* Image */}
        {image ? (
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>🍽️</Text>
          </View>
        )}
      </View>

      {/* Quantity Controls */}
      <View style={styles.controls}>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onDecrement}
            activeOpacity={0.7}
          >
            <Text style={styles.controlText}>−</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantity}>{quantity}</Text>
          
          <TouchableOpacity
            style={styles.controlButton}
            onPress={onIncrement}
            activeOpacity={0.7}
          >
            <Text style={styles.controlText}>+</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onRemove} activeOpacity={0.7}>
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  content: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  vegBadge: {
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: '#10b981',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  nonVegBadge: {
    borderColor: '#dc2626',
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  nonVegDot: {
    backgroundColor: '#dc2626',
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    marginBottom: 4,
  },
  customizations: {
    marginBottom: 4,
  },
  customizationText: {
    fontSize: 12,
    color: colors.gray[500],
    marginBottom: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: colors.gray[900],
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary[600],
    borderRadius: 8,
  },
  controlButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary[600],
  },
  quantity: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.gray[900],
    paddingHorizontal: 16,
  },
  removeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
});