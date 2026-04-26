import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const PROMOTIONS = [
  {
    id: '1',
    title: '50% OFF',
    subtitle: 'On your first order',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop',
    color: '#F97316',
  },
  {
    id: '2',
    title: 'FREE DELIVERY',
    subtitle: 'For orders over $20',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
    color: '#10B981',
  },
];

export const PromotionsCarousel = ({ colors, isDark, label, styles }) => {
  return (
    <View style={styles.promoContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.promoScroll}
        decelerationRate="fast"
        snapToInterval={width * 0.9}
        snapToAlignment="start"
      >
        {PROMOTIONS.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.9}
            style={[styles.promoCard, { backgroundColor: colors.surface }]}
            onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon!')}
          >
            <Image source={{ uri: item.image }} style={styles.promoImg} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.promoGradient}
            />
            <View style={styles.promoContent}>
              <View style={[styles.promoTag, { backgroundColor: item.color }]}>
                <Text style={styles.promoTagText}>{label || 'LIMITED OFFER'}</Text>
              </View>
              <Text style={styles.promoTitle}>{item.title}</Text>
              <Text style={styles.promoSubtitle}>{item.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
