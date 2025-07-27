import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import useIsMobile from '../Util/isMobile';

// Create the context
const UIContext = createContext();

// Custom hook to use the context
export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

// Provider component
export const UIProvider = ({ children }) => {
  // Mobile/Desktop state
  const isMobile = useIsMobile(700);
  const isTablet = useIsMobile(1024);
  
  // Drawer states
  const [overviewDrawerOpen, setOverviewDrawerOpen] = useState(false);
  const [showcaseDrawerOpen, setShowcaseDrawerOpen] = useState(false);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Animation states
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Menu states
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Reset drawer states when switching between mobile/desktop
  useEffect(() => {
    if (!isMobile) {
      setOverviewDrawerOpen(false);
      setShowcaseDrawerOpen(false);
    }
  }, [isMobile]);

  // Drawer control functions
  const toggleOverviewDrawer = useCallback(() => {
    setOverviewDrawerOpen(prev => !prev);
  }, []);

  const closeOverviewDrawer = useCallback(() => {
    setOverviewDrawerOpen(false);
  }, []);

  const toggleShowcaseDrawer = useCallback(() => {
    setShowcaseDrawerOpen(prev => !prev);
  }, []);

  const closeShowcaseDrawer = useCallback(() => {
    setShowcaseDrawerOpen(false);
  }, []);

  // Loading control functions
  const startLoading = useCallback((message = 'Loading...') => {
    setIsLoading(true);
    setLoadingMessage(message);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage('');
  }, []);

  // Animation control functions
  const startAnimation = useCallback(() => {
    setIsAnimating(true);
  }, []);

  const stopAnimation = useCallback(() => {
    setIsAnimating(false);
  }, []);

  // Menu control functions
  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const value = {
    // State
    isMobile,
    isTablet,
    overviewDrawerOpen,
    showcaseDrawerOpen,
    isLoading,
    loadingMessage,
    isAnimating,
    isMenuOpen,
    
    // Actions
    setOverviewDrawerOpen,
    setShowcaseDrawerOpen,
    setIsLoading,
    setLoadingMessage,
    setIsAnimating,
    setIsMenuOpen,
    
    // Drawer controls
    toggleOverviewDrawer,
    closeOverviewDrawer,
    toggleShowcaseDrawer,
    closeShowcaseDrawer,
    
    // Loading controls
    startLoading,
    stopLoading,
    
    // Animation controls
    startAnimation,
    stopAnimation,
    
    // Menu controls
    toggleMenu,
    closeMenu,
  };

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}; 