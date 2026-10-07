import React from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { DataProvider } from '../../context/DataProvider';

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      <DataProvider>
        {children}
      </DataProvider>
    </AuthProvider>
  );
}
