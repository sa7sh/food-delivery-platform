import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator, Animated, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';

export default function ReviewModal({ visible, onClose, onSubmit, isSubmitting, orderItems = [] }) {
  const { colors, isDark } = useTheme();
  const [step, setStep] = useState(1); // 1 = Restaurant, 2 = Food Items

  // Restaurant rating
  const [restaurantRating, setRestaurantRating] = useState(0);
  const [restaurantComment, setRestaurantComment] = useState('');

  // Food item ratings
  const [foodItemRatings, setFoodItemRatings] = useState({});
  const [foodItemComments, setFoodItemComments] = useState({});

  const [scale] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else {
      scale.setValue(0);
      // Reset on close
      setStep(1);
      setRestaurantRating(0);
      setRestaurantComment('');
      setFoodItemRatings({});
      setFoodItemComments({});
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (step === 1) {
      // Move to food items step
      setStep(2);
    } else {
      // Submit all reviews
      const foodItemReviews = orderItems.map(item => ({
        foodItemId: item.foodId || item._id,
        rating: foodItemRatings[item.foodId || item._id] || 0,
        comment: foodItemComments[item.foodId || item._id] || '',
      })).filter(review => review.rating > 0); // Only include rated items

      await onSubmit({
        restaurantRating,
        restaurantComment,
        foodItemReviews,
      });
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const renderStars = (rating, setRating) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={32}
              color={star <= rating ? "#F59E0B" : colors.border}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderRestaurantStep = () => (
    <>
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: `${colors.primary[500]}20` }]}>
          <Ionicons name="restaurant" size={32} color={colors.primary[500]} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          Rate Restaurant
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSub }]}>
          How was the service and delivery?
        </Text>
      </View>

      {renderStars(restaurantRating, setRestaurantRating)}

      <View style={[styles.inputContainer, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
        <TextInput
          multiline
          placeholder="Leave a comment (optional)..."
          placeholderTextColor={colors.textSub}
          value={restaurantComment}
          onChangeText={setRestaurantComment}
          style={[styles.textInput, { color: colors.text }]}
          textAlignVertical="top"
          maxLength={500}
        />
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={restaurantRating === 0}
          style={[
            styles.submitButton,
            { backgroundColor: restaurantRating === 0 ? colors.border : colors.primary[600] }
          ]}
        >
          <Text style={[styles.submitButtonText, { color: restaurantRating === 0 ? colors.textSub : '#fff' }]}>
            Next: Rate Food Items
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onClose}
          style={styles.cancelButton}
        >
          <Text style={[styles.cancelButtonText, { color: colors.textSub }]}>Maybe Later</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderFoodItemsStep = () => (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={[styles.iconCircle, { backgroundColor: `${colors.primary[500]}20` }]}>
          <Ionicons name="fast-food" size={32} color={colors.primary[500]} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          Rate Food Items
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSub }]}>
          How was the taste and quality?
        </Text>
      </View>

      <ScrollView style={styles.foodItemsScroll} showsVerticalScrollIndicator={false}>
        {orderItems.map((item) => {
          const itemId = item.foodId || item._id;
          return (
            <View key={itemId} style={[styles.foodItemCard, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
              <View style={styles.foodItemHeader}>
                {item.image && (
                  <Image source={{ uri: item.image }} style={styles.foodItemImage} />
                )}
                <View style={styles.foodItemInfo}>
                  <Text style={[styles.foodItemName, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[styles.foodItemQty, { color: colors.textSub }]}>Qty: {item.quantity}</Text>
                </View>
              </View>

              <View style={styles.foodItemStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setFoodItemRatings(prev => ({ ...prev, [itemId]: star }))}
                    style={styles.smallStarButton}
                  >
                    <Ionicons
                      name={star <= (foodItemRatings[itemId] || 0) ? "star" : "star-outline"}
                      size={24}
                      color={star <= (foodItemRatings[itemId] || 0) ? "#F59E0B" : colors.border}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                placeholder="Comment (optional)..."
                placeholderTextColor={colors.textSub}
                value={foodItemComments[itemId] || ''}
                onChangeText={(text) => setFoodItemComments(prev => ({ ...prev, [itemId]: text }))}
                style={[styles.foodItemComment, { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border }]}
                maxLength={200}
              />
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={[
            styles.submitButton,
            { backgroundColor: colors.primary[600] }
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={[styles.submitButtonText, { color: '#fff' }]}>
              Submit Reviews
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleBack}
          disabled={isSubmitting}
          style={styles.cancelButton}
        >
          <Text style={[styles.cancelButtonText, { color: colors.textSub }]}>Back</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ scale }], backgroundColor: colors.surface }
          ]}
        >
          {step === 1 ? renderRestaurantStep() : renderFoodItemsStep()}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 450,
    maxHeight: '90%',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    padding: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 16,
  },
  starButton: {
    padding: 4,
  },
  smallStarButton: {
    padding: 2,
  },
  inputContainer: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 24,
    borderWidth: 1,
  },
  textInput: {
    height: 96,
    fontSize: 15,
  },
  buttonsContainer: {
    gap: 12,
  },
  submitButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  submitButtonText: {
    fontWeight: '700',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontWeight: '600',
    fontSize: 14,
  },
  foodItemsScroll: {
    maxHeight: 400,
    marginBottom: 16,
  },
  foodItemCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  foodItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  foodItemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  foodItemInfo: {
    flex: 1,
  },
  foodItemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  foodItemQty: {
    fontSize: 12,
    marginTop: 2,
  },
  foodItemStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 8,
  },
  foodItemComment: {
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    borderWidth: 1,
  },
});
