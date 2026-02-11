import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SkeletonLoader } from '../../../components/ui/Loader';
import Card from '../../../components/ui/Card';

export default function RestaurantListSkeleton({ count = 3 }) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} style={styles.card}>
          <SkeletonLoader width="100%" height={160} borderRadius={0} />
          <View style={styles.content}>
            <SkeletonLoader width="60%" height={20} />
            <View style={{ height: 8 }} />
            <SkeletonLoader width="40%" height={16} />
            <View style={{ height: 8 }} />
            <SkeletonLoader width="80%" height={14} />
          </View>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  card: {
    padding: 0,
    marginBottom: 16,
    overflow: 'hidden',
  },
  content: {
    padding: 12,
  },
});