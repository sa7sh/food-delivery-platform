// Stub for socketService to allow the service to start
export const initSocketService = (io) => {};

export const socketService = {
  notifyRestaurantNewOrder: (restaurantId, order) => {},
  notifyCustomerStatusUpdate: (customerId, order) => {},
  notifyDeliveryPartnersReady: (order) => {},
  notifyRestaurantDriverAccepted: (restaurantId, order) => {},
  notifyRestaurantOrderUpdated: (restaurantId, order) => {},
};
