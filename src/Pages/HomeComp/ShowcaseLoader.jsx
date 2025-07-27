import React, { useState, useEffect } from "react";
import { useUI } from "../../Context/UIContext";

const ShowcaseLoader = ({ showcase, onComponentLoaded }) => {
  const [Component, setComponent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const { startLoading, stopLoading } = useUI();

  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);
    startLoading(`Loading ${showcase.title}...`);

    // Handle dynamic imports for lazy-loaded components
    const loadComponent = async () => {
      try {
        if (typeof showcase.component === "function") {
          // Dynamic import
          const module = await showcase.component();
          setComponent(() => module.default);
        } else if (typeof showcase.component !== "string") {
          // Direct component reference (fallback)
          setComponent(() => showcase.component);
        } else {
          // String-based dynamic import (legacy)
          const module = await import(
            /* webpackMode: "lazy" */
            `../../Showcase/${showcase.component}.jsx`
          );
          setComponent(() => module.default);
        }
        setIsLoading(false);
        stopLoading();
        onComponentLoaded(Component);
      } catch (err) {
        console.error(`Failed to load ${showcase.title}:`, err);
        setLoadError(err);
        setComponent(() => () => (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: '#f5f5f5',
            background: '#162114'
          }}>
            <div>
              <h3>Failed to load {showcase.title}</h3>
              <p>Please try refreshing the page.</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          </div>
        ));
        setIsLoading(false);
        stopLoading();
      }
    };

    loadComponent();
  }, [showcase, startLoading, stopLoading, onComponentLoaded]);

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        color: '#f5f5f5',
        background: '#162114'
      }}>
        <div>
          <h3>Loading {showcase.title}...</h3>
          <p>Please wait while we prepare the magic.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        color: '#f5f5f5',
        background: '#162114'
      }}>
        <div>
          <h3>Failed to load {showcase.title}</h3>
          <p>Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  // Component loaded successfully
  return Component;
};

export default ShowcaseLoader; 