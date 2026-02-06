import httpClient from '../httpClient';

export const reviewService = {
  // Get reviews for a restaurant
  getRestaurantReviews: async (restaurantId) => {
    const response = await httpClient.get(`/reviews/restaurant/${restaurantId}`);
    return response.data;
  },

  // Submit a review for an order
  submitReview: async (reviewData) => {
    const response = await httpClient.post('/reviews', reviewData);
    return response.data;
  },
};
