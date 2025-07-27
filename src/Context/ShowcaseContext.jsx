import React, { createContext, useContext, useState, useCallback } from 'react';
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
  // Filter state
  const [selectedFilters, setSelectedFilters] = useState(["All"]);
  
  // Current showcase state
  const [currentShowcase, setCurrentShowcase] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  
  // Navigation state
  const [showQuickNav, setShowQuickNav] = useState(false);
  
  // Filtered showcases
  const filteredShowcases = showcaseData.filter(
    item => selectedFilters.includes("All") || selectedFilters.some(filter => item.category.includes(filter))
  );

  // Navigation functions
  const navigateToShowcase = useCallback((index) => {
    if (index >= 0 && index < filteredShowcases.length) {
      setCurrentShowcase(filteredShowcases[index]);
      setCurrentIndex(index);
      setShowQuickNav(false);
    }
  }, [filteredShowcases]);

  const navigateToNext = useCallback(() => {
    if (currentIndex !== null && filteredShowcases.length > 0) {
      const nextIndex = (currentIndex + 1) % filteredShowcases.length;
      navigateToShowcase(nextIndex);
    }
  }, [currentIndex, filteredShowcases.length, navigateToShowcase]);

  const navigateToPrev = useCallback(() => {
    if (currentIndex !== null && filteredShowcases.length > 0) {
      const prevIndex = (currentIndex - 1 + filteredShowcases.length) % filteredShowcases.length;
      navigateToShowcase(prevIndex);
    }
  }, [currentIndex, filteredShowcases.length, navigateToShowcase]);

  const closeShowcase = useCallback(() => {
    setCurrentShowcase(null);
    setCurrentIndex(null);
    setShowQuickNav(false);
  }, []);

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