import React, { useRef, useEffect } from "react";
import gsap from "gsap";
import ShowcaseWrapper from "./ShowcaseWrapper";
import ShowcaseLoader from "./ShowcaseLoader";

const ShowcaseContent = ({ showcase, onClose }) => {
  const contentContainerRef = useRef();

  // Fade transition when showcase changes
  useEffect(() => {
    if (contentContainerRef.current) {
      gsap.set(contentContainerRef.current, {
        opacity: 0,
      })
      
      // Fade out current content
      gsap.to(contentContainerRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: "power2.out",
        onComplete: () => {
          // Fade in new content
          gsap.to(contentContainerRef.current, {
            opacity: 1,
            duration: 0.2,
            ease: "power2.out"
          });
        }
      });
    }
  }, [showcase.id]);

  // Handle component loaded callback
  const handleComponentLoaded = (Component) => {
    // Component has been loaded successfully
    // You can add any additional logic here if needed
  };

  return (
    <div className='scContent' ref={contentContainerRef}>
      <div style={{ width: "100%", height: "100%", touchAction: "none" }}>
        <ShowcaseLoader 
          showcase={showcase} 
          onComponentLoaded={handleComponentLoaded}
        />
      </div>
    </div>
  );
};

export default ShowcaseContent; 