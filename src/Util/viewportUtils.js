/**
 * Viewport utilities for responsive design and dynamic sizing
 * Handles viewport changes, responsive calculations, and dynamic scaling
 */

import { debounce } from "./debounce";


class ViewportManager {
  constructor() {
    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      aspectRatio: window.innerWidth / window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1
    };
    
    this.breakpoints = {
      mobile: 768,
      tablet: 1024,
      desktop: 1440
    };
    
    this.callbacks = new Set();
    this.isInitialized = false;
    
    this.init();
  }

  /**
   * Initialize viewport manager
   */
  init() {
    if (this.isInitialized) return;
    
    this.handleResize = debounce(this.handleResize.bind(this), 100);
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('orientationchange', this.handleResize);
    
    this.isInitialized = true;
  }

  /**
   * Handle viewport resize events
   */
  handleResize() {
    const newViewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      aspectRatio: window.innerWidth / window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1
    };

    // Check if viewport actually changed
    if (this.hasViewportChanged(newViewport)) {
      this.viewport = newViewport;
      this.notifyCallbacks();
    }
  }

  /**
   * Check if viewport has changed significantly
   * @param {Object} newViewport - New viewport data
   * @returns {boolean} True if viewport changed
   */
  hasViewportChanged(newViewport) {
    return (
      Math.abs(this.viewport.width - newViewport.width) > 1 ||
      Math.abs(this.viewport.height - newViewport.height) > 1 ||
      Math.abs(this.viewport.aspectRatio - newViewport.aspectRatio) > 0.01
    );
  }

  /**
   * Get current viewport data
   * @returns {Object} Current viewport information
   */
  getViewport() {
    return { ...this.viewport };
  }

  /**
   * Get responsive breakpoint
   * @returns {string} Current breakpoint
   */
  getBreakpoint() {
    const { width } = this.viewport;
    
    if (width < this.breakpoints.mobile) return 'mobile';
    if (width < this.breakpoints.tablet) return 'tablet';
    if (width < this.breakpoints.desktop) return 'desktop';
    return 'large';
  }

  /**
   * Check if current viewport matches breakpoint
   * @param {string} breakpoint - Breakpoint to check
   * @returns {boolean} True if matches
   */
  isBreakpoint(breakpoint) {
    return this.getBreakpoint() === breakpoint;
  }

  /**
   * Check if viewport is mobile
   * @returns {boolean} True if mobile
   */
  isMobile() {
    return this.isBreakpoint('mobile');
  }

  /**
   * Check if viewport is tablet
   * @returns {boolean} True if tablet
   */
  isTablet() {
    return this.isBreakpoint('tablet');
  }

  /**
   * Check if viewport is desktop
   * @returns {boolean} True if desktop
   */
  isDesktop() {
    return this.isBreakpoint('desktop') || this.isBreakpoint('large');
  }

  /**
   * Calculate responsive scale factor
   * @param {number} baseScale - Base scale value
   * @param {number} minScale - Minimum scale
   * @param {number} maxScale - Maximum scale
   * @returns {number} Calculated scale factor
   */
  getResponsiveScale(baseScale = 1, minScale = 0.5, maxScale = 2) {
    const { width, height } = this.viewport;
    const smallerDimension = Math.min(width, height);
    
    // Base scale on smaller dimension
    let scale = baseScale * (smallerDimension / 1000);
    
    // Clamp to min/max values
    return Math.max(minScale, Math.min(maxScale, scale));
  }

  /**
   * Calculate responsive font size
   * @param {number} baseSize - Base font size
   * @param {number} minSize - Minimum font size
   * @param {number} maxSize - Maximum font size
   * @returns {number} Calculated font size
   */
  getResponsiveFontSize(baseSize = 16, minSize = 12, maxSize = 24) {
    const { width } = this.viewport;
    
    // Responsive calculation based on viewport width
    let fontSize = baseSize * (width / 1920); // 1920 as base width
    
    // Clamp to min/max values
    return Math.max(minSize, Math.min(maxSize, fontSize));
  }

  /**
   * Calculate responsive spacing
   * @param {number} baseSpacing - Base spacing value
   * @param {number} minSpacing - Minimum spacing
   * @param {number} maxSpacing - Maximum spacing
   * @returns {number} Calculated spacing
   */
  getResponsiveSpacing(baseSpacing = 1, minSpacing = 0.5, maxSpacing = 3) {
    const { width, height } = this.viewport;
    const smallerDimension = Math.min(width, height);
    
    // Base spacing on smaller dimension
    let spacing = baseSpacing * (smallerDimension / 1000);
    
    // Clamp to min/max values
    return Math.max(minSpacing, Math.min(maxSpacing, spacing));
  }

  /**
   * Get optimal canvas size for current viewport
   * @param {number} baseSize - Base canvas size
   * @param {number} margin - Margin percentage (0-1)
   * @returns {Object} Optimal width and height
   */
  getOptimalCanvasSize(baseSize = 100, margin = 0.1) {
    const { width, height } = this.viewport;
    const smallerDimension = Math.min(width, height);
    const availableSize = smallerDimension * (1 - margin);
    
    return {
      width: availableSize,
      height: availableSize,
      scale: availableSize / baseSize
    };
  }

  /**
   * Subscribe to viewport changes
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.callbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Notify all subscribers of viewport changes
   */
  notifyCallbacks() {
    this.callbacks.forEach(callback => {
      try {
        callback(this.viewport);
      } catch (error) {
        console.error('Viewport callback error:', error);
      }
    });
  }

  /**
   * Clean up event listeners
   */
  destroy() {
    if (this.isInitialized) {
      window.removeEventListener('resize', this.handleResize);
      window.removeEventListener('orientationchange', this.handleResize);
      this.callbacks.clear();
      this.isInitialized = false;
    }
  }
}

// Create singleton instance
const viewportManager = new ViewportManager();

export default viewportManager; 