import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { API_ENDPOINTS } from '../constants';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuth();

  // Hardcoded for now based on your setup, or derived from constants
  // Ideally this should come from a centralized config
  const SOCKET_URL = 'http://192.168.29.228:5000';

  useEffect(() => {
    let socketConnection = null;

    if (isAuthenticated && user) {
      console.log('Initializing Socket for user:', user._id);

      socketConnection = io(SOCKET_URL, {
        transports: ['websocket'],
      });

      socketConnection.on('connect', () => {
        console.log('Socket Connected via Context:', socketConnection.id);
        socketConnection.emit('joinCustomerRoom', user._id);
      });

      socketConnection.on('disconnect', () => {
        console.log('Socket Disconnected');
      });

      setSocket(socketConnection);
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }

    return () => {
      if (socketConnection) {
        socketConnection.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
