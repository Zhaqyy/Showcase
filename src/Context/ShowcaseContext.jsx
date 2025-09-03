import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import showcaseData from '../Data/showcaseData';

// Create the context
const ShowcaseContext = createContext();

// Custom hook to use the context
export const useShowcase = () => {
  const context = useContext(ShowcaseContext);
  if (!context) {
    throw new Error('useShowcase must be used within a ShowcaseProvider');
  }
  return context;
};

// Provider component
export const ShowcaseProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Filter state
  const [selectedFilters, setSelectedFilters] = useState(["All"]);
  
  // Current showcase state
  const [currentShowcase, setCurrentShowcase] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  
  // Navigation state
  const [showQuickNav, setShowQuickNav] = useState(false);
  
  // Filtered showcases (for homepage display only)
  const filteredShowcases = showcaseData.filter(
    item => selectedFilters.includes("All") || selectedFilters.some(filter => item.category.includes(filter))
  );

  // Handle URL changes to sync with showcase state
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/showcase/')) {
      const showcaseId = parseInt(path.split('/')[2]);
      const showcase = showcaseData.find(s => s.id === showcaseId);
      const showcaseIndex = showcaseData.findIndex(s => s.id === showcaseId);
      
      if (showcase) {
        setCurrentShowcase(showcase);
        setCurrentIndex(showcaseIndex);
        setShowQuickNav(false);
      }
    } else if (path === '/') {
      // Reset showcase state when on home page
      setCurrentShowcase(null);
      setCurrentIndex(null);
    }
  }, [location.pathname]);

  // Navigation functions
  const navigateToShowcase = useCallback((index) => {
    if (index >= 0 && index < filteredShowcases.length) {
      const showcase = filteredShowcases[index];
      setCurrentShowcase(showcase);
      setCurrentIndex(index);
      setShowQuickNav(false);
      
      // Update URL
      navigate(`/showcase/${showcase.id}`);
    }
  }, [filteredShowcases, navigate]);

  // Open showcase directly by ID (for URL-based navigation)
  const openShowcaseById = useCallback((showcaseId) => {
    const showcase = showcaseData.find(s => s.id === showcaseId);
    if (showcase) {
      const showcaseIndex = showcaseData.findIndex(s => s.id === showcaseId);
      setCurrentShowcase(showcase);
      setCurrentIndex(showcaseIndex);
      setShowQuickNav(false);
    }
  }, []);

  const navigateToNext = useCallback(() => {
    if (currentShowcase && showcaseData.length > 0) {
      // Use all showcases for navigation, not filtered ones
      const currentGlobalIndex = showcaseData.findIndex(s => s.id === currentShowcase.id);
      const nextIndex = (currentGlobalIndex + 1) % showcaseData.length;
      const nextShowcase = showcaseData[nextIndex];
      navigate(`/showcase/${nextShowcase.id}`);
    }
  }, [currentShowcase, navigate]);

  const navigateToPrev = useCallback(() => {
    if (currentShowcase && showcaseData.length > 0) {
      // Use all showcases for navigation, not filtered ones
      const currentGlobalIndex = showcaseData.findIndex(s => s.id === currentShowcase.id);
      const prevIndex = (currentGlobalIndex - 1 + showcaseData.length) % showcaseData.length;
      const prevShowcase = showcaseData[prevIndex];
      navigate(`/showcase/${prevShowcase.id}`);
    }
  }, [currentShowcase, navigate]);

  const closeShowcase = useCallback(() => {
    setCurrentShowcase(null);
    setCurrentIndex(null);
    setShowQuickNav(false);
    
    // Navigate back to home
    navigate('/');
  }, [navigate]);

  const toggleQuickNav = useCallback(() => {
    setShowQuickNav(prev => !prev);
  }, []);

  // Filter functions
  const updateFilters = useCallback((newFilters) => {
    setSelectedFilters(newFilters);
    // Reset showcase when filters change
    setCurrentShowcase(null);
    setCurrentIndex(null);
  }, []);

  const value = {
    // State
    selectedFilters,
    currentShowcase,
    currentIndex,
    showQuickNav,
    filteredShowcases,
    allShowcases: showcaseData,
    
    // Actions
    setSelectedFilters: updateFilters,
    setCurrentShowcase,
    setCurrentIndex,
    setShowQuickNav,
    
    // Navigation
    navigateToShowcase,
    openShowcaseById,
    navigateToNext,
    navigateToPrev,
    closeShowcase,
    toggleQuickNav,
  };

  return (
    <ShowcaseContext.Provider value={value}>
      {children}
    </ShowcaseContext.Provider>
  );
}; 