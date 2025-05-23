import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import "../Style/Showcase.scss";

const Backroom = () => {
  const wallsRef = useRef([]);
  const [variant, setVariant] = useState(0);

  // Handle variant changes
  useEffect(() => {
    if (variant === 0) {
      // Neon variant - animate between blue and purple
      gsap.fromTo(wallsRef.current, 
        { '--color': 'hsl(190 100% 50% / 1)' },
        {
          '--color': 'hsl(290 100% 50% / 1)',
          duration: 4.5,
          repeat: -1,
        //   yoyo: true,
          ease: 'sine.inOut'
        }
      );
    } else {
      // Default or glitch variant - reset to black
      gsap.killTweensOf(wallsRef.current);
      gsap.set(wallsRef.current, { '--color': 'hsl(0 0% 0% / 1)' });
    }
  }, [variant]);

  // Simple click cycling through variants
  const handleVariantChange = () => {
    setVariant((prev) => (prev + 1) % 2);
  };

  return (
    <div 
      className={`Backroom wrap variant-${variant}`} 
      onClick={handleVariantChange}
      tabIndex="0"
    >
      <div className="body">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`wall w${i}`} 
            ref={el => wallsRef.current[i-1] = el}
          />
        ))}
        <div className="shadow" />
      </div>
    </div>
  );
};

export default Backroom;