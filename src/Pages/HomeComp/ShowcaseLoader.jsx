import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useUI } from "../../Context/UIContext";

const ShowcaseLoader = ({ showcase, onComponentLoaded }) => {
  const [displayState, setDisplayState] = useState({
    status: 'loading', // 'loading', 'ready', 'error'
    component: null,
    error: null
  });
  
  const { startLoading, stopLoading } = useUI();
  const isMounted = useRef(true);
  const loadingStartTime = useRef(0);
  const minDisplayTime = 0; // Minimum display time in ms
  const loaderRef = useRef(null);

  // Stable reference for the showcase to prevent effect re-triggers
  const currentShowcase = useRef(showcase);
  currentShowcase.current = showcase;

  // Fade in animation when loader mounts
  useEffect(() => {
    if (loaderRef.current) {
      gsap.fromTo(loaderRef.current, 
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [showcase.id]);

  useEffect(() => {
    isMounted.current = true;
    loadingStartTime.current = Date.now();

    const loadComponent = async () => {
      try {
        startLoading(`Loading ${currentShowcase.current.title}...`);
        
        let loadedComponent;
        if (typeof currentShowcase.current.component === "function") {
          const module = await currentShowcase.current.component();
          loadedComponent = module.default;
        } else {
          loadedComponent = currentShowcase.current.component;
        }

        if (!isMounted.current) return;

        // Calculate remaining minimum display time
        const elapsed = Date.now() - loadingStartTime.current;
        const remainingTime = Math.max(0, minDisplayTime - elapsed);

        await new Promise(resolve => setTimeout(resolve, remainingTime));

        if (!isMounted.current) return;

        setDisplayState({
          status: 'ready',
          component: loadedComponent,
          error: null
        });
        
        stopLoading();
        onComponentLoaded(loadedComponent);
      } catch (error) {
        if (!isMounted.current) return;

        console.error('Loading failed:', error);
        setDisplayState({
          status: 'error',
          component: null,
          error: error.message
        });
        stopLoading();
      }
    };

    loadComponent();

    return () => {
      isMounted.current = false;
      stopLoading();
    };
  }, [startLoading, stopLoading, onComponentLoaded]);

  switch (displayState.status) {
    case 'error':
      return (
        <div ref={loaderRef} style={styles.container}>
          <div style={styles.content}>
            <h3>Failed to load {currentShowcase.current.title}</h3>
            <p>{displayState.error || 'Unknown error occurred'}</p>
            <button 
              style={styles.button}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      );
    
    case 'loading':
      return (
        <div ref={loaderRef} style={styles.container}>
          <div style={styles.content}>
            <h3>Loading {currentShowcase.current.title}...</h3>
            <p>Please wait while we prepare the experience.</p>
          </div>
        </div>
      );
    
    case 'ready':
      return displayState.component 
        ? React.createElement(displayState.component) 
        : null;
    
    default:
      return null;
  }
};

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#162114',
    color: '#f5f5f5',
    zIndex: 1000
  },
  content: {
    textAlign: 'center',
    padding: '2rem',
    maxWidth: '500px'
  },
  button: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default React.memo(ShowcaseLoader, (prevProps, nextProps) => {
  // Only re-render if showcase ID changes
  return prevProps.showcase.id === nextProps.showcase.id;
});