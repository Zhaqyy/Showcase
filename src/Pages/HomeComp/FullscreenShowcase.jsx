import React, { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import "../../Style/Home.scss";
import ShowcaseSidebar from "./ShowcaseSidebar";
import useDebounce from "../../Util/debounce.jsx";
import QuickNav from "../../Component/QuickNav";
import ShowcaseWrapper from "./ShowcaseWrapper";

const FullscreenShowcase = ({ showcase, onClose, isMobile, allShowcases, currentIndex, setSelectedShowcase, setCurrentIndex }) => {
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
     
          
       <div>
      <span class='label'>TITLE</span>
        <h3>${showcase.title}</h3>
        </div>
        <hr/>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="rgb(241, 204, 186)" d="M7 13a2 2 0 0 1 1.995 1.85L9 15v3a2 2 0 0 1-1.85 1.995L7 20H4a2 2 0 0 1-1.995-1.85L2 18v-3a2 2 0 0 1 1.85-1.995L4 13zm9 4a1 1 0 0 1 .117 1.993L16 19h-4a1 1 0 0 1-.117-1.993L12 17zm-9-2H4v3h3zm13-2a1 1 0 1 1 0 2h-8a1 1 0 1 1 0-2zM7 3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm9 4a1 1 0 0 1 .117 1.993L16 9h-4a1 1 0 0 1-.117-1.993L12 7zM7 5H4v3h3zm13-2a1 1 0 0 1 .117 1.993L20 5h-8a1 1 0 0 1-.117-1.993L12 3z"/></g></svg>
        </div>
        `;
    // <span class='label'>TAGS</span>
    // <div class="tags">${tagsHTML}</div>

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

  // animate drawer trigger out if drawer is out
  useEffect(() => {
    if (!isMobile || !drawerTriggerRef.current) return;

    const trigger = drawerTriggerRef.current;
    const isVisible = gsap.getProperty(trigger, "autoAlpha") === 1;

    if (!drawerOpen && !isVisible) {
      gsap.to(trigger, {
        autoAlpha: 1,
        duration: 0.25,
        delay: 0.2,
        ease: "power2.out",
      });
    }
  }, [isMobile, drawerOpen]);

  // toggle function
  const toggleDrawer = useDebounce(() => {
    if (isMobile) {
      if (drawerOpen) {
        if (!drawerRef.current || !drawerTriggerRef.current) return;

        // Animate out trigger first
        gsap.to(drawerTriggerRef.current, {
          autoAlpha: 0,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            // Then animate drawer
            gsap.to(drawerRef.current, {
              y: "100%",
              autoAlpha: 1,
              duration: 0.3,
              ease: "expo.in",
              onComplete: () => {
                // Only update state if components are still mounted
                if (drawerRef.current && drawerTriggerRef.current) {
                  setDrawerOpen(false);
                }
              },
            });
          },
        });
      } else {
        // First check if refs exist
        if (!drawerRef.current || !drawerTriggerRef.current) return;

        // Animate out trigger first
        gsap.to(drawerTriggerRef.current, {
          autoAlpha: 0,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            // Only update state if components are still mounted
            if (drawerRef.current && drawerTriggerRef.current) {
              setDrawerOpen(true);
              // Then animate drawer
              gsap.to(drawerRef.current, {
                y: "0%",
                duration: 0.3,
                ease: "power2.out",
              });
            }
          },
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
    const trigger = drawerTriggerRef.current;
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
              autoAlpha: 0,
              delay: 0.35,
            });
          },
        });
      } else if (diff < 0 && !drawerOpen) {
        gsap.to(drawer, {
          y: "0%",
          // autoAlpha: 1,
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
        y: drawerOpen ? "0%" : "100%",
        duration: 0.25,
        ease: "expo.in",
      });
    };

    drawer.addEventListener("touchstart", handleTouchStart, { passive: false });
    drawer.addEventListener("touchmove", handleTouchMove, { passive: false });
    drawer.addEventListener("touchend", handleTouchEnd);

    trigger.addEventListener("touchstart", handleTouchStart, { passive: false });
    trigger.addEventListener("touchmove", handleTouchMove, { passive: false });
    trigger.addEventListener("touchend", handleTouchEnd);

    return () => {
      drawer.removeEventListener("touchstart", handleTouchStart);
      drawer.removeEventListener("touchmove", handleTouchMove);
      drawer.removeEventListener("touchend", handleTouchEnd);

      trigger.removeEventListener("touchstart", handleTouchStart);
      trigger.removeEventListener("touchmove", handleTouchMove);
      trigger.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, drawerOpen]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (!allShowcases) return;

    const animateTransition = () => {
      // Animation timeline
      const tl = gsap.timeline();

      // Fade out current showcase
      tl.to(contentContainerRef.current, {
        opacity: 0,
        duration: 0.2,
        delay: 0.6, // for menu to close
      })
        .add(() => {
          // Update to next showcase
          const nextIndex = (currentIndex + 1) % allShowcases.length;
          setSelectedShowcase(allShowcases[nextIndex]);
          setCurrentIndex(nextIndex);
          setShowQuickNav(false);
        })
        // Fade in new showcase
        .to(contentContainerRef.current, {
          opacity: 1,
          duration: 0.2,
        });
    };

    animateTransition();
  }, [allShowcases, currentIndex, setSelectedShowcase, setCurrentIndex, isMenuOpen]);

  const handlePrev = useCallback(() => {
    if (!allShowcases) return;

    const animateTransition = () => {
      const tl = gsap.timeline();

      tl.to(contentContainerRef.current, {
        opacity: 0,
        duration: 0.2,
        delay: 0.6, // for menu to close
      })
        .add(() => {
          const prevIndex = (currentIndex - 1 + allShowcases.length) % allShowcases.length;
          setSelectedShowcase(allShowcases[prevIndex]);
          setCurrentIndex(prevIndex);
          setShowQuickNav(false);
        })
        .to(contentContainerRef.current, {
          opacity: 1,
          duration: 0.2,
        });
    };

    animateTransition();
  }, [allShowcases, currentIndex, setSelectedShowcase, setCurrentIndex, isMenuOpen]);

  const handleSelectShowcase = index => {
    setSelectedShowcase(allShowcases[index]);
    setCurrentIndex(index);
    setShowQuickNav(false);
  };

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
        <button className='nav-button prev' onClick={handlePrev} aria-label='Previous showcase'>
          ←
        </button>

        <button className='quick-nav-button' onClick={toggleQuickNav} aria-label='Show all showcases'>
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="none" stroke="rgb(41, 65, 34)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2 18c0-1.54 0-2.31.347-2.876c.194-.317.46-.583.777-.777C3.689 14 4.46 14 6 14s2.31 0 2.876.347c.317.194.583.46.777.777C10 15.689 10 16.46 10 18s0 2.31-.347 2.877c-.194.316-.46.582-.777.776C8.311 22 7.54 22 6 22s-2.31 0-2.876-.347a2.35 2.35 0 0 1-.777-.776C2 20.31 2 19.54 2 18m12 0c0-1.54 0-2.31.347-2.876c.194-.317.46-.583.777-.777C15.689 14 16.46 14 18 14s2.31 0 2.877.347c.316.194.582.46.776.777C22 15.689 22 16.46 22 18s0 2.31-.347 2.877a2.36 2.36 0 0 1-.776.776C20.31 22 19.54 22 18 22s-2.31 0-2.876-.347a2.35 2.35 0 0 1-.777-.776C14 20.31 14 19.54 14 18M2 6c0-1.54 0-2.31.347-2.876c.194-.317.46-.583.777-.777C3.689 2 4.46 2 6 2s2.31 0 2.876.347c.317.194.583.46.777.777C10 3.689 10 4.46 10 6s0 2.31-.347 2.876c-.194.317-.46.583-.777.777C8.311 10 7.54 10 6 10s-2.31 0-2.876-.347a2.35 2.35 0 0 1-.777-.777C2 8.311 2 7.54 2 6m12 0c0-1.54 0-2.31.347-2.876c.194-.317.46-.583.777-.777C15.689 2 16.46 2 18 2s2.31 0 2.877.347c.316.194.582.46.776.777C22 3.689 22 4.46 22 6s0 2.31-.347 2.876c-.194.317-.46.583-.776.777C20.31 10 19.54 10 18 10s-2.31 0-2.876-.347a2.35 2.35 0 0 1-.777-.777C14 8.311 14 7.54 14 6" color="rgb(41, 65, 34)"/></svg>
        </button>

        <button className='nav-button next' onClick={handleNext} aria-label='Next showcase'>
          →
        </button>
      </div>

      {/* Quick Nav Modal */}
      {showQuickNav && allShowcases && (
        <QuickNav
          showcases={allShowcases}
          currentIndex={currentIndex}
          onSelect={handleSelectShowcase}
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
        <ShowcaseSidebar ref={drawerRef} showcase={showcase} isOpen={drawerOpen} isMobile={isMobile} onToggle={toggleDrawer} />
      ) : (
        <ShowcaseSidebar ref={sidebarRef} showcase={showcase} isOpen={isMenuOpen} />
      )}
    </div>
  );
};

export default FullscreenShowcase;
