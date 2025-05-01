import React, { useRef, useState, useEffect } from "react";
import { showcaseData } from "../Data/showcaseData";
import { overviewData } from "../Data/overviewData";
import "../Style/Home.scss";

import gsap from "gsap";
import useIsMobile from "../Util/isMobile.jsx";
import Filter from "../Component/Filter";

function Home() {
  const [activeShowcase, setActiveShowcase] = useState(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState(["All"]);
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

  const filteredShowcases = showcaseData.filter(
    item => selectedFilters.includes("All") || selectedFilters.some(filter => item.tags.includes(filter))
  );

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
    tl.set(".hero .main", { overflowY: "hidden", height: "100vh", minHeight: 0 });
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
    gsap.set(".hero .main", { overflowY: "auto", height: "100%", minHeight: "150vh" });
    gsap.to(".showcaseItem", { opacity: 1, y: 0, duration: 1, ease: "power1.Out", stagger: 0.1 });
    setSelectedShowcase(null);
  };

  // overview sidebar stuff entry animation
  useEffect(() => {
    const overview = overviewRef.current;
    const sections = gsap.utils.toArray(".overview > *");

    const tl = gsap.timeline({
      defaults: { ease: "power1.out" },
    });

    tl.fromTo(
      sections,
      { opacity: 0 },
      {
        opacity: 1,
        // y: 0,
        duration: 0.5,
        stagger: 0.15,
      }
    );

  }, []);

  // fullscreen showcase sidebar stuff
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

  // disable multiple active collapsible
  useEffect(() => {
    if (sidebarRef.current) {
      const sections = sidebarRef.current.querySelectorAll("details");
      sections.forEach(section => {
        section.addEventListener("toggle", e => {
          if (e.target.open) {
            sections.forEach(s => s !== e.target && (s.open = false));
          }
        });
      });
    }
  }, [selectedShowcase]);

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
        <div className='identity-section'>
          <h1 className='name'>{overviewData.identity.name}</h1>
          <h4 className='title'>{overviewData.identity.title}</h4>
        </div>

        <div className='filter'>
          <h3>Filter Experiments</h3>
          <Filter
            tags={getFilterTags()}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            onFilterChange={handleFilterChange}
          />
        </div>

        <div className='contact-section'>
          <h3>Summoning Circle</h3>
          <ul>
            {["GitHub", "LinkedIn", "Twitter"].map(platform => (
              <li key={platform}>{platform}</li>
            ))}
          </ul>
          <div className='availability'>{overviewData.interaction.collaborationStatus}</div>
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
            {/* Header Section */}
            <div className='sidebar-header'>
              <h3>{selectedShowcase.title}</h3>
              <p className='description'>{selectedShowcase.description}</p>
              <div className='tags'>
                {selectedShowcase.tags.map(tag => (
                  <span key={tag} className='tag'>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Stats (Always Visible) */}
            <div className='quick-stats'>
              <div className='stat'>
                <span className='label'>Mood</span>
                <span className='value'>{selectedShowcase.mood}</span>
              </div>
              <div className='stat'>
                <span className='label'>Interaction Type</span>
                <span className='value'>⌨️ {selectedShowcase.interactionType}</span>
              </div>
              <div className='stat'>
                <span className='label'>Personal Rating</span>
                <span className='value'>⭐ {selectedShowcase.personalRating}/5</span>
              </div>
              <div className='stat'>
                <span className='label'>Likes</span>
                <span className='value'>♥ {selectedShowcase.likes}</span>
              </div>
            </div>

            {/* Collapsible: Extra Information */}
            <details className='collapsible-section' open>
              <summary className='section-title'>Extra Useless Info</summary>
              <div className='section-content'>
                <div className='detail'>
                  <p>{selectedShowcase.content}</p>
                </div>
              </div>
            </details>

            {/* Collapsible: How to Use */}
            <details className='collapsible-section'>
              <summary className='section-title'>How to Use</summary>
              <div className='section-content'>
                <div className='detail'>
                  <span className='detail-label'>Soundtrack</span>
                  <span>{selectedShowcase.soundtrack}</span>
                </div>
                <div className='detail'>
                  <span className='detail-label'>Best Viewed With</span>
                  <span>{selectedShowcase.bestViewedWith}</span>
                </div>
                <div className='detail'>
                  <span className='detail-label'>Secret</span>
                  <span className='easter-egg'>{selectedShowcase.secretInteraction}</span>
                </div>
              </div>
            </details>

            {/* Collapsible: Behind the Scenes */}
            <details className='collapsible-section'>
              <summary className='section-title'>Behind the Scenes</summary>
              <div className='section-content'>
                <div className='detail'>
                  <span className='detail-label'>Build Time</span>
                  <span>{selectedShowcase.timeToBuild}</span>
                </div>
                <div className='detail'>
                  <span className='detail-label'>Difficulty</span>
                  <span>{selectedShowcase.difficulty}</span>
                </div>
                <div className='detail'>
                  <span className='detail-label'>Inspiration</span>
                  <span>{selectedShowcase.inspiration}</span>
                </div>
              </div>
            </details>

            {/* Collapsible: Technical */}
            <details className='collapsible-section'>
              <summary className='section-title'>Technical</summary>
              <div className='section-content'>
                <div className='detail'>
                  <span className='detail-label'>Tech</span>
                  <span>{selectedShowcase.tech.join(", ")}</span>
                </div>
                <div className='detail'>
                  <span className='detail-label'>Warning</span>
                  <span className='warning'>{selectedShowcase.warning}</span>
                </div>
              </div>
            </details>
          </div>
        </div>
      )}
    </section>
  );
}

export default Home;
