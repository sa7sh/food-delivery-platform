import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getFoodItems,
  addFoodItem,
  updateFoodItem,
  deleteFoodItem,
  toggleFoodAvailability,
} from '../services/api';

const FoodContext = createContext();

export const FoodProvider = ({ children }) => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all food items
  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getFoodItems();
      setFoodItems(response.data);
    } catch (err) {
      console.error('Fetch food items error:', err);
      setError(err.response?.data?.message || 'Failed to fetch food items');
    } finally {
      setLoading(false);
    }
  };

  const { isAuthenticated } = useAuth();

  // Load food items when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchFoodItems();
    } else {
      setFoodItems([]);
    }
  }, [isAuthenticated]);

  // Add new food item
  const addFood = async (foodData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await addFoodItem(foodData);
      setFoodItems([response.data, ...foodItems]);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Add food item error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to add food item';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update existing food item
  const updateFood = async (foodId, foodData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateFoodItem(foodId, foodData);
      setFoodItems(
        foodItems.map((item) =>
          item._id === foodId ? response.data : item
        )
      );
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Update food item error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update food item';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Delete food item
  const deleteFood = async (foodId) => {
    try {
      setLoading(true);
      setError(null);
      await deleteFoodItem(foodId);
      setFoodItems(foodItems.filter((item) => item._id !== foodId));
      return { success: true };
    } catch (err) {
      console.error('Delete food item error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to delete food item';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Toggle food availability
  const toggleAvailability = async (foodId, isAvailable) => {
    try {
      const response = await toggleFoodAvailability(foodId, isAvailable);
      setFoodItems(
        foodItems.map((item) =>
          item._id === foodId ? { ...item, isAvailable } : item
        )
      );
      return { success: true };
    } catch (err) {
      console.error('Toggle availability error:', err);
      return { success: false, error: 'Failed to update availability' };
    }
  };

  const value = {
    foodItems,
    loading,
    error,
    fetchFoodItems,
    addFood,
    updateFood,
    deleteFood,
    toggleAvailability,
  };

  return <FoodContext.Provider value={value}>{children}</FoodContext.Provider>;
};

export const useFood = () => {
  const context = useContext(FoodContext);
  if (!context) {
    throw new Error('useFood must be used within FoodProvider');
  }
  return context;
};
