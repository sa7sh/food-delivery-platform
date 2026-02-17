import { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import EmptyState from '../components/EmptyState.js';
import FoodCard from '../components/FoodCard.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import { useFood } from '../context/FoodContext.js';
import { useTheme } from '../context/ThemeContext.js';

const FoodItemsScreen = ({ navigation }) => {
  const { foodItems, loading, fetchFoodItems, toggleAvailability } = useFood();
  const { theme } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFoodItems();
    setRefreshing(false);
  };

  const handleEdit = (food) => {
    navigation.navigate('EditFood', { foodItem: food });
  };

  const handleToggleAvailability = async (foodId, isAvailable) => {
    await toggleAvailability(foodId, isAvailable);
  };

  const handleAddFood = () => {
    navigation.navigate('AddFood');
  };

  if (loading && foodItems.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={foodItems}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <FoodCard
            food={item}
            onEdit={handleEdit}
            onToggleAvailability={handleToggleAvailability}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="🍽️"
            title="No Food Items"
            message="Start by adding your first food item"
            actionText="Add Food Item"
            onAction={handleAddFood}
          />
        }
        contentContainerStyle={
          foodItems.length === 0 ? styles.emptyContainer : styles.listContent
        }
      />

      {/* Floating Add Button - Always Visible */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={handleAddFood}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});

export default FoodItemsScreen;
