import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { useUI } from "../../Context/UIContext";
import ShowcaseLoader from "./ShowcaseLoader";
import ShowcaseNavigation from "./ShowcaseNavigation";
import ShowcaseContent from "./ShowcaseContent";
import ShowcaseSidebar from "./ShowcaseSidebar";
import ShowcaseWrapper from "./ShowcaseWrapper";
import "../../Style/Home.scss";
import { Leva } from "leva";

const FullscreenShowcase = ({ showcase, currentIndex, onClose, isMobile }) => {
  const { isMobile: contextIsMobile } = useUI();
  const modalRef = useRef();
  const contentRef = useRef();
  const [Component, setComponent] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState(null);
  const [isTransitioning, setIsTransitioning] = React.useState(false);

  // Use context mobile state as fallback
  const mobileState = isMobile !== undefined ? isMobile : contextIsMobile;

  // Handle component loaded callback
  const handleComponentLoaded = loadedComponent => {
    setComponent(() => loadedComponent);
    setIsLoading(false);
  };

  // Fade transition when showcase changes
  useEffect(() => {
    if (contentRef.current && Component) {
      setIsTransitioning(true);
      
      // Fade out current content
      gsap.to(contentRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out",
        onComplete: () => {
          // Fade in new content
          gsap.to(contentRef.current, {
            opacity: 1,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
              setIsTransitioning(false);
            }
          });
        }
      });
    }
  }, [showcase.id, Component]);

  // Focus management for accessibility
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    // Focus the modal when it opens
    modal.focus();

    // Store the element that had focus before the modal opened
    const previouslyFocusedElement = document.activeElement;

    return () => {
      // Restore focus when modal closes
      if (previouslyFocusedElement && previouslyFocusedElement.focus) {
        previouslyFocusedElement.focus();
      }
    };
  }, []);

  return (
    <div
      className='fullscreen-showcase'
      ref={modalRef}
      role='dialog'
      aria-modal='true'
      aria-label={`Showcase: ${showcase.title}`}
      tabIndex={-1}
    >
      <div className='leva-root'>
        <Leva collapsed />
      </div>
      {/* Navigation Controls */}
      <ShowcaseNavigation onClose={onClose} />

      {/* Main Content Area */}
      <ShowcaseContent showcase={showcase} onClose={onClose} />

      {/* Sidebar/Drawer */}
      <ShowcaseSidebar showcase={showcase} />

      {/* Component rendering with transition wrapper */}
      <div ref={contentRef} style={{ opacity: 1 }}>
        {Component && !isLoading && !loadError && (
          <ShowcaseWrapper component={Component} {...showcase.props} />
        )}
      </div>
    </div>
  );
};

export default FullscreenShowcase;
