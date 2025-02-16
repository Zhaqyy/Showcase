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

  const handleShowcaseClick = async (index, e) => {
    const item = showcaseRefs.current[index];
    const state = Flip.getState(item);

    item.style.position = "fixed";
    item.style.zIndex = 1000;

    const tl = gsap.timeline();

    // Animate sidebar out
    tl.to(overviewRef.current, {
      x: "-100%",
      duration: 0.5,
      ease: "power2.inOut",
    });

    // FLIP animation to full screen
    tl.add(
      Flip.from(state, {
        duration: 1.2,
        ease: "power4.inOut",
        absolute: true,
        onComplete: () => setActiveShowcase(index),
      }),
      "-=0.3"
    );

    // Animate in new sidebar
    tl.fromTo(newSidebarRef.current, { x: "100%" }, { x: "0%", duration: 0.5, ease: "power2.out" }, "-=0.5");
  };

  const handleClose = () => {
    const item = showcaseRefs.current[activeShowcase];
    const state = Flip.getState(item);

    const tl = gsap.timeline();

    // Animate new sidebar out
    tl.to(newSidebarRef.current, {
      x: "100%",
      duration: 0.3,
      ease: "power2.in",
    });

    // Return main sidebar
    tl.to(
      overviewRef.current,
      {
        x: "0%",
        duration: 0.5,
        ease: "power2.out",
      },
      "-=0.2"
    );

    // FLIP animation back to grid
    tl.add(
      Flip.from(state, {
        duration: 1,
        ease: "power4.inOut",
        absolute: true,
        onComplete: () => {
          item.style.position = "absolute";
          item.style.zIndex = "auto";
          setActiveShowcase(null);
        },
      }),
      "-=0.5"
    );
  };

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
              onClick={e => handleShowcaseClick(index, e)}
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

      {/* Active Showcase Overlay */}
      {activeShowcase !== null && (
        <div className='full-overlay'>
          <button className='close-button' onClick={handleClose}>
            &times;
          </button>
          <div className='full-content'>{showcaseData[activeShowcase].content}</div>
        </div>
      )}

      {/* Right Sidebar */}
      <div className='new-sidebar' ref={newSidebarRef}>
        <button className='sidebar-toggle' onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}>
          {isSidebarExpanded ? "◀" : "▶"}
        </button>

        {isSidebarExpanded && activeShowcase !== null && (
          <div className='sidebar-content'>
            <h3>{showcaseData[activeShowcase].title}</h3>
            <div className='meta-info'>
              <p>
                <strong>Tech Stack:</strong> {showcaseData[activeShowcase].tech.join(", ")}
              </p>
              <p>
                <strong>Created:</strong> {new Date(showcaseData[activeShowcase].date).toLocaleDateString()}
              </p>
            </div>
            <div className='action-buttons'>
              <button>View Demo</button>
              <button>View Code</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Home;
