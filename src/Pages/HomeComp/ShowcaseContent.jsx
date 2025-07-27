import React, { useRef, useEffect } from "react";
import ShowcaseWrapper from "./ShowcaseWrapper";
import ShowcaseLoader from "./ShowcaseLoader";

const ShowcaseContent = ({ showcase, onClose }) => {
  const contentContainerRef = useRef();

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