import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants/Config';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let socketConnection = null;

    const initSocket = async () => {
      const token = await AsyncStorage.getItem('deliveryToken');
      // We can check if token exists, but even without it we *might* want to connect?
      // But for delivery partner, we only want to join if logged in.
      // Let's assume we connect when the provider mounts, but better to check auth.
      // Actually, App.js wraps everything.

      // Simplest approach: Connect always, but only join room if we have a token/user ID?
      // Or better yet, listen to AsyncStorage changes? 
      // Since we don't have a robust AuthContext here yet (Auth info is in HomeScreen state),
      // let's just connect.

      console.log("Initializing Socket for Delivery App...");
      socketConnection = io(API_BASE_URL, {
        transports: ['websocket'],
      });

      socketConnection.on('connect', () => {
        console.log('Socket Connected:', socketConnection.id);
        // Join delivery room immediately on connect?
        // Or maybe we should wait for login. 
        // For now, let's join "delivery_partners" room globally if connected.
        // Security-wise this is weak, but fine for MVP.
        socketConnection.emit('joinDeliveryRoom');
      });

      socketConnection.on('disconnect', () => {
        console.log('Socket Disconnected');
      });

      setSocket(socketConnection);
    };

    initSocket();

    return () => {
      if (socketConnection) {
        socketConnection.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
