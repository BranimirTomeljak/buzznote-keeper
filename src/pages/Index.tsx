
import React from 'react';
import Dashboard from '@/components/Dashboard';
import { AppProvider } from '@/contexts/AppContext';
import LanguageSelector from '@/components/LanguageSelector';

const Index = () => {
  return (
    <AppProvider>
      <div className="absolute top-4 right-4 z-50">
        <LanguageSelector />
      </div>
      <Dashboard />
    </AppProvider>
  );
};

export default Index;
