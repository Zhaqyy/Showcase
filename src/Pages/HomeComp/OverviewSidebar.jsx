import React, { useRef, useEffect } from "react";
import { useUI } from "../../Context/UIContext";
import gsap from "gsap";
import IdentitySection from "./IdentitySection";
import FilterManager from "./FilterManager";
import ContactSection from "./ContactSection";
import MobileDrawerTrigger from "./MobileDrawerTrigger";
import "../../Style/Home.scss";

const OverviewSidebar = () => {
  const { isMobile, overviewDrawerOpen } = useUI();
  const overviewRef = useRef();

  // Setup mobile drawer class and desktop animation
  useEffect(() => {
    const overview = overviewRef.current;
    if (!overview) return;

    if (isMobile) {
      // Add mobile class to drawer
      overview.classList.add("mobile");
    } else {
      // Remove mobile class and add desktop animation
      overview.classList.remove("mobile");
      
      // Desktop animation
      const tl = gsap.timeline({ defaults: { ease: "power1.out" } });
      tl.fromTo(gsap.utils.toArray(".overview > *"), { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.15 });
    }
  }, [isMobile]);

  return (
    <>
      {/* Mobile drawer trigger (manages its own logic) */}
      <MobileDrawerTrigger />
      
      {/* Main sidebar content */}
      <div className={`overview ${isMobile ? "mobile" : ""}`} ref={overviewRef}>
        {/* Drawer handle for mobile */}
        {isMobile && (
          <div className='drawer-header'>
            <div className='drag-handle'></div>
          </div>
        )}

        {/* Identity section */}
        <IdentitySection />

        {/* Filter section */}
        <FilterManager />

        {/* Contact section */}
        <ContactSection />
      </div>
    </>
  );
};

export default OverviewSidebar;
