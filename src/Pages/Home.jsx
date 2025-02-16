import React, { useRef, useState } from "react";
import { showcaseData } from "../Data/showcaseData";
import "../Style/Home.scss";
import gsap from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

function Home() {
  const [activeShowcase, setActiveShowcase] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const overviewRef = useRef();
  const mainBodyRef = useRef();
  const showcaseRefs = useRef([]);
  const newSidebarRef = useRef();

  return (
    <section className='hero'>
      {/* Left Sidebar */}
      <div className='overview' ref={overviewRef}>
        <div>
          <h1 className='name'>Shuaib Abdulrazaq</h1>
          <h4 className='name'>Creative Developer</h4>
        </div>

        <div className='filter'>
          <h3>Filter Experiments</h3>
          <div className='filter-buttons'>
            {["All", "WebGL", "Animation", "Prototype"].map(filter => (
              <button key={filter}>{filter}</button>
            ))}
          </div>
        </div>

        <div className='currentInfo'>
          <h3>Hover to see brief Details</h3>
        </div>

        <div className='contact'>
          <ul>
            {["GitHub", "LinkedIn", "Twitter", "Email"].map(platform => (
              <li key={platform}>{platform}</li>
            ))}
          </ul>
          <h6>AVAILABLE FOR HIRE</h6>
        </div>
      </div>

      {/* Main Content */}
      <div className='main'>
        <div className='mainhead'>
          <div className='headTitle'>
            <h6>LOOK THROUGH MY</h6>
            <p>MIND</p>
            <p>EXPERIMENTS</p>
            <p>INNER CHAMBER</p>
          </div>
          <div className='headInfo'>
            They say the mind is as vast as the universe but mine is an unmanaged zoo with ideas and inspirations. A special storage for 3D
            scenes, web experiences, web arts, designs, prototypes, concepts and many more big words that I managed to bring to life.
          </div>
        </div>

        <div className='mainBody' ref={mainBodyRef}>
          {showcaseData.map((item, index) => (
            <div
              key={item.id}
              className={`showcaseItem`}
              ref={el => (showcaseRefs.current[index] = el)}
              // onClick={e => handleShowcaseClick(index, e)}
            >
              <div className='item-content'>
                <h3>{item.title}</h3>
                <div className='hover-details'>
                  <p>{item.description}</p>
                  <div className='tags'>
                    {item.tags.map(tag => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}

export default Home;
