import React, { Suspense } from 'react';
import ErrorBoundary from '../../Util/ErrorBoundary';

// Create a lazy-loaded component map
const componentMap = {
  Pool: React.lazy(() => import('../../Showcase/Pool')),
  // Add other showcase components here
};

// Fallback component for loading state
const Loader = () => (
  <div style={{
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#f0f0f0',
    color: '#333'
  }}>
    Loading showcase...
  </div>
);

// Error fallback component
const ErrorFallback = ({ error, onRetry }) => (
  <div className="showcase-error">
    <h3>Failed to load showcase</h3>
    <p>{error?.message || 'Unknown error'}</p>
    <button onClick={onRetry}>Retry</button>
  </div>
);

export default function ShowcaseLoader({ name, ...props }) {
  const Component = componentMap[name];
  
  if (!Component) {
    return <ErrorFallback error={{ message: `Showcase "${name}" not found` }} />;
  }

  return (
    <ErrorBoundary 
      onRetry={() => window.location.reload()} 
      onClose={props.onClose}
      fallback={(error, retry) => (
        <ErrorFallback error={error} onRetry={retry} />
      )}
    >
      <Suspense fallback={<Loader />}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
}