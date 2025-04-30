import React, { useRef, useState, useEffect } from "react";
import { showcaseData } from "../Data/showcaseData";
import "../Style/Home.scss";
import gsap from "gsap";
import useIsMobile from "../Util/isMobile.jsx";
import FilterAnimation from "../Component/Filter";
function Home() {
  const [activeShowcase, setActiveShowcase] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedShowcase, setSelectedShowcase] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [backgroundIndex, setBackgroundIndex] = useState(0);

  const isMobile = useIsMobile(800);

  const overviewRef = useRef();
  const sidebarRef = useRef();
  const mainBodyRef = useRef();
  const showcaseRefs = useRef([]);

  // Dynamic background cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setBackgroundIndex(prev => (prev + 1) % showcaseData.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filter functions
  const getFilterTags = () => {
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
  };

  const tags = getFilterTags();
  const filteredShowcases = showcaseData.filter(item => (selectedFilter === "All" ? true : item.tags.includes(selectedFilter)));

  // Animation functions
  const animateSidebarCollapse = () => {
    const tl = gsap.timeline();
    tl.to(overviewRef.current, {
      width: 100,
      borderRadius: 20,
      position: "fixed",
      duration: 0.5,
      ease: "power2.inOut",
    })
      .to(".filter, .currentInfo, .contact", { opacity: 0, duration: 0.3 }, "-=0.2")
      .to(".name", { fontSize: "1rem", duration: 0.3 }, "-=0.2");
    return tl;
  };

  const animateMainContentExit = () => {
    return gsap.to(".showcaseItem", {
      opacity: 0,
      // y: 50,
      duration: 0.5,
      ease: "power2.inOut",
      stagger: 0.1,
    });
  };

  const handleShowcaseClick = async (index, e) => {
    if (isAnimating) return;
    setIsAnimating(true);

    const selectedItem = showcaseRefs.current[index];
    const clone = selectedItem.cloneNode(true);

    const tl = gsap.timeline();
    // tl.add(animateSidebarCollapse())
    tl.add(animateMainContentExit(), "-=0.2").to(
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

    setSelectedShowcase(filteredShowcases[index]);
    setIsAnimating(false);
  };

  const handleCloseShowcase = () => {
    // gsap.to(overviewRef.current, {
    //   width: "25%",
    //   borderRadius: 0,
    //   position: 'relative',
    //   duration: 0.5,
    //   ease: 'power2.inOut'
    // });
    // gsap.to('.filter, .currentInfo, .contact', { opacity: 1, duration: 0.3 });
    // gsap.to('.name', { fontSize: '2rem', duration: 0.3 });
    gsap.to(".showcaseItem", { opacity: 1, y: 0, duration: 1, ease: "power1.Out", stagger: 0.1 });
    setSelectedShowcase(null);
  };

  // showcase sidebar stuff
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const hamburgerRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // sidebar fade-in animation
  useEffect(() => {
    if (sidebarRef.current) {
      gsap.to(sidebarRef.current, {
        autoAlpha: 1,
        duration: 0.5,
        ease: "expo.inOut",
        delay: 1,
      });
    }
  }, []);

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

  const initialScrollY = useRef(0);

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

  // // Reset menu state on desktop
  // useEffect(() => {
  //   if (isMobile) {
  //     setIsMenuOpen(false);
  //     gsap.set(sidebarRef.current, { autoAlpha: 1, x: 0 });
  //     // gsap.set(menuItems.current, { autoAlpha: 1, y: 0 });
  //   }
  // }, [isMobile]);

  return (
    <section className='hero'>
      {/* Dynamic Background */}
      <div className='dynamic-background'>
        {showcaseData.map((item, index) => (
          <div
            key={item.id}
            className={`bg-item ${index === backgroundIndex ? "active" : ""}`}
            style={{ backgroundImage: `url(${item.image})` }}
          />
        ))}
      </div>

      {/* Left Sidebar */}
      <div className='overview' ref={overviewRef}>
        <div>
          <h1 className='name'>Shuaib Abdulrazaq</h1>
          <h4 className='name'>Creative Developer</h4>
        </div>

        <div className='filter'>
          <h3>Filter Experiments</h3>
          {/* <div className='filter-buttons'>
            {getFilterTags().map(({ name, count }) => (
              <button
                key={name}
                onClick={() => setSelectedFilter(name === "All" ? "All" : name)}
                className={selectedFilter === name ? "active" : ""}
              >
                {name} <span className='tag-count'>({count})</span>
              </button>
            ))}
          </div> */}
          <FilterAnimation tags={tags} selectedFilter={selectedFilter} setSelectedFilter={setSelectedFilter} />
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
          {filteredShowcases.map((item, index) => (
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

      {/* Fullscreen Showcase */}
      {selectedShowcase && (
        <div className='fullscreen-showcase'>
          <div className='scContent'>
            <h2>{selectedShowcase.title}</h2>
            <p>{selectedShowcase.description}</p>
            <button onClick={handleCloseShowcase}>Back to Experiments</button>
          </div>
          <button className={`hamburger ${isMenuOpen ? "active" : ""}`} ref={hamburgerRef} onClick={toggleMenu} aria-label='Menu'>
            <span className='hamburger-line'></span>
            <span className='hamburger-line'></span>
            <span className='hamburger-line'></span>
          </button>

          <div className='scSidebar' ref={sidebarRef}>
            <div className='item-content'>
              <h3>{selectedShowcase.title}</h3>
              <div className='hover-details'>
                <p>{selectedShowcase.description}</p>
                <div className='tags'>
                  {selectedShowcase.tags.map(tag => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Home;
