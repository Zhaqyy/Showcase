import React, { Suspense } from 'react';
import ErrorBoundary from '../../Util/ErrorBoundary';

const ShowcaseWrapper = ({ component: Component, fallback = null, ...props }) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={fallback || <DefaultLoading />}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

const DefaultLoading = () => (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: '#162114',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#f5f5f5'
  }}>
    Loading creative magic...
  </div>
);

export default ShowcaseWrapper;