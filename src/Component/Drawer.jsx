"use client"

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { gsap } from 'gsap'
import { Draggable } from 'gsap/Draggable'

gsap.registerPlugin(Draggable)

/**
 * @typedef {Object} DrawerProps
 * @property {boolean} isOpen - Whether the drawer is currently open
 * @property {Function} onClose - Callback function called when drawer closes
 * @property {'left' | 'right' | 'bottom'} [position='bottom'] - Position of the drawer
 * @property {React.ReactNode} [children] - Content to render inside the drawer
 * @property {string} [title] - Title displayed in the drawer header
 * @property {boolean} [showHandle=true] - Whether to show the drag handle (bottom position only)
 * @property {boolean} [showHeader=true] - Whether to show the header with title and close button
 * @property {string} [className] - Additional CSS classes for the drawer
 * @property {Object} [style] - Additional inline styles for the drawer
 */

/**
 * A reusable drawer component with smooth animations and gesture support
 * @param {DrawerProps} props - The drawer props
 * @returns {JSX.Element|null} The drawer component or null if not open
 */
const Drawer = ({ 
  isOpen, 
  onClose, 
  position = 'bottom',
  children,
  title = 'Drawer',
  showHandle = true,
  showHeader = true,
  className = '',
  style = {}
}) => {
  const drawerRef = useRef(null)
  const overlayRef = useRef(null)
  const contentRef = useRef(null)
  const handleRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)
  const draggableInstance = useRef(null)

  const closeDrawer = useCallback(() => {
    if (!drawerRef.current || !overlayRef.current) return

    const tl = gsap.timeline({
      onComplete: () => {
        onClose()
      }
    })

    // Animate drawer out
    if (position === 'bottom') {
      tl.to(drawerRef.current, {
        y: '100%',
        duration: 0.4,
        ease: 'power2.inOut'
      })
    } else if (position === 'left') {
      tl.to(drawerRef.current, {
        x: '-100%',
        duration: 0.4,
        ease: 'power2.inOut'
      })
    } else {
      tl.to(drawerRef.current, {
        x: '100%',
        duration: 0.4,
        ease: 'power2.inOut'
      })
    }

    // Animate overlay out
    tl.to(overlayRef.current, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.out'
    }, '-=0.2')
  }, [onClose, position])

  const openDrawer = useCallback(() => {
    if (!drawerRef.current || !overlayRef.current) return

    const tl = gsap.timeline()

    // Set initial positions - ensure drawer is hidden initially
    if (position === 'bottom') {
      gsap.set(drawerRef.current, { y: '100%', visibility: 'visible' })
    } else if (position === 'left') {
      gsap.set(drawerRef.current, { x: '-100%', visibility: 'visible' })
    } else {
      gsap.set(drawerRef.current, { x: '100%', visibility: 'visible' })
    }

    gsap.set(overlayRef.current, { opacity: 0 })

    // Animate overlay in
    tl.to(overlayRef.current, {
      opacity: 1,
      duration: 0.3,
      ease: 'power2.out'
    })

    // Animate drawer in
    if (position === 'bottom') {
      tl.to(drawerRef.current, {
        y: '0%',
        duration: 0.5,
        ease: 'power3.out'
      }, '-=0.1')
    } else if (position === 'left') {
      tl.to(drawerRef.current, {
        x: '0%',
        duration: 0.5,
        ease: 'power3.out'
      }, '-=0.1')
    } else {
      tl.to(drawerRef.current, {
        x: '0%',
        duration: 0.5,
        ease: 'power3.out'
      }, '-=0.1')
    }

    // Animate content with stagger
    tl.fromTo(contentRef.current?.children[0].children || [], {
      opacity: 0,
      y: 20
    }, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: 'power2.out'
    }, '-=0.2')
  }, [position])

  // Setup draggable functionality
  useEffect(() => {
    if (!drawerRef.current || !handleRef.current || position !== 'bottom') return

    const drawer = drawerRef.current
    const handle = handleRef.current

    // Kill any existing draggable instance
    if (draggableInstance.current) {
      draggableInstance.current.kill()
    }

    draggableInstance.current = Draggable.create(drawer, {
      type: 'y',
      bounds: { minY: 0, maxY: window.innerHeight * 0.8 },
      inertia: true,
      onDragStart: function(e) {
        // Only allow drag if starting on handle or outside drawer content
        const target = e.target;
        const isHandle = target.closest('.drawer-handle');
        const isContent = target.closest('.drawer-content');
        
        if (!isHandle && isContent) {
          // Prevent drag if starting on content
          this.endDrag();
          return false;
        }
        
        setIsDragging(true);
      },
      onDrag: function() {
        const progress = this.y / (window.innerHeight * 0.7)
        gsap.set(overlayRef.current, {
          opacity: Math.max(0, 1 - progress * 2)
        })
      },
      onDragEnd: function() {
        setIsDragging(false)
        
        // Calculate threshold based on drawer height (35% of drawer height)
        const drawerHeight = drawer.offsetHeight;
        const threshold = drawerHeight * 0.35;
        
        if (this.y > threshold) {
          closeDrawer()
        } else {
          gsap.to(drawer, {
            y: 0,
            duration: 0.3,
            ease: 'power2.out'
          })
          gsap.to(overlayRef.current, {
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out'
          })
        }
      }
    })[0]

    return () => {
      if (draggableInstance.current) {
        draggableInstance.current.kill()
      }
    }
  }, [closeDrawer, position, isOpen])

  // Handle touch events for better gesture support
  useEffect(() => {
    let touchStartY = 0
    let touchStartX = 0
    let isVerticalSwipe = false
    let hasMoved = false

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY
      touchStartX = e.touches[0].clientX
      isVerticalSwipe = false
      hasMoved = false
    }

    const handleTouchMove = (e) => {
      if (!drawerRef.current || position !== 'bottom') return
      
      const touchY = e.touches[0].clientY
      const touchX = e.touches[0].clientX
      const deltaY = touchY - touchStartY
      const deltaX = touchX - touchStartX
      
      // Determine if this is a vertical swipe (for closing drawer)
      if (!hasMoved) {
        isVerticalSwipe = Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10
        hasMoved = true
      }
      
      // Only prevent default for vertical swipes on the handle or when dragging
      // Allow scrolling inside drawer content
      const target = e.target;
      const isHandle = target.closest('.drawer-handle');
      const isContent = target.closest('.drawer-content');
      
      if (isVerticalSwipe && isHandle) {
        e.preventDefault()
      } else if (isContent) {
        // Allow scrolling inside content
        return
      }
      
      // Update state for drag detection
      setCurrentY(touchY)
    }

    const handleTouchEnd = (e) => {
      if (!isVerticalSwipe || !hasMoved) return
      
      const deltaY = currentY - touchStartY
      const threshold = 100

      if (deltaY > threshold && position === 'bottom') {
        closeDrawer()
      }
    }

    const drawer = drawerRef.current
    if (drawer) {
      drawer.addEventListener('touchstart', handleTouchStart, { passive: true })
      drawer.addEventListener('touchmove', handleTouchMove, { passive: false })
      drawer.addEventListener('touchend', handleTouchEnd, { passive: true })
    }

    return () => {
      if (drawer) {
        drawer.removeEventListener('touchstart', handleTouchStart)
        drawer.removeEventListener('touchmove', handleTouchMove)
        drawer.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [isDragging, currentY, closeDrawer, position])

  // Open/close animations
  useEffect(() => {
    if (isOpen) {
      openDrawer()
    } else {
      // Ensure drawer is hidden when closed
      if (drawerRef.current) {
        gsap.set(drawerRef.current, { 
          y: position === 'bottom' ? '100%' : position === 'left' ? '-100%' : '100%',
          visibility: 'hidden'
        })
      }
    }
  }, [isOpen, openDrawer, position])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className={`drawer-container ${className}`}>
      <div 
        ref={overlayRef}
        className="drawer-overlay"
        onClick={closeDrawer}
      />
      <div 
        ref={drawerRef}
        className={`drawer drawer-${position}`}
        style={style}
      >
        {position === 'bottom' && showHandle && (
          <div ref={handleRef} className="drawer-handle">
            <div className="drawer-handle-bar" />
          </div>
        )}
        
        {showHeader && (
          <div className="drawer-header">
            <h2>{title}</h2>
            <button 
              className="drawer-close"
              onClick={closeDrawer}
              aria-label="Close drawer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        )}

        <div 
          ref={contentRef} 
          className="drawer-content"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export default Drawer

/*
USAGE EXAMPLES:

// Basic bottom drawer
<Drawer 
  isOpen={isDrawerOpen} 
  onClose={() => setIsDrawerOpen(false)}
  title="Menu"
>
  <div>Your content here</div>
</Drawer>

// Left sidebar drawer
<Drawer 
  isOpen={isSidebarOpen} 
  onClose={() => setIsSidebarOpen(false)}
  position="left"
  title="Navigation"
  showHandle={false}
>
  <nav>Navigation items</nav>
</Drawer>

// Right drawer without header
<Drawer 
  isOpen={isPanelOpen} 
  onClose={() => setIsPanelOpen(false)}
  position="right"
  showHeader={false}
  className="custom-drawer"
>
  <div>Panel content</div>
</Drawer>

// Integration with existing UI context
const { isMobile, overviewDrawerOpen, closeOverviewDrawer } = useUI()

<Drawer 
  isOpen={isMobile && overviewDrawerOpen}
  onClose={closeOverviewDrawer}
  position="bottom"
  title="Overview"
>
  <OverviewSidebarContent />
</Drawer>
*/
