export { ROUTES } from './routes';
export { MESSAGES } from './messages';

export const ORDER_STATUS = {
  PLACED: 'pending',
  CONFIRMED: 'accepted',
  PREPARING: 'preparing',
  READY: 'ready',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'completed',
  CANCELLED: 'cancelled',
};


export const API_ENDPOINTS = {
  // Auth (→ Auth Service via /api/auth)
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP: '/auth/verify-otp',
  FORGOT_PASSWORD: '/auth/forgot-password',
  VERIFY_RESET_OTP: '/auth/verify-reset-otp',
  RESET_PASSWORD: '/auth/reset-password',
  DELETE_ACCOUNT: '/auth/delete-account',
  LOGOUT: '/auth/logout',

  // Profile (→ Auth Service)
  PROFILE: '/auth/profile',
  ADDRESSES: '/auth/addresses',

  // Restaurants (→ Restaurant Service via /api/restaurant)
  RESTAURANTS: '/restaurant/public',
  RESTAURANT_DETAIL: '/restaurant/public/:id',

  // Foods (→ Restaurant Service via /api/foods)
  FOODS: '/foods/restaurant/:id',

  // Cart
  CART: '/cart',

  // Orders (→ Order Service via /api/orders)
  ORDERS: '/orders/customer',
  ORDER_DETAIL: '/orders/customer/:id',
  PLACE_ORDER: '/orders/customer/',
  CANCEL_ORDER: '/orders/:id/cancel',
};