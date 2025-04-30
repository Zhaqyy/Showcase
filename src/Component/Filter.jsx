import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "../Style/Component.scss";

const FilterAnimation = ({ tags, selectedFilter, setSelectedFilter }) => {
  const containerRef = useRef(null);
  const buttonsRef = useRef([]);
  const svgIconsRef = useRef([]);

  useEffect(() => {
    // Set up animations for each button
    buttonsRef.current.forEach((button, index) => {
      const isSelected = tags[index].name === selectedFilter;

      // Initial state
      gsap.set(button, {
        backgroundColor: isSelected ? "#294122" : "rgba(39, 39, 42, 0.5)",
      });

      // SVG animation
      if (svgIconsRef.current[index]) {
        gsap.set(svgIconsRef.current[index], {
          scale: isSelected ? 1 : 0,
          opacity: isSelected ? 1 : 0,
        });
      }
    });
  }, [selectedFilter, tags]);

  const handleButtonClick = tagName => {
    setSelectedFilter(tagName);

    buttonsRef.current.forEach((button, index) => {
      const isSelected = tags[index].name === tagName;

      // Button background animation
      gsap.to(button, {
        backgroundColor: isSelected ? "#294122" : "rgba(39, 39, 42, 0.5)",
        duration: 0.35,
        ease: "power2.out",
      });

      // SVG animation
      if (svgIconsRef.current[index]) {
        gsap.to(svgIconsRef.current[index], {
          scale: isSelected ? 1 : 0,
          opacity: isSelected ? 1 : 0,
          duration: 0.35,
          ease: "elastic.out(1, 0.5)",
        });
      }

      // Text container width animation
      const textContainer = button.querySelector(".text-container");
      if (textContainer) {
        gsap.to(textContainer, {
          //   width: isSelected ? "auto" : "100%",
          paddingRight: isSelected ? "1.5rem" : "0",
          duration: 0.35,
          ease: "back.out(1.85)",
        });
      }
    });
  };

  const handleButtonHover = (index, isHover) => {
    const isSelected = tags[index].name === selectedFilter;

    if (!isSelected) {
      gsap.to(buttonsRef.current[index], {
        backgroundColor: isHover ? "rgba(39, 39, 42, 0.8)" : "rgba(39, 39, 42, 0.5)",
        duration: 0.35,
        ease: "power1.inOut",
      });
    }
  };

  const handleButtonTap = (index, isTap) => {
    const isSelected = tags[index].name === selectedFilter;

    gsap.to(buttonsRef.current[index], {
      backgroundColor: isSelected ? (isTap ? "#1f1209" : "#2a1711") : isTap ? "rgba(39, 39, 42, 0.9)" : "rgba(39, 39, 42, 0.5)",
      duration: 0.1,
    });
  };

  return (
    <div className='filter-container'>
      <div ref={containerRef} className='filter-buttons'>
        {tags.map((tag, index) => {
          const isSelected = tag.name === selectedFilter;

          return (
            <button
              key={tag.name}
              ref={el => (buttonsRef.current[index] = el)}
              onClick={() => handleButtonClick(tag.name)}
              onMouseEnter={() => handleButtonHover(index, true)}
              onMouseLeave={() => handleButtonHover(index, false)}
              onMouseDown={() => handleButtonTap(index, true)}
              onMouseUp={() => handleButtonTap(index, false)}
              className={`filter-button ${isSelected ? "selected" : ""}`}
            >
              <div className='text-container'>
                <span>{tag.name}</span>
                <span ref={el => (svgIconsRef.current[index] = el)} className='svg-icon'>
                  <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' className='animated-check'>
                    <g fill='none' stroke='#f1ccba' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2'>
                      <path
                        strokeDasharray='64'
                        strokeDashoffset='64'
                        d='M3 12c0 -4.97 4.03 -9 9 -9c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9Z'
                      >
                        <animate fill='freeze' attributeName='stroke-dashoffset' dur='0.6s' values='64;0' />
                      </path>
                      <path strokeDasharray='12' strokeDashoffset='12' d='M7 12h10'>
                        <animate fill='freeze' attributeName='stroke-dashoffset' begin='0.6s' dur='0.2s' values='12;0' />
                      </path>
                    </g>
                  </svg>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterAnimation;
