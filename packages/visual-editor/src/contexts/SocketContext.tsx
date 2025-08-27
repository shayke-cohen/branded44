import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔌 [Socket] Connecting to server...');
    
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on('connect', () => {
      console.log('🔌 [Socket] Connected to server');
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 [Socket] Disconnected from server:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('🔌 [Socket] Connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('🔌 [Socket] Reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setConnectionError(null);
    });

    // Bundle-related event listeners
    newSocket.on('bundle-updated', (data) => {
      console.log('📦 [Socket] Bundle updated:', data);
      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent('bundle-updated', { detail: data }));
    });

    newSocket.on('bundle-error', (data) => {
      console.error('📦 [Socket] Bundle error:', data);
      // Dispatch custom event for components to listen to
      window.dispatchEvent(new CustomEvent('bundle-error', { detail: data }));
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('🔌 [Socket] Reconnection error:', error);
      setConnectionError(error.message);
    });

    // Visual editor specific events
    newSocket.on('file-changed', (data) => {
      console.log('📁 [Socket] File changed:', data.filePath);
      // Handle file changes - will be processed by components that need it
    });

    newSocket.on('src2-status', (data) => {
      console.log('📁 [Socket] Src2 status update:', data);
      // Handle src2 status updates
    });

    newSocket.on('component-tree-updated', (data) => {
      console.log('🌳 [Socket] Component tree updated:', data);
      // Handle component tree updates
    });

    newSocket.on('hmr-update', (data) => {
      console.log('🔥 [Socket] HMR update:', data);
      // Handle Hot Module Replacement updates
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 [Socket] Cleaning up socket connection');
      newSocket.close();
    };
  }, []);

  const contextValue: SocketContextType = {
    socket,
    isConnected,
    connectionError,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
