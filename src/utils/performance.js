/**
 * Performance monitoring utilities for RxHtmx
 * Provides lightweight instrumentation for tracking component render times,
 * effect execution, and general performance metrics.
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.enabled = typeof window !== 'undefined' && window.__RXHTMX_PERF__;
  }

  /**
   * Start a performance measurement
   * @param {string} label - Unique identifier for the measurement
   */
  start(label) {
    if (!this.enabled) return;

    const now = performance.now();
    this.metrics.set(label, { start: now, marks: [] });
  }

  /**
   * Add a mark/checkpoint to an ongoing measurement
   * @param {string} label - Measurement identifier
   * @param {string} markLabel - Mark description
   */
  mark(label, markLabel) {
    if (!this.enabled) return;

    const metric = this.metrics.get(label);
    if (!metric) return;

    metric.marks.push({
      label: markLabel,
      time: performance.now() - metric.start,
    });
  }

  /**
   * End a measurement and log results
   * @param {string} label - Measurement identifier
   * @returns {object} Measurement results
   */
  end(label) {
    if (!this.enabled) return null;

    const metric = this.metrics.get(label);
    if (!metric) return null;

    const duration = performance.now() - metric.start;
    const result = {
      label,
      duration: duration.toFixed(2),
      marks: metric.marks,
    };

    this.metrics.delete(label);

    // Log to console in dev mode
    if (import.meta.env?.DEV) {
      console.log(`⚡ ${label}: ${result.duration}ms`, result.marks);
    }

    return result;
  }

  /**
   * Measure a function execution
   * @param {string} label - Measurement identifier
   * @param {Function} fn - Function to measure
   * @returns {*} Function result
   */
  measure(label, fn) {
    if (!this.enabled) return fn();

    this.start(label);
    try {
      const result = fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  /**
   * Measure async function execution
   * @param {string} label - Measurement identifier
   * @param {Function} fn - Async function to measure
   * @returns {Promise<*>} Function result
   */
  async measureAsync(label, fn) {
    if (!this.enabled) return fn();

    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  /**
   * Get all current measurements
   * @returns {Array} Active measurements
   */
  getMetrics() {
    return Array.from(this.metrics.entries()).map(([label, data]) => ({
      label,
      elapsed: performance.now() - data.start,
      marks: data.marks,
    }));
  }

  /**
   * Clear all measurements
   */
  clear() {
    this.metrics.clear();
  }

  /**
   * Enable performance monitoring
   */
  enable() {
    this.enabled = true;
    if (typeof window !== 'undefined') {
      window.__RXHTMX_PERF__ = true;
    }
  }

  /**
   * Disable performance monitoring
   */
  disable() {
    this.enabled = false;
    if (typeof window !== 'undefined') {
      window.__RXHTMX_PERF__ = false;
    }
  }
}

// Global singleton instance
export const perf = new PerformanceMonitor();

/**
 * Decorator for measuring component render time
 * @param {Function} renderFn - Component render function
 * @returns {Function} Wrapped render function
 */
export function measureRender(renderFn) {
  return function (...args) {
    const componentName = this?.constructor?.name || 'Component';
    return perf.measure(`render:${componentName}`, () =>
      renderFn.apply(this, args)
    );
  };
}

/**
 * Decorator for measuring effect execution
 * @param {Function} effectFn - Effect function
 * @param {string} label - Effect label
 * @returns {Function} Wrapped effect function
 */
export function measureEffect(effectFn, label = 'effect') {
  return function (...args) {
    return perf.measure(`effect:${label}`, () => effectFn.apply(this, args));
  };
}

/**
 * Simple FPS monitor
 */
export class FPSMonitor {
  constructor() {
    this.frames = [];
    this.enabled = false;
  }

  start() {
    this.enabled = true;
    this.lastTime = performance.now();
    this.tick();
  }

  tick() {
    if (!this.enabled) return;

    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    this.frames.push(1000 / delta);
    if (this.frames.length > 60) {
      this.frames.shift();
    }

    requestAnimationFrame(() => this.tick());
  }

  getFPS() {
    if (this.frames.length === 0) return 0;
    return this.frames.reduce((a, b) => a + b, 0) / this.frames.length;
  }

  stop() {
    this.enabled = false;
  }
}

export default perf;
