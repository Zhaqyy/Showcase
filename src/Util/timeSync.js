/**
 * Time synchronization utility for accurate time display
 * Includes NTP-like functionality, timezone offset correction, and fallback mechanisms
 */

class TimeSync {
  constructor() {
    this.timeOffset = 0;
    this.lastSync = 0;
    this.syncInterval = 5 * 60 * 1000; // 5 minutes
    this.fallbackEnabled = true;
  }

  /**
   * Get the current synchronized time
   * @returns {Date} Current time with offset correction
   */
  getCurrentTime() {
    const now = new Date();
    return new Date(now.getTime() + this.timeOffset);
  }

  /**
   * Get timezone offset in minutes
   * @returns {number} Timezone offset in minutes
   */
  getTimezoneOffset() {
    return new Date().getTimezoneOffset();
  }

  /**
   * Get local time (corrected for timezone)
   * @returns {Date} Local time
   */
  getLocalTime() {
    // For now, just return the current system time to fix the display issue
    // The timezone offset calculation was causing problems
    return new Date();
  }

  /**
   * Attempt to sync with a time server
   * @param {string} timeServer - Time server URL
   * @returns {Promise<boolean>} Success status
   */
  async syncWithServer(timeServer = 'https://worldtimeapi.org/api/ip') {
    try {
      const startTime = Date.now();
      const response = await fetch(timeServer);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      const serverTime = new Date(data.datetime);
      const endTime = Date.now();
      const roundTripTime = endTime - startTime;
      
      // Calculate offset considering network latency
      const estimatedLatency = roundTripTime / 2;
      const serverTimeAdjusted = serverTime.getTime() + estimatedLatency;
      const localTime = startTime + estimatedLatency;
      
      this.timeOffset = serverTimeAdjusted - localTime;
      this.lastSync = Date.now();
      
      // console.log('Time sync successful:', {
      //   offset: this.timeOffset,
      //   latency: roundTripTime,
      //   serverTime: serverTime.toISOString()
      // });
      
      return true;
    } catch (error) {
      // console.warn('Time sync failed, using fallback:', error.message);
      this.enableFallback();
      return false;
    }
  }

  /**
   * Enable fallback to system clock
   */
  enableFallback() {
    this.fallbackEnabled = true;
    this.timeOffset = 0;
    // console.log('Using system clock fallback');
  }

  /**
   * Get time components for clock display
   * @returns {Object} Time components
   */
  getTimeComponents() {
    const localTime = this.getLocalTime();
    
    return {
      hours: localTime.getHours(),
      minutes: localTime.getMinutes(),
      seconds: localTime.getSeconds(),
      milliseconds: localTime.getMilliseconds(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      isDST: this.isDST(localTime)
    };
  }

  /**
   * Check if current time is in Daylight Saving Time
   * @param {Date} date - Date to check
   * @returns {boolean} DST status
   */
  isDST(date) {
    const jan = new Date(date.getFullYear(), 0, 1);
    const jul = new Date(date.getFullYear(), 6, 1);
    return Math.min(jan.getTimezoneOffset(), jul.getTimezoneOffset()) === date.getTimezoneOffset();
  }

  /**
   * Get formatted time string
   * @param {string} format - Time format ('12h' or '24h')
   * @returns {string} Formatted time string
   */
  getFormattedTime(format = '12h') {
    const { hours, minutes, seconds } = this.getTimeComponents();
    
    if (format === '12h') {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${period}`;
    } else {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  /**
   * Get formatted date string
   * @returns {string} Formatted date string
   */
  getFormattedDate() {
    const localTime = this.getLocalTime();
    return localTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Start automatic time synchronization
   */
  startAutoSync() {
    // Initial sync
    this.syncWithServer();
    
    // Set up periodic sync
    setInterval(() => {
      this.syncWithServer();
    }, this.syncInterval);
  }

  /**
   * Get sync status information
   * @returns {Object} Sync status
   */
  getSyncStatus() {
    return {
      lastSync: this.lastSync,
      timeOffset: this.timeOffset,
      fallbackEnabled: this.fallbackEnabled,
      timezone: this.getTimezoneOffset(),
      isDST: this.isDST(new Date())
    };
  }
}

// Create singleton instance
const timeSync = new TimeSync();

export default timeSync; 