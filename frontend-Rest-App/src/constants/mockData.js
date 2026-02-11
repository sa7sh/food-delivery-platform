// Mock Data for Development
// These structures match the expected backend API responses

export const MOCK_DATA = {
  // Login Response
  LOGIN_RESPONSE: {
    token: 'mock_jwt_token_12345',
    restaurant: {
      _id: 'rest_001',
      name: 'Tasty Bites Restaurant',
      email: 'tastybites@restaurant.com',
      phone: '+91 98765 43210',
      address: '123 Food Street, Mumbai, Maharashtra 400001',
      cuisineType: 'Indian, Chinese, Continental',
      isOpen: true,
      createdAt: '2024-01-15T10:00:00.000Z',
    },
  },

  // Restaurant Profile
  RESTAURANT_PROFILE: {
    _id: 'rest_001',
    name: 'Tasty Bites Restaurant',
    email: 'tastybites@restaurant.com',
    phone: '+91 98765 43210',
    address: '123 Food Street, Mumbai, Maharashtra 400001',
    cuisineType: 'Indian, Chinese, Continental',
    isOpen: true,
    rating: 4.5,
    totalOrders: 1250,
    createdAt: '2024-01-15T10:00:00.000Z',
  },

  // Food Items
  FOOD_ITEMS: [
    {
      _id: 'food_001',
      name: 'Butter Chicken',
      description: 'Creamy tomato-based curry with tender chicken pieces',
      price: 320,
      category: 'Main Course',
      imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
      isAvailable: true,
      restaurantId: 'rest_001',
      createdAt: '2024-01-20T10:00:00.000Z',
    },
    {
      _id: 'food_002',
      name: 'Margherita Pizza',
      description: 'Classic pizza with mozzarella cheese and fresh basil',
      price: 280,
      category: 'Pizza',
      imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
      isAvailable: true,
      restaurantId: 'rest_001',
      createdAt: '2024-01-20T11:00:00.000Z',
    },
    {
      _id: 'food_003',
      name: 'Veg Biryani',
      description: 'Aromatic basmati rice with mixed vegetables and spices',
      price: 220,
      category: 'Rice',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
      isAvailable: false,
      restaurantId: 'rest_001',
      createdAt: '2024-01-20T12:00:00.000Z',
    },
    {
      _id: 'food_004',
      name: 'Chicken Momos',
      description: 'Steamed dumplings filled with seasoned chicken',
      price: 150,
      category: 'Starters',
      imageUrl: 'https://images.unsplash.com/photo-1626776876729-bab4b1c9c164?w=400',
      isAvailable: true,
      restaurantId: 'rest_001',
      createdAt: '2024-01-20T13:00:00.000Z',
    },
    {
      _id: 'food_005',
      name: 'Paneer Tikka',
      description: 'Grilled cottage cheese with aromatic spices',
      price: 240,
      category: 'Starters',
      imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400',
      isAvailable: true,
      restaurantId: 'rest_001',
      createdAt: '2024-01-20T14:00:00.000Z',
    },
  ],

  // Orders
  ORDERS: [
    {
      _id: 'order_001',
      orderNumber: '#ORD1001',
      items: [
        {
          foodId: 'food_001',
          name: 'Butter Chicken',
          quantity: 2,
          price: 320,
          total: 640,
        },
        {
          foodId: 'food_004',
          name: 'Chicken Momos',
          quantity: 1,
          price: 150,
          total: 150,
        },
      ],
      totalAmount: 790,
      status: 'pending', // pending, accepted, preparing, ready, completed, cancelled
      customer: {
        name: 'Rahul Sharma',
        phone: '+91 98765 12345',
      },
      deliveryAddress: '456 Park Avenue, Andheri West, Mumbai 400058',
      paymentMethod: 'Online',
      paymentStatus: 'Paid',
      restaurantId: 'rest_001',
      createdAt: new Date().toISOString(),
    },
    {
      _id: 'order_002',
      orderNumber: '#ORD1002',
      items: [
        {
          foodId: 'food_002',
          name: 'Margherita Pizza',
          quantity: 1,
          price: 280,
          total: 280,
        },
      ],
      totalAmount: 280,
      status: 'accepted',
      customer: {
        name: 'Priya Patel',
        phone: '+91 98765 54321',
      },
      deliveryAddress: '789 Marine Drive, Mumbai 400020',
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      restaurantId: 'rest_001',
      createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    },
    {
      _id: 'order_003',
      orderNumber: '#ORD1003',
      items: [
        {
          foodId: 'food_005',
          name: 'Paneer Tikka',
          quantity: 2,
          price: 240,
          total: 480,
        },
        {
          foodId: 'food_004',
          name: 'Chicken Momos',
          quantity: 2,
          price: 150,
          total: 300,
        },
      ],
      totalAmount: 780,
      status: 'preparing',
      customer: {
        name: 'Amit Kumar',
        phone: '+91 98765 67890',
      },
      deliveryAddress: '321 Link Road, Bandra West, Mumbai 400050',
      paymentMethod: 'Online',
      paymentStatus: 'Paid',
      restaurantId: 'rest_001',
      createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    },
  ],
};

// Food Categories
export const FOOD_CATEGORIES = [
  'Starters',
  'Main Course',
  'Rice',
  'Breads',
  'Pizza',
  'Pasta',
  'Desserts',
  'Beverages',
  'Chinese',
  'Indian',
  'Continental',
];

// Order Status Options
export const ORDER_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Status Colors
export const STATUS_COLORS = {
  pending: '#FFA500',
  accepted: '#2196F3',
  preparing: '#9C27B0',
  ready: '#4CAF50',
  completed: '#757575',
  cancelled: '#F44336',
};