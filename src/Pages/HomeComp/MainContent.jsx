import React, { forwardRef, useState, useEffect, useRef } from "react";
import { useUI } from "../../Context/UIContext";
import gsap from "gsap";
import "../../Style/Home.scss";

const MainContent = forwardRef(({ showcases, onShowcaseClick, showcaseRefs }, ref) => {
  const { viewMode } = useUI();
  const dividerRefs = useRef([]);
  const mouseTarget = useRef({ x: 0 });
  const animationRef = useRef(null);

  // GSAP animation for divider gradients with lerp
  useEffect(() => {
    if (viewMode !== 'list') return;

    const handleMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      mouseTarget.current.x = x;
    };

    // Smooth lerp animation loop
    const animateGradient = () => {
      dividerRefs.current.forEach((dividerRef) => {
        if (dividerRef) {
          const gradient = dividerRef.querySelector('.gradient-shine');
          if (gradient) {
            // Lerp the current position towards the target
            const currentX = gsap.getProperty(gradient, "x") || 0;
            const targetX = mouseTarget.current.x;
            const lerpedX = currentX + (targetX - currentX) * 0.05; // 0.1 = lerp factor (lower = smoother)
            
            gsap.set(gradient, { x: lerpedX });
          }
        }
      });
      animationRef.current = requestAnimationFrame(animateGradient);
    };

    const mainBody = document.querySelector('.mainBody');
    if (mainBody) {
      mainBody.addEventListener('mousemove', handleMouseMove);
      animateGradient();
    }

    return () => {
      if (mainBody) {
        mainBody.removeEventListener('mousemove', handleMouseMove);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [viewMode]);

  // Memoized ShowcaseItem for performance
  const ShowcaseItem = React.memo(({ item, index, onShowcaseClick, showcaseRefs }) => {
    // Keyboard handler for accessibility
    const handleKeyDown = e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onShowcaseClick(index);
      }
    };
    return (
      <div
        key={item.id}
        className={`showcaseItem ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}
        ref={el => (showcaseRefs.current[index] = el)}
        onClick={() => onShowcaseClick(index)}
        tabIndex={0}
        role='button'
        aria-pressed='false'
        aria-labelledby={`showcase-${item.id}-title`}
        aria-describedby={`showcase-${item.id}-desc`}
        onKeyDown={handleKeyDown}
      >
        {/* Add thumbnail container */}
        <div className='thumbnail-container'>
          {item.thumbnail ? (
            <img
              src={`${item.thumbnail}`}
              alt={`Preview of ${item.title}`}
              className='showcase-thumbnail'
              onError={e => {
                e.target.style.display = "none";
                // Fallback to title if image fails to load
                e.target.parentElement.textContent = item.title;
              }}
            />
          ) : (
            <div className='thumbnail-fallback'>{item.title}</div>
          )}
        </div>
        <div className='item-content'>
          <h3 id={`showcase-${item.id}-title`}>{item.title}</h3>
          <div className='hover-details'>
            <p id={`showcase-${item.id}-desc`}>{item.description}</p>
            <div className='tags' role='list'>
              {item.tags.map(tag => (
                <span key={tag} role='listitem'>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  });

  return (
    <div className='main' ref={ref} role='main'>
      <div className='mainhead'>
        <div className='headTitle'>
          {/* <h6>MY</h6> */}
          <p>DEMO</p>
          <p>SHOWCASES &</p>
          <p>EXPERIMENTS</p>
        </div>
        <div className='headInfo'>
          With endless ideas and inspirations, here's my special storage for 3D scenes, web experiences, web arts, designs, animation, prototypes, concepts and many more big words that I managed to bring to life.
        </div>
      </div>

      <div className={`mainBody ${viewMode === 'list' ? 'list-layout' : 'grid-layout'}`} role='grid' aria-label='Showcase items'>
        {showcases.map((item, index) => (
          <React.Fragment key={item.id}>
            <ShowcaseItem
              item={item}
              index={index}
              onShowcaseClick={onShowcaseClick}
              showcaseRefs={showcaseRefs}
            />
            {viewMode === 'list' && index < showcases.length - 1 && (
              <div 
                className="list-divider" 
                data-index={index}
                ref={el => (dividerRefs.current[index] = el)}
              >
                <div className="gradient-shine"></div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
});

export default MainContent;
