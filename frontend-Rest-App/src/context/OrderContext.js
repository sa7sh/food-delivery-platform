import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getOrders, getOrderById, updateOrderStatus } from '../services/api';
import io from 'socket.io-client';
import ENV from '../config/environment';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const [socket, setSocket] = useState(null);

  // Fetch all orders
  const fetchOrders = async (status = null) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOrders(status);
      setOrders(response.data);
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const { isAuthenticated } = useAuth(); // Direct usage if circular dependency is not an issue, or pass it via props?
  // Wait, AuthContext is defined in another file. We need to import AuthContext, not useAuth if we are inside the same file... no they are different files.

  // Load orders when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setOrders([]); // Clear orders on logout
    }
  }, [isAuthenticated]);

  // Socket.IO setup (prepared for backend integration)
  useEffect(() => {
    let socketConnection = null;

    const setupSocket = async () => {
      const token = await AsyncStorage.getItem('restaurantData');
      // Note: restaurantData contains the object. We need the ID to join room.
      // Actually server expects joinRestaurantRoom(ID). 
      // Auth is handled via token or we can just send ID for room joining.

      if (!token) return;
      const restaurant = JSON.parse(token);

      socketConnection = io(ENV.SOCKET_URL, {
        transports: ['websocket'],
      });

      socketConnection.on('connect', () => {
        console.log('Socket connected:', socketConnection.id);
        socketConnection.emit('joinRestaurantRoom', restaurant._id);
      });

      socketConnection.on('newOrder', (order) => {
        console.log('New Order Received via Socket!', order._id);
        setOrders((prevOrders) => [order, ...prevOrders]);
        // Optional: Trigger Haptic feedback or Sound here
      });

      socketConnection.on('orderUpdated', (updatedOrder) => {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order
          )
        );
      });

      // setSocket(socketConnection);
    };

    setupSocket();

    return () => {
      if (socketConnection) {
        socketConnection.disconnect();
      }
    };
  }, []);

  // Get single order by ID
  const fetchOrderById = async (orderId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOrderById(orderId);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Fetch order error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch order';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateStatus = async (orderId, status) => {
    try {
      setLoading(true);
      setError(null);
      const response = await updateOrderStatus(orderId, status);
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Update order status error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to update order status';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    orders,
    loading,
    error,
    fetchOrders,
    fetchOrderById,
    updateStatus,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider');
  }
  return context;
};
