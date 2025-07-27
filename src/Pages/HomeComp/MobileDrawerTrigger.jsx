import React, { useRef, useEffect, useCallback } from "react";
import { useUI } from "../../Context/UIContext";
import gsap from "gsap";

const MobileDrawerTrigger = () => {
  const { isMobile, overviewDrawerOpen, toggleOverviewDrawer, closeOverviewDrawer } = useUI();
  const drawerTriggerRef = useRef();
  const initialScrollY = useRef(0);

  // Setup Drawer on mount
  useEffect(() => {
    if (!isMobile) return;

    const heroElement = document.querySelector(".hero");
    if (!heroElement) return;

    // Create trigger element
    const trigger = document.createElement("div");
    trigger.className = "drawer-trigger";
    trigger.innerHTML = overviewDrawerOpen ? "⛌" : "☵";
    trigger.setAttribute("aria-label", overviewDrawerOpen ? "Close menu" : "Open menu");
    trigger.setAttribute("aria-expanded", overviewDrawerOpen);

    trigger.addEventListener("click", handleTriggerClick);

    heroElement.appendChild(trigger);
    drawerTriggerRef.current = trigger;

    return () => {
      if (drawerTriggerRef.current && heroElement.contains(drawerTriggerRef.current)) {
        drawerTriggerRef.current.removeEventListener("click", handleTriggerClick);
        heroElement.removeChild(drawerTriggerRef.current);
      }
    };
  }, [isMobile, overviewDrawerOpen]);

  // Update trigger icon when drawer state changes
  useEffect(() => {
    if (isMobile && drawerTriggerRef.current) {
      drawerTriggerRef.current.innerHTML = overviewDrawerOpen ? "⛌" : "☵";
      drawerTriggerRef.current.setAttribute("aria-label", overviewDrawerOpen ? "Close menu" : "Open menu");
      drawerTriggerRef.current.setAttribute("aria-expanded", overviewDrawerOpen);
    }
  }, [isMobile, overviewDrawerOpen]);

  // Toggle drawer with animation
  const toggleDrawer = useCallback(() => {
    if (overviewDrawerOpen) {
      gsap.set(".overview", {
        opacity: 1,
      });
      gsap.to(".overview", {
        y: "100%",
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => {
          closeOverviewDrawer();
        },
      });
    } else {
      toggleOverviewDrawer();
      gsap.to(".overview", {
        y: 0,
        duration: 0.3,
        ease: "power2.inOut",
      });
      gsap.set(".overview", {
        opacity: 1,
      });
    }
  }, [overviewDrawerOpen, toggleOverviewDrawer, closeOverviewDrawer]);

  // Close drawer with animation
  const closeDrawer = useCallback(() => {
    if (overviewDrawerOpen) {
      gsap.to(".overview", {
        y: "100%",
        duration: 0.25,
        ease: "expo.in",
        onComplete: () => {
          closeOverviewDrawer();
          gsap.set(".overview", {
            opacity: 0,
            delay: 0.35,
          });
        },
      });
    }
  }, [overviewDrawerOpen, closeOverviewDrawer]);

  // Click handler
  const handleTriggerClick = useCallback(() => {
    if (overviewDrawerOpen) {
      closeDrawer();
    } else {
      toggleDrawer();
    }
  }, [overviewDrawerOpen, toggleDrawer, closeDrawer]);

  // Swipe detection for drawer
  useEffect(() => {
    if (!isMobile) return;

    const drawer = document.querySelector(".overview");
    if (!drawer) return;

    let startY, moveY;

    const handleTouchStart = e => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = e => {
      moveY = e.touches[0].clientY;
      const diff = moveY - startY;

      if (diff > 0 && overviewDrawerOpen) {
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
      } else if (diff < 0 && !overviewDrawerOpen) {
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
        if (diff > 0 && overviewDrawerOpen) {
          toggleDrawer();
        } else if (diff < 0 && !overviewDrawerOpen) {
          toggleDrawer();
        }
      }
      // Snap back if not enough movement
      gsap.to(drawer, {
        y: overviewDrawerOpen ? 0 : "100%",
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
  }, [isMobile, overviewDrawerOpen, toggleDrawer]);

  // Click outside handler
  useEffect(() => {
    if (!isMobile || !overviewDrawerOpen) return;

    const handleClickOutside = e => {
      const overview = document.querySelector(".overview");
      if (
        overview &&
        !overview.contains(e.target) &&
        drawerTriggerRef.current &&
        !drawerTriggerRef.current.contains(e.target)
      ) {
        closeDrawer();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobile, overviewDrawerOpen, closeDrawer]);

  // Scroll handler - close on scroll
  useEffect(() => {
    if (!isMobile || !overviewDrawerOpen) return;

    initialScrollY.current = window.scrollY;
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      lastScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollDelta = Math.abs(lastScrollY - initialScrollY.current);
          if (scrollDelta > 50) {
            closeDrawer();
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isMobile, overviewDrawerOpen, closeDrawer]);

  // This component doesn't render anything visible
  // It only manages the mobile drawer trigger logic
  return null;
};

export default MobileDrawerTrigger; 