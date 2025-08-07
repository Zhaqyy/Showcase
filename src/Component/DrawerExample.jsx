import React, { useState } from 'react'
import { useUI } from '../Context/UIContext'
import Drawer from './Drawer'

/**
 * Example component showing how to use the Drawer component
 * This demonstrates integration with existing UI context and patterns
 */
const DrawerExample = () => {
  const { isMobile, overviewDrawerOpen, closeOverviewDrawer } = useUI()
  const [showcaseDrawerOpen, setShowcaseDrawerOpen] = useState(false)
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false)

  return (
    <div className="drawer-example">
      {/* Example 1: Integration with existing UI context (Overview Drawer) */}
      <Drawer 
        isOpen={isMobile && overviewDrawerOpen}
        onClose={closeOverviewDrawer}
        position="bottom"
        title="Overview"
        showHandle={true}
        showHeader={true}
      >
        <div className="drawer-example-content">
          <h3>Overview Content</h3>
          <p>This drawer integrates with your existing UI context.</p>
          <p>It automatically shows on mobile when overviewDrawerOpen is true.</p>
          
          <div className="example-section">
            <h4>Features</h4>
            <ul>
              <li>✅ Smooth GSAP animations</li>
              <li>✅ Gesture-based dragging</li>
              <li>✅ Touch-friendly interactions</li>
              <li>✅ Backdrop blur and overlay</li>
              <li>✅ Staggered content animations</li>
              <li>✅ Inertia and momentum</li>
              <li>✅ Threshold-based closing</li>
              <li>✅ Accessibility support</li>
            </ul>
          </div>
        </div>
      </Drawer>

      {/* Example 2: Showcase drawer (similar to your existing showcase sidebar) */}
      <Drawer 
        isOpen={showcaseDrawerOpen}
        onClose={() => setShowcaseDrawerOpen(false)}
        position="bottom"
        title="Showcase Details"
        showHandle={true}
        showHeader={true}
      >
        <div className="drawer-example-content">
          <h3>Showcase Information</h3>
          <p>This could replace your existing showcase sidebar on mobile.</p>
          
          <div className="showcase-stats">
            <div className="stat">
              <span className="label">Mood</span>
              <span className="value">Energetic</span>
            </div>
            <div className="stat">
              <span className="label">Interaction</span>
              <span className="value">⌨️ Keyboard</span>
            </div>
            <div className="stat">
              <span className="label">Rating</span>
              <span className="value">⭐ 4/5</span>
            </div>
          </div>
          
          <div className="example-section">
            <h4>Technical Details</h4>
            <p>Tech: React, GSAP, Three.js</p>
            <p>Tags: Animation, 3D, Interactive</p>
          </div>
        </div>
      </Drawer>

      {/* Example 3: Left sidebar drawer */}
      <Drawer 
        isOpen={leftDrawerOpen}
        onClose={() => setLeftDrawerOpen(false)}
        position="left"
        title="Navigation"
        showHandle={false}
        showHeader={true}
      >
        <div className="drawer-example-content">
          <nav className="sidebar-nav">
            <a href="#" className="nav-item">Home</a>
            <a href="#" className="nav-item">About</a>
            <a href="#" className="nav-item">Projects</a>
            <a href="#" className="nav-item">Contact</a>
          </nav>
          
          <div className="example-section">
            <h4>Settings</h4>
            <div className="setting-item">
              <span>Dark Mode</span>
              <input type="checkbox" />
            </div>
            <div className="setting-item">
              <span>Notifications</span>
              <input type="checkbox" />
            </div>
          </div>
        </div>
      </Drawer>

      {/* Control buttons for demonstration */}
      <div className="drawer-controls">
        <button 
          onClick={() => setShowcaseDrawerOpen(true)}
          className="control-button"
        >
          Open Showcase Drawer
        </button>
        
        <button 
          onClick={() => setLeftDrawerOpen(true)}
          className="control-button"
        >
          Open Left Drawer
        </button>
      </div>
    </div>
  )
}

export default DrawerExample

// HOW TO INTEGRATE WITH YOUR EXISTING CODE:
//
// 1. Replace your existing mobile drawer logic in ShowcaseSidebar.jsx:
//
// OLD APPROACH (complex manual DOM manipulation)
// useEffect(() => {
//   if (!isMobile) return;
//   const displayElement = document.querySelector(".fullscreen-showcase");
//   // ... complex DOM manipulation
// }, [isMobile, showcase]);
//
// NEW APPROACH (simple component)
// <Drawer 
//   isOpen={isMobile && showcaseDrawerOpen}
//   onClose={closeShowcaseDrawer}
//   position="bottom"
//   title={showcase.title}
// >
//   <ShowcaseSidebarContent showcase={showcase} />
// </Drawer>
//
// 2. Replace your existing overview drawer in OverviewSidebar.jsx:
//
// OLD APPROACH
// <div className={`overview ${isMobile ? "mobile" : ""}`} ref={overviewRef}>
//   {/* complex mobile handling */}
// </div>
//
// NEW APPROACH
// {isMobile ? (
//   <Drawer 
//     isOpen={overviewDrawerOpen}
//     onClose={closeOverviewDrawer}
//     position="bottom"
//     title="Overview"
//   >
//     <IdentitySection />
//     <FilterManager />
//     <ContactSection />
//   </Drawer>
// ) : (
//   <div className="overview" ref={overviewRef}>
//     <IdentitySection />
//     <FilterManager />
//     <ContactSection />
//   </div>
// )}
//
// 3. Benefits of the new approach:
// - ✅ No more manual DOM manipulation
// - ✅ Consistent animations and behavior
// - ✅ Better accessibility
// - ✅ Easier to maintain
// - ✅ Reusable across your app
// - ✅ Works with your existing UI context
// - ✅ Follows your existing patterns 