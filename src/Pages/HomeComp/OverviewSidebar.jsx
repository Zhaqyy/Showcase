import React, { useRef, useEffect, useMemo, useState, useCallback } from "react";
import gsap from "gsap";
import { overviewData } from "../../Data/overviewData";
import showcaseData from "../../Data/showcaseData";
import Filter from "../../Component/Filter";
import "../../Style/Home.scss";
import useDebounce from "../../Util/debounce";

const OverviewSidebar = ({ selectedFilters, setSelectedFilters, isMobile }) => {
  const overviewRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const drawerTriggerRef = useRef();
  const initialScrollY = useRef(0);

  // Setup Drawer on mount
  useEffect(() => {
    const overview = overviewRef.current;
    if (!overview) return;

    if (isMobile) {
      // Set initial position for mobile
      const heroElement = document.querySelector(".hero");
      if (!heroElement) return;

      // Add mobile class to drawer
      overview.classList.add("mobile");


      // Create trigger element
      const trigger = document.createElement("div");
      trigger.className = "drawer-trigger";
      trigger.innerHTML = isOpen ? "⛌" : "☵";
      trigger.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      trigger.setAttribute("aria-expanded", isOpen);

      const heroRef = heroElement;

      trigger.addEventListener("click", handleTriggerClick);

      heroRef.appendChild(trigger);
      drawerTriggerRef.current = trigger;

      return () => {
        if (drawerTriggerRef.current && heroRef.contains(drawerTriggerRef.current)) {
          drawerTriggerRef.current.removeEventListener("click", handleTriggerClick);
          heroRef.removeChild(drawerTriggerRef.current);
        }
        overview.classList.remove("mobile");
      };
    } else {
      // mobile class is removed
      overview.classList.remove("mobile");

      // Desktop animation
      const tl = gsap.timeline({ defaults: { ease: "power1.out" } });
      tl.fromTo(gsap.utils.toArray(".overview > *"), { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.15 });
    }
  }, [isMobile, isOpen]);

  // Update trigger icon when isOpen changes
  useEffect(() => {
    if (isMobile && drawerTriggerRef.current) {
      drawerTriggerRef.current.innerHTML = isOpen ? "⛌" : "☵";
      drawerTriggerRef.current.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      drawerTriggerRef.current.setAttribute("aria-expanded", isOpen);
    }
  }, [isMobile, isOpen]);

  // Toggle drawer with animation
  const toggleDrawer = useCallback(() => {
    if (isOpen) {
      gsap.set(overviewRef.current, {
        opacity: 1,
      });
      gsap.to(overviewRef.current, {
        y: "100%",
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => {
          setIsOpen(false);
        },
      });
    } else {
      setIsOpen(true);
      gsap.to(overviewRef.current, {
        y: 0,
        duration: 0.3,
        ease: "power2.inOut",
      });
      gsap.set(overviewRef.current, {
        opacity: 1,
      });
    }
  }, [isOpen]);

  // Close drawer with animation
  const closeDrawer = useCallback(() => {
    if (isOpen) {
      gsap.to(overviewRef.current, {
        y: "100%",
        duration: 0.25,
        ease: "expo.in",
        onComplete: () => {
          setIsOpen(false);
          gsap.set(overviewRef.current, {
            opacity: 0,
            delay: 0.35,
          });
        },
      });
    }
  }, [isOpen]);

  // debounced handlers
  const debouncedToggle = useDebounce(toggleDrawer, 350); // 300ms animation + 50ms buffer
  const debouncedClose = useDebounce(closeDrawer, 300); // 250ms animation + 50ms buffer

  // click handler
  const handleTriggerClick = useCallback(() => {
    if (isOpen) {
      debouncedClose();
    } else {
      debouncedToggle();
    }
  }, [isOpen, debouncedClose, debouncedToggle]);

  // swipe detection for drawer
  useEffect(() => {
    if (!isMobile) return;

    const drawer = overviewRef.current;
    let startY, moveY;

    const handleTouchStart = e => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = e => {
      moveY = e.touches[0].clientY;
      const diff = moveY - startY;

      if (diff > 0 && isOpen) {
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
      } else if (diff < 0 && !isOpen) {
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
        if (diff > 0 && isOpen) {
          toggleDrawer();
        } else if (diff < 0 && !isOpen) {
          toggleDrawer();
        }
      }
      // Snap back if not enough movement
      gsap.to(drawer, {
        y: isOpen ? 0 : "100%",
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
  }, [isMobile, isOpen]);

  // Click outside handler
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleClickOutside = e => {
      if (
        overviewRef.current &&
        !overviewRef.current.contains(e.target) &&
        drawerTriggerRef.current &&
        !drawerTriggerRef.current.contains(e.target)
      ) {
        closeDrawer();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside); // For mobile touch

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMobile, isOpen, closeDrawer]);

  // Scroll handler - close on scroll
  useEffect(() => {
    if (!isMobile || !isOpen) return;

    initialScrollY.current = window.scrollY;
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      lastScrollY = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollDelta = Math.abs(lastScrollY - initialScrollY.current);
          if (scrollDelta > 50) {
            // 50px threshold
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
  }, [isMobile, isOpen, closeDrawer]);

  // Filter functions
  const getFilterTags = useMemo(() => {
    const allTags = showcaseData.flatMap(item => item.tags);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

    const uniqueTags = ["All", ...Object.keys(tagCounts).sort()];
    return uniqueTags.map(tag => ({
      name: tag,
      count: tag === "All" ? showcaseData.length : tagCounts[tag],
    }));
  }, [showcaseData]);

  const handleFilterChange = () => {
    // Play the showcase animation when filters change
    gsap.set(".showcaseItem", {
      opacity: 0,
      onComplete: () => {
        gsap.to(".showcaseItem", {
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power1.out",
        });
      },
    });
  };

  return (
    <div className={`overview ${isMobile ? "mobile" : ""}`} ref={overviewRef}>
      {/* drawer handle */}
      {isMobile && (
        <>
          <div className='drawer-header' onClick={toggleDrawer}>
            <div className='drag-handle'></div>
          </div>
        </>
      )}

      <div className='identity-section'>
        <h1 className='name'>{overviewData.identity.name}</h1>
        <h4 className='title'>{overviewData.identity.title}</h4>
      </div>

      <div className='filter'>
        <h3>Filter Experiments</h3>
        <Filter
          tags={getFilterTags}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          onFilterChange={handleFilterChange}
        />
      </div>

      <div className='contact-section'>
        <h3 id='contact-heading'>Summoning Circle</h3>
        <ul role='list' aria-labelledby='contact-heading'>
          {overviewData.contact.map(contact => (
            <li key={contact.platform}>
              <a href={contact.url} target='_blank' rel='noopener noreferrer' aria-label={`${contact.platform} (opens in new tab)`}>
                {contact.platform}
              </a>
            </li>
          ))}
        </ul>
        <div className='availability' aria-live='polite' aria-atomic='true'>
          {overviewData.interaction.collaborationStatus}
        </div>
      </div>
    </div>
  );
};

export default OverviewSidebar;
