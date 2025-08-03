import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { debugPaymentSystem } from "@/utils/debugPaymentSystem";
import { AuthProvider } from "@/hooks/useAuth";
import { useEffect } from "react";
import { seedSubscriptionPlans } from "@/utils/seedSubscriptionPlans";
import Index from "./pages/Index";
import Series from "./pages/Series";
import SeriesDetail from "./pages/SeriesDetail";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import EditProfile from "./pages/EditProfile";
import PrivacySettings from "./pages/PrivacySettings";
import SubscriptionSettings from "./pages/SubscriptionSettings";
import DownloadSettings from "./pages/DownloadSettings";
import Preferences from "./pages/Preferences";
import { SubscriptionButton } from "./components/SubscriptionButton";
import TestSubscription from "./pages/TestSubscription";
import VideoPlayer from "./pages/VideoPlayer";
import VideoDemo from "./pages/VideoDemo";
import VideoDebugger from "./components/VideoDebugger";
import { SubscriptionDebugger } from "./components/SubscriptionDebugger";
import SubscriptionDebug from "./pages/SubscriptionDebug";
import SubscriptionTest from "./pages/SubscriptionTest";
import SubscriptionQuickTest from "./pages/SubscriptionQuickTest";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Add global error handler for external script errors
    const handleGlobalError = (event: ErrorEvent) => {
      // Suppress external script errors that don't affect our app
      if (event.filename && (
        event.filename.includes('share-modal') ||
        event.filename.includes('data:;base64') ||
        event.filename.includes('chrome-extension') ||
        event.filename.includes('inpage.js') ||
        event.filename.includes('checkout-static') ||
        event.filename.includes('razorpay') ||
        event.filename.includes('sentry-cdn')
      )) {
        console.warn('🔇 Suppressed external script error:', event.message);
        event.preventDefault();
        return false;
      }
    };

    // Add global unhandled rejection handler
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Suppress known external promise rejections
      const reason = event.reason?.toString() || '';
      if (reason.includes('MetaMask extension not found') ||
          reason.includes('Failed to connect to MetaMask') ||
          reason.includes('SVG attribute') ||
          reason.includes('share-modal') ||
          reason.includes('message port closed')) {
        console.warn('🔇 Suppressed external promise rejection:', reason);
        event.preventDefault();
        return;
      }
      
      console.error('🚨 Unhandled promise rejection:', event.reason);
      // Don't prevent default for promise rejections as they might be important
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Clear any problematic session storage on app start
    const clearProblematicStorage = () => {
      try {
        // Clear any old subscription check flags that might be causing issues
        const keysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (key.includes('subscription_check_') || key.includes('profile_creation_'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => sessionStorage.removeItem(key));
        
        console.log('🧹 Cleared problematic session storage');
      } catch (error) {
        console.error('Error clearing session storage:', error);
      }
    };

    // Initialize subscription plans on app start (only once per session)
    const initializePlans = async () => {
      try {
        console.log('🌱 Starting subscription plans initialization...');
        await seedSubscriptionPlans();
        console.log('✅ Subscription plans initialization completed');
      } catch (error) {
        console.error('❌ Failed to seed subscription plans:', error);
        // Don't block app loading for seeding failures
      }
    };
    
    clearProblematicStorage();
    
    // Run initialization in background with delay to prevent blocking
    setTimeout(() => {
      initializePlans();
    }, 1000);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []); // Empty dependency array ensures this runs only once

  return (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/series" element={<Series />} />
            <Route path="/series/:id" element={<SeriesDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/settings/edit-profile" element={<EditProfile />} />
            <Route path="/settings/privacy" element={<PrivacySettings />} />
            <Route path="/settings/subscription" element={<SubscriptionSettings />} />
            <Route path="/subscribe" element={<SubscriptionButton />} />
            <Route path="/test-subscription" element={<TestSubscription />} />
            <Route path="/player/:seriesId/:episodeId" element={<VideoPlayer />} />
            <Route path="/video-demo" element={<VideoDemo />} />
            <Route path="/video-debugger" element={<div className="min-h-screen bg-bg-primary flex items-center justify-center p-4"><VideoDebugger /></div>} />
            <Route path="/subscription-debug" element={<SubscriptionDebug />} />
            <Route path="/subscription-test" element={<SubscriptionTest />} />
            <Route path="/subscription-quick-test" element={<SubscriptionQuickTest />} />
            <Route path="/settings/downloads" element={<DownloadSettings />} />
            <Route path="/settings/preferences" element={<Preferences />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
