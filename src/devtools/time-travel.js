/**
 * Time-Travel Debugging for Signals
 * Record and replay signal state changes
 */
/* eslint-disable no-console */

class TimeTravelDebugger {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistory = 100;
    this.isEnabled = false;
    this.trackedSignals = new Map();
    this.snapshots = [];
  }

  /**
   * Enable time-travel debugging
   */
  enable() {
    this.isEnabled = true;
    console.log('🕐 Time-travel debugging enabled');
  }

  /**
   * Disable time-travel debugging
   */
  disable() {
    this.isEnabled = false;
    console.log('🕐 Time-travel debugging disabled');
  }

  /**
   * Track a signal for time-travel
   */
  track(name, signal) {
    if (!this.isEnabled) return;

    this.trackedSignals.set(name, signal);

    // Record initial state
    this.recordSnapshot(`Track: ${name}`, {
      [name]: signal.value,
    });
  }

  /**
   * Record a state snapshot
   */
  recordSnapshot(action, state = {}) {
    if (!this.isEnabled) return;

    // Get current state of all tracked signals
    const fullState = {};
    for (const [name, signal] of this.trackedSignals.entries()) {
      fullState[name] = this.cloneValue(signal.value);
    }

    const snapshot = {
      timestamp: Date.now(),
      action,
      state: { ...fullState, ...state },
    };

    // Remove future history if we're in the middle
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    this.history.push(snapshot);
    this.currentIndex = this.history.length - 1;

    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  /**
   * Go back in time
   */
  goBack() {
    if (this.currentIndex <= 0) {
      console.warn('Cannot go back further');
      return false;
    }

    this.currentIndex--;
    this.restoreSnapshot(this.history[this.currentIndex]);
    return true;
  }

  /**
   * Go forward in time
   */
  goForward() {
    if (this.currentIndex >= this.history.length - 1) {
      console.warn('Cannot go forward further');
      return false;
    }

    this.currentIndex++;
    this.restoreSnapshot(this.history[this.currentIndex]);
    return true;
  }

  /**
   * Jump to specific snapshot
   */
  jumpTo(index) {
    if (index < 0 || index >= this.history.length) {
      console.warn('Invalid snapshot index');
      return false;
    }

    this.currentIndex = index;
    this.restoreSnapshot(this.history[index]);
    return true;
  }

  /**
   * Restore a snapshot
   */
  restoreSnapshot(snapshot) {
    console.log(
      `🕐 Restoring snapshot: ${snapshot.action} (${new Date(snapshot.timestamp).toLocaleTimeString()})`
    );

    for (const [name, value] of Object.entries(snapshot.state)) {
      const signal = this.trackedSignals.get(name);
      if (signal) {
        signal.value = this.cloneValue(value);
      }
    }
  }

  /**
   * Get current snapshot
   */
  getCurrentSnapshot() {
    return this.history[this.currentIndex];
  }

  /**
   * Get all snapshots
   */
  getHistory() {
    return this.history.map((snapshot, index) => ({
      index,
      ...snapshot,
      isCurrent: index === this.currentIndex,
    }));
  }

  /**
   * Export history as JSON
   */
  export() {
    return JSON.stringify(
      {
        history: this.history,
        currentIndex: this.currentIndex,
        timestamp: Date.now(),
      },
      null,
      2
    );
  }

  /**
   * Import history from JSON
   */
  import(json) {
    try {
      const data = JSON.parse(json);
      this.history = data.history;
      this.currentIndex = data.currentIndex;
      this.restoreSnapshot(this.history[this.currentIndex]);
      return true;
    } catch (error) {
      console.error('Failed to import history:', error);
      return false;
    }
  }

  /**
   * Clear history
   */
  clear() {
    this.history = [];
    this.currentIndex = -1;
    this.snapshots = [];
    console.log('🕐 History cleared');
  }

  /**
   * Clone value (deep copy)
   */
  cloneValue(value) {
    if (value === null || typeof value !== 'object') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.map(item => this.cloneValue(item));
    }

    const cloned = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        cloned[key] = this.cloneValue(value[key]);
      }
    }
    return cloned;
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      totalSnapshots: this.history.length,
      currentIndex: this.currentIndex,
      canGoBack: this.currentIndex > 0,
      canGoForward: this.currentIndex < this.history.length - 1,
      trackedSignals: this.trackedSignals.size,
      isEnabled: this.isEnabled,
    };
  }
}

// Global singleton
export const timeTravel = new TimeTravelDebugger();

// Auto-expose in dev mode
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  window.__RXHTMX_TIME_TRAVEL__ = timeTravel;

  // Add keyboard shortcuts
  document.addEventListener('keydown', e => {
    // Ctrl+Alt+Left Arrow - Go back
    if (e.ctrlKey && e.altKey && e.key === 'ArrowLeft') {
      e.preventDefault();
      timeTravel.goBack();
    }

    // Ctrl+Alt+Right Arrow - Go forward
    if (e.ctrlKey && e.altKey && e.key === 'ArrowRight') {
      e.preventDefault();
      timeTravel.goForward();
    }
  });
}

export default timeTravel;
