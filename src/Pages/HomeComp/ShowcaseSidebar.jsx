import React, { useRef, useEffect, useCallback } from "react";
import { useUI } from "../../Context/UIContext";
import { useShowcase } from "../../Context/ShowcaseContext";
import gsap from "gsap";
import useDebounce from "../../Util/debounce";
import ShowcaseSidebarContent from "./ShowcaseSidebarContent";
import Drawer from "../../Component/Drawer";

const FSTrigger = ({ showcase, isOpen, onToggle }) => {
  return (
    <div 
      className="FS-drawer-trigger"
      onClick={onToggle}
      style={{ 
        opacity: isOpen ? 0 : 1,
        visibility: isOpen ? 'hidden' : 'visible',
        transition: 'opacity 0.2s ease, visibility 0.2s ease'
      }}
      aria-label={isOpen ? 'Hide details' : 'Show details'}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
    >
      <div className="sidebar-header">
        <div>
          <span className='label'>TITLE</span>
          <h3>{showcase.title}</h3>
        </div>
        <hr/>
        <span className='open-icon'>☵</span>
      </div>
    </div>
  );
};

const ShowcaseSidebar = ({ showcase }) => {
  const {
    isMobile,
    showcaseDrawerOpen,
    toggleShowcaseDrawer,
    closeShowcaseDrawer,
    isMenuOpen,
    setIsMenuOpen,
    isAnimating,
    setIsAnimating,
  } = useUI();

  const { navigateToShowcase, allShowcases, currentIndex } = useShowcase();

  const hamburgerRef = useRef();
  const initialScrollY = useRef(0);

  // Proper close function that waits for animation
  const handleCloseShowcaseDrawer = useCallback(() => {
    // The Drawer component will handle the animation, then call this
    closeShowcaseDrawer();
  }, [closeShowcaseDrawer]);

  // Toggle drawer function - simplified for new Drawer component
  const toggleDrawer = useDebounce(() => {
    if (isMobile) {
      toggleShowcaseDrawer();
    } else {
      setIsMenuOpen(!isMenuOpen);
    }
  }, 150);

  // Hamburger animation
  useEffect(() => {
    if (isMobile) return;

    const hamburger = hamburgerRef.current;
    if (!hamburger) return;

    // Simple transition for the icon change
    gsap.to(hamburger, {
      scale: 0.9,
      duration: 0.1,
      ease: "power2.out",
      onComplete: () => {
        gsap.to(hamburger, {
          scale: 1,
          duration: 0.1,
          ease: "power2.out"
        });
      }
    });
  }, [isMenuOpen, isMobile]);

  // Toggle menu function
  const toggleMenu = useCallback(() => {
    if (!isAnimating) {
      setIsMenuOpen(!isMenuOpen);
    }
  }, [isMenuOpen, isAnimating, setIsMenuOpen]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = e => {
      if (isMobile) {
        // Check if click is outside both the drawer and the FS trigger
        const isClickOnFSTrigger = e.target.closest('.FS-drawer-trigger');
        const isClickOnDrawer = e.target.closest('.showcase-drawer');
        
        if (showcaseDrawerOpen && !isClickOnFSTrigger && !isClickOnDrawer) {
          handleCloseShowcaseDrawer();
        }
      } else {
        if (isMenuOpen && !hamburgerRef.current.contains(e.target)) {
          setIsMenuOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobile, showcaseDrawerOpen, isMenuOpen, handleCloseShowcaseDrawer, setIsMenuOpen]);

  // Scroll handler - close on scroll
  useEffect(() => {
    if ((isMobile && showcaseDrawerOpen) || (!isMobile && isMenuOpen)) {
      initialScrollY.current = window.scrollY;
      let lastScrollY = window.scrollY;
      let ticking = false;

      const handleScroll = () => {
        lastScrollY = window.scrollY;
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const scrollDelta = Math.abs(lastScrollY - initialScrollY.current);
            if (scrollDelta > 50) {
              if (isMobile) handleCloseShowcaseDrawer();
              else setIsMenuOpen(false);
            }
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [isMobile, showcaseDrawerOpen, isMenuOpen, handleCloseShowcaseDrawer, setIsMenuOpen]);

  return (
    <>
      {/* Hamburger Menu */}
      <button
        className={`hamburger ${isMenuOpen ? "active" : ""}`}
        ref={hamburgerRef}
        onClick={toggleMenu}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMenuOpen}
      >
        <span className='hamburger-icon'>
          {isMenuOpen ? "⛌" : "☵"}
        </span>
      </button>

      {/* Mobile FS Trigger */}
      {isMobile && (
        <FSTrigger 
          showcase={showcase}
          isOpen={showcaseDrawerOpen}
          onToggle={toggleDrawer}
        />
      )}

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Drawer
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          position="right"
          title={showcase.title}
          showHandle={false}
          showHeader={false}
          className="showcase-sidebar-desktop"
        >
          <ShowcaseSidebarContent 
            showcase={showcase} 
            isOpen={isMenuOpen} 
          />
        </Drawer>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          isOpen={showcaseDrawerOpen}
          onClose={handleCloseShowcaseDrawer}
          position="bottom"
          title={showcase.title}
          showHandle={true}
          showHeader={false}
          className="showcase-drawer"
        >
          <ShowcaseSidebarContent 
            showcase={showcase} 
            isOpen={showcaseDrawerOpen} 
            isMobile={true}
          />
        </Drawer>
      )}
    </>
  );
};

export default ShowcaseSidebar;
