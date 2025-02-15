import React, { useEffect, useRef } from "react";
import "../Style/Home.scss";

import gsap from "gsap";
import { animateHome, animateHomeFoot } from "../Util/PageAnimations";

function Home({ activeIndex, setActiveIndex }) {
  const homeRef = useRef();
  const containerRef = useRef(null);


  // useEffect(() => {
  //   const context = gsap.context(() => {
  //     const tl = gsap.timeline({delay:0.5});

  //     tl.add(animateHome(homeRef));
  //     tl.add(animateHomeFoot(containerRef), "-=90%");

  //   }, homeRef);

  //   return () => context.revert(); // Cleanup on unmount
  // }, []);

  return (
    <section className='hero' ref={homeRef}>
      <div className="overview"></div>
      <div className="main"></div>
    </section>
  );
}

export default Home;
