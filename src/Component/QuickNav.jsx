import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import "../Style/Component.scss";

const QuickNav = ({ showcases, currentIndex, onSelect, onClose }) => {
  const modalRef = useRef();

  // Animation on mount/unmount
  useEffect(() => {
    const modal = modalRef.current;
    gsap.fromTo(modal, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });

    return () => {
      gsap.to(modal, {
        opacity: 0,
        y: 20,
        duration: 0.2,
        ease: "power2.in",
      });
    };
  }, []);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className='quick-nav-modal' ref={modalRef} onClick={e => e.target === modalRef.current && onClose()}>
      <div className='quick-nav-content'>
        <button className='close-modal' onClick={onClose} aria-label='Close'>
          ✕
        </button>

        <h3>All Showcases</h3>

        <div className='showcase-grid'>
          {showcases.map((showcase, index) => (
            <div key={showcase.id} className={`showcase-thumb ${index === currentIndex ? "active" : ""}`} onClick={() => onSelect(index)}>
              <img src={showcase.thumbnail || "/default-thumbnail.jpg"} alt={showcase.title} />
              <span>{showcase.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Memoize QuickNav for performance
export default React.memo(QuickNav);
