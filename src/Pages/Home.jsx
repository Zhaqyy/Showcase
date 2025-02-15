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
      <div className='overview'>
        <div>
          <h1 className='name'>Shuaib Abdulrazaq</h1>
          <h4 className='name'>Creative Developer</h4>
        </div>

        <div className='filter'></div>
        <div className='currentInfo'>
          <h3>Hover to see brief Details</h3>
        </div>
        <div className='contact'>
          <h5>AVAILABLE FOR HIRE</h5>
          <ul>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </ul>
        </div>
      </div>

      <div className='main'>
        <div className='mainhead'>
          <div className='headTitle'>
            <h6>LOOK THROUGH MY</h6>
            <p>MIND</p>
            <p>EXPERIMENTS</p>
            <p>INNER CHAMBER</p>
          </div>
          <div className='headInfo'>
            They say the mind is as vast as the universe but mine is an unmanaged zoo with ideas and inspirations. A special storage for 3d
            scenes, web experiences, web arts, designs, prototypes, concepts and many more big words that I managed to bring to life.
          </div>
        </div>
        <div className='mainBody'>
          <div className='showcaseItem'></div>
          <div className='showcaseItem'></div>
          <div className='showcaseItem'></div>
          <div className='showcaseItem'></div>
          <div className='showcaseItem'></div>
          <div className='showcaseItem'></div>
          <div className='showcaseItem'></div>
          <div className='showcaseItem'></div>
          <div className='showcaseItem'></div>
          <div className='showcaseItem'></div>
        </div>
      </div>
    </section>
  );
}

export default Home;
