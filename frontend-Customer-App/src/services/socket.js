import io from 'socket.io-client';
import { ENV } from '../config/env';

let socket;

export const socketService = {
  connect: (userId) => {
    if (!socket) {
      // Remove '/api' from base URL to get root URL for socket
      const socketUrl = ENV.API_BASE_URL.replace(/\/api$/, '');

      socket = io(socketUrl, {
        transports: ['websocket'],
        forceNew: true,
      });

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        if (userId) {
          socket.emit('joinCustomerRoom', userId);
        }
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });

      socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
      });
    } else {
      // If socket exists but we have a userId, ensure we join the room
      if (userId && socket.connected) {
        socket.emit('joinCustomerRoom', userId);
      }
    }
  },

  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  getSocket: () => socket,

  on: (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  },

  off: (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  }
};
