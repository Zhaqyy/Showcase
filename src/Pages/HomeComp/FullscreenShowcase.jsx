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

  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef();
  const drawerTriggerRef = useRef();

  // Add this effect for mobile drawer setup
  useEffect(() => {
    if (!isMobile) return;

    const displayElement = document.querySelector(".fullscreen-showcase");

    if (!displayElement) return;

    // Create mobile trigger button
    const trigger = document.createElement("div");
    trigger.className = "FS-drawer-trigger";

    const tagsHTML = showcase.tags.map(tag => `<span class="tag">${tag}</span>`).join("");

    trigger.innerHTML = `
      <div class="sidebar-header">
        <h3>${showcase.title}</h3>
        <div class="tags">${tagsHTML}</div>
      </div>
    `;

    trigger.addEventListener("click", toggleDrawer);

    const dispRef = displayElement;
    dispRef.appendChild(trigger);

    drawerTriggerRef.current = trigger;


    return () => {
      if (drawerTriggerRef.current && dispRef.contains(drawerTriggerRef.current)) {
        drawerTriggerRef.current.removeEventListener("click", toggleDrawer);
        dispRef.removeChild(drawerTriggerRef.current);
      }
    };
  }, [isMobile, showcase]);

  useEffect(() => {
    if (!isMobile || !drawerTriggerRef.current) return;
  
    const trigger = drawerTriggerRef.current;
    const isVisible = gsap.getProperty(trigger, "autoAlpha") === 1;
  
    if (!drawerOpen && !isVisible) {
      gsap.to(trigger, {
        autoAlpha: 1,
        duration: 0.3,
        delay: 0.2,
        ease: "power2.out"
      });
    }
  }, [isMobile, drawerOpen]);
  
  // Modified toggle function
const toggleDrawer = useDebounce(() => {
  if (isMobile) {
    if (drawerOpen) {
      if (!drawerTriggerRef.current) return;

      // Animate out trigger first
      gsap.to(drawerTriggerRef.current, {
        autoAlpha: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          // Then animate drawer
          gsap.to(drawerRef.current, {
            y: "100%",
            duration: 0.3,
            ease: "power2.out",
            onComplete: () => {
              setDrawerOpen(false);
            }
          });
        }
      });
    } else {
      // Animate out trigger first
      gsap.to(drawerTriggerRef.current, {
        autoAlpha: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setDrawerOpen(true);
          // Then animate drawer
          gsap.to(drawerRef.current, {
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          });
        }
      });
    }
  } else {
    setIsMenuOpen(!isMenuOpen);
  }
}, 150);

  // swipe detection for drawer
  useEffect(() => {
    if (!isMobile) return;

    const drawer = drawerRef.current;
    // drawerTriggerRef.current
    let startY, moveY;

    const handleTouchStart = e => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = e => {
      moveY = e.touches[0].clientY;
      const diff = moveY - startY;

      if (diff > 0 && drawerOpen) {
        gsap.to(drawer, {
          y: "100%",
          duration: 0.25,
          ease: "expo.in",
          onComplete: () => {
            gsap.set(drawer, {
              opacity: 0,
              delay: 0.35,
            });
          },
        });
      } else if (diff < 0 && !drawerOpen) {
        gsap.to(drawer, {
          y: "0%",
          duration: 0.25,
          ease: "expo.in",
        });
      }
    };

    const handleTouchEnd = () => {
      const diff = moveY - startY;
      if (Math.abs(diff) > 50) {
        if (diff > 0 && drawerOpen) {
          toggleDrawer();
        } else if (diff < 0 && !drawerOpen) {
          toggleDrawer();
        }
      }
      // Snap back if not enough movement
      gsap.to(drawer, {
        y: drawerOpen ? 0 : "100%",
        duration: 0.25,
        ease: "expo.in",
      });
    };

    drawer.addEventListener("touchstart", handleTouchStart);
    drawer.addEventListener("touchmove", handleTouchMove);
    drawer.addEventListener("touchend", handleTouchEnd);

    return () => {
      drawer.removeEventListener("touchstart", handleTouchStart);
      drawer.removeEventListener("touchmove", handleTouchMove);
      drawer.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, drawerOpen]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (!allShowcases) return;
    const nextIndex = (currentIndex + 1) % allShowcases.length;
    setSelectedShowcase(allShowcases[nextIndex]);
    setShowQuickNav(false);
  }, [allShowcases, currentIndex]);

  const handlePrev = useCallback(() => {
    if (!allShowcases) return;
    const prevIndex = (currentIndex - 1 + allShowcases.length) % allShowcases.length;
    setSelectedShowcase(allShowcases[prevIndex]);
    setShowQuickNav(false);
  }, [allShowcases, currentIndex]);

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

  // click outside handler - close on Click
  useEffect(() => {
    const handleClickOutside = e => {
      if (isMobile) {
        if (drawerOpen && !drawerRef.current.contains(e.target) && !drawerTriggerRef.current.contains(e.target)) {
          toggleDrawer();
        }
      } else {
        if (isMenuOpen && !sidebarRef.current.contains(e.target) && !hamburgerRef.current.contains(e.target)) {
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
  }, [isMobile, drawerOpen, isMenuOpen, toggleDrawer]);

  // scroll handler - close on scroll
  useEffect(() => {
    if ((isMobile && drawerOpen) || (!isMobile && isMenuOpen)) {
      initialScrollY.current = window.scrollY;
      let lastScrollY = window.scrollY;
      let ticking = false;

      const handleScroll = () => {
        lastScrollY = window.scrollY;
        if (!ticking) {
          window.requestAnimationFrame(() => {
            const scrollDelta = Math.abs(lastScrollY - initialScrollY.current);
            if (scrollDelta > 50) {
              if (isMobile) toggleDrawer();
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
  }, [isMobile, drawerOpen, isMenuOpen, toggleDrawer]);

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

      {/* Close Button */}
      <button onClick={onClose} className='close-button' aria-label='Close showcase'>
        ✕
      </button>

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
      {/* <ShowcaseSidebar ref={sidebarRef} showcase={showcase} isOpen={isMenuOpen} /> */}
      {isMobile ? (
        <ShowcaseSidebar ref={drawerRef} showcase={showcase} isOpen={drawerOpen} isMobile={isMobile} />
      ) : (
        <ShowcaseSidebar ref={sidebarRef} showcase={showcase} isOpen={isMenuOpen} />
      )}
    </div>
  );
};

export default FullscreenShowcase;
