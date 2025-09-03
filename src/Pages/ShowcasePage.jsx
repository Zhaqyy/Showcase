import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShowcase } from "../Context/ShowcaseContext";
import FullscreenShowcase from "./HomeComp/FullscreenShowcase";
import { useUI } from "../Context/UIContext";
import "../Style/Home.scss";

function ShowcasePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { allShowcases, openShowcaseById, currentShowcase } = useShowcase();
  const { isMobile } = useUI();
  const [showcase, setShowcase] = useState(null);

  useEffect(() => {
    // Find showcase by ID from URL
    const showcaseId = parseInt(id);
    const foundShowcase = allShowcases.find(s => s.id === showcaseId);
    
    if (foundShowcase) {
      setShowcase(foundShowcase);
      // Also set it in context for navigation
      openShowcaseById(showcaseId);
    } else {
      // If showcase not found, redirect to home
      navigate('/', { replace: true });
    }
  }, [id, allShowcases, openShowcaseById, navigate]);

  // Handle close showcase
  const handleCloseShowcase = () => {
    navigate('/', { replace: true });
  };

  // If showcase not found or loading, return null
  if (!showcase) {
    return null;
  }

  // Render the showcase directly
  return (
    // <div className="showcase-page">
      <FullscreenShowcase 
        showcase={showcase} 
        currentIndex={allShowcases.findIndex(s => s.id === showcase.id)}
        onClose={handleCloseShowcase} 
        isMobile={isMobile} 
      />
    // </div>
  );
}

export default ShowcasePage; 