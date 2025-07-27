import React, { useState, useLayoutEffect } from "react";
import gsap from "gsap";
import Intro from "./Intro";

const Loader = ({ onComplete }) => {
  const [timeline, setTimeline] = useState(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
      });
      setTimeline(tl);
    });

    return () => ctx.revert(); // Cleanup
  }, []);

  const handleComplete = () => {
    onComplete(); // Notify parent
  };

  return <Intro timeline={timeline} onComplete={handleComplete} />;
};

// Memoize Loader for performance
export default React.memo(Loader);
