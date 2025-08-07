import React, { useRef, useEffect } from "react";
import { useUI } from "../../Context/UIContext";
import gsap from "gsap";
import IdentitySection from "./IdentitySection";
import FilterManager from "./FilterManager";
import ContactSection from "./ContactSection";
import MobileDrawerTrigger from "./MobileDrawerTrigger";
import Drawer from "../../Component/Drawer";
import "../../Style/Home.scss";

const OverviewSidebar = () => {
  const { isMobile, overviewDrawerOpen, closeOverviewDrawer } = useUI();
  const overviewRef = useRef();

  // Setup desktop animation
  useEffect(() => {
    if (isMobile) return;

    const overview = overviewRef.current;
    if (!overview) return;

    // Desktop animation
    const tl = gsap.timeline({ defaults: { ease: "power1.out" } });
    tl.fromTo(gsap.utils.toArray(".overview > *"), { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.15 });
  }, [isMobile]);

  return (
    <>
      {/* Mobile drawer trigger (manages its own logic) */}
      <MobileDrawerTrigger />
      
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="overview" ref={overviewRef}>
          {/* Identity section */}
          <IdentitySection />

          {/* Filter section */}
          <FilterManager />

          {/* Contact section */}
          <ContactSection />
        </div>
      )}

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          isOpen={overviewDrawerOpen}
          onClose={closeOverviewDrawer}
          position="bottom"
          title="Overview"
          showHandle={true}
          showHeader={false}
          className="overview-drawer"
        >
          <div className="overview-content">
            {/* Identity section */}
            <IdentitySection />

            {/* Filter section */}
            <FilterManager />

            {/* Contact section */}
            <ContactSection />
          </div>
        </Drawer>
      )}
    </>
  );
};

export default OverviewSidebar;
