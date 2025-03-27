
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { SupabaseProvider } from "@/contexts/SupabaseContext";
import { getLanguage } from "./utils/translations";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  }
});

const App = () => {
  const [language, setLanguage] = useState(getLanguage());

  useEffect(() => {
    // Listen for language changes
    const handleLanguageChange = () => {
      setLanguage(getLanguage());
    };

    window.addEventListener('languagechange', handleLanguageChange);
    return () => {
      window.removeEventListener('languagechange', handleLanguageChange);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SupabaseProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index key={language} />} />
              <Route path="/auth" element={<Auth key={language} />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound key={language} />} />
            </Routes>
          </BrowserRouter>
        </SupabaseProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
