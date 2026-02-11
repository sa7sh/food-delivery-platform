import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation';
import ErrorBoundary from './src/components/ErrorBoundary';
import { SocketProvider } from './src/context/SocketContext';
import './global.css';

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <SocketProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </SocketProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}