export { ROUTES } from './routes';
export { MESSAGES } from './messages';

export const ORDER_STATUS = {
  PLACED: 'PLACED',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  VERIFY_OTP: '/auth/verify-otp',
  FORGOT_PASSWORD: '/auth/forgot-password',
  DELETE_ACCOUNT: '/auth/delete-account',

  // Restaurant
  RESTAURANTS: '/restaurants',
  RESTAURANT_DETAIL: '/restaurants/:id',

  // Cart
  CART: '/cart',

  // Orders
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',

  // User
  PROFILE: '/user/profile',
  ADDRESSES: '/user/addresses',
};