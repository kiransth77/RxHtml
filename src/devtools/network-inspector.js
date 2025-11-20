/**
 * Network Request Inspector
 * Captures and displays network requests for debugging
 */
/* eslint-disable no-console */

class NetworkInspector {
  constructor() {
    this.requests = [];
    this.enabled = false;
    this.maxRequests = 100;
    this.filters = {
      method: null,
      status: null,
      type: null,
    };
  }

  /**
   * Start capturing network requests
   */
  start() {
    if (this.enabled) return;

    this.enabled = true;
    this.interceptFetch();
    this.interceptXHR();

    console.log('🌐 Network Inspector started');
  }

  /**
   * Stop capturing network requests
   */
  stop() {
    this.enabled = false;
    console.log('🌐 Network Inspector stopped');
  }

  /**
   * Intercept fetch API
   */
  interceptFetch() {
    const originalFetch = window.fetch;
    const self = this;

    window.fetch = async function (...args) {
      if (!self.enabled) return originalFetch.apply(this, args);

      const startTime = performance.now();
      const request = {
        id: self.generateId(),
        method: args[1]?.method || 'GET',
        url: args[0],
        type: 'fetch',
        startTime,
        headers: args[1]?.headers || {},
        body: args[1]?.body,
        status: null,
        statusText: null,
        duration: null,
        response: null,
        error: null,
      };

      try {
        const response = await originalFetch.apply(this, args);
        const endTime = performance.now();

        request.status = response.status;
        request.statusText = response.statusText;
        request.duration = (endTime - startTime).toFixed(2);
        request.responseHeaders = self.headersToObject(response.headers);

        // Clone response to read body
        const clonedResponse = response.clone();
        try {
          request.response = await clonedResponse.text();
        } catch (e) {
          request.response = '[Unable to read response]';
        }

        self.addRequest(request);
        return response;
      } catch (error) {
        const endTime = performance.now();
        request.error = error.message;
        request.duration = (endTime - startTime).toFixed(2);
        self.addRequest(request);
        throw error;
      }
    };
  }

  /**
   * Intercept XMLHttpRequest
   */
  interceptXHR() {
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;
    const self = this;

    XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      if (self.enabled) {
        this._networkInspector = {
          id: self.generateId(),
          method,
          url,
          type: 'xhr',
          startTime: null,
        };
      }
      return originalOpen.apply(this, [method, url, ...rest]);
    };

    XMLHttpRequest.prototype.send = function (body) {
      if (self.enabled && this._networkInspector) {
        this._networkInspector.startTime = performance.now();
        this._networkInspector.body = body;

        this.addEventListener('load', function () {
          const endTime = performance.now();
          const request = {
            ...this._networkInspector,
            status: this.status,
            statusText: this.statusText,
            duration: (endTime - this._networkInspector.startTime).toFixed(2),
            response: this.responseText,
            responseHeaders: this.getAllResponseHeaders(),
          };
          self.addRequest(request);
        });

        this.addEventListener('error', function () {
          const endTime = performance.now();
          const request = {
            ...this._networkInspector,
            error: 'Network request failed',
            duration: (endTime - this._networkInspector.startTime).toFixed(2),
          };
          self.addRequest(request);
        });
      }
      return originalSend.apply(this, [body]);
    };
  }

  /**
   * Add request to history
   */
  addRequest(request) {
    this.requests.unshift(request);

    // Limit number of stored requests
    if (this.requests.length > this.maxRequests) {
      this.requests.pop();
    }

    // Emit event for UI updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('network-request', { detail: request })
      );
    }
  }

  /**
   * Get all requests
   */
  getRequests(filters = {}) {
    let filtered = [...this.requests];

    if (filters.method) {
      filtered = filtered.filter(r => r.method === filters.method);
    }

    if (filters.status) {
      filtered = filtered.filter(r => r.status === filters.status);
    }

    if (filters.type) {
      filtered = filtered.filter(r => r.type === filters.type);
    }

    if (filters.url) {
      filtered = filtered.filter(r => r.url.includes(filters.url));
    }

    return filtered;
  }

  /**
   * Clear all requests
   */
  clear() {
    this.requests = [];
  }

  /**
   * Get request by ID
   */
  getRequest(id) {
    return this.requests.find(r => r.id === id);
  }

  /**
   * Export requests as JSON
   */
  export() {
    return JSON.stringify(this.requests, null, 2);
  }

  /**
   * Generate unique request ID
   */
  generateId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convert Headers object to plain object
   */
  headersToObject(headers) {
    const obj = {};
    for (const [key, value] of headers.entries()) {
      obj[key] = value;
    }
    return obj;
  }

  /**
   * Get statistics
   */
  getStats() {
    const total = this.requests.length;
    const successful = this.requests.filter(
      r => r.status >= 200 && r.status < 300
    ).length;
    const failed = this.requests.filter(r => r.error || r.status >= 400).length;
    const avgDuration =
      total > 0
        ? (
            this.requests.reduce(
              (sum, r) => sum + parseFloat(r.duration || 0),
              0
            ) / total
          ).toFixed(2)
        : 0;

    return {
      total,
      successful,
      failed,
      avgDuration,
      byMethod: this.groupBy('method'),
      byStatus: this.groupBy('status'),
    };
  }

  /**
   * Group requests by property
   */
  groupBy(prop) {
    return this.requests.reduce((acc, req) => {
      const key = req[prop] || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }
}

// Global singleton
export const networkInspector = new NetworkInspector();

// Auto-start in dev mode
if (typeof window !== 'undefined' && import.meta.env?.DEV) {
  window.__RXHTMX_NETWORK__ = networkInspector;
}

export default networkInspector;
