// src/components/ShowcaseLoader.jsx
import React from 'react';
import Pool from './Pool';
// Import all other showcase components here

const components = {
  Pool,
  // Add other components here as needed
};

export default function ShowcaseLoader({ name, ...props }) {
  const Component = components[name];
  
  if (!Component) {
    return <div className="showcase-error">Showcase "{name}" not found</div>;
  }

  return <Component {...props} />;
}