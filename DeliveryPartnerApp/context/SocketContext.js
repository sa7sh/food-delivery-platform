import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { API_BASE_URL } from '../constants/Config';
import { useDeliveryAuthStore } from '../store/authStore';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const { token } = useDeliveryAuthStore();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    let socketConnection = null;

    const initSocket = async () => {
      console.log("Initializing Socket for Delivery App...");
      socketConnection = io(API_BASE_URL, {
        transports: ['websocket'],
      });

      socketConnection.on('connect', () => {
        console.log('Socket Connected:', socketConnection.id);
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

  // Handle joining room when socket is connected and token is available
  useEffect(() => {
    if (socket && token) {
      console.log("Emitting joinDeliveryRoom...");
      socket.emit('joinDeliveryRoom');
    }
  }, [socket, token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
