import React, { useRef, useEffect, useCallback } from "react";
import { useUI } from "../../Context/UIContext";
import { useShowcase } from "../../Context/ShowcaseContext";
import gsap from "gsap";
import useDebounce from "../../Util/debounce";
import ShowcaseSidebarContent from "./ShowcaseSidebarContent";

const ShowcaseSidebar = ({ showcase }) => {
  const { 
    isMobile, 
    showcaseDrawerOpen, 
    toggleShowcaseDrawer, 
    closeShowcaseDrawer,
    isMenuOpen,
    setIsMenuOpen,
    isAnimating,
    setIsAnimating
  } = useUI();
  
  const { navigateToShowcase, allShowcases, currentIndex } = useShowcase();
  
  const sidebarRef = useRef();
  const hamburgerRef = useRef();
  const drawerRef = useRef();
  const drawerTriggerRef = useRef();
  const initialScrollY = useRef(0);

  // Mobile drawer setup
  useEffect(() => {
    if (!isMobile) return;

    const displayElement = document.querySelector(".fullscreen-showcase");
    if (!displayElement) return;

    // Create mobile trigger button
    const trigger = document.createElement("div");
    trigger.className = "FS-drawer-trigger";

    trigger.innerHTML = `
      <div class="sidebar-header">
        <div>
          <span class='label'>TITLE</span>
          <h3>${showcase.title}</h3>
        </div>
        <hr/>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <g fill="none" fill-rule="evenodd">
            <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/>
            <path fill="rgb(241, 204, 186)" d="M7 13a2 2 0 0 1 1.995 1.85L9 15v3a2 2 0 0 1-1.85 1.995L7 20H4a2 2 0 0 1-1.995-1.85L2 18v-3a2 2 0 0 1 1.85-1.995L4 13zm9 4a1 1 0 0 1 .117 1.993L16 19h-4a1 1 0 0 1-.117-1.993L12 17zm-9-2H4v3h3zm13-2a1 1 0 1 1 0 2h-8a1 1 0 1 1 0-2zM7 3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm9 4a1 1 0 0 1 .117 1.993L16 9h-4a1 1 0 0 1-.117-1.993L12 7zM7 5H4v3h3zm13-2a1 1 0 0 1 .117 1.993L20 5h-8a1 1 0 0 1-.117-1.993L12 3z"/>
          </g>
        </svg>
      </div>
    `;

    trigger.addEventListener("click", toggleDrawer);
    displayElement.appendChild(trigger);
    drawerTriggerRef.current = trigger;

    return () => {
      if (drawerTriggerRef.current && displayElement.contains(drawerTriggerRef.current)) {
        drawerTriggerRef.current.removeEventListener("click", toggleDrawer);
        displayElement.removeChild(drawerTriggerRef.current);
      }
    };
  }, [isMobile, showcase, toggleDrawer]);

  // Animate drawer trigger visibility
  useEffect(() => {
    if (!isMobile || !drawerTriggerRef.current) return;

    const trigger = drawerTriggerRef.current;
    const isVisible = gsap.getProperty(trigger, "autoAlpha") === 1;

    if (!showcaseDrawerOpen && !isVisible) {
      gsap.to(trigger, {
        autoAlpha: 1,
        duration: 0.25,
        delay: 0.2,
        ease: "power2.out",
      });
    }
  }, [isMobile, showcaseDrawerOpen]);

  // Toggle drawer function
  const toggleDrawer = useDebounce(() => {
    if (isMobile) {
      if (showcaseDrawerOpen) {
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
                if (drawerRef.current && drawerTriggerRef.current) {
                  closeShowcaseDrawer();
                }
              },
            });
          },
        });
      } else {
        if (!drawerRef.current || !drawerTriggerRef.current) return;

        // Animate out trigger first
        gsap.to(drawerTriggerRef.current, {
          autoAlpha: 0,
          duration: 0.2,
          ease: "power2.in",
          onComplete: () => {
            if (drawerRef.current && drawerTriggerRef.current) {
              toggleShowcaseDrawer();
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

  // Swipe detection for drawer
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

      if (diff > 0 && showcaseDrawerOpen) {
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
      } else if (diff < 0 && !showcaseDrawerOpen) {
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
        if (diff > 0 && showcaseDrawerOpen) {
          toggleDrawer();
        } else if (diff < 0 && !showcaseDrawerOpen) {
          toggleDrawer();
        }
      }
      // Snap back if not enough movement
      gsap.to(drawer, {
        y: showcaseDrawerOpen ? "0%" : "100%",
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
  }, [isMobile, showcaseDrawerOpen, toggleDrawer]);

  // Animation logic for menu
  const debouncedToggle = useDebounce((shouldOpen) => {
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

  // Sidebar display animation
  useEffect(() => {
    if (sidebarRef.current) {
      const menu = sidebarRef.current;

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
  useEffect(() => {
    const handleClickOutside = e => {
      if (isMobile) {
        if (showcaseDrawerOpen && !drawerRef.current.contains(e.target) && !drawerTriggerRef.current.contains(e.target)) {
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
  }, [isMobile, showcaseDrawerOpen, isMenuOpen, toggleDrawer]);

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
  }, [isMobile, showcaseDrawerOpen, isMenuOpen, toggleDrawer]);

  return (
    <>
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
       {isMobile ? (
         <ShowcaseSidebarContent 
           ref={drawerRef} 
           showcase={showcase} 
           isOpen={showcaseDrawerOpen} 
           isMobile={isMobile} 
           onToggle={toggleDrawer} 
         />
       ) : (
         <ShowcaseSidebarContent 
           ref={sidebarRef} 
           showcase={showcase} 
           isOpen={isMenuOpen} 
         />
       )}
    </>
  );
};

export default ShowcaseSidebar;
