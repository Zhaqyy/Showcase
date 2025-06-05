import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import '../Style/Component.scss';

const DirButton = ({ 
  children,
  className = '',
  style = {},
  onClick = () => {},
  buttonColor = '#17307F',
  circleColor = 'white',
  shadowColor = '#C5C5C5',
  ...props 
}) => {
  const buttonRef = useRef(null);
  const circleRef = useRef(null);
  const timeline = useRef(null);

  useEffect(() => {
    const btn = buttonRef.current;
    const circle = circleRef.current;

    // Set initial state
    gsap.set(circle, {
      scale: 0.2,
      opacity: 0
    });

    // Create animation timeline
    timeline.current = gsap.timeline({ paused: true });
    timeline.current
      .to(btn, {
        duration: 0.1,
        scale: 0.95,
        // boxShadow: `0px -2px 20px 0px ${shadowColor}`,
        ease: "sine.in"
      })
      .to(circle, {
        scale: 5,
        opacity: 0.2
      }, "<");

    // Clean up
    return () => {
      timeline.current.kill();
    };
  }, [shadowColor]);

  const setPosition = (e) => {
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;

    gsap.set(circleRef.current, {
      left: `${x}px`,
      top: `${y}px`
    });
  };

  const handleMouseEnter = (e) => {
    setPosition(e);
    timeline.current.play();
  };

  const handleMouseLeave = (e) => {
    setPosition(e);
    timeline.current.reverse();
  };

  return (
    <button
      ref={buttonRef}
      className={`button-effect ${className}`}
      style={{ 
        backgroundColor: buttonColor,
        // boxShadow: `0px -8px 20px 5px ${shadowColor}`,
        ...style 
      }}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
      <span 
        ref={circleRef} 
        className="button-effect-circle"
        style={{ backgroundColor: circleColor }}
      />
    </button>
  );
};

export default DirButton;

// Use Like this
{/* <DirButton onClick={() => console.log('Button clicked!')}>
You can put any content here 
</DirButton> */}

{/* Customized example */}
{/* 
<DirButton 
buttonColor="#FF5733" 
circleColor="#33FF57"
shadowColor="#333333"
style={{ }}
>
You can put any content here
</DirButton>
 */}