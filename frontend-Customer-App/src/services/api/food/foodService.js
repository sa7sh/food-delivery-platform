import httpClient from '../httpClient';

/**
 * Food Service
 * Handles all food-related API calls for the Customer App
 */

/**
 * Get all available food items
 * @returns {Promise<Array>} Array of food items
 */
export const getAllFoods = async () => {
  try {
    const response = await httpClient.get('/foods');
    return response;
  } catch (error) {
    console.error('Get all foods error:', error);
    throw error;
  }
};

/**
 * Get latest food items (for home screen)
 * @param {number} limit - Number of items to fetch (default: 10)
 * @returns {Promise<Array>} Array of latest food items
 */
export const getLatestFoods = async (limit = 10) => {
  try {
    const response = await httpClient.get('/foods/latest', {
      params: { limit }
    });
    return response;
  } catch (error) {
    console.error('Get latest foods error:', error);
    throw error;
  }
};

/**
 * Search food items by query and filters
 * @param {string|Object} queryOrParams - Search query string or params object
 * @returns {Promise<Array>} Array of matching food items
 */
export const searchFoods = async (queryOrParams) => {
  try {
    // Support both old (string) and new (object) parameter formats
    const params = typeof queryOrParams === 'string'
      ? { query: queryOrParams }
      : queryOrParams;

    const response = await httpClient.get('/foods/search', { params });
    return response;
  } catch (error) {
    console.error('Search foods error:', error);
    throw error;
  }
};

/**
 * Get food item by ID
 * @param {string} id - Food item ID
 * @returns {Promise<Object>} Food item details
 */
export const getFoodById = async (id) => {
  try {
    const response = await httpClient.get(`/foods/${id}`);
    return response;
  } catch (error) {
    console.error('Get food by ID error:', error);
    throw error;
  }
};

/**
 * Get food items by restaurant ID
 * @param {string} restaurantId - Restaurant ID
 * @returns {Promise<Array>} Array of food items for the restaurant
 */
export const getFoodsByRestaurant = async (restaurantId) => {
  try {
    const response = await httpClient.get(`/foods/restaurant/${restaurantId}`);
    return response;
  } catch (error) {
    console.error('Get foods by restaurant error:', error);
    throw error;
  }
};

// Export as named exports
export const foodService = {
  getAllFoods,
  getLatestFoods,
  searchFoods,
  getFoodById,
  getFoodsByRestaurant,
};
