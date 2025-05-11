import React, { useRef, useEffect, useMemo, useState } from "react";
import gsap from "gsap";
import { overviewData } from "../../Data/overviewData";
import showcaseData from "../../Data/showcaseData";
import Filter from "../../Component/Filter";
import "../../Style/Home.scss";

const OverviewSidebar = ({ selectedFilters, setSelectedFilters, isMobile }) => {
  const overviewRef = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const drawerTriggerRef = useRef();

  // Animation on mount
  // useEffect(() => {
  //   const tl = gsap.timeline({ defaults: { ease: "power1.out" } });
  //   tl.fromTo(gsap.utils.toArray(".overview > *"), { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.15 });
  // }, []);

  // Animation on mount
  useEffect(() => {
    if (isMobile) {
      // Set initial position for mobile
      gsap.set(overviewRef.current, {
        y: "80%",
        opacity: 0,
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "auto",
        maxHeight: "80vh",
        borderRadius: "20px 20px 0 0",
        padding: "20px",
        boxShadow: "0 -5px 30px rgba(0,0,0,0.3)",
        zIndex: 100,
      });

      // Create trigger element
      const trigger = document.createElement("div");
      trigger.className = "drawer-trigger";
      trigger.innerHTML = "☰ Menu";
      trigger.style.position = "fixed";
      trigger.style.bottom = "20px";
      trigger.style.right = "50%";
      trigger.style.translate = "50%";
      trigger.style.zIndex = "101";
      trigger.style.padding = "10px 20px";
      trigger.style.background = "#000";
      trigger.style.color = "#fff";
      trigger.style.borderRadius = "50px";
      trigger.style.cursor = "pointer";
      trigger.addEventListener("click", toggleDrawer);

      document.body.appendChild(trigger);
      drawerTriggerRef.current = trigger;

      return () => {
        if (drawerTriggerRef.current) {
          document.body.removeChild(drawerTriggerRef.current);
        }
      };
    } else {
      // Desktop animation
      const tl = gsap.timeline({ defaults: { ease: "power1.out" } });
      tl.fromTo(gsap.utils.toArray(".overview > *"), { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.15 });
    }
  }, [isMobile]);

  const toggleDrawer = () => {
    if (isOpen) {
       gsap.set(overviewRef.current, {
        opacity: 1,
      });
      gsap.to(overviewRef.current, {
        y: "80%",
        // opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
      });
     
    } else {
      gsap.to(overviewRef.current, {
        y: 0,
        // opacity: 1,
        duration: 0.3,
        ease: "power2.inOut",
      });
      gsap.set(overviewRef.current, {
        opacity: 1,
      });
    }
    setIsOpen(!isOpen);
  };

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
          {/* <div className='drawerUnderlay'></div> */}
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
