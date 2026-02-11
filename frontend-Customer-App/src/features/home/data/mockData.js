export const categories = [
  { id: '1', label: 'All', icon: '🍽️' },
  { id: '2', label: 'Pizza', icon: '🍕' },
  { id: '3', label: 'Burger', icon: '🍔' },
  { id: '4', label: 'Chinese', icon: '🥡' },
  { id: '5', label: 'Cake', icon: '🍰' },
  { id: '6', label: 'Biryani', icon: '🍛' },
  { id: '7', label: 'North Indian', icon: '🥘' },
  { id: '8', label: 'South Indian', icon: '🥟' },
  { id: '9', label: 'Pasta', icon: '🍝' },
  { id: '10', label: 'Ice Cream', icon: '🍦' },
];

export const offerChips = [
  { id: '1', label: 'Filters', type: 'filter', icon: 'sliders' },
  { id: '2', label: 'Near & Fast', type: 'sort', icon: 'zap' },
  { id: '3', label: 'Great Offers', type: 'offer', icon: 'percent' },
  { id: '4', label: 'Rating 4.0+', type: 'rating', icon: 'star' },
  { id: '5', label: 'New to you', type: 'discovery', icon: 'sparkles' },
];

export const recommendedFood = [
  {
    id: 'f1',
    name: 'Natural Ice Cream',
    image: 'https://images.unsplash.com/photo-1560008581-09826d1de69e?w=400',
    discount: '10% OFF up to ₹40',
    rating: 4.5,
    time: '15-20 mins',
    type: 'Ice Cream'
  },
  {
    id: 'f2',
    name: 'Oven Story Pizza',
    image: 'https://images.unsplash.com/photo-1593560708920-63984dc86f32?w=400',
    discount: 'Buy 1 get 1 free',
    rating: 3.9,
    time: '25-30 mins',
    type: 'Pizza'
  },
  {
    id: 'f3',
    name: 'Deliure & The Eat',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
    discount: 'FLAT ₹125 OFF',
    rating: 4.5,
    time: '15-20 mins',
    type: 'Dessert'
  },
  {
    id: 'f4',
    name: 'Behrouz Biryani',
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400',
    discount: '60% OFF',
    rating: 4.4,
    time: '30-35 mins',
    type: 'Biryani'
  }
];

export const restaurants = [
  {
    id: 'r1',
    name: 'Pizza Palace',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    rating: 4.3,
    ratingCount: 2340,
    cuisine: ['Pizza', 'Italian', 'Fast Food'],
    deliveryTime: '30-35 mins',
    costForTwo: 400,
    distance: '2.5 km',
    offers: ['50% off up to ₹100'],
    isOpen: true,
  },
  {
    id: 'r2',
    name: 'Burger House',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    rating: 4.1,
    ratingCount: 1890,
    cuisine: ['Burgers', 'American', 'Fast Food'],
    deliveryTime: '25-30 mins',
    costForTwo: 300,
    distance: '1.8 km',
    offers: [],
    isOpen: true,
  },
  {
    id: 'r3',
    name: 'Spice Garden',
    image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400',
    rating: 4.5,
    ratingCount: 3210,
    cuisine: ['North Indian', 'Mughlai', 'Biryani'],
    deliveryTime: '40-45 mins',
    costForTwo: 500,
    distance: '3.2 km',
    offers: ['20% off | Use SPICE20'],
    isOpen: true,
  },
  {
    id: 'r4',
    name: 'Chinese Wok',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400',
    rating: 4.0,
    ratingCount: 1560,
    cuisine: ['Chinese', 'Asian', 'Thai'],
    deliveryTime: '35-40 mins',
    costForTwo: 350,
    distance: '2.1 km',
    offers: [],
    isOpen: false,
  },
  {
    id: 'r5',
    name: 'Sweet Treats',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
    rating: 4.6,
    ratingCount: 2890,
    cuisine: ['Desserts', 'Ice Cream', 'Bakery'],
    deliveryTime: '20-25 mins',
    costForTwo: 200,
    distance: '1.5 km',
    offers: ['Free delivery'],
    isOpen: true,
  },
];

export const banners = [
  {
    id: 'b1',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
    title: '50% OFF',
    subtitle: 'On your first order',
  },
  {
    id: 'b2',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    title: 'Free Delivery',
    subtitle: 'Orders above ₹199',
  },
  {
    id: 'b3',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800',
    title: 'Weekend Special',
    subtitle: 'Extra 20% off on all orders',
  },
];