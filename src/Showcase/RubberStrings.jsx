import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import "../Style/Showcase.scss";

const RubberStrings = () => {
  const stringRef = useRef(null);
  const svgRef = useRef(null);
  const controlPointRef = useRef(null);
  const [interactionMode, setInteractionMode] = useState("drag");
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [dragSide, setDragSide] = useState(null);
  const [dimensions, setDimensions] = useState({ 
    width: typeof window !== 'undefined' ? window.innerWidth : 0, 
    height: typeof window !== 'undefined' ? window.innerHeight : 0 
  });
  const gap = 10;
  const linesRef = useRef([]);

  // Generate lines on mount and resize
  const generateLines = () => {
    if (!svgRef.current) return;

    const lineCount = Math.floor(dimensions.height / gap);
    linesRef.current = Array.from({ length: lineCount }, (_, i) => ({
      id: `curve-${i}`,
      centerY: i * gap,
      element: null
    }));

    svgRef.current.setAttribute("viewBox", `0 0 ${dimensions.width} ${lineCount * gap}`);
  };

  // Update lines based on control point position
  const updateLines = (controlX, controlY) => {
    linesRef.current.forEach((line, index) => {
      const element = document.getElementById(line.id);
      if (!element) return;

      const distanceFromControl = line.centerY - controlY;
      let bendX = controlX;
      let bendY;

      if (interactionMode === "hover") {
        if (distanceFromControl > 0) {
          bendY = controlY * 2 - index * 0.95 * gap;
          element.setAttribute(
            "d",
            `M0 ${line.centerY} Q ${bendX} ${bendY} ${dimensions.width} ${line.centerY}`
          );
        } else {
          element.setAttribute(
            "d",
            `M0 ${line.centerY} Q ${dimensions.width / 2} ${line.centerY} ${dimensions.width} ${line.centerY}`
          );
        }
      } else if (interactionMode === "drag") {
        if (controlY <= dimensions.height / 2) {
          if (distanceFromControl < 0) {
            bendY = controlY + Math.abs(distanceFromControl / 2);
            element.setAttribute(
              "d",
              `M0 ${line.centerY} Q ${bendX} ${bendY} ${dimensions.width} ${line.centerY}`
            );
          } else {
            element.setAttribute(
              "d",
              `M0 ${line.centerY} Q ${dimensions.width / 2} ${line.centerY} ${dimensions.width} ${line.centerY}`
            );
          }
        } else {
          if (distanceFromControl > 0) {
            bendY = controlY - Math.abs(distanceFromControl / 2);
            element.setAttribute(
              "d",
              `M0 ${line.centerY} Q ${bendX} ${bendY} ${dimensions.width} ${line.centerY}`
            );
          } else {
            element.setAttribute(
              "d",
              `M0 ${line.centerY} Q ${dimensions.width / 2} ${line.centerY} ${dimensions.width} ${line.centerY}`
            );
          }
        }
      }
    });
  };
// Generate lines on mount
useEffect(() => {
    generateLines(); // Generate lines immediately

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Set initial dimensions
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Regenerate when dimensions change
  useEffect(() => {
    generateLines();
  }, [dimensions]);
  
  // Reset lines with GSAP animation
  const resetLinesToDefault = () => {
    linesRef.current.forEach((line, index) => {
      const element = document.getElementById(line.id);
      if (!element) return;

      const defaultPath = `M0 ${line.centerY} Q ${dimensions.width / 2} ${line.centerY} ${dimensions.width} ${line.centerY}`;
      
      gsap.to(element, {
        attr: { d: defaultPath },
        duration: 0.5,
        delay: index * 0.002,
        ease: "elastic.out(1, 0.35)"
      });
    });
  };

  // Event handlers
  const handlePointerMove = (e) => {
    if (interactionMode !== "hover") return;

    const controlX = e.clientX;
    const controlY = e.clientY;

    if (controlPointRef.current) {
      gsap.to(controlPointRef.current, {
        attr: { cx: controlX, cy: controlY },
        duration: 0.1
      });
    }

    updateLines(controlX, controlY);
  };

  const handlePointerDown = (e) => {
    if (interactionMode !== "drag") return;

    setIsMouseDown(true);
    setDragSide(e.clientY <= dimensions.height / 2 ? "top" : "bottom");

    const controlX = e.clientX;
    const controlY = e.clientY;

    if (controlPointRef.current) {
      gsap.to(controlPointRef.current, {
        attr: { cx: controlX, cy: controlY },
        duration: 0.1
      });
    }

    updateLines(controlX, controlY);
  };

  const handleDragMove = (e) => {
    if (!isMouseDown || interactionMode !== "drag") return;

    const controlX = e.clientX;
    const controlY = e.clientY;

    if (controlPointRef.current) {
      gsap.to(controlPointRef.current, {
        attr: { cx: controlX, cy: controlY },
        duration: 0.1
      });
    }

    linesRef.current.forEach((line, index) => {
      const element = document.getElementById(line.id);
      if (!element) return;

      const distanceFromControl = line.centerY - controlY;
      let bendX = controlX;
      let bendY;

      const indexFactor = index / linesRef.current.length;
      const gapEffect = gap * 0.5;
      const distanceEffect = Math.abs(distanceFromControl / 2);

      if (dragSide === "top") {
        if (distanceFromControl < 0) {
          bendY = controlY + distanceEffect * (2 - indexFactor) - gapEffect * indexFactor;
          element.setAttribute(
            "d",
            `M0 ${line.centerY} Q ${bendX} ${bendY} ${dimensions.width} ${line.centerY}`
          );
        } else {
          element.setAttribute(
            "d",
            `M0 ${line.centerY} Q ${dimensions.width / 2} ${line.centerY} ${dimensions.width} ${line.centerY}`
          );
        }
      } else if (dragSide === "bottom") {
        if (distanceFromControl > 0) {
          bendY = controlY - distanceEffect * (1 + indexFactor) - gapEffect * indexFactor;
          element.setAttribute(
            "d",
            `M0 ${line.centerY} Q ${bendX} ${bendY} ${dimensions.width} ${line.centerY}`
          );
        } else {
          element.setAttribute(
            "d",
            `M0 ${line.centerY} Q ${dimensions.width / 2} ${line.centerY} ${dimensions.width} ${line.centerY}`
          );
        }
      }
    });
  };

  const handlePointerUp = () => {
    setIsMouseDown(false);
    resetLinesToDefault();
  };

  // Set up event listeners and initial state
  useEffect(() => {
    generateLines();
    if (!stringRef.current) return
const strings = stringRef.current
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    strings.addEventListener('pointermove', handlePointerMove);
    strings.addEventListener('pointerdown', handlePointerDown);
    strings.addEventListener('pointermove', handleDragMove);
    strings.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('resize', handleResize);
      strings.removeEventListener('pointermove', handlePointerMove);
      strings.removeEventListener('pointerdown', handlePointerDown);
      strings.removeEventListener('pointermove', handleDragMove);
      strings.removeEventListener('pointerup', handlePointerUp);
    };
  }, [interactionMode, isMouseDown, dragSide, dimensions]);

  return (
    <div ref={stringRef} className="RubberStrings body">
      <svg ref={svgRef} id="line">
        {linesRef.current.map((line) => (
          <path
            key={line.id}
            id={line.id}
            className="dynamic-curve"
            d={`M0 ${line.centerY} Q ${dimensions.width / 2} ${line.centerY} ${dimensions.width} ${line.centerY}`}
            fill="transparent"
          />
        ))}
        <circle cx="10" cy="80" r="2" fill="none" id="start-point" />
        <circle cx="180" cy="80" r="2" fill="none" id="end-point" />
        <circle 
          ref={controlPointRef}
          cx="20" 
          cy="20" 
          r="10" 
          width="60" 
          height="60" 
          fill="none" 
          id="control-point" 
        />
      </svg>

      <div className="bg"></div>
      <div className="bgText">
        <p>98 / 100</p>
      </div>

      <div className="info">
        <h1>100 Day Challenge</h1>
        <div className="credit">
          <p>Design By :<br />Suz Sirunyan</p>
          <p>Coded By :<br />Abdulrazaq Shuaib</p>

          <div id="control-panel">
            <label>
              <input
                type="radio"
                name="interaction-mode"
                value="hover"
                checked={interactionMode === 'hover'}
                onChange={() => setInteractionMode('hover')}
              /> Hover Mode
            </label>
            <label>
              <input
                type="radio"
                name="interaction-mode"
                value="drag"
                checked={interactionMode === 'drag'}
                onChange={() => setInteractionMode('drag')}
              /> Drag Mode
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RubberStrings;