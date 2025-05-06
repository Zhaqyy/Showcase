import React, { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import "../../Style/Home.scss";
import ShowcaseSidebar from "./ShowcaseSidebar";
import useDebounce from "../../Util/debounce.jsx";
import QuickNav from "../../Component/QuickNav";
import ShowcaseWrapper from "./ShowcaseWrapper";

const FullscreenShowcase = ({ showcase, onClose, isMobile, allShowcases, currentIndex, onNavigate }) => {
  // Individual state declarations
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showQuickNav, setShowQuickNav] = useState(false);

  // Individual ref declarations
  const sidebarRef = useRef();
  const hamburgerRef = useRef();
  const contentContainerRef = useRef();
  const initialScrollY = useRef(0);

  // Showcase component state
  const [Component, setComponent] = useState(null);

  useEffect(() => {
    // For direct component references
    if (typeof showcase.component !== "string") {
      setComponent(() => showcase.component);
      return;
    }

    // For dynamic imports
    const loadComponent = async () => {
      try {
        const module = await import(
          /* webpackMode: "lazy" */
          `../../Showcase/${showcase.component}.jsx`
        );
        setComponent(() => module.default);
        setIsLoading(false);
      } catch (err) {
        console.error(`Failed to load ${showcase.component}:`, err);
        setComponent(() => () => <FallbackComponent name={showcase.title} />);
        setIsLoading(false);
      }
    };

    loadComponent();
  }, [showcase]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (!allShowcases || currentIndex >= allShowcases.length - 1) return;
    currentIndex + 1;
    setShowQuickNav(false); // Close QuickNav when navigating
  }, [allShowcases, currentIndex, onNavigate]);

  const handlePrev = useCallback(() => {
    if (!allShowcases || currentIndex <= 0) return;
    currentIndex - 1;
    setShowQuickNav(false); // Close QuickNav when navigating
  }, [allShowcases, currentIndex, onNavigate]);
  
  const toggleQuickNav = () => {
    setShowQuickNav(prev => !prev);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") onClose();
      if (e.key === "q") toggleQuickNav();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex]);

  // Animation logic
  const debouncedToggle = useDebounce(shouldOpen => {
    if (isAnimating) return;

    setIsAnimating(true);
    const menu = sidebarRef.current;

    if (shouldOpen) {
      gsap.fromTo(
        menu,
        { x: 20, autoAlpha: 0 },
        {
          x: 0,
          autoAlpha: 1,
          duration: 0.3,
          ease: "expo.in",
          onComplete: () => {
            setIsMenuOpen(true);
            setIsAnimating(false);
          },
        }
      );
    } else {
      gsap.to(menu, {
        x: 20,
        autoAlpha: 0,
        duration: 0.2,
        ease: "expo.in",
        onComplete: () => {
          setIsMenuOpen(false);
          setIsAnimating(false);
        },
      });
    }
  }, 300);

  const toggleMenu = () => {
    debouncedToggle(!isMenuOpen);
  };

  // sidebar display animation
  useEffect(() => {
    if (sidebarRef.current) {
      const menu = sidebarRef.current;
      // const items = menuItems.current;

      if (isMenuOpen) {
        gsap.set(menu, {
          display: "block",
          delay: 0.25,
          onComplete: () => {
            gsap.to(menu, {
              duration: 0.1,
              autoAlpha: 1,
              x: 0,
              ease: "expo.in",
            });
          },
        });
      } else {
        gsap.to(menu, {
          duration: 0.25,
          autoAlpha: 0,
          x: 20,
          ease: "sine.in",
          delay: 0.1,
          onComplete: () => {
            gsap.set(menu, {
              display: "none",
              delay: 0.25,
            });
          },
        });
      }
    }
  }, [isMenuOpen]);

  // Click outside and scroll handlers

  // close on Click outside handler
  useEffect(() => {
    const handleClickOutside = e => {
      if (isMenuOpen && !sidebarRef.current.contains(e.target) && !hamburgerRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Scroll handling - close on scroll
  useEffect(() => {
    if (isMenuOpen) {
      initialScrollY.current = window.scrollY;
      let lastScrollY = window.scrollY;
      let ticking = false;

      const handleScroll = () => {
        lastScrollY = window.scrollY;
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const scrollDelta = Math.abs(lastScrollY - initialScrollY.current);
            if (scrollDelta > 150) {
              // 50px threshold
              setIsMenuOpen(false);
            }
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [isMenuOpen]);

  return (
    <div className='fullscreen-showcase'>
      {/* Main Content Area */}
      <div className='scContent' ref={contentContainerRef}>
        <div style={{ width: "100%", height: "100%", touchAction: "none" }}>
          {Component && <ShowcaseWrapper component={Component} {...showcase.props} />}
        </div>
        <button onClick={onClose} className='close-button' aria-label='Close showcase'>
          {/* Back to Experiments */}
        </button>
      </div>

      {/* Navigation Controls */}
      <div className='navigation-controls'>
        <button
          className='nav-button prev'
          onClick={handlePrev}
          // disabled={!allShowcases || currentIndex === 0}
          aria-label='Previous showcase'
        >
          ←
        </button>

        <button className='quick-nav-button' onClick={toggleQuickNav} aria-label='Show all showcases'>
          ○○○
        </button>

        <button
          className='nav-button next'
          onClick={handleNext}
          // disabled={!allShowcases || currentIndex === allShowcases.length - 1}
          aria-label='Next showcase'
        >
          →
        </button>
      </div>

      <button onClick={onClose} className='close-button' aria-label='Close showcase'>
        ✕
      </button>

      {/* Quick Nav Modal */}
      {showQuickNav && allShowcases && (
        <QuickNav
          showcases={allShowcases}
          currentIndex={currentIndex}
          onSelect={index => {
            if (index !== currentIndex) {
              onNavigate(index);
            }
            setShowQuickNav(false);
          }}
          onClose={() => setShowQuickNav(false)}
          isMobile={isMobile}
        />
      )}

      {/* Hamburger Menu */}
      <button
        className={`hamburger ${isMenuOpen ? "active" : ""}`}
        ref={hamburgerRef}
        onClick={toggleMenu}
        aria-label='Menu'
        aria-expanded={isMenuOpen}
      >
        <span className='hamburger-line'></span>
        <span className='hamburger-line'></span>
        <span className='hamburger-line'></span>
      </button>

      {/* Sidebar */}
      <ShowcaseSidebar ref={sidebarRef} showcase={showcase} isOpen={isMenuOpen} />
    </div>
  );
};

export default FullscreenShowcase;
