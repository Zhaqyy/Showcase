import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { useShowcase } from "../Context/ShowcaseContext";
import { useUI } from "../Context/UIContext";
import OverviewSidebar from "./HomeComp/OverviewSidebar";
import MainContent from "./HomeComp/MainContent";
import FullscreenShowcase from "./HomeComp/FullscreenShowcase";
import "../Style/Home.scss";

function Home() {
  const { filteredShowcases, currentShowcase, currentIndex, navigateToShowcase, closeShowcase } = useShowcase();

  const { isMobile } = useUI();

  const showcaseRefs = useRef([]);
  const mainBodyRef = useRef([]);

  // Showcase click handler
  const handleShowcaseClick = async index => {
    const selectedItem = showcaseRefs.current[index];
    const clone = selectedItem.cloneNode(true);

    const tl = gsap.timeline();

    tl.to(".showcaseItem", { opacity: 0, duration: 0.5, stagger: 0.1 }).to(
      clone,
      {
        position: "fixed",
        top: "50%",
        left: "50%",
        x: "-50%",
        y: "-50%",
        width: "100vw",
        height: "100vh",
        duration: 0.8,
        ease: "power2.inOut",
      },
      "-=0.3"
    );
    gsap.set(".hero .main", { overflowY: "hidden", height: "100vh", minHeight: 0 });

    // Use context to navigate to showcase
    navigateToShowcase(index);
  };

  // Close showcase handler
  const handleCloseShowcase = () => {
    gsap.set(".hero .main", { overflowY: "auto", height: "100%", minHeight: "150vh" });
    gsap.to(".showcaseItem", {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power1.Out",
      stagger: 0.1,
    });
    window.scrollTo(0, 0);

    // Use context to close showcase
    closeShowcase();
  };

  return (
    <section className='hero' role='region' aria-label='Portfolio showcase'>
      {/* Overview Sidebar */}
      <OverviewSidebar />

      {/* Main Content */}
      <MainContent ref={mainBodyRef} showcases={filteredShowcases} onShowcaseClick={handleShowcaseClick} showcaseRefs={showcaseRefs} />

      {/* Fullscreen Showcase */}
      {currentShowcase && (
        <FullscreenShowcase showcase={currentShowcase} currentIndex={currentIndex} onClose={handleCloseShowcase} isMobile={isMobile} />
      )}
    </section>
  );
}

export default Home;
