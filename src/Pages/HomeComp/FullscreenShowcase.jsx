import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import "../../Style/Home.scss";
import ShowcaseSidebar from "./ShowcaseSidebar";
import useDebounce from "../../Util/debounce.jsx";

const FullscreenShowcase = ({ showcase, onClose, isMobile }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const sidebarRef = useRef();
  const hamburgerRef = useRef();

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

        // gsap.to(items, {
        //   duration: 0.6,
        //   autoAlpha: 1,
        //   y: 0,
        //   stagger: 0.1,
        //   ease: "expo.out",
        //   delay: 0.2,
        // });
      } else {
        // gsap.to(items, {
        //   duration: 0.4,
        //   autoAlpha: 0,
        //   y: 20,
        //   stagger: 0.05,
        //   ease: "expo.in",
        // });

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

  const initialScrollY = useRef(0);

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
      <div className='scContent'>
        <h2>{showcase.title}</h2>
        <p>{showcase.description}</p>
        <button onClick={onClose}>Back to Experiments</button>
      </div>

      {/* Hamburger icon */}
      <button className={`hamburger ${isMenuOpen ? "active" : ""}`} ref={hamburgerRef} onClick={toggleMenu} aria-label='Menu'>
        <span className='hamburger-line'></span>
        <span className='hamburger-line'></span>
        <span className='hamburger-line'></span>
      </button>

      <ShowcaseSidebar ref={sidebarRef} showcase={showcase} isOpen={isMenuOpen} />
    </div>
  );
};

export default FullscreenShowcase;
