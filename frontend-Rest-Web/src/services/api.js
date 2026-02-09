import axios from 'axios';

const BACKEND_API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending HttpOnly cookies automatically
});

const STORAGE_KEYS = {
  MENU: 'rp_menu_items',
  ORDERS: 'rp_orders_v2', // Changed key to reset old fake data
  USER: 'rp_user',
};

// --- AXIOS INTERCEPTOR ---
// (No longer needed for Auth, cookies handle it)
BACKEND_API.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);


// --- HELPER FUNCTIONS ---
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const getStorage = (key, initialValue) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (e) {
    console.error(`Error reading ${key} from storage`, e);
    return initialValue;
  }
};

const setStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage`, e);
  }
};

// --- MOCK DATA FOR ORDERS (Backend not ready) ---
// --- MOCK DATA FOR ORDERS (Backend not ready) ---
const INITIAL_ORDERS = [];


// --- API SERVICE ---
const api = {
  // --- AUTH ---
  login: async (email, password) => {
    try {
      // Backend sets HttpOnly cookie automatically
      const res = await BACKEND_API.post('/auth/login', { email, password });

      // We don't need to store token manually anymore

      // Fetch the restaurant profile to get the name
      try {
        const profileRes = await BACKEND_API.get('/restaurant/profile');

        if (profileRes.data) {
          setStorage(STORAGE_KEYS.USER, profileRes.data);
          return { success: true, user: profileRes.data };
        }
      } catch (profileError) {
        console.error('Profile fetch failed after login', profileError);
        // Still return success with basic user info
        const user = { email };
        setStorage(STORAGE_KEYS.USER, user);
        return { success: true, user };
      }

      return { success: false, error: 'Login successful but profile fetch failed' };
    } catch (error) {
      console.error('Login error:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  },

  signup: async (restaurantName, email, password) => {
    try {
      // 1. Register User using HttpOnly cookie flow
      const res = await BACKEND_API.post('/auth/register', { email, password });
      const user = { email, name: restaurantName };

      setStorage(STORAGE_KEYS.USER, user);

      // 2. Auto-Update Profile with Restaurant details
      try {
        await BACKEND_API.put('/restaurant/profile', {
          name: restaurantName
        });
        // Fetch full profile to be sure
        const profileRes = await BACKEND_API.get('/restaurant/profile');
        if (profileRes.data) {
          setStorage(STORAGE_KEYS.USER, profileRes.data);
          return { success: true, user: profileRes.data };
        }
      } catch (profileError) {
        console.error("Profile update failed after reg", profileError);
      }

      return { success: true, user };

    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      };
    }
  },

  logout: async () => {
    try {
      await BACKEND_API.post('/auth/logout');
    } catch (e) {
      console.warn('Logout failed on server, clearing local anyway');
    }
    localStorage.removeItem(STORAGE_KEYS.USER);
    // Token is in cookie, server clears it or we just forget user
    return { success: true };
  },

  getUser: async () => {
    // Try to fetch profile using the HttpOnly cookie
    try {
      const res = await BACKEND_API.get('/restaurant/profile');
      const user = res.data;
      setStorage(STORAGE_KEYS.USER, user); // Update local cache
      return { user };
    } catch (error) {
      // If 401, cookie is missing/invalid
      // console.error("Get User Failed (likely not logged in)", error);
      return { user: null };
    }
  },

  updateProfile: async (updates) => {
    try {
      const res = await BACKEND_API.put('/restaurant/profile', updates);
      const updatedUser = res.data;
      setStorage(STORAGE_KEYS.USER, updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Update failed' };
    }
  },

  // --- MENU (CONNECTED TO BACKEND) ---
  getMenuItems: async () => {
    try {
      const res = await BACKEND_API.get('/restaurant/food-items');
      // Transform Backend Data (imageUrl -> image, isAvailable -> status)
      return res.data.map(item => ({
        ...item,
        id: item._id, // Ensure ID is mapped if using _id
        image: item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=120&h=120',
        status: item.isAvailable ? 'Available' : 'Out of Stock'
      }));
    } catch (error) {
      console.error("Failed to fetch menu", error);
      return [];
    }
  },

  addMenuItem: async (item) => {
    try {
      // Transform Frontend Data to Backend Format
      const payload = {
        ...item,
        imageUrl: item.image,
        isAvailable: item.status === 'Available',
        price: Number(item.price) // Ensure price is number
      };

      const res = await BACKEND_API.post('/restaurant/food-items', payload);
      return res.data;
    } catch (error) {
      console.error("Failed to add item", error);
      throw error;
    }
  },

  updateMenuItem: async (id, updates) => {
    try {
      const payload = { ...updates };

      if (updates.image) payload.imageUrl = updates.image;
      if (updates.status) payload.isAvailable = updates.status === 'Available';
      if (updates.price) payload.price = Number(updates.price);

      const res = await BACKEND_API.put(`/restaurant/food-items/${id}`, payload);
      return res.data;
    } catch (error) {
      console.error("Failed to update item", error);
      throw error;
    }
  },

  deleteMenuItem: async (id) => {
    try {
      await BACKEND_API.delete(`/restaurant/food-items/${id}`);
      return { success: true };
    } catch (error) {
      console.error("Failed to delete item", error);
      return { success: false, error: error.message };
    }
  },

  // --- ORDERS (MOCK - Backend has no routes for this yet) ---
  getOrders: async () => {
    await delay(400);
    const orders = getStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) setStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    return orders;
  },

  updateOrderStatus: async (id, status) => {
    await delay(500);
    const orders = getStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    const updatedOrders = orders.map(order =>
      order.id === id ? { ...order, status } : order
    );
    setStorage(STORAGE_KEYS.ORDERS, updatedOrders);
    return updatedOrders.find(o => o.id === id);
  },

  // --- STATS (Derived from data) ---
  getDashboardStats: async () => {
    await delay(600);
    // Fetch real menu items
    let items = [];
    try {
      const res = await BACKEND_API.get('/restaurant/food-items');
      items = res.data;
    } catch (e) { items = []; }

    const orders = getStorage(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);

    const todayOrders = orders.length; // Mock logic
    const revenue = orders.reduce((acc, order) => acc + (parseFloat(order.amount) || 0), 0);
    const activeItems = items.filter(i => i.isAvailable !== false).length; // Backend uses isAvailable boolean
    const pendingOrders = orders.filter(o => ['Pending', 'Preparing'].includes(o.status)).length;

    return {
      todayOrders,
      revenue: revenue,
      activeItems,
      pendingOrders,
      recentOrders: orders.slice(0, 5) // Return top 5
    };
  }
};

export default api;
