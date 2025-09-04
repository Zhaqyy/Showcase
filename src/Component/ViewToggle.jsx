import React from 'react';
import { useUI } from '../Context/UIContext';

const ViewToggle = () => {
  const { viewMode, setViewModeGrid, setViewModeList } = useUI();

  return (
    <div className="view-toggle-container">
      <h3 >View Mode</h3>
      <div className="toggle-switch">
        <button
          className={`toggle-option ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={setViewModeGrid}
          aria-label="Grid view"
        >
          <div className="toggle-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 3v8h8V3H3zm6 6H5V5h4v4zm-6 4v8h8v-8H3zm6 6H5v-4h4v4zm4-16v8h8V3h-8zm6 6h-4V5h4v4zm-6 4v8h8v-8h-8zm6 6h-4v-4h4v4z"/>
            </svg>
          </div>
          <span>Grid</span>
        </button>
        
        <button
          className={`toggle-option ${viewMode === 'list' ? 'active' : ''}`}
          onClick={setViewModeList}
          aria-label="List view"
        >
          <div className="toggle-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
            </svg>
          </div>
          <span>List</span>
        </button>
        
        <div className="toggle-slider" data-active={viewMode}></div>
      </div>
    </div>
  );
};

export default ViewToggle; 