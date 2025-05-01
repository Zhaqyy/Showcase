import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import { overviewData } from "../../Data/overviewData";
import { showcaseData } from "../../Data/showcaseData";
import Filter from "../../Component/Filter";
import "../../Style/Home.scss";

const OverviewSidebar = ({ selectedFilters, setSelectedFilters }) => {
  const overviewRef = useRef();

  // Animation on mount
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power1.out" } });
    tl.fromTo(gsap.utils.toArray(".overview > *"), { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.15 });
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
  );
};

export default OverviewSidebar;
