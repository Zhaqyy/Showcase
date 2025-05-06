import React, { forwardRef, useEffect } from "react";
import gsap from "gsap";
import "../../Style/Home.scss";

const ShowcaseSidebar = forwardRef(({ showcase, isOpen }, ref) => {
  useEffect(() => {
    if (!ref.current) return;

    const sections = ref.current.querySelectorAll("details");
    sections.forEach(section => {
      section.addEventListener("toggle", e => {
        if (e.target.open) {
          sections.forEach(s => s !== e.target && (s.open = false));
        }
      });
    });
  }, [ref]);

  return (
    <div className='scSidebar' ref={ref}>
      {/* Header Section */}
      <div className='sidebar-header'>
        <h3>{showcase.title}</h3>
        <p className='description'>{showcase.description}</p>
        <div className='tags'>
          {showcase.tags.map(tag => (
            <span key={tag} className='tag'>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Stats (Always Visible) */}
      <div className='quick-stats'>
        <div className='stat'>
          <span className='label'>Mood</span>
          <span className='value'>{showcase.mood}</span>
        </div>
        <div className='stat'>
          <span className='label'>Interaction Type</span>
          <span className='value'>⌨️ {showcase.interactionType}</span>
        </div>
        <div className='stat'>
          <span className='label'>Personal Rating</span>
          <span className='value'>⭐ {showcase.personalRating}/5</span>
        </div>
        <div className='stat'>
          <span className='label'>Likes</span>
          <span className='value'>♥ {showcase.likes}</span>
        </div>
      </div>

      {/* Collapsible: Extra Information */}
      <details className='collapsible-section' open>
        <summary className='section-title'>Side Commentary</summary>
        <div className='section-content'>
          <div className='detail'>
            <p>{showcase.commentary}</p>
          </div>
        </div>
      </details>

      {/* Collapsible: How to Use */}
      <details className='collapsible-section'>
        <summary className='section-title'>How to Use</summary>
        <div className='section-content'>
          <div className='detail'>
            <span className='detail-label'>Soundtrack</span>
            <span>{showcase.soundtrack}</span>
          </div>
          <div className='detail'>
            <span className='detail-label'>Best Viewed With</span>
            <span>{showcase.bestViewedWith}</span>
          </div>
          <div className='detail'>
            <span className='detail-label'>Secret</span>
            <span className='easter-egg'>{showcase.secretInteraction}</span>
          </div>
        </div>
      </details>

      {/* Collapsible: Behind the Scenes */}
      <details className='collapsible-section'>
        <summary className='section-title'>Behind the Scenes</summary>
        <div className='section-content'>
          <div className='detail'>
            <span className='detail-label'>Build Time</span>
            <span>{showcase.timeToBuild}</span>
          </div>
          <div className='detail'>
            <span className='detail-label'>Difficulty</span>
            <span>{showcase.difficulty}</span>
          </div>
          <div className='detail'>
            <span className='detail-label'>Inspiration</span>
            <span>{showcase.inspiration}</span>
          </div>
        </div>
      </details>

      {/* Collapsible: Technical */}
      <details className='collapsible-section'>
        <summary className='section-title'>Technical</summary>
        <div className='section-content'>
          <div className='detail'>
            <span className='detail-label'>Tech</span>
            <span>{showcase.tech.join(", ")}</span>
          </div>
          <div className='detail'>
            <span className='detail-label'>Warning</span>
            <span className='warning'>{showcase.warning}</span>
          </div>
        </div>
      </details>
    </div>
  );
});

export default ShowcaseSidebar;
