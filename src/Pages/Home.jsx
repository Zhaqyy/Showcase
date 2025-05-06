import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import showcaseData from "../Data/showcaseData";
import OverviewSidebar from "./HomeComp/OverviewSidebar";
import MainContent from "./HomeComp/MainContent";
import FullscreenShowcase from "./HomeComp/FullscreenShowcase";
import "../Style/Home.scss";
import useIsMobile from "../util/isMobile";

function Home() {
  const [selectedFilters, setSelectedFilters] = useState(["All"]);
  const [selectedShowcase, setSelectedShowcase] = useState(null);
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const showcaseRefs = useRef([]);
  const mainBodyRef = useRef([]);
  const isMobile = useIsMobile(800);

  // Filter showcases
  const filteredShowcases = showcaseData.filter(
    item => selectedFilters.includes("All") || selectedFilters.some(filter => item.tags.includes(filter))
  );

  // Background cycling
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setBackgroundIndex(prev => (prev + 1) % showcaseData.length);
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, []);

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
    tl.set(".hero .main", { overflowY: "hidden", height: "100vh", minHeight: 0 });
    setSelectedShowcase(filteredShowcases[index]);
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
    setSelectedShowcase(null);
  };

  return (
    <section className='hero'>
      {/* Dynamic Background */}
      {/* <div className='dynamic-background'>
        {showcaseData.map((item, index) => (
          <div
            key={item.id}
            className={`bg-item ${index === backgroundIndex ? "active" : ""}`}
            style={{ backgroundImage: `url(${item.image})` }}
          />
        ))}
      </div> */}
      {/* Overview Sidebar */}
      <OverviewSidebar selectedFilters={selectedFilters} setSelectedFilters={setSelectedFilters} />

      {/* Main Content */}
      <MainContent ref={mainBodyRef} showcases={filteredShowcases} onShowcaseClick={handleShowcaseClick} showcaseRefs={showcaseRefs} />

      {/* Fullscreen Showcase */}
      {selectedShowcase && <FullscreenShowcase showcase={selectedShowcase} allShowcases={showcaseData} onClose={handleCloseShowcase} isMobile={isMobile} />}
    </section>
  );
}
// 2. what if I want to make each showcase have a unique URL, so that way I can send them directly to people just by using the URL, 
// do you get, that way I can reference it easily
export default Home;
