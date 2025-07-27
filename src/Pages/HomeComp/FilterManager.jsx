import React, { useMemo } from "react";
import { useShowcase } from "../../Context/ShowcaseContext";
import Filter from "../../Component/Filter";
import showcaseData from "../../Data/showcaseData";

const FilterManager = () => {
  const { selectedFilters, setSelectedFilters } = useShowcase();

  // Filter functions
  const getFilterTags = useMemo(() => {
    const allTags = showcaseData.flatMap(item => item.category);
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
    // This could be moved to a custom hook or context
    if (typeof window !== 'undefined' && window.gsap) {
      window.gsap.set(".showcaseItem", {
        opacity: 0,
        onComplete: () => {
          window.gsap.to(".showcaseItem", {
            opacity: 1,
            duration: 1,
            stagger: 0.1,
            ease: "power1.out",
          });
        },
      });
    }
  };

  return (
    <div className='filter'>
      <h3>Filter Experiments</h3>
      <Filter
        tags={getFilterTags}
        selectedFilters={selectedFilters}
        setSelectedFilters={setSelectedFilters}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
};

export default FilterManager; 