
import React from 'react';
import Dashboard from '@/components/Dashboard';
import { AppProvider } from '@/contexts/AppContext';
import { SupabaseProvider } from '@/contexts/SupabaseContext';

const Index = () => {
  return (
    <SupabaseProvider>
      <AppProvider>
        <Dashboard />
      </AppProvider>
    </SupabaseProvider>
  );
};

export default Index;
