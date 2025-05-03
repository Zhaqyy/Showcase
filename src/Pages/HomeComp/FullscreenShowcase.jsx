import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import "../../Style/Home.scss";
import ShowcaseSidebar from "./ShowcaseSidebar";
import useDebounce from "../../Util/debounce.jsx";
import ErrorBoundary from "../../Util/ErrorBoundary";
import QuickNav from "../../Component/QuickNav";
// import componentRegistry from './componentRegistry';
import Pool from "../../Showcase/Pool";
const FullscreenShowcase = ({ showcase, onClose, isMobile, allShowcases, currentIndex, onNavigate }) => {
  // State management
  const [uiState, setUiState] = useState({
    isMenuOpen: false,
    isAnimating: false,
    isLoading: true,
    showQuickNav: false,
    dimensions: { width: 0, height: 0 },
  });

  // Refs
  const refs = {
    sidebar: useRef(),
    hamburger: useRef(),
    contentContainer: useRef(),
    initialScrollY: useRef(0),
  };

  // Dynamic component handling
  // const [ActiveComponent, setActiveComponent] = useState(null);

  // Load component
  // useEffect(() => {
  //   const loadComponent = async () => {
  //     try {
  //       setUiState(prev => ({ ...prev, isLoading: true }));
        
  //       // Handle string references only
  //       if (typeof showcase.component !== 'string') {
  //         throw new Error('Component must be referenced by string');
  //       }
  
  //       // First try the registry
  //       let Component = componentRegistry[showcase.component];
        
  //       // If not in registry, try dynamic import
  //       if (!Component) {
  //         try {
  //           const module = await import(`../../Showcase/${showcase.component}.jsx`);
  //           Component = module.default;
  //         } catch (importError) {
  //           console.error(`Failed to dynamically import ${showcase.component}:`, importError);
  //           throw new Error(`Component ${showcase.component} not found`);
  //         }
  //       }
  
  //       if (!Component) {
  //         throw new Error('Component loaded but is undefined');
  //       }
  
  //       setActiveComponent(() => Component);
  //     } catch (error) {
  //       console.error("Component load failed:", error);
  //       setUiState(prev => ({ ...prev, hasError: true }));
  //     } finally {
  //       setUiState(prev => ({ ...prev, isLoading: false }));
  //     }
  //   };
  
  //   loadComponent();
  
  //   // Track container dimensions
  //   const updateDimensions = () => {
  //     if (refs.contentContainer.current) {
  //       setUiState(prev => ({
  //         ...prev,
  //         dimensions: {
  //           width: refs.contentContainer.current.offsetWidth,
  //           height: refs.contentContainer.current.offsetHeight,
  //         },
  //       }));
  //     }
  //   };

  //   updateDimensions();
  //   const resizeObserver = new ResizeObserver(updateDimensions);
  //   if (refs.contentContainer.current) {
  //     resizeObserver.observe(refs.contentContainer.current);
  //   }

  //   return () => resizeObserver.disconnect();
  // }, [showcase]);

  // Navigation handlers
  const handleNext = () => {
    if (!allShowcases) return;
    if (currentIndex < allShowcases.length - 1) {
      onNavigate(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (!allShowcases) return;
    if (currentIndex > 0) {
      onNavigate(currentIndex - 1);
    }
  };

  const toggleQuickNav = () => {
    setUiState(prev => ({ ...prev, showQuickNav: !prev.showQuickNav }));
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

  // Animation logic with enhanced safety
  const debouncedToggle = useDebounce(shouldOpen => {
    if (uiState.isAnimating || !refs.sidebar.current) return;

    setUiState(prev => ({ ...prev, isAnimating: true }));

    const animation = shouldOpen
      ? gsap.fromTo(
          refs.sidebar.current,
          { x: 20, autoAlpha: 0 },
          {
            x: 0,
            autoAlpha: 1,
            duration: 0.3,
            ease: "expo.in",
            onComplete: () => {
              setUiState(prev => ({ ...prev, isMenuOpen: true, isAnimating: false }));
            },
          }
        )
      : gsap.to(refs.sidebar.current, {
          x: 20,
          autoAlpha: 0,
          duration: 0.2,
          ease: "expo.in",
          onComplete: () => {
            setUiState(prev => ({ ...prev, isMenuOpen: false, isAnimating: false }));
            gsap.set(refs.sidebar.current, { display: "none" });
          },
        });

    return () => animation.kill();
  }, 300);

  const toggleMenu = () => {
    debouncedToggle(!uiState.isMenuOpen);
  };

  // Event handlers with cleanup
  useEffect(() => {
    const handleClickOutside = e => {
      if (
        uiState.isMenuOpen &&
        refs.sidebar.current &&
        !refs.sidebar.current.contains(e.target) &&
        !refs.hamburger.current.contains(e.target)
      ) {
        setUiState(prev => ({ ...prev, isMenuOpen: false }));
      }
    };

    const handleScroll = () => {
      if (!uiState.isMenuOpen) return;

      const scrollDelta = Math.abs(window.scrollY - refs.initialScrollY.current);
      if (scrollDelta > 150) {
        setUiState(prev => ({ ...prev, isMenuOpen: false }));
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [uiState.isMenuOpen]);

  return (
    <div className='fullscreen-showcase'>
      {/* Main Content Area */}
      <div className='scContent' ref={refs.contentContainer}>
      <ErrorBoundary onRetry={() => window.location.reload()} onClose={onClose}>
        <div style={{ width: "100%", height: "100%", touchAction: "none" }}>
          <ShowcaseLoader 
            name={showcase.component}
            isActive={true}
            {...uiState.dimensions}
            pixelRatio={window.devicePixelRatio}
          />
        </div>
      </ErrorBoundary>

        <button onClick={onClose} className='close-button' aria-label='Close showcase'>
          {/* Back to Experiments */}
        </button>
      </div>

      {/* Navigation Controls */}
      <div className='navigation-controls'>
        <button
          className='nav-button prev'
          onClick={handlePrev}
          disabled={!allShowcases || currentIndex === 0}
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
          disabled={!allShowcases || currentIndex === allShowcases.length - 1}
          aria-label='Next showcase'
        >
          →
        </button>
      </div>

      <button onClick={onClose} className='close-button' aria-label='Close showcase'>
        ✕
      </button>

      {/* Quick Nav Modal */}
      {uiState.showQuickNav && allShowcases && (
        <QuickNav
          showcases={allShowcases}
          currentIndex={currentIndex}
          onSelect={index => {
            onNavigate(index);
            setUiState(prev => ({ ...prev, showQuickNav: false }));
          }}
          onClose={() => setUiState(prev => ({ ...prev, showQuickNav: false }))}
        />
      )}

      {/* Hamburger Menu */}
      <button
        className={`hamburger ${uiState.isMenuOpen ? "active" : ""}`}
        ref={refs.hamburger}
        onClick={toggleMenu}
        aria-label='Menu'
        aria-expanded={uiState.isMenuOpen}
      >
        <span className='hamburger-line'></span>
        <span className='hamburger-line'></span>
        <span className='hamburger-line'></span>
      </button>

      {/* Sidebar */}
      <ShowcaseSidebar ref={refs.sidebar} showcase={showcase} isOpen={uiState.isMenuOpen} />
    </div>
  );
};

export default FullscreenShowcase;


const componentRegistry = {
  Pool,
};