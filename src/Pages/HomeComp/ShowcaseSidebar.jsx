import React, { useRef, useEffect, useCallback } from "react";
import { useUI } from "../../Context/UIContext";
import { useShowcase } from "../../Context/ShowcaseContext";
import gsap from "gsap";
import useDebounce from "../../Util/debounce";
import ShowcaseSidebarContent from "./ShowcaseSidebarContent";
import Drawer from "../../Component/Drawer";

// New FS Trigger Component
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
    >
      <div className="sidebar-header">
        <div>
          <span className='label'>TITLE</span>
          <h3>{showcase.title}</h3>
        </div>
        <hr/>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <g fill="none" fillRule="evenodd">
            <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/>
            <path fill="rgb(241, 204, 186)" d="M7 13a2 2 0 0 1 1.995 1.85L9 15v3a2 2 0 0 1-1.85 1.995L7 20H4a2 2 0 0 1-1.995-1.85L2 18v-3a2 2 0 0 1 1.85-1.995L4 13zm9 4a1 1 0 0 1 .117 1.993L16 19h-4a1 1 0 0 1-.117-1.993L12 17zm-9-2H4v3h3zm13-2a1 1 0 1 1 0 2h-8a1 1 0 1 1 0-2zM7 3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm9 4a1 1 0 0 1 .117 1.993L16 9h-4a1 1 0 0 1-.117-1.993L12 7zM7 5H4v3h3zm13-2a1 1 0 0 1 .117 1.993L20 5h-8a1 1 0 0 1-.117-1.993L12 3z"/>
          </g>
        </svg>
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
